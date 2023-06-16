import React from 'react';
import { connect } from 'react-redux';
import { useRegistrationPageVarietyPathQuery } from '../apollo/siteEditor/pageVarietyPathQueryHooks';
import { useGraphQLSiteEditorData, GraphQLSiteEditorDataReleases } from '../ExperimentHelper';
import gql from 'graphql-tag';
import { useStore } from 'react-redux';
import ConcurWidget from 'event-widgets/lib/Concur/ConcurWidget';
import { redirectToConcur } from '../redux/travelCart/workflow';
import {
  getRegistrationPathIdForWidget,
  isWidgetOnPath
} from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { currentRegistrantOrGuestsHaveConcurBookings } from '../redux/travelCart/airActuals';

/**
 * Data wrapper for putting basic and required information
 * for the functioning of the Concur's Widget.
 */
export const RegistrationCancellationConcurWidget = connect(
  (state, props) => {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'registrationForm' does not exist on type... Remove this comment to see the full error message
      registrationForm: {
        regCart: { eventRegistrations }
      },
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'eventTravel' does not exist on type 'Def... Remove this comment to see the full error message
      eventTravel: {
        airData: { isConcurEnabled }
      }
    } = state;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'isConcurWidgetEnabled' does not exist on... Remove this comment to see the full error message
    const { isConcurWidgetEnabled } = props;
    const showConcurCancellationWidget =
      isConcurEnabled && isConcurWidgetEnabled && currentRegistrantOrGuestsHaveConcurBookings(state);
    return {
      eventRegistrations,
      isConcurEnabled: showConcurCancellationWidget
    };
  },
  {
    onFlightRequest: redirectToConcur
  }
)(ConcurWidget);

export const REGISTRATION_CANCELLATION_CONCUR_FRAGMENT = gql`
  fragment RegistrationCancellationConcur on PageVarietyPath {
    concur {
      enabled
    }
  }
`;

export const RegistrationCancellationConcurWithGraphQL = (props: $TSFixMe): $TSFixMe => {
  const query = useRegistrationPageVarietyPathQuery(REGISTRATION_CANCELLATION_CONCUR_FRAGMENT);
  const data = query.data || query.previousData;
  const isConcurWidgetEnabled = data?.event?.registrationPath?.registration?.concur?.enabled;

  return <RegistrationCancellationConcurWidget isConcurWidgetEnabled={!!isConcurWidgetEnabled} {...props} />;
};

export const RegistrationCancellationConcurWithRedux = (props: $TSFixMe): $TSFixMe => {
  const store = useStore();
  const state = store.getState();
  const { website } = state;
  const isConcurWidgetEnabled = isWidgetOnPath(website, 'Concur', getRegistrationPathIdForWidget(state, props.id));

  return <RegistrationCancellationConcurWidget isConcurWidgetEnabled={isConcurWidgetEnabled} {...props} />;
};

export default function RegistrationCancellationConcurExperimentWrapper(props: $TSFixMe): $TSFixMe {
  const usingGraphQLWidgetData = useGraphQLSiteEditorData(GraphQLSiteEditorDataReleases.RegistrationCancellationConcur);
  if (usingGraphQLWidgetData) return <RegistrationCancellationConcurWithGraphQL {...props} />;
  return <RegistrationCancellationConcurWithRedux {...props} />;
}
