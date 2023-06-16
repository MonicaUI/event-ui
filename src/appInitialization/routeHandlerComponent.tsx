import React, { useState, useEffect } from 'react';
import { isNetworkError, runNetworkErrorHandler, logErrorAndRedirect } from '../errorHandling/loggingAndErrors';
import Logger from '@cvent/nucleus-logging';
import { AppProps } from '../App';

const LOG = new Logger('event-guestside-site/src/appInitialization/routeHandlerComponent');

/*
 * Higher order component to wrap onEnter/onLeave/onUpdate functions for routes as react-router v4 doesn't support it.
 * It is suggested to implement them in terms of react lifecycle methods instead.
 */
export function withRoutes(BaseComponent: React.ComponentType<AppProps>, createRoutes: $TSFixMe): $TSFixMe {
  let pendingRouteChange = null;

  class PendingChangeErrorBoundary extends React.PureComponent {
    state = { hasError: false, pageId: null };
    componentDidCatch(error, errorInfo) {
      if (pendingRouteChange) {
        /*
         * Some poorly written widgets don't handle page transitions away from the page that they are on gracefully
         * Ignore the error and hope that it resolves itself when the page transition completes
         */
        LOG.error('Error rendering page', error, errorInfo);
      } else {
        void logErrorAndRedirect('Error rendering page', error, errorInfo);
      }
    }
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    static getDerivedStateFromProps(props, state) {
      // eslint-disable-next-line react/prop-types
      return { pageId: props.pageId, hasError: state.hasError && props.pageId === state.pageId };
    }
    render() {
      // Eslint thinks this is a stateless functional component, but it's not
      // eslint-disable-next-line react/no-this-in-sfc, react/prop-types
      return this.state.hasError ? null : this.props.children;
    }
  }

  function RouteHandlerComponent() {
    const [fullyLoadedPageId, setFullyLoadedPageId] = useState(null);

    async function handleRouteChange(routeProps, onEnterCallback) {
      // Create new object to be able to detect if this is the same change as when we check later
      const pageId = routeProps.match.params.pageId;
      const currentRouteChange = { pageId };
      pendingRouteChange = currentRouteChange;
      try {
        if (onEnterCallback && typeof onEnterCallback === 'function') {
          await onEnterCallback(routeProps, { isAnyPageCurrentlyDisplayed: !!fullyLoadedPageId });
        }
      } catch (ex) {
        // Only react if this is still the pending change that we are waiting on
        if (pendingRouteChange === currentRouteChange) {
          pendingRouteChange = null;
          if (isNetworkError(ex)) {
            runNetworkErrorHandler();
            return;
          }
          throw ex;
        }
      }
      // Only react if this is still the pending change that we are waiting on
      if (pendingRouteChange === currentRouteChange) {
        pendingRouteChange = null;
        if (pageId) {
          setFullyLoadedPageId(pageId);
          /*
           * Record that the page is finished loading in NewRelic.
           * Calling this additional times is a no-op, so it's ok to use in the route change handler.
           */
          if ((window as $TSFixMe).newrelic) {
            (window as $TSFixMe).newrelic.finished();
          }
        }
      }
    }

    /*
     * Creates a React component that runs the code inside useEffect every time it renders
     * Effectively, this lets us attach an event to react-router rendering a route
     */
    function createOnEnterHandler(onEnterCallback) {
      function OnEnterHandler(routeProps) {
        useEffect(() => {
          const pageId = routeProps.match.params.pageId;
          if (pendingRouteChange) {
            if (pendingRouteChange.pageId === pageId) {
              return;
            }
          } else if (fullyLoadedPageId === routeProps.match.params.pageId) {
            return;
          }
          void handleRouteChange(routeProps, onEnterCallback);
        });
        return null;
      }
      return OnEnterHandler;
    }

    return (
      <>
        {
          /* This should always render null, but will call the update handler at the appropriate time */
          createRoutes(createOnEnterHandler)
        }
        {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
        <PendingChangeErrorBoundary pageId={fullyLoadedPageId}>
          <BaseComponent key="BaseComponent" pageId={fullyLoadedPageId} />
        </PendingChangeErrorBoundary>
      </>
    );
  }
  return <RouteHandlerComponent />;
}
