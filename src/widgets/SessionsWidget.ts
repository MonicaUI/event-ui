import { connect } from 'react-redux';
import { widgetWithBehavior } from 'event-widgets/lib/Sessions/SessionsWidget';
import { getEventTimezone, RootState } from '../redux/reducer';
import { getAccountSessionCategories, getSessionCustomFieldDefinitions } from 'event-widgets/redux/selectors/account';
import { selectSession, unSelectSession, switchSession } from '../redux/registrationForm/regCart/sessions';
import {
  withSpinnerButtonAndTransparentWrapper,
  initSessionSelection
} from '../redux/registrationForm/regCart/productUpdate';
import { updateSessionFilters } from '../redux/sessionFilters';
import { addSessionForSelectingWaitlist } from '../redux/sessionsInWaitlist';
import { addSessionForWaitlistingGuests } from '../redux/waitlistSelectionForGuests';
import {
  isRegApprovalRequired,
  getEventRegistrationId,
  isRegistrationModification,
  modificationStart,
  getSelectedSessionFilters,
  getSelectedAdmissionItem
} from '../redux/selectors/currentRegistrant';
import {
  getSessionRegistrationCount,
  getCurrentRegistrantAndGuests,
  getSessionUnregisterCount,
  getSessionCountWithAdmissionItemAssociation,
  getSessionWaitlistCount,
  getSessionUnWaitlistCount,
  getPrimaryAndGuestSelectedSessions,
  getPrimaryAndGuestSortedVisibleSessions,
  getPrimarySortedVisibleSessions,
  getSessionsVisibleToPrimary,
  isAnyRegistrantOnNonPendingSessionWaitlist,
  isSessionBeingUpdated,
  getWaitlistSessionMetaData,
  isSessionBeingUnregistered,
  getSelectedWaitlistSessionsInSessionGroup,
  getSessionBundleRegistrationCount,
  getSessionCountWithSessionBundleAssociation
} from '../redux/selectors/productSelectors';
import {
  getRegistrationPathIdOrNull as getRegistrationPathId,
  isGuestProductSelectionEnabledOnRegPath
} from '../redux/selectors/currentRegistrationPath';
import { getHasCurrentRegistrationAtLeastOneInPersonAttendee } from '../redux/selectors/hybridEventSelectors';
import { getSessionCategoryListOrders, isSessionBundlesEnabled } from '../redux/selectors/event';
import {
  getSessionsWithSpeakers,
  adjustTimeZoneTimesForSessions,
  getSortedSessions,
  getSessionSortOrder
} from 'event-widgets/redux/selectors/website/sessions';
import { getSpeakers } from 'event-widgets/redux/selectors/event';
import { getSpeakerCategories } from 'event-widgets/redux/selectors';
import { getSelectedTimezone } from 'event-widgets/redux/selectors/timezone';
import getDialogContainerStyle from '../dialogs/shared/getDialogContainerStyle';
import SessionsErrorDisplay from './Sessions/SessionsErrorDisplay';
import SessionGroupRequiredError from './Sessions/SessionGroupRequiredError';
import { getRegistrationTypeId, getSelectedRegistrationTypeIds, guestCount } from './Sessions/util';
import { openIncludedSessionsDialog, openTimeZoneDialog } from '../dialogs';
import { recordViewSpeakerProfileActivity } from './Speakers/SpeakersWidget';
import { hideLoadingDialog, showLoadingDialog } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { useRegisterSessionBundle } from './Sessions/useRegisterSessionBundle';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { areRegistrationActionsDisabled, getRegCart } from '../redux/selectors/shared';
import { isPlannerRegistration } from '../redux/defaultUserSession';
import { isNameFormatUpdateEnabled } from '../ExperimentHelper';

const SessionsWidget = widgetWithBehavior({
  getSessionBundleRegistrationCount,
  getSessionRegistrationCount,
  getSessionUnregisterCount,
  getSessionCountWithAdmissionItemAssociation,
  getSessionCountWithSessionBundleAssociation,
  getSessionWaitlistCount,
  getSessionUnWaitlistCount,
  isAnyRegistrantOnNonPendingSessionWaitlist,
  isSelectedByEveryRegistrant(state, sessionSelectedCount) {
    const currentRegistrants = getCurrentRegistrantAndGuests(state);
    return currentRegistrants && currentRegistrants.length === sessionSelectedCount;
  },
  getRegistrationTypeId,
  getSelectedRegistrationTypeIds,
  getSelectedAdmissionItem,
  getRegistrationPathId,
  SessionsErrorDisplay,
  SessionGroupRequiredError,
  isSessionBeingUpdated,
  getPrimaryAndGuestSelectedSessions,
  getSelectedWaitlistSessionsInSessionGroup,
  getWaitlistSessionMetaData,
  getRegisteredSessions: state => modificationStart.getRegisteredSessions(state),
  isSessionBeingUnregistered,
  isVisibleToPrimary: (state, id) => getSessionsVisibleToPrimary(state).includes(id),
  guestCount,
  isGuestProductSelectionEnabled: isGuestProductSelectionEnabledOnRegPath,
  recordViewSpeakerProfileActivity,
  useRegisterSessionBundle,
  openIncludedSessionsDialog,
  areRegistrationActionsDisabled,
  isPlannerRegistration,
  getRegCart
});

