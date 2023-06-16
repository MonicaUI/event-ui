import { setIn, getIn } from 'icepick';
import uuid from 'uuid';
import { hideLoadingOnError } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import Logger from '@cvent/nucleus-logging';
import { loadAvailableCapacityCounts } from '../../capacity';
import {
  getPrimaryRegistrationId,
  getGuestsOfRegistrant,
  getRegistrationTypeId,
  getRegistrationPathId
} from './selectors';
import * as currentRegistrantSelectors from '../../selectors/currentRegistrant';
import {
  openCapacityReachedDialog,
  openGroupRegistrationTypeDialog,
  openKnownErrorDialog,
  openNoAdmissionItemAvailableForRegistrationTypeDialog
} from '../../../dialogs';
import { getEmailOnlyRegistrationTypes } from '../../selectors/shared';
import { getUpdateErrors, getModErrors, findKnownErrorResourceKey } from '../errors';
import { routeToFirstPageOfRegistrationForGroup } from '../../pathInfo';
import { getInitialProductRegistrations } from './internal';
import { startModification } from './workflow';
import {
  REMOVE_EVENT_REGISTRATION_ID,
  SET_CURRENT_EVENT_REGISTRATION_ID,
  ADD_GROUP_MEMBER_PENDING,
  ADD_GROUP_MEMBER_FAILURE,
  ADD_GROUP_MEMBER_SUCCESS
} from './actionTypes';
import { closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { updateGuestsInRegCart, removeGuestByEventRegistrationId } from './guests';
import { hasRegTypeCapacityWarning } from '../warnings';
const LOG = new Logger('redux/registrationForm/regCart/group');
import { getAvailableGroupRegTypeCapacities } from '../../../utils/regTypeCapacities';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import {
  filterEventSnapshot,
  loadGuestRegistrationContent,
  loadRegistrationContent,
  evaluateQuestionVisibilityLogic
} from '../../actions';
import { isAdmissionItemsEnabled } from '../../selectors/event';
import { populateVisibleProducts } from '../../visibleProducts';
import { PENDING_APPROVAL, POST_REGISTRATION, REGISTRATION } from '../../website/registrationProcesses';
import { getRegistrationPathIdOrNull } from '../../selectors/currentRegistrationPath';
import { groupLeaderAndGroupMemberHaveCompatibleManualApprovalSettings } from '../../../utils/registrationUtils';
import { openPrivateEventErrorDialog } from '../../../dialogs';

function setGroupLeaderAttendeeType(regCart) {
  const groupLeaderEventRegId = getPrimaryRegistrationId(regCart);
  const regCartWithGroupLeader = setIn(
    regCart,
    ['eventRegistrations', groupLeaderEventRegId, 'attendeeType'],
    'GROUP_LEADER'
  );
  return regCartWithGroupLeader;
}

function updateRegCartWithNewEventRegistration(
  eventRegId,
  regCartClient,
  accessToken,
  state,
  inviteeId,
  contactId,
  eventId,
  isTestMode,
  referenceId,
  regTypeId,
  regCart
) {
  const regCartWithGroupLeader = setGroupLeaderAttendeeType(regCart);
  const regCartWithNewEventReg = setIn(regCartWithGroupLeader, ['eventRegistrations', eventRegId], {
    eventId,
    eventRegistrationId: eventRegId,
    attendee: {
      personalInformation: {},
      eventAnswers: {}
    },
    attendeeType: 'ATTENDEE',
    primaryRegistrationId: getPrimaryRegistrationId(regCart),
    registrationTypeId: regTypeId,
    productRegistrations: getInitialProductRegistrations(state, regTypeId)
  });
  LOG.debug('added new event reg for group member', regCart);
  return regCartWithNewEventReg;
}

export function removeEventRegistrationFromRegCart(currentEventRegistrationId: $TSFixMe): $TSFixMe {
  return {
    type: REMOVE_EVENT_REGISTRATION_ID,
    payload: {
      currentEventRegistrationId,
      path: ['eventRegistrations']
    }
  };
}

export function removeGroupMembersFromRegCart(eventRegIds: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      registrationForm: { regCart }
    } = getState();
    if (currentRegistrantSelectors.isGroupRegistration(getState()) && regCart && regCart.eventRegistrations) {
      let updatedRegCart = regCart;
      for (const eventRegId of eventRegIds) {
        const guests = getGuestsOfRegistrant(regCart, eventRegId);
        /* If the GM has guest remove them then update the regCart */
        if (guests.length !== 0) {
          for (const eventReg of guests) {
            updatedRegCart = await removeGuestByEventRegistrationId(updatedRegCart, eventReg.eventRegistrationId);
          }
        }
        // remove the attendee
        updatedRegCart = await removeGuestByEventRegistrationId(updatedRegCart, eventRegId);
      }
      await dispatch(updateGuestsInRegCart(updatedRegCart));
    }
  };
}

