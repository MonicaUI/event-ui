import React, { useCallback } from 'react';
import LinearNavigatorWidget from 'nucleus-widgets/lib/LinearNavigator/LinearNavigatorWidget';
import {
  BEGINNING,
  MIDDLE,
  END,
  SINGLE_STEP,
  FORWARD,
  BACKWARD,
  COMPLETE,
  EXIT
} from 'nucleus-widgets/lib/LinearNavigator/LinearNavigator';
import { resolveTestId } from '@cvent/nucleus-test-automation';
import { useApolloClient } from '@apollo/client';
import { useSelector } from 'react-redux';
import { getRegistrationPathIdOrNull } from '../../redux/selectors/currentRegistrationPath';
import { getRegistrationTypeIdFromUserSession } from '../../redux/userSession';
import { getCurrentPageId } from '../../redux/pathInfo';
import { getNextPage } from '../../redux/website/navigation';

/**
 * Gets the position of the page within the linear pages.
 * @param {string} currentPageId - The id of the current page in the linear process.
 * @param {Array<string>} pageIds - All pages by id.
 * @returns The position within the linear pages.
 */
const getPostition = (currentPageId, pageIds) => {
  const position = pageIds.indexOf(currentPageId);
  const isAProcessPage = position !== -1;
  if (!isAProcessPage) {
    return undefined;
  }

  const beginning = 0;
  if (position === beginning) {
    const singlePage = pageIds.length === 1;
    return singlePage ? SINGLE_STEP : BEGINNING;
  }

  const end = pageIds.length - 1;
  return position === end ? END : MIDDLE;
};

export type NavigatorWidgetProps = {
  config: {
    displayText: {
      backward: string;
      forward: string;
      complete: string;
      exit: string;
    };
  };
  style?: Record<string, string>;
  classes?: Record<string, string>;
  translate?: $TSFixMeFunction;
  pageIds?: string[];
  onNavigateRequest?: (pageId: string, isForward: boolean) => void;
  onCompleteRequest?: () => void;
  onExitRequest?: () => void;
  disableForwardNavigation?: boolean;
  reverseButtonOrderOnMobile?: boolean;
};

/**
 * A widget for navigating through the pages of a linear process. Allows a user
 * to move forward, backwards and to exit or complete the pages in a linear process. Configuration
 * includes items such as preventing forward navigation if business rules have not
 * been met.
 */
function NavigatorWidget(props: NavigatorWidgetProps): JSX.Element {
  const { pageIds, disableForwardNavigation, onNavigateRequest, onCompleteRequest, onExitRequest, ...other } = props;
  const currentPageId = useSelector(getCurrentPageId);
  const registrationPathId = useSelector(getRegistrationPathIdOrNull);
  const registrationTypeId = useSelector(getRegistrationTypeIdFromUserSession);
  const apolloClient = useApolloClient();
  const onNavigateRequestInternal = useCallback(
    async (direction: string) => {
      const position = pageIds.indexOf(currentPageId);
      switch (direction) {
        case BACKWARD:
          onNavigateRequest(pageIds[position - 1], false);
          break;
        case FORWARD: {
          const nextPage = await getNextPage(currentPageId, registrationPathId, registrationTypeId, apolloClient);
          if (nextPage?.id) {
            onNavigateRequest(nextPage.id, true);
          }
          break;
        }
        case COMPLETE:
          onCompleteRequest();
          break;
        case EXIT:
          onExitRequest();
          break;
        default:
      }
    },
    [
      currentPageId,
      pageIds,
      onNavigateRequest,
      onCompleteRequest,
      onExitRequest,
      registrationTypeId,
      registrationPathId,
      apolloClient
    ]
  );
  const currentPosition = getPostition(currentPageId, pageIds);
  if (!currentPosition) {
    // If the page is not in the list of process pages, the widget
    // will not be displayed.
    return <div />;
  }

  return (
    <LinearNavigatorWidget
      {...resolveTestId(props)}
      {...other}
      currentPosition={currentPosition}
      disableForwardNavigation={disableForwardNavigation}
      onNavigateRequest={onNavigateRequestInternal}
    />
  );
}

NavigatorWidget.displayName = 'LinearPageNavigatorWidget';

export default NavigatorWidget;
