import React from 'react';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { connect } from 'react-redux';
import { IncludedSessionsDialog } from './IncludedSessionsDialog';
import IncludedSessionsDialogStyles from './IncludedSessionsDialog.less';
import { withStyles } from '../ThemedDialog';
import { getRegistrationPathId } from '../../redux/selectors/currentRegistrationPath';
import { getEventTimezone } from '../../redux/reducer';
import { getSelectedTimezone } from 'event-widgets/redux/selectors/timezone';
import { values } from 'lodash';
import { gql } from '@apollo/client/core';

export const GET_SORTED_SESSIONS_FOR_BUNDLE = gql`
  query getSortedSessionsForBundle($registrationPathId: String, $productId: String) {
    eventId @client @export(as: "eventId")
    environment @client @export(as: "environment")
    eventSnapshotVersion @client @export(as: "eventSnapshotVersion")
    sessionBundleSessions(
      eventId: $eventId
      environment: $environment
      snapshotVersion: $eventSnapshotVersion
      productId: $productId
      registrationPathId: $registrationPathId
      productType: "sessionBundles"
    )
      @rest(
        type: "SortedSessionsResponse"
        path: "product-visibility/v2/event/{args.eventId}/sorted-products?{args}"
        endpoint: "eventGuestsideV1"
      ) {
      code
      id
      speakerIds
      name
      locationId
      locationName
      categoryId
      description
      sessionCustomFieldValues
      startTime
      endTime
    }
  }
`;

const Dialog = withStyles(IncludedSessionsDialog);

const classes = {
  ...IncludedSessionsDialogStyles
};

const mapStateToProps = (state: $TSFixMe) => {
  return {
    title: 'EventGuestSide_IncludedSessionsModal_Title__resx',
    translate: state.text.translate,
    eventTimezone: getEventTimezone(state),
    selectedTimeZone: getSelectedTimezone(state)
  };
};

const mapDispatchToProps = (dispatch: $TSFixMe) => {
  return {
    onClose: () => {
      dispatch(closeDialogContainer());
    }
  };
};

const ConnectedIncludedSessionsDialog = connect(mapStateToProps, mapDispatchToProps)(Dialog);

export const openIncludedSessionsDialog = (props: $TSFixMe, sessionBundle: $TSFixMe) => {
  return async (
    dispatch: $TSFixMe,
    getState: $TSFixMe,
    {
      apolloClient
    }: {
      apolloClient?: $TSFixMe;
    }
  ): Promise<$TSFixMe> => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const style = props && props.style;

    const sessionBundleSessions = await apolloClient
      .query({
        query: GET_SORTED_SESSIONS_FOR_BUNDLE,
        variables: {
          registrationPathId: getRegistrationPathId(getState()),
          productId: sessionBundle.id
        }
      })
      .then(results => values(results.data?.sessionBundleSessions));

    const dialog = (
      <ConnectedIncludedSessionsDialog
        {...props}
        classes={{ ...props.classes, ...classes }}
        sessionBundle={sessionBundle}
        sessionBundleSessions={sessionBundleSessions}
        contentStyle={style}
        isInIncludedSessionsModal
      />
    );
    return dispatch(
      openDialogContainer(dialog, () => dispatch(closeDialogContainer()), {
        classes: {
          dialogContainer: IncludedSessionsDialogStyles.dialogContainer
        },
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};
