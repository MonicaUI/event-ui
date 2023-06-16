import { NOT_VISIBLE } from 'cvent-question-widgets/lib/DisplayType';
import StandardContactFields from 'event-widgets/lib/StandardContactFields/StandardContactFields';
import getJSONValue from 'nucleus-widgets/utils/fields/getJSONValue';
import { SAVING_REGISTRATION } from '../../registrationIntents';
import { UPDATE_REG_CART_FAILURE, UPDATE_REG_CART_PENDING, UPDATE_REG_CART_SUCCESS } from './actionTypes';
import { getIn, setIn, updateIn } from 'icepick';
import { setAdminRegOnProductionSelection } from './internal';
import { updateGuestsToMatchPrimaryReg } from './guests';
import {
  evaluateQuestionVisibilityLogic,
  filterEventSnapshot,
  loadGuestRegistrationContent,
  loadRegistrationContent
} from '../../actions';
import { getRegPackId, isAttendeeListOptInAutomatic } from '../../selectors/shared';
import { updateRegTypeAndAdmissionItemIdsInTravelBookings } from '../../travelCart';
import { clearInapplicableSelectedPaymentMethod } from '../regCartPayment/actions';
import { getAllSessionCapacityIds, loadCapacity } from 'event-widgets/redux/modules/capacity';
import { loadAvailableCapacityCounts } from '../../capacity';
import { hideLoadingOnError } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { findKnownErrorResourceKey, getUpdateErrors, isProductCapacityReached } from '../errors';
import { openCapacityReachedDialog, openPrivateEventErrorDialog } from '../../../dialogs';
import Logger from '@cvent/nucleus-logging';
import { pickBy, set, merge, isEmpty } from 'lodash';
import { openKnownErrorDialog } from '../../../dialogs/KnownErrorDialog';
import { REGISTRATION } from '../../website/registrationProcesses';
import { getRegistrationPathId, getRegistrationTypeId, isPlaceholderRegCart } from './selectors';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';
import { shouldUseAirOptOutFeature } from '../../../ExperimentHelper';
import { handleRegTypeConflictFromServiceValidationResult } from '../../../dialogs/selectionConflictDialogs';
import { handleEmbeddedRegistrationCartCreationAndDetermineNextSteps, handleRegCartSave } from './embeddedRegistration';

const LOG = new Logger('redux/registrationForm/regCart/partialUpdates');

export const SESSION_THRESHOLD = 100;

function getVisibleFieldValues(state, unsavedPersonalInformation, regPathId, updatedPersonalInformation) {
  // unsaved changes stays on top so that attendee input is not lost
  const personalInformation = merge({}, updatedPersonalInformation, unsavedPersonalInformation);
  const regPath = state.appData.registrationSettings.registrationPaths[regPathId];
  const regFields = regPath.registrationPageFields[1].registrationFields;
  const customFields = pickBy(personalInformation.customFields, (field, fieldId) => {
    return regFields[fieldId] && regFields[fieldId].display !== NOT_VISIBLE;
  });
  const result = { customFields };
  Object.keys(StandardContactFields).forEach(fieldId => {
    if (regFields[fieldId] && regFields[fieldId].display !== NOT_VISIBLE) {
      const path = StandardContactFields[fieldId].regApiPath;
      const value = getJSONValue(personalInformation, path);
      if (value) {
        set(result, path, value);
      }
    }
  });
  return result;
}

function getVisibleQuestionAnswers(state, eventAnswers, regPathId) {
  const { registrationQuestions, productQuestions } = state.appData.registrationSettings;
  return pickBy(eventAnswers, (answer, questionId) => {
    return (
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      (registrationQuestions[questionId] &&
        registrationQuestions[questionId].registrationPathQuestionAssociations.includes(regPathId)) || // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      (productQuestions[questionId] &&
        productQuestions[questionId].registrationPathQuestionAssociations.includes(regPathId))
    );
  });
}

function getVisibleFieldsAndQuestionValues(state, unsavedAttendee, regPathId, updatedAttendee) {
  return {
    personalInformation: getVisibleFieldValues(
      state,
      unsavedAttendee.personalInformation,
      regPathId,
      updatedAttendee.personalInformation
    ),
    eventAnswers: getVisibleQuestionAnswers(state, unsavedAttendee.eventAnswers, regPathId)
  };
}

function getTermsAndConditionsValues(state, attendee, regPathId) {
  const regPath = state.appData.registrationSettings.registrationPaths[regPathId];
  const termsConditionsEnabled = regPath.termsConditionsEnabled;
  if (termsConditionsEnabled) {
    return {
      termsAndConditionsAccepted: attendee.termsAndConditionsAccepted
    };
  }
  return {};
}