const applyGroupMemberRegistrationTypeSelection = (
  regCartWithGroupMember,
  groupMemberEventRegId,
  inviteeId,
  contactId
) => {
  return async (dispatch, getState) => {
    dispatch(closeDialogContainer());
    const chosenRegistrationType = getIn(regCartWithGroupMember, [
      'eventRegistrations',
      groupMemberEventRegId,
      'registrationTypeId'
    ]);
    if (canAddGroupMemberFromCurrentPage(getState())) {
      await dispatch(startModification());

      const manualApprovalConfig = { knownMemberRegTypeId: chosenRegistrationType };
      if (!groupLeaderAndGroupMemberHaveCompatibleManualApprovalSettings(getState(), manualApprovalConfig)) {
        return dispatch(openPrivateEventErrorDialog());
      }

      const {
        accessToken,
        clients: { regCartClient },
        userSession: { referenceId },
        defaultUserSession: { isTestMode },
        registrationForm: { regCart },
        event
      } = getState();
      const eventId = event.id;

      let regModCartWithGroupMember = updateRegCartWithNewEventRegistration(
        groupMemberEventRegId,
        regCartClient,
        accessToken,
        getState(),
        inviteeId,
        contactId,
        eventId,
        isTestMode,
        referenceId,
        chosenRegistrationType,
        regCart
      );

      regModCartWithGroupMember = setIn(
        regModCartWithGroupMember,
        ['eventRegistrations', groupMemberEventRegId, 'registrationTypeId'],
        chosenRegistrationType
      );

      await dispatch(continueWithAddGroupMember(regModCartWithGroupMember, groupMemberEventRegId));
    } else {
      const updatedRegCart = setIn(
        regCartWithGroupMember,
        ['eventRegistrations', groupMemberEventRegId, 'productRegistrations'],
        getInitialProductRegistrations(getState(), chosenRegistrationType)
      );
      await dispatch(continueWithAddGroupMember(updatedRegCart, groupMemberEventRegId));
    }
  };
};

export function getVisibleRegTypes(
  openRegTypes: $TSFixMe,
  state: $TSFixMe,
  isAdmissionItemsEnabledFlag: $TSFixMe,
  regTypeHasAvailableAdmissionItemMap: $TSFixMe
): $TSFixMe {
  const emailOnlyTypes = getEmailOnlyRegistrationTypes(state);
  const currentRegistrationTypeId = currentRegistrantSelectors.getRegistrationTypeId(state);
  return openRegTypes.filter(regType => {
    const isEmailOnly = emailOnlyTypes.includes(regType.id);
    const hasAvailableAdmission = isAdmissionItemsEnabledFlag ? regTypeHasAvailableAdmissionItemMap[regType.id] : true;
    // If the current registrant's type is a private type and has admission available, show it as an option.
    if (regType.name !== '' && isEmailOnly && hasAvailableAdmission && regType.id === currentRegistrationTypeId)
      return true;
    // If the reg type is not associated with an private reg path and has admission available, show it as an option.
    if (regType.name !== '' && !isEmailOnly && hasAvailableAdmission) return true;
  });
}

function canAddGroupMemberFromCurrentPage(state) {
  return POST_REGISTRATION.isTypeOfCurrentPage(state) || PENDING_APPROVAL.isTypeOfCurrentPage(state);
}

