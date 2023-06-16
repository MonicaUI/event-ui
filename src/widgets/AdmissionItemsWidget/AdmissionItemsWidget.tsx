import React from 'react';
import { connect, useSelector, useStore } from 'react-redux';
import AdmissionItemsWidget from 'event-widgets/lib/AdmissionItems/AdmissionItemsWidget';
import { getCurrentPageId } from '../../redux/pathInfo';
import * as currentRegistrantSelectors from '../../redux/selectors/currentRegistrant';
import { getNoOfConfirmedGuestsWithGivenAttendingFormat } from '../../redux/selectors/guestSelectors';
import {
  getCurrentRegistrantAndGuests,
  getPrimarySortedVisibleAdmissionItems,
  getPrimaryAndGuestSortedVisibleAdmissionItems,
  getAllSortedAdmissionItemsForWidget,
  getRegistrationTypeIdsForCurrentRegistrantsAndGuests,
  getAllSortedSessionsForWidget
} from '../../redux/selectors/productSelectors';
import { isGuestProductSelectionEnabledOnRegPath } from '../../redux/selectors/currentRegistrationPath';
import {
  getHasCurrentRegistrationAtLeastOneInPersonAttendee,
  getHasCurrentRegistrationAtLeastOneVirtualAttendee
} from '../../redux/selectors/hybridEventSelectors';
import * as eventSelectors from '../../redux/selectors/event';
import { selectAdmissionItem } from '../../redux/registrationForm/actions';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import {
  validateAdmissionItemChange,
  openAdmissionItemSelectionConflictDialog
} from '../../dialogs/selectionConflictDialogs';
import { getUpdateErrors } from '../../redux/registrationForm/errors';
import { keys, get, filter, isEmpty } from 'lodash';
import { isRegistrationPage as isRegistrationPageSelector } from '../../redux/website/registrationProcesses';
import { sessionsAppearOnPageBeforeAdmissionItems as sessionsAppearOnPageBeforeAdmissionItemsSelector } from '../../redux/website/pageContentsWithGraphQL';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';
import { updateExpandedHotels } from '../../redux/travelCart';
import { areRegistrationActionsDisabled, isRegCartUpdateInProgress } from '../../redux/selectors/shared';
import { isGraphQLForEventCapacitiesVariantON, isHidingAdmissionItemsVariantON } from '../../ExperimentHelper';
import { useAdmissionItems } from './useAdmissionItems';
import { getRegistrationTypeId } from '../../redux/selectors/currentRegistrant';
import { getPrimaryVisibleAdmissionItems } from './admissionItemsUtils';
import { isPlannerRegistration } from '../../redux/defaultUserSession';
import { AdmissionItemSnapshot } from '@cvent/flex-event-shared/target/guestside';

// EventID of grace hopper event
const PREVENT_ADMISSION_ITEM_CHANGE_EVENT_ID = '84f26b13-25ef-458c-9d38-38432d71be09';

const DEFAULT_ADMISSION_ITEMS = Object.freeze({});
const DEFAULT_SESSIONS = Object.freeze([]);

const getSessions = state => {
  return getAllSortedSessionsForWidget(state).reduce((obj, session) => {
    const sessionsObj = obj;
    sessionsObj[session.id] = session;
    return sessionsObj;
  }, {});
};

const getVisibleAdmissionItems = state => {
  const isGuestProductSelectionEnabled = !!isGuestProductSelectionEnabledOnRegPath(state);
  return isGuestProductSelectionEnabled
    ? getPrimaryAndGuestSortedVisibleAdmissionItems(state)
    : getPrimarySortedVisibleAdmissionItems(state);
};

const getSessionOverlapValidation = state => {
  const currentEventRegistrationId = state.registrationForm.currentEventRegistrationId;
  return filter(state.registrationForm.validationMessages || [], validationMessage => {
    const eventRegistrationId = get(validationMessage, 'parametersMap.eventRegistrationId', '');
    return (
      currentEventRegistrationId === eventRegistrationId &&
      validationMessage.localizationKey === 'REGAPI.SESSIONS_OVERLAP'
    );
  });
};

const shouldOpenConflictDialogForAdmissionItemChange = async (
  state,
  eventRegistrationId,
  admissionItemId,
  sessionsAppearOnPageBeforeAdmissionItems,
  apolloClient
) => {
  const validationResults = await validateAdmissionItemChange(
    state,
    eventSelectors.getAdmissionItem(state, admissionItemId),
    eventRegistrationId,
    sessionsAppearOnPageBeforeAdmissionItems,
    apolloClient
  );

  if (
    !validationResults.isValid ||
    (sessionsAppearOnPageBeforeAdmissionItems &&
      validationResults.advancedRuleValidationResults &&
      !validationResults.advancedRuleValidationResults.isValid)
  ) {
    return {
      shouldOpenConflictModal: true,
      validationResults
    };
  }
};

