import React from 'react';
import { setIn, getIn } from 'icepick';
import { returnToProcessStart } from './SelectionConflictDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import DialogStyles from './SelectionConflictDialog.less';
import { updateGuestsInRegCart } from '../../redux/registrationForm/regCart';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { injectTestId } from '@cvent/nucleus-test-automation';
import { getGuestsOfRegistrant, getSelectedAdmissionItem } from '../../redux/registrationForm/regCart/selectors';
import { openCapacityReachedDialog } from '../CapacityReachedDialog';
import {
  getEventRegistrationId,
  guestRegistrantsCount,
  getSelectedAdmissionItemDefinition,
  getSelectedSessionWaitlists,
  getVisibleRegistrationTypesForGuestDialog,
  isRegApprovalRequired,
  getTotalAdmissionItemCapacityAvailable
} from '../../redux/selectors/currentRegistrant';
import {
  getRegistrationPathIdOrDefault,
  isGuestProductSelectionEnabledOnRegPath,
  isGuestRegistrationTypeSelectionEnabledOnRegPath
} from '../../redux/selectors/currentRegistrationPath';
import { some, pickBy, isEmpty, isNil } from 'lodash';
import { getGuestRegistrationTypeSettings, getAdmissionItems, getAdmissionItem } from '../../redux/selectors/event';
import { admissionItemIsVisible } from '../../redux/selectors/shared';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import {
  getSelectedSessionDefinitions,
  getPrimaryAndGuestSortedVisibleAdmissionItems,
  getAllSortedSessionsForPrimaryAndGuest,
  getPrimaryAndGuestSelectedWaitlistedSessions
} from '../../redux/selectors/productSelectors';
import { withStyles, withCancelAndConfirmButtons } from '../ThemedDialog';
import StandardDialog from '../shared/StandardDialog';
import { populateVisibleProducts } from '../../redux/visibleProducts';
import { allSessionBundlesVar } from 'event-widgets/lib/Sessions/useVisibleSessionBundles';

const Dialog = withStyles(withCancelAndConfirmButtons(StandardDialog));

/**
 * A dialog to let the user decide what they want to do with the number of guest update.
 * If they decide to keep the update, then we will remove the products that has insufficient capacity
 * and redirect to first page. Else, we will keep the product selection and remove their guest changes
 * @param {RegCart} regCartWithGuestUpdates reg cart which failed capacity check
 */
