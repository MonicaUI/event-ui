import RegistrationTypeWidget from 'event-widgets/lib/RegistrationType/RegistrationTypeWidget';
import { ChoiceSortOrders } from 'event-widgets/lib/RegistrationType/RegistrationTypeSettings';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import {
  runRegistrationTypeChangeValidationsForPrimaryAndGuest,
  setRegistrationTypeId,
  setAirRequestOptOutChoice
} from '../../redux/registrationForm/regCart';
import { connect, useSelector, useStore } from 'react-redux';
import { evaluateQuestionVisibilityLogic } from '../../redux/actions';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import {
  validateUserRegistrationTypeSelection,
  handleRegistrationTypeSelectionConflict
} from '../../dialogs/selectionConflictDialogs';
import { hasRegTypeCapacityWarning } from '../../redux/registrationForm/warnings';
import { getRegistrationPathIdForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { getEventRegistration } from '../../redux/registrationForm/regCart/selectors';
import { routeToPage } from '../../redux/pathInfo';
import { getUpdateErrors } from '../../redux/registrationForm/errors';
import {
  openPrivateEventErrorDialog,
  openCapacityReachedDialog,
  openNoAdmissionItemAvailableForRegistrationTypeDialog,
  openEventTemporaryClosedErrorDialog
} from '../../dialogs';
import * as eventRegistrationData from '../../utils/eventRegistrationData';
import { isAdmissionItemsEnabled } from '../../redux/selectors/event';
import { getAvailableRegTypeCapacities } from '../../utils/regTypeCapacities';
import { toggleScrollToRegType as sessionToggleScrollToRegType } from '../../redux/userSession';
import { REGTYPE_CHANGED } from '../../redux/registrationForm/regCart/actionTypes';
import { isGraphQLForEventCapacitiesVariantON } from '../../ExperimentHelper';

import {
  getRegistrationTypeId,
  getEventRegistrationId,
  isGroupMember,
  getTemporaryGuestEventRegistrationId,
  isAttendeeRegistered,
  getVisibleRegistrationTypes,
  getRegTypeHasAvailableAdmissionItemMap,
  getVisibleRegistrationTypesForGuestDialog,
  getVoucherCode,
  getConfirmedGuests
} from '../../redux/selectors/currentRegistrant';
import {
  getRegistrationPathId,
  isGuestProductSelectionEnabledOnRegPath
} from '../../redux/selectors/currentRegistrationPath';
import { isVoucherEnabled, areRegistrationActionsDisabled } from '../../redux/selectors/shared';
import { populateVisibleProducts } from '../../redux/visibleProducts';
import { REGISTRATION } from '../../redux/website/registrationProcesses';
import { updateEventVoucher } from '../../redux/registrationForm/regCart/actions';
import { eventHasMultipleLanguages } from 'event-widgets/utils/multiLanguageUtils';
import { AttendingFormat, shouldHybridFlowWork } from 'event-widgets/utils/AttendingFormatUtils';
import { TRAVEL_OPT_OUT_CHOICE } from 'event-widgets/utils/travelConstants';
import { shouldUseAirOptOutFeature } from '../../ExperimentHelper';
import React from 'react';
import { useRegTypes } from './useRegTypes';
import { getAnswer, getAttendeeType } from './regTypeUtils';

export function routeToNewRegPath(eventRegistrationId: $TSFixMe, regTypeId: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    try {
      const regPathId = getRegistrationPathId(getState());
      await dispatch(setRegistrationTypeId(eventRegistrationId, regTypeId));
      const translate = getState().text.translate;
      if (hasRegTypeCapacityWarning(getState())) {
        return await dispatch(
          openCapacityReachedDialog({ subMessage: translate('EventGuestSide_RegType_CapacityReachedSubMessage__resx') })
        );
      }
      const newRegPathId = getRegistrationPathId(getState());

      // get visible products everytime reselect regType.
      await dispatch(populateVisibleProducts());
      await dispatch(evaluateQuestionVisibilityLogic(null, true));

      if (shouldUseAirOptOutFeature(getState())) {
        const attendee = getState().registrationForm.regCart.eventRegistrations[eventRegistrationId].attendee;
        if (attendee.airOptOutChoice !== TRAVEL_OPT_OUT_CHOICE.NOT_APPLICABLE) {
          await dispatch(setAirRequestOptOutChoice(eventRegistrationId, TRAVEL_OPT_OUT_CHOICE.NOT_APPLICABLE));
        }
      }
      if (regPathId !== newRegPathId) {
        dispatch(routeToPage(REGISTRATION.forRegistrationPath(newRegPathId).startPageId(getState())));
        // remove voucher after switching reg path if present and new reg path doesn't have voucher enabled
        if (!isVoucherEnabled(getState(), newRegPathId) && getVoucherCode(getState(), eventRegistrationId)) {
          dispatch(updateEventVoucher(eventRegistrationId, ''));
        }
      }
    } catch (error) {
      if (
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
        getUpdateErrors.isPrivateEvent(error, getState()) ||
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0-1 arguments, but got 2.
        getUpdateErrors.isAttendeeNotAllowedByCustomLogic(error, getState())
      ) {
        return dispatch(openPrivateEventErrorDialog());
      }
      if (getUpdateErrors.isAdmissionItemsNotAvailableForRegTypeError(error)) {
        return dispatch(openNoAdmissionItemAvailableForRegistrationTypeDialog());
      }
      throw error;
    }
  };
}