export function addGroupMemberInRegCart(eventId: $TSFixMe, inviteeId?: $TSFixMe, contactId?: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      appData: {
        registrationSettings: { showModalForGroupMemberRegistrationTypes }
      }
    } = getState();
    const capacityInfo = getAvailableGroupRegTypeCapacities(getState());
    const isRegTypesEnabled = getIn(getState(), [
      'event',
      'eventFeatureSetup',
      'registrationProcess',
      'multipleRegistrationTypes'
    ]);
    const regTypes = capacityInfo.regTypeCapacitiesAvailable.map(regType => ({
      ...getState().event.registrationTypes[regType.id],
      closedForGroupMember: isRegTypesEnabled && regType.available < 1
    }));
    const openRegTypes = regTypes.filter(regType => !regType.closedForGroupMember);
    // add check to make sure published in phase 5
    const regTypeHasAvailableAdmissionItemMap = currentRegistrantSelectors.getRegTypeHasAvailableAdmissionItemMap(
      getState()
    );
    const isAdmissionItemsEnabledFlag = isAdmissionItemsEnabled(getState());
    const visibleRegTypes = getVisibleRegTypes(
      openRegTypes,
      getState(),
      isAdmissionItemsEnabledFlag,
      regTypeHasAvailableAdmissionItemMap
    );
    const displayRegTypeModal = visibleRegTypes.length > 1 && showModalForGroupMemberRegistrationTypes;
    if (canAddGroupMemberFromCurrentPage(getState()) && !displayRegTypeModal) {
      try {
        await dispatch(startModification());
      } catch (error) {
        if (getModErrors.isKnownError(error)) {
          return await dispatch(openKnownErrorDialog(findKnownErrorResourceKey(error.responseBody.validationMessages)));
        } else if (!groupLeaderAndGroupMemberHaveCompatibleManualApprovalSettings(getState())) {
          return dispatch(openPrivateEventErrorDialog());
        }
      }
    }
    const {
      accessToken,
      clients: { regCartClient },
      userSession: { referenceId },
      defaultUserSession: { isTestMode },
      registrationForm: { regCart }
    } = getState();
    /**
     * If there is only one visible regType to the member, we automatically give them that,
     * if not, we give the default regType and dispatch the regtype selection modal.
     */
    let regTypeIdToSet = defaultRegistrationTypeId;
    if (openRegTypes && openRegTypes.length > 0 && visibleRegTypes.length < 2) {
      regTypeIdToSet = (visibleRegTypes.length === 0 ? openRegTypes : visibleRegTypes)[0].id;
    }
    const eventRegId = String(uuid.v4());
    const regCartWithGroupMember = await updateRegCartWithNewEventRegistration(
      eventRegId,
      regCartClient,
      accessToken,
      getState(),
      inviteeId,
      contactId,
      eventId,
      isTestMode,
      referenceId,
      regTypeIdToSet,
      regCart
    );

    if (displayRegTypeModal) {
      return dispatch(
        openGroupRegistrationTypeDialog(
          visibleRegTypes,
          regCartWithGroupMember,
          eventRegId,
          applyGroupMemberRegistrationTypeSelection,
          inviteeId,
          contactId,
          regTypeHasAvailableAdmissionItemMap,
          isAdmissionItemsEnabledFlag
        )
      );
    }
    await dispatch(continueWithAddGroupMember(regCartWithGroupMember, eventRegId));
  };
}

const setCurrentEventRegistrationId = eventRegistrationId => dispatch => {
  dispatch({
    type: SET_CURRENT_EVENT_REGISTRATION_ID,
    payload: {
      currentEventRegistrationId: eventRegistrationId
    }
  });
};