function withEventRegistrationId(action) {
  return (...args) => {
    return (dispatch, getState) => {
      const eventRegistrationId = getEventRegistrationId(getState());
      return dispatch(action(eventRegistrationId, ...args));
    };
  };
}

interface Props {
  id: string;
  translate: (resx: string, opts: string) => string;
}

export default connect(
  (state: RootState, props: Props) => {
    const {
      text: { translateDate, translateTime, locale }
    } = state;
    const { id: widgetId, translate } = props;
    const eventTimezone = getEventTimezone(state);
    const selectedTimeZone = getSelectedTimezone(state);
    const sessionCategories = getAccountSessionCategories(state);
    const sessionCustomFieldDefinitions = getSessionCustomFieldDefinitions(state);
    const isGuestProductSelectionEnabled = isGuestProductSelectionEnabledOnRegPath(state);
    const sessions = isGuestProductSelectionEnabled
      ? getPrimaryAndGuestSortedVisibleSessions(state)
      : getPrimarySortedVisibleSessions(state);
    const sortedSessions = getSortedSessions(
      sessions,
      getSessionSortOrder(state, widgetId),
      eventTimezone,
      state.account,
      state.event,
      translate
    );
    const compositeSessions = adjustTimeZoneTimesForSessions(sortedSessions, selectedTimeZone, eventTimezone);
    const sessionCategoryListOrders = getSessionCategoryListOrders(state);
    const isPlanner = state.defaultUserSession.isPlanner;
    const isRegMod = isRegistrationModification(state);
    const speakers = getSpeakers(state.event);
    const speakerCategories = getSpeakerCategories(state);
    const sessionsWithSpeakers = getSessionsWithSpeakers(compositeSessions, speakers);
    const sessionBundlesEnabled = isSessionBundlesEnabled(state);
    const hasCurrentRegistrationAtLeastOneInPersonAttendee = getHasCurrentRegistrationAtLeastOneInPersonAttendee(state);
    const nameFormatUpdateEnabled = isNameFormatUpdateEnabled(state);

    return {
      locale,
      translateTime,
      translateDate,
      translateCurrency: state.text.resolver.currency,
      sessionCategories,
      sessionCustomFieldDefinitions,
      overrideFullCapacity: state.defaultUserSession.isPlanner,
      compositeSessions: sessionsWithSpeakers,
      selectedSessionFilters: getSelectedSessionFilters(state),
      sessionCategoryListOrders,
      isPlanner,
      isRegMod,
      isRegApprovalRequired: isRegApprovalRequired(state),
      speakers,
      speakerCategories,
      dialogContainerStyle: getDialogContainerStyle(state),
      eventTimezone,
      isSessionBundlesEnabled: sessionBundlesEnabled,
      hasCurrentRegistrationAtLeastOneInPersonAttendee,
      nameFormatUpdateEnabled
    };
  },
  {
    onSessionSelect: withSpinnerButtonAndTransparentWrapper(withEventRegistrationId(selectSession)),
    onSessionUnSelect: withSpinnerButtonAndTransparentWrapper(withEventRegistrationId(unSelectSession)),
    onSessionSwitch: withSpinnerButtonAndTransparentWrapper(withEventRegistrationId(switchSession)),
    onSelectedSessionFilterUpdate: withSpinnerButtonAndTransparentWrapper(updateSessionFilters),
    onAddingSessionsInWaitlist: withSpinnerButtonAndTransparentWrapper(addSessionForSelectingWaitlist),
    onAddingSessionForWaitlistingGuests: withSpinnerButtonAndTransparentWrapper(addSessionForWaitlistingGuests),
    onInitSessionSelection: initSessionSelection(),
    switchTimeZone: openTimeZoneDialog,
    onSessionBundlesLoading: (dispatch, isLoading) =>
      isLoading ? dispatch(showLoadingDialog()) : dispatch(hideLoadingDialog()),
    viewIncludedSessions: withLoading(openIncludedSessionsDialog)
  }
)(SessionsWidget);