function changeGuestRegType(answerSetterAction, regTypeId) {
  return async dispatch => {
    await dispatch(eventRegistrationData.setAnswerAction(answerSetterAction, regTypeId));
    await dispatch(evaluateQuestionVisibilityLogic(null, true, true));
  };
}

function changeAttendeeRegType(eventRegistrationId, customFieldId, regTypeId) {
  return async (dispatch, getState, { apolloClient }) => {
    const { attendingFormat = AttendingFormat.INPERSON } = getState().event;
    try {
      const regTypeChangeValidations = await runRegistrationTypeChangeValidationsForPrimaryAndGuest(
        validateUserRegistrationTypeSelection,
        regTypeId,
        getState(),
        false,
        apolloClient
      );
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (regTypeChangeValidations && regTypeChangeValidations.hasConflicts) {
        return dispatch(
          handleRegistrationTypeSelectionConflict(regTypeChangeValidations.validationResults, null, null, () =>
            routeToNewRegPath(eventRegistrationId, regTypeId)
          )
        );
      }
      // We are saving a flag regTypeChanged when reg type is change to handle read only fields
      const existingRegTypeId = getRegistrationTypeId(getState());
      dispatch({ type: REGTYPE_CHANGED, payload: { regTypeChanged: existingRegTypeId !== regTypeId } });
      await dispatch(routeToNewRegPath(eventRegistrationId, regTypeId));
      if (!getState().userSession.scrollToRegTyoe) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 2.
        dispatch(toggleScrollToRegType(dispatch, getState()));
      }
    } catch (error) {
      if (
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
        getUpdateErrors.isPrivateEvent(error, getState()) ||
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0-1 arguments, but got 2.
        getUpdateErrors.isAttendeeNotAllowedByCustomLogic(error, getState())
      ) {
        return dispatch(openPrivateEventErrorDialog());
      }
      if (getUpdateErrors.isAdmissionItemsNotAvailableForRegTypeError(error)) {
        return dispatch(openNoAdmissionItemAvailableForRegistrationTypeDialog());
      }
      if (shouldHybridFlowWork(attendingFormat) && getUpdateErrors.isEventTemporaryClosed(error)) {
        return dispatch(
          openEventTemporaryClosedErrorDialog('EventGuestSide_EventTemporaryClosed_Error_SubMessage__resx', false)
        );
      }
      throw error;
    }
  };
}

function toggleScrollToRegType() {
  return async (dispatch, getState) => {
    await sessionToggleScrollToRegType(dispatch, getState());
  };
}