function getDisplayOnAttendeeListValue(attendee, regPathId, oldRegPathId, state) {
  if (
    (regPathId !== oldRegPathId && !isAttendeeListOptInAutomatic(state, regPathId)) ||
    typeof attendee.displayOnAttendeeList !== 'boolean'
  ) {
    return {};
  }
  return {
    displayOnAttendeeList: attendee.displayOnAttendeeList
  };
}

function getReceiveAttendeeEmail(attendee) {
  if (typeof attendee.receiveAttendeeEmail === 'boolean') {
    return {
      receiveAttendeeEmail: attendee.receiveAttendeeEmail
    };
  }
  return {};
}

export function getAttendeeFieldValues(
  state: $TSFixMe,
  unsavedAttendee: $TSFixMe,
  regPathId: $TSFixMe,
  oldRegPathId?: $TSFixMe,
  updatedAttendee = {}
): $TSFixMe {
  return merge(
    getVisibleFieldsAndQuestionValues(state, unsavedAttendee, regPathId, updatedAttendee),
    getTermsAndConditionsValues(state, unsavedAttendee, regPathId),
    isAttendeeListOptInAutomatic(state, regPathId)
      ? { displayOnAttendeeList: true }
      : getDisplayOnAttendeeListValue(unsavedAttendee, regPathId, oldRegPathId, state),
    getReceiveAttendeeEmail(unsavedAttendee),
    { attendeeId: (updatedAttendee as $TSFixMe).attendeeId },
    { airOptOutChoice: shouldUseAirOptOutFeature(state) ? unsavedAttendee.airOptOutChoice : null }
  );
}

/**
 * Selectively update requested fields in RegCart:
 * 1. registrationType, 2. productRegistrations, 3. sessionRegistrations
 * These product selection requires immediate server side update (outside of automatic save on page navigation)
 */
export function applyPartialEventRegistrationUpdate(
  eventRegistrationId: $TSFixMe,
  eventRegUpdates: $TSFixMe,
  guestEventRegUpdates?: $TSFixMe,
  productId?: $TSFixMe,
  isSessionSelectionUpdate?: $TSFixMe,
  donationItemIdsRemoved?: $TSFixMe
) {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    await dispatch(
      applyPartialEventRegistrationUpdateInner(
        eventRegistrationId,
        eventRegUpdates,
        guestEventRegUpdates,
        productId,
        isSessionSelectionUpdate,
        donationItemIdsRemoved
      )
    );
    await dispatch(evaluateQuestionVisibilityLogic(null, true));
  };
}

function loadNewContent(eventRegistrationId, oldRegCart, newRegCart) {
  return async (dispatch, getState) => {
    const { registrationTypeId: newRegTypeId, registrationPathId: newRegPathId } = getIn(newRegCart, [
      'eventRegistrations',
      eventRegistrationId
    ]);
    const { registrationTypeId, registrationPathId } = getIn(oldRegCart, ['eventRegistrations', eventRegistrationId]);
    const reloadPromises = [];
    if (registrationTypeId !== newRegTypeId || registrationPathId !== newRegPathId) {
      reloadPromises.push(dispatch(filterEventSnapshot(getState().eventSnapshotVersion, newRegTypeId, newRegPathId)));
    }
    if (registrationPathId !== newRegPathId) {
      reloadPromises.push(
        dispatch(loadRegistrationContent(REGISTRATION, newRegPathId)),
        dispatch(loadGuestRegistrationContent(newRegPathId))
      );
    }
    await Promise.all(reloadPromises);
  };
}

