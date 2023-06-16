import React from 'react';
import { connect } from 'react-redux';
import { getRegCartCharges } from '../redux/selectors/payment';
import { addGroupMemberInRegCart, navigateToGroupMemberRegistration } from '../redux/registrationForm/regCart';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { isWidgetPresentOnCurrentPage } from '../redux/website/pageContents';
import { getCurrentPageId } from '../redux/pathInfo';
import { getTravelWidgets } from '../redux/website/travel';
import {
  openGroupMemberRemoveDialog,
  openGuestRemoveDialog,
  openGuestDetailsDialog,
  openTimeZoneDialog
} from '../dialogs';
import {
  getAirBookingsToDisplay,
  getHotelRoomBookingsToDisplay,
  getAirActualsToDisplay,
  getGroupFlightBookingsToDisplay
} from '../utils/travelUtils';
import { getGroupFlightsSnapshotData } from 'event-widgets/redux/selectors/eventTravel';
import { getTravelAnswersToDisplay } from '../utils/travelQuestionUtils';
import { getAvailableGroupRegTypeCapacities } from '../utils/regTypeCapacities';
import { getRegistrationPathIdForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import {
  canModifyRegistrationWithEventStatus,
  groupLeaderAndGroupMemberHaveCompatibleManualApprovalSettings,
  updateContactFieldsWithLocalizedText
} from '../utils/registrationUtils';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import { getIn } from 'icepick';
import useCachedRegCartPricing from './PaymentWidget/useCachedRegCartPricing';
import { loadCountryStates } from '../redux/states';
import { widgetWithBehavior } from 'event-widgets/lib/RegistrationSummary/RegistrationSummaryWidget';
import { getRegistrationTypeId, getSelectedRegistrationTypeIds } from './Sessions/util';
import { GraphQLSiteEditorDataReleases, useGraphQLSiteEditorData } from '../ExperimentHelper';
import { useRegistrationPageVarietyPathQuery } from '../apollo/siteEditor/pageVarietyPathQueryHooks';

// selectors

import { getOrderedWidgetsInAllRegistrationPaths } from '../redux/website/pageContents';
import {
  GUEST_REGISTRATION,
  isPostRegistrationPage,
  PENDING_APPROVAL,
  REGISTRATION,
  POST_REGISTRATION
} from '../redux/website/registrationProcesses';
import {
  getAllSortedSessionsForWidget,
  getAllSortedAdmissionItemsForWidget,
  getAllSortedQuantityItemsForWidget,
  getAllSortedDonationItemsForWidget
} from '../redux/selectors/productSelectors';
import { getEventTimezone } from '../redux/reducer';
import { isRegistrationApprovalEnabled } from 'event-widgets/redux/selectors/event';
import { adjustTimeZoneTimesForSessions } from 'event-widgets/redux/selectors/website/sessions';
import { getSelectedTimezone } from 'event-widgets/redux/selectors/timezone';
import { isClosedEvent } from '../redux/selectors/event';
import { isRegistrationModification, getSelectedAdmissionItem } from '../redux/selectors/currentRegistrant';
import { getRegistrationPathIdOrNull as getRegistrationPathId } from '../redux/selectors/currentRegistrationPath';

const hideAddGroupButton = state => {
  const isRegMod = isRegistrationModification(state);
  const isOnConfirmationPage = isPostRegistrationPage(state, getCurrentPageId(state));
  const isOnPendingApprovalPage = PENDING_APPROVAL.isTypeOfCurrentPage(state);
  /**
   * should still allow group leader/admin to add new group member when their
   * reg path passed reg mod deadline.
   */
  if (!canModifyRegistrationWithEventStatus(state.event)) {
    return true;
  }

  /*
   * FLEX-28867: accepted group leaders can now add group members
   * cannot add group members during reg mod on the registation summary widget.
   */
  if (!isOnConfirmationPage && !isOnPendingApprovalPage && isRegMod) {
    return true;
  }

  return false;
};

const disableAddGroupButton = state => {
  // FLEX-33765 if event is closed don't allow add gm on post reg pages or pending approval page
  const isPostRegPage = isPostRegistrationPage(state, getCurrentPageId(state));
  if (isPostRegPage) {
    if (isClosedEvent(state)) {
      return true;
    }
    const isRegistrationApproved = POST_REGISTRATION.isTypeOfCurrentPage(state);
    const registrationApproval = isRegistrationApprovalEnabled(state.event);
    if (
      registrationApproval &&
      !groupLeaderAndGroupMemberHaveCompatibleManualApprovalSettings(state, { isRegistrationApproved })
    ) {
      return true;
    }
  }
  return getAvailableGroupRegTypeCapacities(state).isFull;
};

const getQuestions = (props, state) => {
  const registrationQuestions =
    props.config?.appData?.registrationQuestions || state.appData.registrationSettings.registrationQuestions || {};
  const productQuestions =
    props.config?.appData?.productQuestions || state.appData.registrationSettings.productQuestions || {};

  const travelQuestionsInProps = props.config?.appData?.travelQuestions;
  // returns true if travelQuestionsInProps is defined, not null & not empty
  const hasValidTravelQuestionsInProps = travelQuestionsInProps && Object.keys(travelQuestionsInProps).length;
  const travelQuestions =
    (hasValidTravelQuestionsInProps && travelQuestionsInProps) ||
    state.appData.registrationSettings.travelQuestions ||
    {};
  return { registrationQuestions, productQuestions, travelQuestions };
};

function getSavedQuestions(savedRegistrationQuestions, savedProductQuestions, savedTravelQuestions) {
  return {
    ...savedRegistrationQuestions,
    ...savedProductQuestions,
    ...savedTravelQuestions
  };
}

const RegistrationSummaryWidgetWithBehaviour = widgetWithBehavior({
  getRegistrationPathId,
  getRegistrationTypeId,
  getSelectedRegistrationTypeIds,
  getSelectedAdmissionItem
});
/**
 * Data wrapper for the registration summary widget.
 */
const RegistrationSummaryWidgetWrapper = withMappedWidgetConfig(
  connect(
    withMemoizedFunctions({ updateContactFieldsWithLocalizedText, getSavedQuestions })(
      memoized => (state: $TSFixMe, props: $TSFixMe) => {
        const {
          text,
          event,
          appData: {
            registrationSettings: {
              registrationQuestions: savedRegistrationQuestions = {},
              productQuestions: savedProductQuestions = {},
              travelQuestions: savedTravelQuestions = {}
            }
          },
          account: { contactCustomFields },
          registrationForm: { regCart },
          countries: { countries },
          eventTravel,
          airports,
          pathInfo: { currentPageId },
          localizedUserText = {},
          multiLanguageTranslation,
          account,
          states
        } = state;
        const { registrationQuestions, productQuestions, travelQuestions } = getQuestions(props, state);
        const registrationPaths = props.config.appData.registrationPaths;
        const eventTimezone = getEventTimezone(state);
        const selectedTimeZone = getSelectedTimezone(state);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
        const admissionItems = getAllSortedAdmissionItemsForWidget(state, 'RegistrationSummary');
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
        const sessions = getAllSortedSessionsForWidget(state, 'RegistrationSummary');
        const sortedSessions = adjustTimeZoneTimesForSessions(sessions, selectedTimeZone, eventTimezone);
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
        const sortedQuantityItems = getAllSortedQuantityItemsForWidget(state, 'RegistrationSummary');
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
        const sortedDonationItems = getAllSortedDonationItemsForWidget(state, 'RegistrationSummary');
        const contactFields = getOrderedWidgetsInAllRegistrationPaths(state, [
          'EventStandardContactFieldText',
          'EventStandardContactFieldAddress',
          'EventStandardContactFieldChoice',
          'EventStandardContactFieldDateTime',
          'EventStandardContactFieldImage',
          'EventStandardContactSecureFieldText',
          'EventCustomContactFieldText',
          'EventCustomContactFieldSingleChoice',
          'EventCustomContactFieldMultiChoice',
          'EventCustomContactFieldDateTime'
        ]);
        const contactFieldsOrganizedByPath = memoized.updateContactFieldsWithLocalizedText(
          contactFields,
          localizedUserText,
          getIn(event, ['eventLocalesSetup', 'eventLocales'])
        );
        const meetingInterestWidget =
          (!props.loadSiteEditorDataViaGraphQL &&
            getOrderedWidgetsInAllRegistrationPaths(state, ['ApptsMeetingInterest'])) ||
          {};
        const regPathId = getRegistrationPathIdForWidget(state, props.id);
        const apptsAvailabilitySettings =
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          registrationPaths[regPathId] &&
          registrationPaths[regPathId].apptSettings &&
          registrationPaths[regPathId].apptSettings.availabilitySettings;
        const apptsMeetingInterestSettings =
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          registrationPaths[regPathId] &&
          registrationPaths[regPathId].apptSettings &&
          registrationPaths[regPathId].apptSettings.meetingInterestSettings;
        const groupFlightsSetup = getGroupFlightsSnapshotData(state.eventTravel).groupFlightSetup;
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        const groupFlights = groupFlightsSetup && groupFlightsSetup.groupFlights;

        return {
          guestText: text,
          // uses the order to display the fields
          orderedContactFields: contactFieldsOrganizedByPath,
          // ccf from acct snapshot to determine if questionId is a date field to parse
          customFieldsMetadata: contactCustomFields,
          // standard field labels/display name are stored here
          contactFieldLabels: registrationPaths,
          // custom field labels/display name are stored here
          customFieldLabels: contactFieldsOrganizedByPath,
          // uses the order of the widgets to display the questions
          orderedQuestions: getOrderedWidgetsInAllRegistrationPaths(state, [
            'OpenEndedTextQuestion',
            'ChoiceQuestion',
            'DateTimeQuestion',
            'ConsentQuestion',
            'FileUploadQuestion'
          ]),
          questionsMetadata: [
            ...Object.values(registrationQuestions),
            ...Object.values(productQuestions),
            ...Object.values(travelQuestions)
          ],
          event: {
            ...event,
            timezone: state.timezones[event.timezone]
          },
          registrationPaths,
          sortedSessions,
          // reg cart with actual day to display
          regCart,
          regCartCharges: getRegCartCharges(props),
          countries,
          isRegPage: REGISTRATION.isTypeOfCurrentPage(state) || GUEST_REGISTRATION.isTypeOfCurrentPage(state),
          ignoreMaxGroupMemberValidation: false,
          eventTravel,
          getAirBookingsToDisplay: (primaryEventRegistrationId, guestEventRegistrationIds) =>
            getAirBookingsToDisplay(state, primaryEventRegistrationId, guestEventRegistrationIds),
          getHotelRoomBookingsToDisplay: (primaryEventRegistrationId, guestEventRegistrationIds) =>
            getHotelRoomBookingsToDisplay(state, primaryEventRegistrationId, guestEventRegistrationIds),
          getAirActualsToDisplay: (primaryEventRegistrationId, guestEventRegistrationIds) =>
            getAirActualsToDisplay(state, primaryEventRegistrationId, guestEventRegistrationIds),
          getGroupFlightBookingsToDisplay: (primaryEventRegistrationId, guestEventRegistrationIds) =>
            getGroupFlightBookingsToDisplay(state, primaryEventRegistrationId, guestEventRegistrationIds),
          getTravelAnswersToDisplay: (primaryEventRegistrationId, guestEventRegistrationIds) =>
            getTravelAnswersToDisplay(state, primaryEventRegistrationId, guestEventRegistrationIds),
          travelWidgets: getTravelWidgets(state, eventTravel.hotelsData.isPasskeyEnabled) || [],
          airports,
          disableAddGroupMemberButton: disableAddGroupButton(state),
          hideAddGroupMemberButton: hideAddGroupButton(state),
          isGuestWidgetOnPage: isWidgetPresentOnCurrentPage(state.website, 'GuestRegistration', currentPageId),
          admissionItemsInfo: admissionItems,
          meetingInterestWidget,
          apptsAvailabilitySettings,
          apptsMeetingInterestSettings,
          groupFlights,
          sortedQuantityItems,
          sortedDonationItems,
          localizedUserText,
          multiLanguageTranslation,
          selectedTimeZone,
          account,
          savedQuestions: memoized.getSavedQuestions(
            savedRegistrationQuestions,
            savedProductQuestions,
            savedTravelQuestions
          ),
          states,
          useRegistrationPathQuery: useRegistrationPageVarietyPathQuery
        };
      }
    ),
    {
      addGroupMember: withLoading(addGroupMemberInRegCart),
      guestRemoveHandler: openGuestRemoveDialog,
      guestEditHandler: openGuestDetailsDialog,
      removeGroupMember: openGroupMemberRemoveDialog,
      editGroupMember: navigateToGroupMemberRegistration,
      switchTimeZone: openTimeZoneDialog,
      loadCountryStates
    }
  )(RegistrationSummaryWidgetWithBehaviour)
);

export default function RegistrationSummaryWidgetCacheWrapper(props: $TSFixMe): $TSFixMe {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '[QueryResu... Remove this comment to see the full error message
  const { data, previousData } = useCachedRegCartPricing();
  const regCartPricing = data?.pricing?.regCartPricing || previousData?.pricing?.regCartPricing;
  const loadSiteEditorDataViaGraphQL = useGraphQLSiteEditorData(GraphQLSiteEditorDataReleases.Development);

  return (
    <RegistrationSummaryWidgetWrapper
      {...props}
      regCartPricing={regCartPricing}
      loadSiteEditorDataViaGraphQL={loadSiteEditorDataViaGraphQL}
    />
  );
}