const RegistrationTypeWidgetConnect = connect(
  () => {
    // eslint-disable-next-line complexity
    return (state: $TSFixMe, props: $TSFixMe) => {
      const registrationTypeId = getRegistrationTypeId(state);
      const regPathId = getRegistrationPathIdForWidget(state, props.id);
      const registrationId = getEventRegistrationId(state);
      const groupMember = isGroupMember(state, registrationId);
      const capacityInfo = props.capacityInfo;
      const regTypeAssociatedVisibility = props.regTypeAssociatedVisibility;
      const answer = getAnswer(state, props);

      let choices;
      if (answer.isWidgetPlacedOnGuestModal) {
        choices = getVisibleRegistrationTypesForGuestDialog(state, regPathId, defaultRegistrationTypeId);
      } else {
        choices = getVisibleRegistrationTypes(state, regPathId, registrationTypeId);
      }

      const thisAttendee = answer.isWidgetPlacedOnGuestModal
        ? getTemporaryGuestEventRegistrationId(state)
        : registrationId;

      const regInRegCart = getEventRegistration(state.registrationForm.regCart, thisAttendee);
      const disableRegistration = areRegistrationActionsDisabled(state) ?? false;
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      const selectedRegistrationTypeInCart = regInRegCart && regInRegCart.registrationTypeId;
      const attendeeRegistered = isAttendeeRegistered(state, thisAttendee);
      const isWidgetPlacedOnGuestModal = answer.isWidgetPlacedOnGuestModal;

      const isAutoAssignRegTypeForEventRegistration =
        state.experiments?.isFlexAutoAssignRegTypeEnabled && regInRegCart?.autoAssignRegTypeForEventRegistration;

      const checkGuestCount = !isWidgetPlacedOnGuestModal && !isGuestProductSelectionEnabledOnRegPath(state);
      const regTypeHasAvailableAdmissionItemMap =
        regTypeAssociatedVisibility ??
        getRegTypeHasAvailableAdmissionItemMap(state, checkGuestCount ? getConfirmedGuests(state).length : null);

      for (const choice of choices) {
        const info = capacityInfo?.regTypeCapacitiesAvailable?.find(regType => regType.id === choice.id);

        /*
         * info may be null if three conditions are ALL true:
         * 1) this widget is in the guest reg modal
         * 2) the choice in question is "no registration type"
         * 3) "limitVisbility" is turned on.
         * if the above conditions are true, we are isn the awkward position of making the
         * "no registration type" choice available, even though it is not technically a valid choice.
         */
        choice.closed = info == null || info.available < 1 || info.visible === 'CLOSED';
      }

      const {
        appData: {
          registrationSettings: { showModalForGroupMemberRegistrationTypes }
        }
      } = state;
      /**
       * If group registation only make it readOnly if all these conditions are met.
       * 1. showModalForGroupMembrRegistrationTypes flag is true
       * 2. isGroupMember returns true
       * 3. the widget isn't placed on GuestModal
       */
      const disableForGroupMember =
        showModalForGroupMemberRegistrationTypes && groupMember && !isWidgetPlacedOnGuestModal;
      const hasMultiLanguage = eventHasMultipleLanguages(state.event);
      const { attendingFormat = AttendingFormat.INPERSON } = state.event;

      return {
        choices,
        choiceSortOrder: ChoiceSortOrders.AS_ENTERED,
        disabled: disableRegistration,
        readOnly: attendeeRegistered || disableForGroupMember || isAutoAssignRegTypeForEventRegistration,
        hideWhenNoChoices: true,
        selectedRegistrationType: answer.value,
        selectedRegistrationTypeInCart,
        eventRegistrationId: registrationId,
        locale: state.text.locale,
        capacity: state.capacity,
        plannerRegistration: state.defaultUserSession.isPlanner,
        isWidgetPlacedOnGuestModal,
        guestSetterAction: answer.setterAction,
        regTypeHasAvailableAdmissionItemMap,
        isAdmissionItemsEnabled: isAdmissionItemsEnabled(state),
        scrollToRegType: state.userSession.scrollToRegType,
        toggleScrollToRegType,
        hasMultiLanguage,
        attendingFormat
      };
    };
  },
  {
    changeAttendeeRegType: withLoading(changeAttendeeRegType),
    changeGuestRegType: withLoading(changeGuestRegType)
  },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    const onRegTypeChange = stateProps.isWidgetPlacedOnGuestModal
      ? dispatchProps.changeGuestRegType.bind(null, stateProps.guestSetterAction)
      : dispatchProps.changeAttendeeRegType.bind(null, stateProps.eventRegistrationId, ownProps.id);

    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      onRegTypeChange,
      fieldName: stateProps.isWidgetPlacedOnGuestModal ? 'GuestRegistrationType' : 'RegistrationType'
    };
  }
)(RegistrationTypeWidget);

function regTypeAssociatedVisibilityFn(array, key) {
  return (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    array &&
    array.reduce(
      (existing, regType) => ({
        ...existing,
        [regType[key]]: regType.visible === 'AVAILABLE'
      }),
      {}
    )
  );
}

function RegistrationTypeWidgetGraphQL(props) {
  const registrationTypes = useRegTypes(props);
  const capacityInfo = { regTypeCapacitiesAvailable: registrationTypes };
  const regTypeAssociatedVisibility = regTypeAssociatedVisibilityFn(registrationTypes, 'id');
  return (
    <RegistrationTypeWidgetConnect
      {...props}
      capacityInfo={capacityInfo}
      regTypeAssociatedVisibility={regTypeAssociatedVisibility}
    />
  );
}

function RegistrationTypeWidgetCapacity(props) {
  const store = useStore();
  const state = store.getState();
  const attendeeType = getAttendeeType(state, props);
  const capacityInfo = getAvailableRegTypeCapacities(state, attendeeType);
  return <RegistrationTypeWidgetConnect {...props} capacityInfo={capacityInfo} />;
}

export default function RegistrationTypeExperimentWrapper(props: $TSFixMe): $TSFixMe {
  const isGraphQLExperimentON = useSelector(isGraphQLForEventCapacitiesVariantON);
  if (isGraphQLExperimentON) return <RegistrationTypeWidgetGraphQL {...props} />;
  return <RegistrationTypeWidgetCapacity {...props} />;
}