function applyPartialEventRegistrationUpdateInner(
  eventRegistrationId,
  eventRegUpdates,
  guestEventRegUpdates,
  productId,
  isSessionSelectionUpdate,
  donationItemIdsRemoved
) {
  // eslint-disable-next-line complexity
  return async (dispatch, getState) => {
    LOG.debug('applyPartialEventRegistrationUpdate', eventRegistrationId, eventRegUpdates);
    let shouldSaveCart = true;
    if (isPlaceholderRegCart(getState().registrationForm?.regCart)) {
      let shouldContinue;
      ({ shouldContinue, shouldSaveCart } = await handleEmbeddedRegistrationCartCreationAndDetermineNextSteps(
        dispatch,
        getState,
        eventRegistrationId,
        eventRegUpdates
      ));
      if (!shouldContinue) {
        return;
      }
    }

    const {
      accessToken,
      registrationForm: { regCart: cart },
      regCartStatus: { lastSavedRegCart, registrationIntent },
      clients: { regCartClient },
      event,
      account
    } = getState();
    const { attendingFormat = AttendingFormat.INPERSON } = event;
    if (registrationIntent === SAVING_REGISTRATION) {
      return;
    }
    dispatch({ type: UPDATE_REG_CART_PENDING });
    const lastSavedAttendee = getIn(lastSavedRegCart, ['eventRegistrations', eventRegistrationId, 'attendee']);
    let lastSavedDonationItemRegistrations = getIn(lastSavedRegCart, [
      'eventRegistrations',
      eventRegistrationId,
      'donationItemRegistrations'
    ]);
    const currentVoucher = getIn(cart, ['eventRegistrations', eventRegistrationId, 'appliedVoucher']);
    const registrationStatus = getIn(cart, ['eventRegistrations', eventRegistrationId, 'registrationStatus']);
    let cartWithSelection = updateIn(cart, ['eventRegistrations', eventRegistrationId], eventReg => {
      let appliedVoucher = {};
      if (!!currentVoucher && !isEmpty(currentVoucher)) {
        appliedVoucher = { appliedVoucher: {} };
        /*
         * The voucher must be included (if present) or capacity will be reserved as if it is a newly used voucher
         * during reg mod
         */
        if (registrationStatus === 'REGISTERED') {
          appliedVoucher = { appliedVoucher: currentVoucher };
        }
      }
      // remove donation items that have been cleared
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      const donationIdsRemoved = donationItemIdsRemoved && donationItemIdsRemoved[eventReg.eventRegistrationId];
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (donationIdsRemoved && donationIdsRemoved.length) {
        // create copy of the donation items state object to be mutated
        lastSavedDonationItemRegistrations = { ...lastSavedDonationItemRegistrations };
        donationIdsRemoved.forEach(donationId => {
          delete lastSavedDonationItemRegistrations[donationId];
        });
      }
      return {
        ...eventReg,
        ...eventRegUpdates,
        attendee: lastSavedAttendee,
        donationItemRegistrations: lastSavedDonationItemRegistrations,
        ...appliedVoucher
      };
    });
    // Remove admin infomation from regcart with updates
    cartWithSelection = setAdminRegOnProductionSelection(lastSavedRegCart, cartWithSelection);

    /* Simple guests take the same products as the primary always. Complex guests can have diffent products. */
    if (guestEventRegUpdates) {
      Object.keys(guestEventRegUpdates).forEach(updatedGuestRegId => {
        cartWithSelection = updateIn(cartWithSelection, ['eventRegistrations', updatedGuestRegId], currentGuestReg => {
          return {
            ...currentGuestReg,
            ...guestEventRegUpdates[updatedGuestRegId]
          };
        });
      });
    }

    // Don't match sessions or admission items for complex guests
    cartWithSelection = updateGuestsToMatchPrimaryReg(cartWithSelection, eventRegistrationId, getState(), productId);

    try {
      LOG.debug('updateRegCart', cartWithSelection);
      const response = await handleRegCartSave(
        regCartClient,
        accessToken,
        cartWithSelection,
        lastSavedRegCart,
        shouldSaveCart
      );
      LOG.debug('updateRegCart success');
      const savedRegCart = response.regCart;
      const { registrationTypeId, registrationPathId } = getIn(lastSavedRegCart, [
        'eventRegistrations',
        eventRegistrationId
      ]);

      await dispatch(loadNewContent(eventRegistrationId, lastSavedRegCart, savedRegCart));

      const { registrationTypeId: newRegTypeId, registrationPathId: newRegPathId } = getIn(savedRegCart, [
        'eventRegistrations',
        eventRegistrationId
      ]);
      let updatedAttendee = {};
      if (registrationTypeId !== newRegTypeId || registrationPathId !== newRegPathId) {
        // if reg path changed, we need to apply attendee field updates so that they get pre-populated when applicable
        updatedAttendee = getIn(savedRegCart, ['eventRegistrations', eventRegistrationId, 'attendee']);
      }

      // Put the information that wasn't saved as part of selecting a product back in the reg cart
      const notSavedAttendee = getAttendeeFieldValues(
        getState(),
        getIn(cart, ['eventRegistrations', eventRegistrationId, 'attendee']),
        getIn(savedRegCart, ['eventRegistrations', eventRegistrationId, 'registrationPathId']),
        registrationPathId,
        updatedAttendee
      );
      let regCartWithUnsavedChanges = setIn(
        savedRegCart,
        ['eventRegistrations', eventRegistrationId, 'attendee'],
        notSavedAttendee
      );
      const notSavedDonationItemsReg = getIn(cart, [
        'eventRegistrations',
        eventRegistrationId,
        'donationItemRegistrations'
      ]);
      regCartWithUnsavedChanges = setIn(
        regCartWithUnsavedChanges,
        ['eventRegistrations', eventRegistrationId, 'donationItemRegistrations'],
        notSavedDonationItemsReg
      );
      if (guestEventRegUpdates) {
        Object.keys(guestEventRegUpdates)
          .filter(eventRegId => eventRegId !== eventRegistrationId)
          .forEach(guestEventRegId => {
            const notSavedGuest = getAttendeeFieldValues(
              getState(),
              getIn(cart, ['eventRegistrations', guestEventRegId, 'attendee']),
              getIn(savedRegCart, ['eventRegistrations', guestEventRegId, 'registrationPathId']),
              registrationPathId
            );
            regCartWithUnsavedChanges = setIn(
              regCartWithUnsavedChanges,
              ['eventRegistrations', guestEventRegId, 'attendee'],
              notSavedGuest
            );
          });
      }
      const notSavedVoucher = getIn(cart, ['eventRegistrations', eventRegistrationId, 'appliedVoucher']);
      if (!isEmpty(notSavedVoucher)) {
        regCartWithUnsavedChanges = setIn(
          regCartWithUnsavedChanges,
          ['eventRegistrations', eventRegistrationId, 'appliedVoucher'],
          notSavedVoucher
        );
      }
      // Put back unsaved Admin information
      regCartWithUnsavedChanges = setAdminRegOnProductionSelection(cart, regCartWithUnsavedChanges);
      dispatch({
        type: UPDATE_REG_CART_SUCCESS,
        payload: {
          regCart: regCartWithUnsavedChanges,
          savedRegCart,
          validationMessages: response.validationMessages
        }
      });
      // Update the reg type ids and admission item ids in the travel cart if anything has changed
      if (!isSessionSelectionUpdate) {
        await dispatch(updateRegTypeAndAdmissionItemIdsInTravelBookings());
        LOG.debug('loadAvailableCapacityCounts');
      }

      // Allowed payment methods might have changed, clear the selected payment method if it is no longer allowed
      dispatch(clearInapplicableSelectedPaymentMethod());

      /*
       * Due to performance degradation for events with a large number of sessions, we will be passing
       * sessionId of the (un)selected session to loadCapacity(), for events havng # of sessions greater
       * than the SESSION_THRESHOLD value, so that only the (un)selected session's capacity is loaded along
       * with that of all the admisison items, regTypes, and the event itself. These will then be merged
       * along with the rest of the sessions' capacities.
       */
      const sessionCount = getAllSessionCapacityIds(event).length;
      if (isSessionSelectionUpdate && sessionCount > SESSION_THRESHOLD) {
        const regPackId = getRegPackId(getState());
        await Promise.all([dispatch(loadCapacity(productId, regPackId))]);
      } else {
        await Promise.all([dispatch(loadAvailableCapacityCounts())]);
      }
      LOG.debug('loadAvailableCapacityCounts success');
    } catch (error) {
      LOG.info('applyPartialEventRegistrationUpdate failed', error);
      // if we get external auth or oauth error , we need to redirect to external auth or oauth url
      if (
        getUpdateErrors.handleAuthError(
          error,
          account,
          event,
          getRegistrationTypeId(cartWithSelection, eventRegistrationId),
          getRegistrationPathId(cartWithSelection, eventRegistrationId)
        )
      ) {
        return;
      }
      dispatch({ type: UPDATE_REG_CART_FAILURE, payload: { error } });
      dispatch(hideLoadingOnError());
      const sessionBundleRegTypeConflictValidations = getUpdateErrors.getRegTypeConflictSessionBundleParams(error);
      if (sessionBundleRegTypeConflictValidations?.length > 0) {
        return await dispatch(
          handleRegTypeConflictFromServiceValidationResult(
            eventRegistrationId,
            sessionBundleRegTypeConflictValidations,
            null
          )
        );
      } else if (isProductCapacityReached(error, attendingFormat)) {
        dispatch(loadAvailableCapacityCounts());
        return await dispatch(openCapacityReachedDialog());
      } else if (getUpdateErrors.isEventClosed(error)) {
        return await dispatch(openPrivateEventErrorDialog());
      } else if (getUpdateErrors.isSessionOverlapError(error)) {
        return;
      } else if (getUpdateErrors.isKnownError(error)) {
        return dispatch(openKnownErrorDialog(findKnownErrorResourceKey(error.responseBody.validationMessages)));
      }
      throw error;
    }
  };
}