export function openGuestProductCapacityReachedDialog(
  regCartWithGuestUpdates?: $TSFixMe,
  additionalActions?: $TSFixMe
) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      text: { translate }
    } = getState();
    const currentRegistrantId = getEventRegistrationId(getState());
    const showCapacityReachedModal = validateNoAvailableAdmissionItemOrEventCapacity(
      getGuestsOfRegistrant(regCartWithGuestUpdates, currentRegistrantId).length,
      getState(),
      !!additionalActions
    );
    if (showCapacityReachedModal) {
      return await dispatch(
        openCapacityReachedDialog({
          subMessage: translate('EventGuestSide_GuestUpdate_CapacityReachedError__resx')
        })
      );
    }
    const boundCancelSelection = () => dispatch(closeDialogContainer());
    const boundContinueSelection = async () =>
      await dispatch(withLoading(continueSelection)(regCartWithGuestUpdates, additionalActions));
    const dialog = (
      <Dialog
        {...injectTestId('guest-product-capacity-dialog')}
        title={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_Title__resx')}
        message={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_Title__resx')}
        subMessage={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_InformationalText__resx')}
        content={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_InstructionalText__resx')}
        secondaryButtonText={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_Cancel__resx')}
        cancel={boundCancelSelection}
        onClose={boundCancelSelection}
        primaryButtonText={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_Ok__resx')}
        confirm={boundContinueSelection}
        icon="attentionWarning"
        iconModifier="error"
        classes={DialogStyles}
      />
    );
    return dispatch(
      openDialogContainer(dialog, boundCancelSelection, {
        classes: { dialogContainer: DialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
}

/**
 * Remove any products that do not have sufficient capacity and redirect to first page.
 * @param {RegCart} regCart RegCart that needs to be cleaned
 */
function continueSelection(regCart, additionalActions) {
  return async (dispatch, getState) => {
    const currentRegistrantId = getEventRegistrationId(getState());
    const guests = getGuestsOfRegistrant(regCart, currentRegistrantId);

    // TODO In the future this should change to only the people that went over capacity.
    const eventRegistrationToUpdate = [currentRegistrantId];
    guests.forEach(guest => eventRegistrationToUpdate.push(guest.eventRegistrationId));
    const productIdsWithInsufficientCapacity = getProductIdsWithInsufficientCapacity(guests.length, getState());
    const productsWithClosedForRegistration = getProductIdsClosedForRegistration(getState());
    let updatedRegCart = regCart;
    const isPlanner = getState().defaultUserSession.isPlanner;
    eventRegistrationToUpdate.forEach(eventRegistrationId => {
      const currentProductRegistrations = updatedRegCart.eventRegistrations[eventRegistrationId].productRegistrations;
      if (currentProductRegistrations) {
        const updatedProductRegistrations = [];

        currentProductRegistrations.forEach(product => {
          if (
            productIdsWithInsufficientCapacity.includes(product.productId) ||
            productsWithClosedForRegistration.includes(product.productId)
          ) {
            const updatedProduct = { ...product, requestedAction: 'UNREGISTER' };
            updatedProductRegistrations.push(updatedProduct);
          } else {
            updatedProductRegistrations.push(product);
          }
        });
        updatedRegCart = setIn(
          updatedRegCart,
          ['eventRegistrations', eventRegistrationId, 'productRegistrations'],
          updatedProductRegistrations
        );
      }
      const currentSessionRegistrations = updatedRegCart.eventRegistrations[eventRegistrationId].sessionRegistrations;
      if (currentSessionRegistrations) {
        const updatedSessionRegistrations = {};
        Object.values(currentSessionRegistrations).forEach(session => {
          const isInsufficientSession =
            !isPlanner &&
            (productIdsWithInsufficientCapacity.includes((session as $TSFixMe).productId) ||
              productIdsWithInsufficientCapacity.includes((session as $TSFixMe).registrationSourceParentId));
          const isClosedSession = productsWithClosedForRegistration.includes((session as $TSFixMe).productId);
          if (isInsufficientSession || isClosedSession) {
            // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
            const updatedSession = { ...session, requestedAction: 'UNREGISTER' };
            updatedSessionRegistrations[(session as $TSFixMe).productId] = updatedSession;
          } else {
            updatedSessionRegistrations[(session as $TSFixMe).productId] = session;
          }
        });
        updatedRegCart = setIn(
          updatedRegCart,
          ['eventRegistrations', eventRegistrationId, 'sessionRegistrations'],
          updatedSessionRegistrations
        );
      }

      const currentSessionBundleRegistrations =
        updatedRegCart.eventRegistrations[eventRegistrationId].sessionBundleRegistrations;
      if (currentSessionBundleRegistrations) {
        const updatedSessionBundleRegistrations = {};

        Object.values(currentSessionBundleRegistrations).forEach(sessionBundle => {
          if (productIdsWithInsufficientCapacity.includes((sessionBundle as $TSFixMe).productId)) {
            updatedSessionBundleRegistrations[(sessionBundle as $TSFixMe).productId] = {
              // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
              ...sessionBundle,
              requestedAction: 'UNREGISTER'
            };
          } else {
            updatedSessionBundleRegistrations[(sessionBundle as $TSFixMe).productId] = sessionBundle;
          }
        });

        updatedRegCart = setIn(
          updatedRegCart,
          ['eventRegistrations', eventRegistrationId, 'sessionBundleRegistrations'],
          updatedSessionBundleRegistrations
        );
      }

      const currentSessionWaitlists = updatedRegCart.eventRegistrations[eventRegistrationId].sessionWaitlists;
      if (currentSessionWaitlists) {
        const updatedSessionWaitlists = {};
        Object.values(currentSessionWaitlists).forEach(session => {
          if (productIdsWithInsufficientCapacity.includes((session as $TSFixMe).productId + '_waitlist')) {
            // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
            const updatedSession = { ...session, requestedAction: 'LEAVE_WAITLIST' };
            updatedSessionWaitlists[(session as $TSFixMe).productId] = updatedSession;
          } else {
            updatedSessionWaitlists[(session as $TSFixMe).productId] = session;
          }
        });
        updatedRegCart = setIn(
          updatedRegCart,
          ['eventRegistrations', eventRegistrationId, 'sessionWaitlists'],
          updatedSessionWaitlists
        );
      }
    });
    if (productsWithClosedForRegistration.length > 0) {
      await dispatch(populateVisibleProducts());
    }
    await dispatch(updateGuestsInRegCart(updatedRegCart));
    await dispatch(returnToProcessStart());
    dispatch(closeDialogContainer());
    if (additionalActions && typeof additionalActions === 'function') {
      dispatch(additionalActions(guests.length, true));
    }
  };
}

/**
 * Validates if the change in guest count violates any product capacity
 * @param {Number} pendingGuestCount
 * @param state redux app state
 * @param isAddGuestButton guest added via guest details modal (vs dropdown to select just guest count with no details)
 * @returns a boolean to indicate if no admission item or event capacity is available
 */
// eslint-disable-next-line complexity
export function validateNoAvailableAdmissionItemOrEventCapacity(
  pendingGuestCount: $TSFixMe,
  state: $TSFixMe,
  isAddGuestButton = false
): $TSFixMe {
  const {
    event,
    registrationForm: { regCart }
  } = state;

  // check if event capacity is at full
  const productIdsWithInsufficientCapacity = getProductIdsWithInsufficientCapacity(pendingGuestCount, state);
  if (productIdsWithInsufficientCapacity.includes(event.id)) {
    return true;
  }

  const isGuestProductSelectionEnabled = isGuestProductSelectionEnabledOnRegPath(state);
  let guestRegTypes = [];
  const primaryRegistrantId = getEventRegistrationId(state);
  const primaryAdmissionItemReg = getSelectedAdmissionItem(regCart, primaryRegistrantId);
  // get adm items available to visible guest regtypes
  if (isGuestProductSelectionEnabled) {
    const isPlanner = state.defaultUserSession.isPlanner;
    const regPathId = getRegistrationPathIdOrDefault(state);
    const isGuestRegistrationTypeSelectionEnabled = isGuestRegistrationTypeSelectionEnabledOnRegPath(state);
    const guestRegTypeSettings = getGuestRegistrationTypeSettings(state, regPathId);
    /*
     * if guests can't select their regtype, if regType selection not required, or dropdown allow
     * or if limit is on but no categorized regtypes are selected
     */
    const noCategorizedRegTypes =
      guestRegTypeSettings.categorizedRegistrationTypes &&
      guestRegTypeSettings.categorizedRegistrationTypes.length === 0;
    const useNoRegType =
      !isGuestRegistrationTypeSelectionEnabled ||
      !guestRegTypeSettings.isRequired ||
      !isAddGuestButton ||
      (guestRegTypeSettings.limitVisibility && noCategorizedRegTypes);
    // if regType feature not on return the default regType
    if (
      !isGuestRegistrationTypeSelectionEnabled ||
      !isAddGuestButton ||
      !event.eventFeatureSetup.registrationProcess.multipleRegistrationTypes
    ) {
      guestRegTypes.unshift({ text: '', id: defaultRegistrationTypeId });
    } else {
      guestRegTypes = getVisibleRegistrationTypesForGuestDialog(state, regPathId);
      // if no limited visibility and regType is not required add default regType to the list
      if (useNoRegType) {
        guestRegTypes.splice(0, 0, { id: defaultRegistrationTypeId, text: '' });
      }
    }
    // go through all admission items and return the ones visible to guest regType and that have capacity
    const availableAdmissionItems = pickBy(getAdmissionItems(state), admissionItem => {
      return some(guestRegTypes, regType => {
        if (admissionItemIsVisible(regType.id, admissionItem, { includeClosedAdmissionItems: isPlanner })) {
          const admissionItemHasUnlimitedCapacity =
            getIn(state, ['capacity', admissionItem.capacityId, 'totalCapacityAvailable']) === -1;
          const admissionItemAvailableCapacity = getIn(state, [
            'capacity',
            admissionItem.capacityId,
            'availableCapacity'
          ]);
          return admissionItemHasUnlimitedCapacity || admissionItemAvailableCapacity > 0;
        }
      });
    });
    // check if any admission item available for selection for guest
    if (isEmpty(availableAdmissionItems)) {
      return true;
    }
  } else {
    /*
     * PROD-75187 if primary already selected an admission item, and guest cannot select their own
     * product, only get the selected admission item capacity
     */
    const primaryAdmissionItem = primaryAdmissionItemReg && getAdmissionItem(state, primaryAdmissionItemReg.productId);
    if (primaryAdmissionItem && primaryAdmissionItem.isOpenForRegistration === false) {
      const visibleAdmissionItems = getPrimaryAndGuestSortedVisibleAdmissionItems(state);
      const noOpenAdmissionItem = Object.values(visibleAdmissionItems).every(item => {
        return !(item as $TSFixMe).isOpenForRegistration;
      });
      // PROD-99671 should disable Add guestButton if no admission item is open for registration
      if (noOpenAdmissionItem) {
        return true;
      }
    }
  }

  // check if primary has an admission item and subtract one from the available count if doesnt have one
  const totalAdmItemCapAvailable = getTotalAdmissionItemCapacityAvailable(
    state,
    isGuestProductSelectionEnabled,
    guestRegTypes,
    !isAddGuestButton,
    primaryAdmissionItemReg
  );
  const totalAdmItemCapLeft = totalAdmItemCapAvailable - (primaryAdmissionItemReg ? 0 : 1);

  // get only the ones that have reserved capacity.
  const guestsWithReservedCapacity = getGuestsOfRegistrant(regCart, primaryRegistrantId).filter(guestReg =>
    getSelectedAdmissionItem(regCart, guestReg.eventRegistrationId)
  ).length;

  const isPreviewOrRegApproval = state.defaultUserSession.isPreview || isRegApprovalRequired(state);
  const totalGuestCapacityRequired = pendingGuestCount - (isPreviewOrRegApproval ? 0 : guestsWithReservedCapacity);

  return totalAdmItemCapLeft < totalGuestCapacityRequired;
}

/**
 * returns true if session waitlist cap full
 *  if agenda flag onn and pending approval onn ,
 *  calculate all guest count and check if cap full for any selected session waitlist
 */
export function validateNoWaitlistedSessionCapacity(pendingGuestCount: $TSFixMe, state: $TSFixMe): $TSFixMe {
  const isGuestProductSelectionEnabled = isGuestProductSelectionEnabledOnRegPath(state);
  const productIdsWithInsufficientCapacity = getProductIdsWithInsufficientCapacity(pendingGuestCount, state);
  const selectedWaitlistedSessn = getPrimaryAndGuestSelectedWaitlistedSessions(state);
  /*
   * if copyAgenda onn and productIdsWithInsufficientCapacity contains atleast 1 selected session
   * in waitlist then show conflict pop
   */
  const sessionWaitlistCapFull =
    isGuestProductSelectionEnabled ||
    !productIdsWithInsufficientCapacity ||
    productIdsWithInsufficientCapacity.length < 1 ||
    isEmpty(selectedWaitlistedSessn)
      ? false
      : !isEmpty(
          Object.values(selectedWaitlistedSessn).filter(ssn =>
            productIdsWithInsufficientCapacity.includes(ssn.productId + '_waitlist')
          )
        );
  return sessionWaitlistCapFull;
}

function getProductIdsWithInsufficientCapacity(pendingGuestCount, state) {
  const isRegApproval = isRegApprovalRequired(state);
  const { capacity, event } = state;
  // get only the ones that haven't reserved any capacity yet.
  const guestsWithReservedCapacity = guestRegistrantsCount(state);
  const totalGuests = pendingGuestCount;
  const selectedAdmissionItem = getSelectedAdmissionItemDefinition(state);
  const selectedSessions = getSelectedSessionDefinitions(state);
  const waitlistedSessionDefinitions = getSelectedSessionDefinitions(
    state,
    'Sessions',
    '',
    getSelectedSessionWaitlists(state)
  );
  const shouldRecountEveryone = productCapacityId => {
    // if productCapacityId is that of the event's capacity id, then don't count everyone
    if (productCapacityId === event.capacityId) {
      return false;
    }
    /*
     * if the productCapacityId is that of a selected admission item's capacity id, don't count everyone
     * but reg approval doesn't actually take capacity, so count everyone for that
     */
    if (selectedAdmissionItem && selectedAdmissionItem.capacityId === productCapacityId) {
      return isRegApproval;
    }
    // if the productCapacityId is that of a selected sessions's capacity id, don't count everyone
    if (
      selectedSessions &&
      Object.values(selectedSessions).find(session => (session as $TSFixMe).capacityId === productCapacityId)
    ) {
      return false;
    }

    // if the productCapacityId is that of a selected sessions's capacity id, don't count everyone
    if (
      waitlistedSessionDefinitions &&
      Object.values(waitlistedSessionDefinitions).find(
        session => (session as $TSFixMe).waitlistCapacityId === productCapacityId
      )
    ) {
      return isRegApproval;
    }
    return true;
  };
  const productCapacityIdsWithInsufficientCapacity =
    capacity &&
    Object.values(capacity)
      .filter(
        c =>
          (c as $TSFixMe).active &&
          (c as $TSFixMe).availableCapacity !== -1 &&
          (c as $TSFixMe).availableCapacity <
            (shouldRecountEveryone((c as $TSFixMe).capacityId)
              ? totalGuests + 1
              : totalGuests - guestsWithReservedCapacity)
      )
      .map(c => (c as $TSFixMe).capacityId);
  if (!productCapacityIdsWithInsufficientCapacity) {
    return [];
  }
  /**
   * Build product id list which do not have capacity.
   * NOTE TO DEVS : Add other product handling here.
   */
  const productIdsWithInsufficientCapacity = [];
  if (productCapacityIdsWithInsufficientCapacity.includes(event.capacityId)) {
    productIdsWithInsufficientCapacity.push(event.id);
  }
  const allAdmissionItems = getPrimaryAndGuestSortedVisibleAdmissionItems(state);
  Object.values(allAdmissionItems).forEach(admissionItem => {
    if (productCapacityIdsWithInsufficientCapacity.includes((admissionItem as $TSFixMe).capacityId)) {
      productIdsWithInsufficientCapacity.push((admissionItem as $TSFixMe).id);
    }
  });
  const allSessions = getAllSortedSessionsForPrimaryAndGuest(state);
  Object.values(allSessions).forEach(session => {
    if (productCapacityIdsWithInsufficientCapacity.includes(session.capacityId)) {
      productIdsWithInsufficientCapacity.push(session.id);
    }
    if (session.waitlistCapacityId && productCapacityIdsWithInsufficientCapacity.includes(session.waitlistCapacityId)) {
      productIdsWithInsufficientCapacity.push(session.id + '_waitlist');
    }
  });

  Object.values(allSessionBundlesVar()).forEach(sessionBundle => {
    const availableCapacity = (sessionBundle as $TSFixMe).capacity?.availableCapacity;
    if (!isNil(availableCapacity) && availableCapacity !== -1 && availableCapacity < totalGuests + 1) {
      productIdsWithInsufficientCapacity.push((sessionBundle as $TSFixMe).id);
    }
  });

  return productIdsWithInsufficientCapacity;
}

function getProductIdsClosedForRegistration(state) {
  const selectedAdmissionItem = getSelectedAdmissionItemDefinition(state);
  // Check if selected admission item is closed.
  const productIdsClosedForRegistration = [];
  if (selectedAdmissionItem && !selectedAdmissionItem.isOpenForRegistration) {
    productIdsClosedForRegistration.push(selectedAdmissionItem.id);
  }

  // Check if any of the selected sessions are closed.
  const selectedSessions = getSelectedSessionDefinitions(state);
  Object.values(selectedSessions).forEach(session => {
    if (!(session as $TSFixMe).isOpenForRegistration) {
      productIdsClosedForRegistration.push((session as $TSFixMe).id);
    }
  });

  return productIdsClosedForRegistration;
}