const validateSessionOverlap = (state, sessionsAppearOnPageBeforeAdmissionItems) => {
  const sessionOvelapValidations = getSessionOverlapValidation(state);
  if (sessionsAppearOnPageBeforeAdmissionItems && sessionOvelapValidations && sessionOvelapValidations.length > 0) {
    return true;
  }
};

const selectAdmissionItemWithLoading = withLoading((eventRegistrationId, admissionItemId) => {
  return async (dispatch, getState, { apolloClient }) => {
    // clear out any expanded hotels when admission item is switched
    await dispatch(updateExpandedHotels([]));
    const guestCount = currentRegistrantSelectors.guestRegistrantsCount(getState());
    const isGuestProductSelectionEnabled = !!isGuestProductSelectionEnabledOnRegPath(getState());
    if (isGuestProductSelectionEnabled && guestCount > 0) {
      return await dispatch(
        selectAdmissionItem(
          eventRegistrationId,
          admissionItemId,
          true,
          openAdmissionItemSelectionConflictDialog,
          shouldOpenConflictDialogForAdmissionItemChange,
          validateSessionOverlap
        )
      );
    }
    const sessionsAppearOnPageBeforeAdmissionItems = await sessionsAppearOnPageBeforeAdmissionItemsSelector(
      getState(),
      apolloClient
    );
    const admissionItemConflict = await shouldOpenConflictDialogForAdmissionItemChange(
      getState(),
      eventRegistrationId,
      admissionItemId,
      sessionsAppearOnPageBeforeAdmissionItems,
      apolloClient
    );
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (admissionItemConflict && admissionItemConflict.shouldOpenConflictModal) {
      return await dispatch(openAdmissionItemSelectionConflictDialog(admissionItemConflict.validationResults));
    }
    try {
      await dispatch(selectAdmissionItem(eventRegistrationId, admissionItemId, false));
    } catch (error) {
      if (
        getUpdateErrors.isInviteeAlreadyRegistered(error) ||
        getUpdateErrors.isRegistrantAlreadyAddedAsGuest(error) ||
        getUpdateErrors.isDuplicateInvitee(error)
      ) {
        return;
      }
      throw error;
    }
  };
});

function admissionItemHasFee(admissionItem: AdmissionItemSnapshot): boolean {
  return !!admissionItem.fees[admissionItem.defaultFeeId]?.isActive;
}

/**
 * Data wrapper for the AdmissionItems widget.
 */