function continueWithAddGroupMember(regCartWithGroupMember, groupMemberEventRegId) {
  return async (dispatch, getState) => {
    dispatch({
      type: ADD_GROUP_MEMBER_PENDING
    });
    let response;
    const {
      accessToken,
      clients: { regCartClient },
      text: { translate },
      event,
      account
    } = getState();
    try {
      response = await regCartClient.updateRegCart(accessToken, regCartWithGroupMember);
      dispatch({
        type: ADD_GROUP_MEMBER_SUCCESS,
        payload: {
          regCart: response.regCart,
          validationMessages: response.validationMessages,
          currentEventRegistrationId: groupMemberEventRegId
        }
      });
      const regCart = response.regCart.eventRegistrations ? response.regCart : regCartWithGroupMember;
      // filter snaphsot to show updated prices for products for the group member
      const { registrationTypeId, registrationPathId } = regCart.eventRegistrations[groupMemberEventRegId];
      await dispatch(filterEventSnapshot(getState().eventSnapshotVersion, registrationTypeId, registrationPathId));
      await dispatch(loadAvailableCapacityCounts());
      LOG.debug('addGroupMember success');
    } catch (error) {
      LOG.info('addGroupMember failed', error);
      // if we get external auth or oauth error , we need to redirect to external auth or oauth url
      if (
        getUpdateErrors.handleAuthError(
          error,
          account,
          event,
          getRegistrationTypeId(regCartWithGroupMember, groupMemberEventRegId),
          getRegistrationPathId(regCartWithGroupMember, groupMemberEventRegId)
        )
      ) {
        return;
      }
      dispatch({ type: ADD_GROUP_MEMBER_FAILURE, payload: { error } });
      dispatch(hideLoadingOnError());
      if (getUpdateErrors.isAddGroupMemberNotAvailableError(error)) {
        await dispatch(loadAvailableCapacityCounts());
        return await dispatch(
          openCapacityReachedDialog({
            subMessage: translate('EventGuestSide_GroupMember_CapacityReachedError__resx')
          })
        );
      }
      if (getUpdateErrors.isRegTypeInvalidForGroup(error)) {
        const subMessage = 'EventGuestSide_RegistrationTypeError_NoRegistrationTypeAvailableHelpText_resx';
        const message = 'EventGuestSide_RegistrationTypeConflict_Title_resx';
        return await dispatch(openKnownErrorDialog(subMessage, message));
      }
      if (getUpdateErrors.isAdmissionItemsNotAvailableForRegTypeError(error)) {
        const callBack = () => {
          const state = getState();
          const capacityInfo = getAvailableGroupRegTypeCapacities(state);
          const regTypes = capacityInfo.regTypeCapacitiesAvailable.map(regType => ({
            ...state.event.registrationTypes[regType.id],
            closedForGroupMember: regType.available < 1
          }));
          return dispatch(
            openGroupRegistrationTypeDialog(
              regTypes,
              regCartWithGroupMember,
              groupMemberEventRegId,
              applyGroupMemberRegistrationTypeSelection
            )
          );
        };
        return dispatch(openNoAdmissionItemAvailableForRegistrationTypeDialog(callBack));
      }
      throw error;
    }
    if (hasRegTypeCapacityWarning(getState())) {
      await dispatch(loadAvailableCapacityCounts());
      dispatch(setCurrentEventRegistrationId(getPrimaryRegistrationId(regCartWithGroupMember)));
      await dispatch(removeGroupMembersFromRegCart([groupMemberEventRegId]));
      return await dispatch(
        openCapacityReachedDialog({
          subMessage: getState().text.translate('EventGuestSide_RegType_CapacityReachedSubMessage__resx')
        })
      );
    }
    await Promise.all([
      dispatch(populateVisibleProducts()),
      dispatch(loadRegistrationContent(REGISTRATION, getRegistrationPathIdOrNull(getState()))),
      dispatch(loadGuestRegistrationContent(getRegistrationPathIdOrNull(getState()))),
      dispatch(evaluateQuestionVisibilityLogic(null, true))
    ]);
    await dispatch(
      routeToFirstPageOfRegistrationForGroup(
        groupMemberEventRegId,
        REGISTRATION.forCurrentRegistrant().startPageId(getState())
      )
    );
    return response;
  };
}

export const navigateToGroupMemberRegistration =
  (eventRegistrationId: $TSFixMe): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    dispatch(setCurrentEventRegistrationId(eventRegistrationId));
    const {
      registrationForm: { regCart }
    } = getState();
    // filter snaphsot to show updated prices for products for the group member
    const { registrationTypeId, registrationPathId } = regCart.eventRegistrations[eventRegistrationId];
    await Promise.all([
      dispatch(filterEventSnapshot(getState().eventSnapshotVersion, registrationTypeId, registrationPathId)),
      dispatch(loadRegistrationContent(REGISTRATION, getRegistrationPathIdOrNull(getState())))
    ]);
    await dispatch(
      routeToFirstPageOfRegistrationForGroup(
        eventRegistrationId,
        REGISTRATION.forCurrentRegistrant().startPageId(getState())
      )
    );
  };