const AdmissionItemsWidgetConnect = connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    let admissionItems = props.isGraphQLExperimentON ? props.admissionItems : getVisibleAdmissionItems(state);
    const visibleToPrimary = props.isGraphQLExperimentON
      ? props.visibleToPrimary
      : keys(getPrimarySortedVisibleAdmissionItems(state));
    const currentPageId = getCurrentPageId(state);
    const isRegistrationPage = isRegistrationPageSelector(state, currentPageId);
    const isRegMod = currentRegistrantSelectors.isRegistrationModification(state);
    // FLEX-56422 don't allow switching of adm item during mod if under experiment and not the planner
    const selectedAdmissionItem = currentRegistrantSelectors.getSelectedAdmissionItem(state);
    const eventId = eventSelectors.getEventId(state);
    const preventSwitchingDuringMod =
      !state.defaultUserSession.isPlanner &&
      isRegMod &&
      state.experiments?.preventAdmissionItemSelectionDuringRegMod &&
      eventId === PREVENT_ADMISSION_ITEM_CHANGE_EVENT_ID;
    admissionItems = preventSwitchingDuringMod
      ? { [selectedAdmissionItem.productId]: admissionItems[selectedAdmissionItem.productId] }
      : admissionItems;
    const { attendingFormat = AttendingFormat.INPERSON } = state.event;
    const confirmedGuests = props.isGraphQLExperimentON
      ? getNoOfConfirmedGuestsWithGivenAttendingFormat(state, AttendingFormat.INPERSON)
      : currentRegistrantSelectors.getConfirmedGuests(state);

    const noOfConfirmedVirtualGuests = props.isGraphQLExperimentON
      ? getNoOfConfirmedGuestsWithGivenAttendingFormat(state, AttendingFormat.VIRTUAL)
      : 0;

    admissionItems =
      !props.isGraphQLExperimentON && !isRegistrationPage && isEmpty(admissionItems)
        ? // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 3.
          getAllSortedAdmissionItemsForWidget(state, 'AdmissionItems', props.id)
        : admissionItems || DEFAULT_ADMISSION_ITEMS;

    const disableSelectButton = areRegistrationActionsDisabled(state) || isRegCartUpdateInProgress(state);

    const regCartUpdateInProgress = isRegCartUpdateInProgress(state);

    const hasCurrentRegistrationAtLeastOneInPersonAttendee = getHasCurrentRegistrationAtLeastOneInPersonAttendee(state);

    const hasCurrentRegistrationAtLeastOneVirtualAttendee = props.isGraphQLExperimentON
      ? getHasCurrentRegistrationAtLeastOneVirtualAttendee(state)
      : false;

    const admissionItemValues = Object.values(admissionItems);
    const hideAdmissionItemWidget =
      isHidingAdmissionItemsVariantON(state) &&
      (admissionItemValues.length === 0 || // hide if no available admission items
        (admissionItemValues.length === 1 && // hide if only one available item which has no fees and not planner
          !isPlannerRegistration(state) &&
          !admissionItemHasFee(admissionItemValues[0])));

    return {
      admissionItems,
      eventRegistrationId: currentRegistrantSelectors.getEventRegistrationId(state),
      isRegistrationPage,
      admissionItemRegistrations: currentRegistrantSelectors.getAdmissionItems(state),
      capacity: state.capacity,
      currency: state.text.resolver.currency,
      sessions: props.isGraphQLExperimentON ? DEFAULT_SESSIONS : getSessions(state),
      overrideFullCapacity: state.defaultUserSession.isPlanner,
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      guestInPersonCount: (confirmedGuests && confirmedGuests.length) || 0,
      guestVirtualCount: noOfConfirmedVirtualGuests,
      primaryAndGuestAdmissionItemInfo: currentRegistrantSelectors.getAdmissionItemInfoForPrimaryAndGuests(state),
      isRegApprovalRequired: currentRegistrantSelectors.isRegApprovalRequired(state),
      isRegMod,
      currentRegistrants: getCurrentRegistrantAndGuests(state),
      visibleToPrimary,
      timezone: state.timezones[state.event.timezone],
      attendingFormat,
      hasCurrentRegistrationAtLeastOneInPersonAttendee,
      hasCurrentRegistrationAtLeastOneVirtualAttendee,
      disableSelectButton,
      regCartUpdateInProgress,
      isVisible: !hideAdmissionItemWidget
    };
  },
  { selectAdmissionItem: selectAdmissionItemWithLoading }
)(AdmissionItemsWidget);

/**
 * This function make a call to apollo server graphQL to get the relevant admission items
 * @returns {JSX.Element}
 */
function AdmissionItemsWidgetWithGraphQL(props) {
  const store = useStore();
  const state = store.getState();

  const primaryRegistrantRegTypeId = useSelector(getRegistrationTypeId);
  // eslint-disable-next-line react/prop-types
  const registrationTypeIds = props.isGuestProductSelectionEnabled
    ? getRegistrationTypeIdsForCurrentRegistrantsAndGuests(state)
    : [primaryRegistrantRegTypeId];

  // eslint-disable-next-line react/prop-types
  const admissionItems = useAdmissionItems(props.id, registrationTypeIds);
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
  const visibleToPrimary = getPrimaryVisibleAdmissionItems(admissionItems, primaryRegistrantRegTypeId);

  return <AdmissionItemsWidgetConnect {...props} admissionItems={admissionItems} visibleToPrimary={visibleToPrimary} />;
}

/**
 * Wrapper over the Admission Item Widget to decide working on GraphQL or existing flow \
 * @returns {JSX.Element}
 */
export default function AdmissionItemsWidgetWrapper(props: $TSFixMe): $TSFixMe {
  const store = useStore();
  const state = store.getState();

  const isGuestProductSelectionEnabled = !!isGuestProductSelectionEnabledOnRegPath(state);
  const isGraphQLExperimentON = useSelector(isGraphQLForEventCapacitiesVariantON);

  if (isGraphQLExperimentON) {
    return (
      <AdmissionItemsWidgetWithGraphQL
        {...props}
        isGuestProductSelectionEnabled={isGuestProductSelectionEnabled}
        isGraphQLExperimentON={isGraphQLExperimentON}
      />
    );
  }
  return (
    <AdmissionItemsWidgetConnect
      {...props}
      isGuestProductSelectionEnabled={isGuestProductSelectionEnabled}
      isGraphQLExperimentON={isGraphQLExperimentON}
    />
  );
}
