import React from 'react';
import { getIn, setIn } from 'icepick';
import { intersectionBy, map, isEmpty, filter, some } from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LegacyPageNavigatorWidget from 'nucleus-widgets/lib/LinearPageNavigator/LinearPageNavigatorWidget';
import {
  getUpdateErrors,
  getUpdateResponseValidations,
  getCheckoutErrors,
  isExcludedByPrivacySettings
} from '../../redux/registrationForm/errors';
import { routeToPage, getCurrentPageId } from '../../redux/pathInfo';
import { getDefaultWebsitePageId } from '../../redux/website';
import {
  saveRegistration,
  finalizeRegistration,
  removeEventRegistrationFromRegCart,
  waitForRegCartCheckoutCompletionUi,
  removeGroupMembersFromRegCart,
  resumeAlreadyStartedCheckout
} from '../../redux/registrationForm/regCart';
import { updateSessionFilters } from '../../redux/sessionFilters';
import { REGISTERING } from '../../redux/registrationIntents';
import withForm from 'nucleus-form/src/components/withForm';
import { findKnownErrorResourceKey } from '../../redux/registrationForm/errors';
import { hasInvalidMobilePhone } from '../../redux/registrationForm/infoValidations';
import {
  openAlreadyRegisteredDialog,
  openPrivateEventErrorDialog,
  openPaymentProcessingErrorDialog,
  openKnownErrorDialog,
  openInformationAlreadyUsedDialog,
  openPreviewModeWarningDialog,
  openCapacityReachedDialog,
  openNoAdmissionItemAvailableForRegistrationTypeDialog,
  openEventStatusDialog,
  openGroupCancelRegistrationDialog,
  openSessionOverlapWarningDialog,
  openGroupMemberRemoveDialog,
  openCancelRegistrationSuccessConfirmationDialog,
  openPaymentAmountServiceFeeConfirmationDialog,
  openPaymentCreditsErrorDialog
} from '../../dialogs';
import { openInvalidPhoneNumberDialog } from '../../dialogs/InvalidPhoneNumberDialog';
import {
  FINALIZE_CHECKOUT_PAYMENT_FAILURE,
  CHECKOUT_FAILURE,
  REGTYPE_CHANGED,
  SUBMIT_WEBPAYMENTS_FORM
} from '../../redux/registrationForm/regCart/actionTypes';
import { logoutRegistrant, logoutPlanner } from '../../redux/registrantLogin/actions';
import InvalidFormError from 'nucleus-form/src/utils/InvalidFormError';
import { showLoadingDialog, withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import {
  getAllInviteesRegistrationIds,
  areRegistrationActionsDisabled,
  isRegCartUpdateInProgress
} from '../../redux/selectors/shared';
import {
  isGroupRegistration,
  regModCartContainsNewRegistrants,
  isRegistrationModification,
  modificationStart,
  getEventRegistrationId,
  getAdminPersonalInformation,
  getRegistrationTypeId,
  isGroupLeader,
  getEventRegistration,
  guests
} from '../../redux/selectors/currentRegistrant';
import {
  getPrimaryAndGuestSortedVisibleSessions,
  getPrimarySortedVisibleSessions,
  getSkipSessionValidationAttendees,
  getPrimaryAndGuestVisibleEventRegistration
} from '../../redux/selectors/productSelectors';
import { getPageWithRegistrationSummary, getPageWithRegistrationType } from '../../redux/website/pageContents';
import {
  sessionsAppearOnPageBeforeAdmissionItems,
  regTypeAppearOnPageBeforeEventIdentityConfirmation
} from '../../redux/website/pageContentsWithGraphQL';
import {
  getLeadersRegistrationPathId,
  getRegistrationPathId,
  getRegistrationPageFields,
  isGuestProductSelectionEnabledOnRegPath,
  isOverlappingSessionsAllowedOnRegPath,
  partialRegistrationEnabledOnRegPath,
  partialRegistrationEnabledInAccount,
  getPaymentCreditsEnabled
} from '../../redux/selectors/currentRegistrationPath';
import { isWidgetReviewed } from '../../redux/website/pageContents';
import {
  hasAttendeeWithEmailAddress,
  getEventRegistration as getEventRegistrationRegCart,
  getPrimaryRegistrationId,
  getSelectedAdmissionItem,
  getRegistrationPathId as getRegistrationPathIdRegCart,
  getRegistrationTypeId as getRegistrationTypeIdRegCart,
  isPlaceholderRegCart
} from '../../redux/registrationForm/regCart/selectors';
import { loadAvailableCapacityCounts } from '../../redux/capacity';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import {
  getIdConfirmationValidationsFromCartError,
  openIdConfirmationConflictDialog,
  openGuestNavigationConflictDialog
} from '../../dialogs/selectionConflictDialogs';
import {
  hasRegTypeCapacityWarning,
  hasAttendeeQuestionRuleValidationWarning,
  hasQuantityItemAdvancedRuleValidation
} from '../../redux/registrationForm/warnings';
import { delayedScrollToFirstFormError } from '../../utils/formUtils';
import { overlap } from '../../utils/overlapUtil';
import {
  filterEventSnapshot,
  runningVisibilityLogicEvaluations,
  getStartPageForCurrentRegPath
} from '../../redux/actions';
import { SET_CURRENT_EVENT_REGISTRATION_ID } from '../../redux/registrationForm/regCart/actionTypes';
import { productOpen } from 'event-widgets/utils/product';
import { isWidgetPresentOnCurrentPage } from '../../redux/website/pageContentsWithGraphQL';
import {
  updateAdmin,
  removeInvalidCustomField,
  updateEventRegistrations,
  setEventRegistrationFieldValue
} from '../../redux/registrationForm/regCart/actions';
import { REQUIRED } from 'cvent-question-widgets/lib/DisplayType';
import { getConfirmationPageIdForInvitee } from '../../utils/confirmationUtil';
import {
  isAdministratorRegistrationEnabled,
  isAttendeeListOptInAutomatic,
  getRegCart
} from '../../redux/selectors/shared';
import { isFeesEnabled, hasAccessToWebsitePages } from '../../redux/selectors/event';
import {
  getSelectedSessionDefinitions,
  getGuestSelectedSessionDefinitions,
  getGuestSelectedSessionDefinitionsByGuest,
  getPrimaryAndGuestSortedVisibleAdmissionItems
} from '../../redux/selectors/productSelectors';
import { populateVisibleProducts } from '../../redux/visibleProducts';
import { REGISTRATION, isRegistrationPage } from '../../redux/website/registrationProcesses';
import { validateTravelWidgetsAndNavigate } from '../../utils/travelUtils';
import * as InviteeStatus from 'event-widgets/utils/InviteeStatus';
import { searchPartialRegistration, abortRegCart } from '../../redux/registrationForm/regCart';
import { openPartialRegDialog } from '../../dialogs';
import { setSelectedPaymentMethod } from '../../redux/registrationForm/regCartPayment/actions';
import { defaultPricingInfo, shouldSubmitWebPaymentsForm } from '../../redux/registrationForm/regCartPayment/util';
import { getPaymentInfo, shouldUseWebpaymentsForm } from '../../redux/selectors/payment';
import { isCompletePaymentByCredits } from 'event-widgets/utils/paymentUtils';

import { PAYMENT_AMOUNT_OPTION } from 'event-widgets/utils/paymentConstant';
import getRegCartPricingMergedState from '../PaymentWidget/getRegCartPricingAction';
import { isInCheckoutVar, getCachedRegCartPricing } from '../PaymentWidget/regCartPricing';
import { invalidateDatatagCache } from '../../utils/datatagUtils';
import { AttendingFormat, shouldHybridFlowWork } from 'event-widgets/utils/AttendingFormatUtils';
import { redirectToConfirmation, loadConfirmedRegCart } from '../../errorHandling/confirmation';
import LinearNavigatorClasses from 'nucleus-widgets/lib/LinearNavigator/LinearNavigator.less';
import ButtonGroupStyles from 'nucleus-core/buttons/styles/ButtonGroup.less';
import RegistrationNavigatorWidgetStyles from './RegistrationNavigatorWidgetStyles.less';
import { defaultMemoize } from 'reselect';
import { beginNewRegistration, redirectToDefaultPageOrStartNewRegistration } from '../../routing/startRegistration';
import { redirectToSummaryPage } from '../../redux/registrationForm/regCart/workflow';
import { useGraphQLForSkippingPages } from '../../ExperimentHelper';
import GraphQLEnabledNavigatorWidget from './NavigatorWidget';

/**
 * Wraps the submitForm action to detect if the failure was due to validations and
 * scrolls to error.
 */
export const withScrollToFirstError = (submitForm: $TSFixMe) => {
  return async (...args: $TSFixMe[]): Promise<$TSFixMe> => {
    try {
      await submitForm(...args);
    } catch (error) {
      if (error instanceof InvalidFormError) {
        delayedScrollToFirstFormError();
        return;
      }
      throw error;
    }
  };
};

function groupMemberCallBack(regCart, currentEventRegistrationId) {
  return async (dispatch, getState) => {
    dispatch({
      type: SET_CURRENT_EVENT_REGISTRATION_ID,
      payload: {
        currentEventRegistrationId: getPrimaryRegistrationId(regCart)
      }
    });
    const registrationSummaryWidgetPage = getPageWithRegistrationSummary(getState());
    if (isRegistrationModification(getState())) {
      return await dispatch(exitRegistration(true));
    }
    await dispatch(removeEventRegistrationFromRegCart(currentEventRegistrationId));
    dispatch(routeToPage(registrationSummaryWidgetPage.id));
  };
}

const logoutPlannerWithLoading = async (dispatch, exitUrl) => {
  dispatch(showLoadingDialog());
  return await dispatch(logoutPlanner(exitUrl));
};

/**
 * On exit registration without successful register:
 * Navigates to the default website, unless in planner registration which specifies exitUrl
 */
function exitRegistration(removeGroupMemberConfirmed = false) {
  // eslint-disable-next-line complexity
  return async (dispatch, getState) => {
    const state = getState();
    const {
      defaultUserSession: { isPlanner },
      plannerRegSettings: { exitUrl },
      // @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
      experiments: { abortRegCartVariant } = {}
    } = state;
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const regCart = state.registrationForm && state.registrationForm.regCart;
    const needToRemoveGroupMember = removeGroupMemberConfirmed === false && regCart && isGroupRegistration(state);
    if (needToRemoveGroupMember) {
      const currentEventRegistrationId = getEventRegistrationId(state);
      const regModCartHasNewRegistrants = regModCartContainsNewRegistrants(state);
      const isGroupLead = isGroupLeader(state, currentEventRegistrationId);
      const isRegMod = isRegistrationModification(state);
      // PROD-69812 if canceling on regSummary page during mod, pass in the groupMember eventRegId
      if (regModCartHasNewRegistrants && isGroupLead) {
        const groupEventRegId = (
          Object.values(regCart.eventRegistrations).find(
            eventReg => (eventReg as $TSFixMe).attendeeType === 'ATTENDEE'
          ) as $TSFixMe
        ).eventRegistrationId;
        return await dispatch(
          openGroupMemberRemoveDialog(groupEventRegId, () => groupMemberCallBack(regCart, groupEventRegId))
        );
      }
      if (regModCartHasNewRegistrants || (!isRegMod && !isGroupLead)) {
        return await dispatch(
          openGroupMemberRemoveDialog(currentEventRegistrationId, () =>
            groupMemberCallBack(regCart, currentEventRegistrationId)
          )
        );
      }
      if (!isRegMod) {
        return await dispatch(
          openGroupCancelRegistrationDialog(() => exitRegistration(true), {
            title: 'EventGuestsideSite_GroupCancelDialog_Title__resx',
            style: state.website.theme.global
          })
        );
      }
      if (isPlanner) {
        return await logoutPlannerWithLoading(dispatch, exitUrl);
      }
    }
    if (isPlanner) {
      return await logoutPlannerWithLoading(dispatch, exitUrl);
    }

    const logoutUserOnCancel = abortRegCartVariant === 2;
    const abortRegCartOnCancel = logoutUserOnCancel || abortRegCartVariant === 1;

    const isRegModificationByAttendee = !isPlanner && isRegistrationModification(getState());
    const areWebsitePagesAccessible = hasAccessToWebsitePages(state);
    if (isRegModificationByAttendee) {
      await dispatch(loadConfirmedRegCart({ abortCurrentRegCart: abortRegCartOnCancel }));
      const confirmationPageId = await dispatch(getConfirmationPageIdForInvitee());
      dispatch(routeToPage(confirmationPageId));
      if (getState().persona.inviteeStatus === InviteeStatus.Cancelled) {
        dispatch(openCancelRegistrationSuccessConfirmationDialog());
        await dispatch(logoutRegistrant());
      }
    } else {
      if (abortRegCartOnCancel) {
        await dispatch(abortRegCart());
      }
      const defaultPage = getDefaultWebsitePageId(getState());
      await Promise.all([
        areWebsitePagesAccessible && logoutUserOnCancel ? dispatch(logoutRegistrant()) : Promise.resolve(),
        dispatch(redirectToDefaultPageOrStartNewRegistration(defaultPage, areWebsitePagesAccessible))
      ]);
    }
  };
}

const validateSessionOverlap = async (dispatch, state, attendeesToSkipOverlapValidation) => {
  const primarySelectedSessions = getSelectedSessionDefinitions(state);
  const guestSelectedSessions = getGuestSelectedSessionDefinitionsByGuest(state);

  const primaryOptionalSessions = primarySelectedSessions.filter(session => {
    return !session.isIncludedSession;
  });
  let primaryResult = [];
  /*
   * preventing overlap validation during reg mod for existing registered sessions
   * for primary registrant
   */
  if (!attendeesToSkipOverlapValidation.includes(getEventRegistrationId(state))) {
    primaryResult = overlap(primaryOptionalSessions || []);
  }

  // check overlap for each guest
  const guestResult = {};
  guestSelectedSessions.forEach((guestSessions, key) => {
    // preventing overlap validation during reg mod for existing registered sessions for guests
    if (!attendeesToSkipOverlapValidation.includes(key)) {
      const guestOptionalSessions = [];
      guestSessions.forEach(session => {
        if (!session.isIncludedSession) {
          guestOptionalSessions.push(session);
        }
      });
      guestResult[key] = overlap(guestOptionalSessions || []);
    }
  });
  if ((primaryResult as $TSFixMe).overlap || some(guestResult, 'overlap')) {
    await dispatch(openSessionOverlapWarningDialog());
    throw new InvalidFormError('Overlapping in sessions');
  }
};

const validateSessions = () => {
  return async (dispatch, getState, { apolloClient }) => {
    const {
      defaultUserSession: { isPlanner },
      capacity
    } = getState();
    const isSessionsWidgetPresent = await isWidgetPresentOnCurrentPage(
      getState(),
      'Sessions',
      getCurrentPageId(getState()),
      apolloClient
    );
    const isRegMod = isRegistrationModification(getState());
    const selectedSessions = [].concat(
      getSelectedSessionDefinitions(getState()),
      getGuestSelectedSessionDefinitions(getState())
    );
    const requiredValidationSessionGroups = getPrimaryAndGuestVisibleEventRegistration(getState());
    if (isSessionsWidgetPresent) {
      const isGuestProductSelectionEnabled = isGuestProductSelectionEnabledOnRegPath(getState());
      const compositeSessions = isGuestProductSelectionEnabled
        ? getPrimaryAndGuestSortedVisibleSessions(getState())
        : getPrimarySortedVisibleSessions(getState());
      const missingSelectedForRequiredSessionGroups = compositeSessions.filter(sessionGroup => {
        if (sessionGroup.isSessionSelectionRequired) {
          if (isEmpty(intersectionBy(map(sessionGroup.sessions), selectedSessions, 'id'))) {
            /*
             * for regular planner reg, if session group is closed or all sessions within
             * session group is closed, we do not enforce required validations for session groups
             * for planner reg mod we do not enforce required validations for the same conditions
             * unless it's previously registered
             */
            let skipRequiredValidation = false;
            if (!requiredValidationSessionGroups[sessionGroup.id]) {
              skipRequiredValidation = true;
            } else if (isPlanner) {
              const allSessionClosed = filter(sessionGroup.sessions, session => productOpen(session)).length === 0;
              if (isRegMod) {
                const regModCartSessions = modificationStart.getRegisteredSessions(getState());
                const registeredSessions = regModCartSessions ? Object.keys(regModCartSessions) : [];
                const sessionRegisteredInGroup = some(sessionGroup.sessions, session =>
                  registeredSessions.includes(session.id)
                );
                skipRequiredValidation = (!productOpen(sessionGroup) || allSessionClosed) && !sessionRegisteredInGroup;
              } else {
                skipRequiredValidation = !productOpen(sessionGroup) || allSessionClosed;
              }
            } else {
              const sessionsWithCapaciyNotFull = filter(sessionGroup.sessions, session => {
                const sCapacity = capacity[session.capacityId] || { availableCapacity: -1 };
                const isUnlimitedSession = sCapacity && sCapacity.totalCapacityAvailable === -1;
                // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
                const availableCapacity = (sCapacity && sCapacity.availableCapacity) || 0;
                const sessionCapacity = availableCapacity < 0 && !isUnlimitedSession ? 0 : availableCapacity;
                const sessionIsFull = !isUnlimitedSession && sessionCapacity <= 0;
                if (selectedSessions[session.id] || !sessionGroup.isSessionSelectionRequired || !sessionIsFull) {
                  return session;
                }
              });
              /*
               * If a required session group are having all the sessions with capacity full,
               * then, the validation of this session group should be skipped.
               */
              if (!sessionsWithCapaciyNotFull.length) {
                skipRequiredValidation = true;
              }
            }

            if (!skipRequiredValidation) {
              return sessionGroup;
            }
          }
        }
      });
      if (!isEmpty(missingSelectedForRequiredSessionGroups)) {
        dispatch(
          updateSessionFilters({
            keywordFilterValue: '',
            selectedFilterChoices: {}
          })
        );
        throw new InvalidFormError('A session was not selected in the required session group.');
      }
    }

    const isAdmissionItemsWidgetPresent = await isWidgetPresentOnCurrentPage(
      getState(),
      'AdmissionItems',
      getCurrentPageId(getState()),
      apolloClient
    );

    if (
      isSessionsWidgetPresent ||
      (isAdmissionItemsWidgetPresent && (await sessionsAppearOnPageBeforeAdmissionItems(getState(), apolloClient)))
    ) {
      if (!isOverlappingSessionsAllowedOnRegPath(getState())) {
        await validateSessionOverlap(
          dispatch,
          getState(),
          getSkipSessionValidationAttendees(getState()).attendeesToSkipOverlapValidation
        );
      }
    }
  };
};

const deleteInvalidGroupMemberAndRouteToPage = () => {
  return async (dispatch, getState) => {
    const translate = getState().text.translate;
    const currentEventRegistrationId = getEventRegistrationId(getState());
    const registrationSummaryWidgetPage = getPageWithRegistrationSummary(getState());
    const linkedInviteeIdToRemove = getEventRegistration(getState()).attendee.attendeeId;
    await dispatch(removeEventRegistrationFromRegCart(currentEventRegistrationId));
    await dispatch(saveRegistration(linkedInviteeIdToRemove));
    if (registrationSummaryWidgetPage) {
      await dispatch(routeToPage(registrationSummaryWidgetPage.id));
    }
    return await dispatch(
      openCapacityReachedDialog({
        subMessage: translate('EventGuestSide_GroupMember_CapacityReachedError__resx')
      })
    );
  };
};

const deleteInvalidCustomFields = fieldErrors => {
  return async (dispatch, getState) => {
    const currentEventRegistrationId = getEventRegistrationId(getState());
    for (const fieldError of fieldErrors) {
      await dispatch(removeInvalidCustomField(currentEventRegistrationId, fieldError.parametersMap.customField));
    }
  };
};

const regTypeCapacityValidation = async (state, apolloClient) => {
  const isRegTypeWidgetPresent = await isWidgetPresentOnCurrentPage(
    state,
    'RegistrationType',
    getCurrentPageId(state),
    apolloClient
  );
  if (isRegTypeWidgetPresent) {
    return () =>
      openCapacityReachedDialog({
        subMessage: state.text.translate('EventGuestSide_RegType_CapacityReachedSubMessage__resx')
      });
  }
  const isIdConfirmWidgetPresent = await isWidgetPresentOnCurrentPage(
    state,
    'EventIdentityConfirmation',
    getCurrentPageId(state),
    apolloClient
  );
  if (isIdConfirmWidgetPresent) {
    const regTypeWidgetDoesNotExist = !getPageWithRegistrationType(state);
    if (regTypeWidgetDoesNotExist) {
      return () => openPrivateEventErrorDialog('EventGuestSide_RegistrationNotAvailable_SubMessage__resx');
    }
    const regTypeWidgetAppearBeforeIdConfirmWidget = await regTypeAppearOnPageBeforeEventIdentityConfirmation(
      state,
      apolloClient
    );
    const regTypeOnAnyPrevPages = regTypeWidgetAppearBeforeIdConfirmWidget && !isRegTypeWidgetPresent;
    if (regTypeOnAnyPrevPages) {
      return () =>
        openCapacityReachedDialog({
          subMessage: state.text.translate('EventGuestSide_RegType_CapacityReachedSubMessage__resx')
        });
    }
  }
};

/**
 * Checks if admin email exists in attendee emails and removes admin information when admin reg is not selected.
 * On submission of an initial registration with a single registrant during admin reg, will set attendeeType
 * to group leader.
 */
const updateAdminRegistrationFields = isSubmit => {
  // eslint-disable-next-line complexity
  return async (dispatch, getState) => {
    const regPathId = getLeadersRegistrationPathId(getState());
    const administratorRegistrationEnabled = isAdministratorRegistrationEnabled(getState(), regPathId);
    const admin = getAdminPersonalInformation(getState());
    const isRegMod = isRegistrationModification(getState());
    /*
     * Admin enabled or not matters only in initial reg.
     * In reg modification, if admin info exists, we should validate it.
     */
    if ((administratorRegistrationEnabled && admin && admin.selectedValue) || (admin && isRegMod)) {
      const emailExists = hasAttendeeWithEmailAddress(getState().registrationForm.regCart, admin.emailAddress);
      if (emailExists) {
        await dispatch(
          openKnownErrorDialog(getState().text.translate('EventGuestSide_AdminEmailExist_ErrorMessage__resx'))
        );
        throw new InvalidFormError('Admin email used by attendee');
      }
    }
    if (isSubmit && !isRegMod) {
      const regCart = getRegCart(getState());
      const eventRegistrations = getIn(regCart, ['eventRegistrations']);
      const isSingleRegistration =
        eventRegistrations && filter(eventRegistrations, e => e.attendeeType !== 'GUEST').length === 1;
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      const isAdminReg = admin && admin.selectedValue;
      if (!administratorRegistrationEnabled || !isAdminReg) {
        dispatch(updateAdmin(null));
      } else if (isAdminReg && isSingleRegistration) {
        const primaryEventRegId = getPrimaryRegistrationId(regCart);
        const groupLeaderEventRegistration = setIn(
          eventRegistrations,
          [primaryEventRegId, 'attendeeType'],
          'GROUP_LEADER'
        );
        dispatch(updateEventRegistrations(groupLeaderEventRegistration));
      }
    }
  };
};

const validateGuestsCanProceedForward = state => {
  const currentRegGuests = guests(state);
  if (isEmpty(currentRegGuests)) {
    return { isValid: true };
  }
  const isAdmissionItemWidgetReviewed = isWidgetReviewed(state, { widgetType: 'AdmissionItems' });
  const regCart = getRegCart(state);
  const guestsWithoutAdmissionitem = currentRegGuests.filter(guestReg => {
    return !getSelectedAdmissionItem(regCart, guestReg.eventRegistrationId);
  });
  if (isAdmissionItemWidgetReviewed && guestsWithoutAdmissionitem.length > 0) {
    const guestEventRegIdsToRemove = guestsWithoutAdmissionitem.map(guestEventReg => guestEventReg.eventRegistrationId);
    return {
      isValid: false,
      guestEventRegIdsToRemove
    };
  }
  return { isValid: true };
};

const validateAdmissionItemWasSelected = async (state, apolloClient) => {
  /*
   * this check is to handle the scenario where the registrant has no reg type and no admission items are associated
   * with having no reg type. we will fail validation when there are no visible admission items on the page that
   * contains the admission items widget and not allow them to continue registration.
   */
  const widgetOnPage = await isWidgetPresentOnCurrentPage(
    state,
    'AdmissionItems',
    getCurrentPageId(state),
    apolloClient
  );
  if (widgetOnPage && isEmpty(getPrimaryAndGuestSortedVisibleAdmissionItems(state))) {
    return { isValid: false };
  }
  return { isValid: true };
};

const isPartialRegAllowed = state => {
  return partialRegistrationEnabledInAccount(state) && partialRegistrationEnabledOnRegPath(state);
};

const EMAIL_LAST_FIRST_NAME = 'EMAIL_LAST_FIRST_NAME';
const EMAIL_ONLY = 'EMAIL_ONLY';

/**
 * checks whether dupmatchkey fields have been filled out or not
 */
const checkDupMatchKey = state => {
  const dupMatchKeyType = state.account.settings.dupMatchKeyType;
  const regCart = getRegCart(state);
  const primaryEventRegistrationId = getPrimaryRegistrationId(regCart);
  const primaryRegistrant = getEventRegistrationRegCart(regCart, primaryEventRegistrationId);
  const personalInformation =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    primaryRegistrant && primaryRegistrant.attendee && primaryRegistrant.attendee.personalInformation;
  if (dupMatchKeyType === EMAIL_ONLY) {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    return personalInformation && personalInformation.emailAddress;
  }
  if (dupMatchKeyType === EMAIL_LAST_FIRST_NAME) {
    return (
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      personalInformation &&
      personalInformation.emailAddress &&
      personalInformation.firstName &&
      personalInformation.lastName
    );
  }
};

/**
 * Initiates reg cart creation for embedded reg, if necessary, and returns booleans controlling whether
 * the handler should continue and if so whether the reg cart save operation should also occur.
 * The embedded reg cart is initialized from the redux store which is populated with data entered by the user
 */
async function handleEmbeddedRegistrationCartCreationAndDetermineNextSteps(dispatch, getState) {
  let shouldSaveCart = true;
  if (isPlaceholderRegCart(getState().registrationForm?.regCart)) {
    await dispatch(beginNewRegistration());
    if (isPlaceholderRegCart(getState().registrationForm?.regCart)) {
      // if cart has not been replaced, an error has occurred and we should not continue
      return { shouldContinue: false };
    }
    shouldSaveCart = false;
  }
  return { shouldContinue: true, shouldSaveCart };
}

/**
 * Initiates the reg cart save, if required, and calculates changes to reg type and path
 */
async function handleRegCartSave(dispatch, getState, shouldSaveCart, isForward) {
  let response = {};
  let regTypeChanged = false;
  let regPathChanged = false;
  let registrationTypeIdAfterSaveRegistration;
  let registrationPathIdAfterSaveRegistration;
  const initialState = getState();
  if (shouldSaveCart) {
    const registrationTypeIdPriorToSaveRegistration = getRegistrationTypeId(initialState);
    const registrationPathIdPriorToSaveRegistration = getRegistrationPathId(initialState);
    response = await dispatch(saveRegistration(null, true, isForward));
    registrationTypeIdAfterSaveRegistration = getRegistrationTypeId(getState());
    registrationPathIdAfterSaveRegistration = getRegistrationPathId(getState());
    regTypeChanged = registrationTypeIdPriorToSaveRegistration !== registrationTypeIdAfterSaveRegistration;
    regPathChanged = registrationPathIdPriorToSaveRegistration !== registrationPathIdAfterSaveRegistration;
  } else {
    registrationTypeIdAfterSaveRegistration = getRegistrationTypeId(initialState);
    registrationPathIdAfterSaveRegistration = getRegistrationPathId(initialState);
  }
  return {
    response,
    regTypeChanged,
    regPathChanged,
    registrationTypeIdAfterSaveRegistration,
    registrationPathIdAfterSaveRegistration
  };
}

/**
 * Save the registration while changing page
 */
export const saveRegistrationAndRouteToPage = withLoading((submitForm, pageId, isForward) => {
  return async (dispatch, getState, { apolloClient }) => {
    // eslint-disable-next-line complexity
    async function submitAction() {
      const { shouldContinue, shouldSaveCart } = await handleEmbeddedRegistrationCartCreationAndDetermineNextSteps(
        dispatch,
        getState
      );
      if (!shouldContinue) {
        return;
      }
      const state = getState();
      const {
        event: { attendingFormat = AttendingFormat.INPERSON }
      } = state;

      let regStatus;
      let targetPageId = pageId;
      const isRegMod = isRegistrationModification(getState());
      const currentPageId = getCurrentPageId(state);
      if (
        !isRegMod &&
        !state.userSession.isAbandonedReg &&
        isPartialRegAllowed(state) &&
        checkDupMatchKey(state) &&
        !state.regCartStatus.partialRegCartUpdated &&
        isRegistrationPage(state, currentPageId)
      ) {
        const response = await dispatch(searchPartialRegistration());
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        const partialRegCart = response && response.regCart;
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        const validationMessage = response && response.validationMessages;
        if (partialRegCart) {
          return await dispatch(openPartialRegDialog(partialRegCart, validationMessage));
        }
      }
      const isRegistrationSummaryWidgetPresent = await isWidgetPresentOnCurrentPage(
        getState(),
        'RegistrationSummary',
        getCurrentPageId(getState()),
        apolloClient
      );
      const isRegistrationSummaryWidgetOnNextPage = await isWidgetPresentOnCurrentPage(
        getState(),
        'RegistrationSummary',
        targetPageId,
        apolloClient
      );
      if (isForward) {
        await dispatch(validateSessions());
        await dispatch(updateAdminRegistrationFields(false));
        const guestNavigationValidationResults = validateGuestsCanProceedForward(getState());
        if (!guestNavigationValidationResults.isValid) {
          return await dispatch(
            openGuestNavigationConflictDialog(guestNavigationValidationResults.guestEventRegIdsToRemove)
          );
        }
        const admissionItemAvailableValidation = await validateAdmissionItemWasSelected(getState(), apolloClient);
        if (!admissionItemAvailableValidation.isValid) {
          return await dispatch(openNoAdmissionItemAvailableForRegistrationTypeDialog());
        }
      }

      try {
        const {
          response,
          regTypeChanged,
          regPathChanged,
          registrationTypeIdAfterSaveRegistration,
          registrationPathIdAfterSaveRegistration
        } = await handleRegCartSave(dispatch, getState, shouldSaveCart, isForward);

        const {
          registrationForm: { regCart }
        } = getState();
        const primaryEventRegId = getPrimaryRegistrationId(regCart);
        const primaryRegPathId = getRegistrationPathIdRegCart(regCart, primaryEventRegId);
        const currentEventRegistrationId = getEventRegistrationId(getState());
        /*
         * check if the regSummary widget is on the next page during group reg and if
         * the currentRegistrants regPath is the same as the Group Leaders regPath
         * if not filter the snapshot with the groupLeaders details
         */
        const shouldFilterSnapshot =
          isGroupRegistration(getState()) &&
          ((isFeesEnabled(getState()) && isRegistrationSummaryWidgetPresent) ||
            (isRegistrationSummaryWidgetOnNextPage && primaryRegPathId !== registrationPathIdAfterSaveRegistration));

        if (regTypeChanged || regPathChanged || shouldFilterSnapshot) {
          const regTypeId =
            shouldFilterSnapshot && isRegistrationSummaryWidgetOnNextPage
              ? getRegistrationTypeIdRegCart(regCart, currentEventRegistrationId)
              : registrationTypeIdAfterSaveRegistration;
          const regPathId =
            shouldFilterSnapshot && isRegistrationSummaryWidgetOnNextPage
              ? primaryRegPathId
              : registrationPathIdAfterSaveRegistration;
          await dispatch(filterEventSnapshot(getState().eventSnapshotVersion, regTypeId, regPathId));
          await dispatch(loadAvailableCapacityCounts());
          await dispatch(populateVisibleProducts(currentEventRegistrationId));
        }
        if (
          getUpdateResponseValidations.isPrivateEvent(response) ||
          getUpdateResponseValidations.isAttendeeNotAllowedByCustomLogic(response)
        ) {
          return await dispatch(openPrivateEventErrorDialog(null, removeGroupMembersFromRegCart));
        }
        if (getUpdateResponseValidations.isAdminEmailUsedByAttendee(response)) {
          return await dispatch(
            openKnownErrorDialog(getState().text.translate('EventGuestSide_AdminEmailExist_ErrorMessage__resx'))
          );
        }
        if (isForward && hasRegTypeCapacityWarning(getState())) {
          const modalDispatchAction = await regTypeCapacityValidation(getState(), apolloClient);
          if (modalDispatchAction) {
            return await dispatch(modalDispatchAction());
          }
        }
        const hasValidation = await hasQuantityItemAdvancedRuleValidation(getState(), apolloClient);
        if (isForward && hasValidation) {
          return await dispatch(
            openIdConfirmationConflictDialog(null, getCallbackForIdConfirmationConflictModal(getState(), submitForm))
          );
        }
        const hasValidationWarning = await hasAttendeeQuestionRuleValidationWarning(getState(), apolloClient);
        if (isForward && hasValidationWarning) {
          // cancel current form submission as there are validation errors
          return;
        }
        if (hasInvalidMobilePhone(getState())) {
          const phoneCallback = () => saveRegistrationAndRouteToPage(submitForm, pageId, isForward);
          return await dispatch(openInvalidPhoneNumberDialog(phoneCallback));
        }
        // if reg path changes during id confirmation, need to recalculate the target pageId
        if (regPathChanged) {
          targetPageId = await dispatch(getStartPageForCurrentRegPath(REGISTRATION));
        }
        dispatch(routeToPage(targetPageId));
      } catch (error) {
        if (
          isExcludedByPrivacySettings(error, getState()) ||
          // @ts-expect-error ts-migrate(2554) FIXME: Expected 0-1 arguments, but got 2.
          getUpdateErrors.isAttendeeNotAllowedByCustomLogic(error, getState())
        ) {
          return await dispatch(openPrivateEventErrorDialog(null, removeGroupMembersFromRegCart));
        } else if (getUpdateErrors.isInviteeAlreadyRegistered(error)) {
          return await dispatch(
            openAlreadyRegisteredDialog({
              title: 'EventGuestSide_ExistingInvitee_AlreadyRegistered_Header__resx',
              instructionalText: 'EventGuestSide_ExistingInvitee_AlreadyRegistered_InstructionalText__resx',
              prepopulateForm: true
            })
          );
        } else if (getUpdateErrors.isRegistrantAlreadyAddedAsGuest(error)) {
          const subMessage = 'AlreadyRegistered_validation__resx';
          return await dispatch(openKnownErrorDialog(subMessage));
        } else if (getUpdateErrors.isDuplicateInvitee(error)) {
          return await dispatch(openInformationAlreadyUsedDialog());
        } else if (
          getUpdateErrors.isProductAvailabilityError(error) ||
          (shouldHybridFlowWork(attendingFormat) && getUpdateErrors.isProductAvailabilityErrorInHybridEvent(error))
        ) {
          dispatch(loadAvailableCapacityCounts());
          return await dispatch(openCapacityReachedDialog());
        } else if (getUpdateErrors.isVoucherAvailabilityError(error)) {
          return await dispatch(
            openCapacityReachedDialog({
              message: getState().text.translate('EventGuestSide_InvalidVoucherCode_Error__resx'),
              subMessage: getState().text.translate('EventGuestSide_ApiError_VoucherCapacityReached__resx')
            })
          );
        } else if (getUpdateErrors.isAdmissionItemsNotAvailableForRegTypeError(error)) {
          const currentEventRegistrationId = getEventRegistrationId(getState());
          if (isGroupRegistration(getState()) && !isGroupLeader(getState(), currentEventRegistrationId)) {
            return await dispatch(deleteInvalidGroupMemberAndRouteToPage());
          }
          const defaultPage = getDefaultWebsitePageId(getState()) || 'summary';
          dispatch(routeToPage(defaultPage));
          return await dispatch(openEventStatusDialog(eventStatus.CLOSED, getState().text.translate));
        } else if (getUpdateErrors.isCustomFieldAnswerInvalidError(error)) {
          const fieldErrors = getUpdateErrors.getCustomFieldAnswerInvalidErrors(error);
          await dispatch(deleteInvalidCustomFields(fieldErrors));
          const hasRequired = some(fieldErrors, fieldError => {
            const fieldId = fieldError.parametersMap.customField;
            const pageFields = getRegistrationPageFields(getState());
            return some(pageFields, field => field.fieldId === fieldId && field.display === REQUIRED);
          });
          if (hasRequired) {
            const registrationStartPageId = REGISTRATION.forCurrentRegistrant().startPageId(getState());
            const callback = () => saveRegistrationAndRouteToPage(submitForm, registrationStartPageId, false);
            return await dispatch(openIdConfirmationConflictDialog(null, callback));
          }
          return await dispatch(saveRegistrationAndRouteToPage(submitForm, targetPageId, false));
        } else if (getUpdateErrors.isKnownError(error)) {
          return await dispatch(openKnownErrorDialog(findKnownErrorResourceKey(error.responseBody.validationMessages)));
        } else if (getUpdateErrors.isCartBeingProcessed(error)) {
          // Checkout already started, instead of treating as a failure, we'll just poll for completion normally
          regStatus = await dispatch(resumeAlreadyStartedCheckout());
          if (
            regStatus.statusCode !== 'THIRD_PARTY_REDIRECT' &&
            regStatus.statusCode !== 'THIRD_PARTY_REDIRECT_STARTED'
          ) {
            return await redirectToConfirmation(regStatus, dispatch, getState);
          }
        } else if (getUpdateErrors.isCartCancelled(error) || getUpdateErrors.acquiringLockFailed(error)) {
          return await dispatch(
            openKnownErrorDialog(
              findKnownErrorResourceKey(error.responseBody.validationMessages),
              null,
              redirectToSummaryPage
            )
          );
        } else if (getUpdateErrors.isVoucherCodeInvalid(error) || getUpdateErrors.isVoucherCodeMissing(error)) {
          const message = 'EventGuestSide_InvalidVoucherCode_Error__resx';
          const subMessage = 'EventGuestSide_ApiError_InvalidVoucherCode__resx';
          return await dispatch(openKnownErrorDialog(subMessage, message));
        } else if (getCheckoutErrors.admissionItemMissing(error)) {
          return await dispatch(openNoAdmissionItemAvailableForRegistrationTypeDialog());
        } else if (getUpdateErrors.isRegTypeInvalidForEvent(error) || getUpdateErrors.isRegTypeInvalidForGroup(error)) {
          const subMessage = 'EventGuestSide_RegistrationTypeError_NoRegistrationTypeAvailableHelpText_resx';
          const message = 'EventGuestSide_RegistrationTypeConflict_Title_resx';
          return await dispatch(openKnownErrorDialog(subMessage, message));
        } else if (getUpdateErrors.isErrorThatPreventsRegistration(error)) {
          return await dispatch(openPrivateEventErrorDialog());
        }

        if (getUpdateErrors.isEventClosed(error)) {
          return await dispatch(openEventStatusDialog(eventStatus.CLOSED, getState().text.translate));
        }

        const idConfirmationValidations = getIdConfirmationValidationsFromCartError(getState(), error);
        if (!idConfirmationValidations.isValid) {
          const registrationStartPageId = REGISTRATION.forCurrentRegistrant().startPageId(getState());
          const callback = () => saveRegistrationAndRouteToPage(submitForm, registrationStartPageId, false);
          return await dispatch(openIdConfirmationConflictDialog(idConfirmationValidations, callback));
        }
        throw error;
      }
    }

    const {
      regCartStatus: { registrationIntent }
    } = getState();
    if (registrationIntent !== REGISTERING) {
      // Disable while processing a navigation
      return;
    }

    const navigationHandler = async () => {
      // If moving forward, we want to enforce validations. If going backwards, we don't need to.
      if (isForward) {
        await runningVisibilityLogicEvaluations();
        await submitForm(submitAction);
      } else {
        await submitAction();
      }
    };
    await validateTravelWidgetsAndNavigate(navigationHandler, dispatch, getState());
    // we will reset the regTypeChanged value once move to next page
    dispatch({ type: REGTYPE_CHANGED, payload: { regTypeChanged: false } });
  };
});

function getCallbackForIdConfirmationConflictModal(state, submitForm) {
  const registrationStartPageId = REGISTRATION.forCurrentRegistrant().startPageId(state);
  const callback = () => saveRegistrationAndRouteToPage(submitForm, registrationStartPageId, false);
  return callback;
}

function setDisplayOnAttendeeList(state, registrationId) {
  return setEventRegistrationFieldValue(registrationId, ['attendee', 'displayOnAttendeeList'], true);
}

/**
 * All remaining checkout flow after completeRegistration has finished
 * @param {*} submitForm Function that validates nucleus-form components
 */
export function completeRegistrationCallback(submitForm: $TSFixMe) {
  // eslint-disable-next-line complexity
  return async (dispatch: $TSFixMe, getState: $TSFixMe, { apolloClient }: $TSFixMe = {}): Promise<$TSFixMe> => {
    try {
      isInCheckoutVar(true);
      await dispatch(validateSessions());
      await dispatch(updateAdminRegistrationFields(true));
      const isPreview = getState().defaultUserSession.isPreview;
      if (isPreview) {
        return await dispatch(openPreviewModeWarningDialog());
      }
      const guestNavigationValidationResults = validateGuestsCanProceedForward(getState());
      if (!guestNavigationValidationResults.isValid) {
        return dispatch(openGuestNavigationConflictDialog(guestNavigationValidationResults.guestEventRegIdsToRemove));
      }
      let regStatus;
      let response = {};
      try {
        let state = getState();
        const {
          registrationForm: { regCart }
        } = getState();
        const registrationIds = getAllInviteesRegistrationIds(state);
        for (const registrationId of registrationIds) {
          if (isAttendeeListOptInAutomatic(state, getRegistrationPathIdRegCart(regCart, registrationId))) {
            await dispatch(setDisplayOnAttendeeList(state, registrationId));
          }
        }

        response = await dispatch(saveRegistration(undefined, true, true));

        if (hasInvalidMobilePhone(getState())) {
          const phoneCallback = () => completeRegistrationCallback(submitForm);
          return await dispatch(openInvalidPhoneNumberDialog(phoneCallback));
        }

        if (
          getUpdateResponseValidations.isPrivateEvent(response) ||
          getUpdateResponseValidations.isAttendeeNotAllowedByCustomLogic(response)
        ) {
          return await dispatch(openPrivateEventErrorDialog(null, removeGroupMembersFromRegCart));
        }
        if (hasRegTypeCapacityWarning(getState())) {
          const modalDispatchAction = await regTypeCapacityValidation(getState(), apolloClient);
          if (modalDispatchAction) {
            return await dispatch(modalDispatchAction());
          }
        }

        state = getState();
        const { partialPaymentSettings } = state;
        const hasPartialPayment =
          partialPaymentSettings?.paymentAmountOption?.value === PAYMENT_AMOUNT_OPTION.PARTIAL_PAYMENT.value;

        state = await getRegCartPricingMergedState(getState(), apolloClient, hasPartialPayment);

        if (
          state.regCartPricing &&
          state.regCartPricing.netFeeAmountChargeWithPaymentAmountServiceFee > state.regCartPricing.netFeeAmountCharge
        ) {
          return await dispatch(openPaymentAmountServiceFeeConfirmationDialog(submitForm));
        }

        // set offline payment method if all payment is being done via payment credits
        if (
          getPaymentCreditsEnabled(state) &&
          isCompletePaymentByCredits(getPaymentInfo(state, state.regCartPricing))
        ) {
          const offlinePaymentMethod = defaultPricingInfo.offline.optionOne.paymentMethodKey;
          await dispatch(setSelectedPaymentMethod(offlinePaymentMethod));
        }

        regStatus = await dispatch(finalizeRegistration());
      } catch (error) {
        if (
          error.responseStatus === 422 &&
          error.responseBody &&
          error.responseBody.message === 'This RegCart is currently being processed.'
        ) {
          // Checkout already started, instead of treating as a failure, we'll just poll for completion normally
          regStatus = await dispatch(resumeAlreadyStartedCheckout());
        } else {
          const dialog = await returnProperErrorDialog(error, dispatch, getState);
          if (dialog !== null) {
            dispatch({ type: CHECKOUT_FAILURE });
            return dialog;
          }
          const idConfirmationValidations = getIdConfirmationValidationsFromCartError(getState(), error);
          if (!idConfirmationValidations.isValid) {
            const registrationStartPageId = REGISTRATION.forCurrentRegistrant().startPageId(getState());
            const callback = () => saveRegistrationAndRouteToPage(submitForm, registrationStartPageId, false);
            return await dispatch(openIdConfirmationConflictDialog(idConfirmationValidations, callback));
          }
          throw error;
        }
      }
      invalidateDatatagCache();
      if (regStatus.statusCode !== 'THIRD_PARTY_REDIRECT' && regStatus.statusCode !== 'THIRD_PARTY_REDIRECT_STARTED') {
        await redirectToConfirmation(regStatus, dispatch, getState);
      }
    } finally {
      isInCheckoutVar(false);
    }
  };
}

/**
 * Complete the registration and route to the confirmation page
 */
function completeRegistration(submitForm) {
  return async (dispatch, getState, { apolloClient }: $TSFixMe = {}) => {
    const state = getState();
    const {
      registrationForm: { regCart }
    } = state;
    const regCartPricing = getCachedRegCartPricing(regCart.regCartId, apolloClient);
    async function submitAction() {
      if (shouldUseWebpaymentsForm(getState(), regCartPricing)) {
        if (shouldSubmitWebPaymentsForm(getState())) {
          // Submit webpayments form calls back to completeRegistrationCallback()
          dispatch({ type: SUBMIT_WEBPAYMENTS_FORM });
          return;
        }
        /*
         * submitForm should not need to be passed because we are never going to be navigating forwards
         * Putting this under experiment to verify this
         */
        const registrationResponse = await dispatch(completeRegistrationCallback(null));
        return registrationResponse;
      }
      const registrationResponse = await dispatch(completeRegistrationCallback(submitForm));
      return registrationResponse;
    }

    const {
      regCartStatus: { registrationIntent }
    } = getState();
    if (registrationIntent !== REGISTERING) {
      // Disable while processing a navigation
      return;
    }
    const callback = async () => {
      await submitForm(submitAction);
    };
    await validateTravelWidgetsAndNavigate(callback, dispatch, getState());
  };
}

export function continueRegistration() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    let regStatus;
    try {
      regStatus = await dispatch(waitForRegCartCheckoutCompletionUi(getState));
    } catch (error) {
      const dialog = await returnProperErrorDialog(error, dispatch, getState);
      if (dialog !== null) {
        return dialog;
      }
      throw error;
    }
    await redirectToConfirmation(regStatus, dispatch, getState);
  };
}

// eslint-disable-next-line complexity
export async function returnProperErrorDialog(
  error: $TSFixMe,
  dispatch: $TSFixMe,
  getState: $TSFixMe
): Promise<$TSFixMe> {
  const {
    event: { attendingFormat = AttendingFormat.INPERSON }
  } = getState();

  if (
    isExcludedByPrivacySettings(error, getState()) ||
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0-1 arguments, but got 2.
    getUpdateErrors.isAttendeeNotAllowedByCustomLogic(error, getState()) ||
    getUpdateErrors.hasRegTypeCapacityError(error)
  ) {
    return await dispatch(openPrivateEventErrorDialog(null, removeGroupMembersFromRegCart));
  } else if (getUpdateErrors.isPaymentProcessingError(error)) {
    dispatch({ type: FINALIZE_CHECKOUT_PAYMENT_FAILURE });
    return await dispatch(openPaymentProcessingErrorDialog());
  } else if (getUpdateErrors.isInviteeAlreadyRegistered(error)) {
    return await dispatch(
      openAlreadyRegisteredDialog({
        title: 'EventGuestSide_ExistingInvitee_AlreadyRegistered_Header__resx',
        instructionalText: 'EventGuestSide_ExistingInvitee_AlreadyRegistered_InstructionalText__resx',
        prepopulateForm: true
      })
    );
  } else if (getUpdateErrors.isRegistrantAlreadyAddedAsGuest(error)) {
    const subMessage = 'AlreadyRegistered_validation__resx';
    return await dispatch(openKnownErrorDialog(subMessage));
  } else if (getUpdateErrors.isDuplicateInvitee(error)) {
    return await dispatch(openInformationAlreadyUsedDialog());
  } else if (
    getUpdateErrors.isProductAvailabilityError(error) ||
    (shouldHybridFlowWork(attendingFormat) && getUpdateErrors.isProductAvailabilityErrorInHybridEvent(error))
  ) {
    await dispatch(loadAvailableCapacityCounts());
    return await dispatch(openCapacityReachedDialog());
  } else if (getUpdateErrors.isVoucherAvailabilityError(error)) {
    return await dispatch(
      openCapacityReachedDialog({
        message: getState().text.translate('EventGuestSide_InvalidVoucherCode_Error__resx'),
        subMessage: getState().text.translate('EventGuestSide_ApiError_VoucherCapacityReached__resx')
      })
    );
  } else if (getUpdateErrors.isKnownError(error)) {
    return await dispatch(openKnownErrorDialog(findKnownErrorResourceKey(error.responseBody.validationMessages)));
  } else if (getCheckoutErrors.admissionItemMissing(error)) {
    return await dispatch(openNoAdmissionItemAvailableForRegistrationTypeDialog());
  } else if (getUpdateErrors.isVoucherCodeInvalid(error) || getUpdateErrors.isVoucherCodeMissing(error)) {
    const message = 'EventGuestSide_InvalidVoucherCode_Error__resx';
    const subMessage = 'EventGuestSide_ApiError_InvalidVoucherCode__resx';
    return await dispatch(openKnownErrorDialog(subMessage, message));
  } else if (getUpdateErrors.isSessionOverlapError(error)) {
    return await dispatch(openSessionOverlapWarningDialog());
  } else if (getUpdateErrors.isEventClosed(error)) {
    return await dispatch(openEventStatusDialog(eventStatus.CLOSED, getState().text.translate));
  } else if (getCheckoutErrors.isKnownError(error)) {
    return await dispatch(
      openKnownErrorDialog(findKnownErrorResourceKey(error.responseBody.validationMessages), undefined, undefined, true)
    );
  } else if (getCheckoutErrors.hasPaymentCreditsError(error)) {
    return await dispatch(openPaymentCreditsErrorDialog());
  } else if (getUpdateErrors.isCartBeingProcessed(error)) {
    // Checkout already started, instead of treating as a failure, we'll just poll for completion normally
    return await redirectToConfirmation({ statusCode: 'COMPLETED' }, dispatch, getState);
  } else if (getUpdateErrors.isCartCancelled(error) || getUpdateErrors.acquiringLockFailed(error)) {
    return await dispatch(
      openKnownErrorDialog(
        findKnownErrorResourceKey(error.responseBody.validationMessages),
        null,
        redirectToSummaryPage
      )
    );
  } else if (getUpdateErrors.isRegTypeInvalidForEvent(error)) {
    const subMessage = 'EventGuestSide_RegistrationTypeError_NoRegistrationTypeAvailableHelpText_resx';
    const message = 'EventGuestSide_RegistrationTypeConflict_Title_resx';
    return await dispatch(openKnownErrorDialog(subMessage, message));
  } else if (getUpdateErrors.isErrorThatPreventsRegistration(error)) {
    return await dispatch(openPrivateEventErrorDialog());
  }
  return null;
}

const emptyClasses = {};
const getWidgetClasses = defaultMemoize(classes => {
  return {
    ...classes,
    ...LinearNavigatorClasses,
    ...ButtonGroupStyles,
    button: `${LinearNavigatorClasses.button} ${RegistrationNavigatorWidgetStyles.button}`
  };
});

/**
 * Whether we show the exit button in the widget
 * Its shown only when either
 * a. website pages are accessible (by default accessible for all non-container events)
 * OR
 * b. its a planner action
 * OR
 * c. its reg modification
 * OR
 * d. it shouldnt be (the first page of registration or registration actions shouldnt be disabled)
 */
export const showExitButtonInWidget = (
  state: $TSFixMe,
  pageIds: $TSFixMe,
  currentPageId: $TSFixMe,
  registrationActionsDisabled: $TSFixMe
): $TSFixMe => {
  const areWebsitePagesAccessible = hasAccessToWebsitePages(state);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const startPageId = pageIds && pageIds[0];
  const isFirstRegistrationPage = currentPageId === startPageId;
  const isPlanner = state.defaultUserSession?.isPlanner;
  return (
    areWebsitePagesAccessible ||
    isPlanner ||
    isRegistrationModification(state) ||
    !(isFirstRegistrationPage || registrationActionsDisabled)
  );
};

export const LinearPageNavigatorWidget = (props: unknown): JSX.Element => {
  const useGraphQL = useGraphQLForSkippingPages();
  const NavigatorComponent = useGraphQL ? GraphQLEnabledNavigatorWidget : LegacyPageNavigatorWidget;
  return <NavigatorComponent {...props} />;
};

/**
 * Connects the RegistrationNavigator widget to the application.
 */
export default withForm(
  () => ({}),
  formActions => ({ submitForm: formActions.submitForm })
)(
  connect(
    (state: $TSFixMe, props: $TSFixMe) => {
      const registrationProcessPath = REGISTRATION.forPathContainingWidget(props.id);
      const pageIds = registrationProcessPath.pageIds(state);
      const currentPageId = getCurrentPageId(state);
      const registrationActionsDisabled = areRegistrationActionsDisabled(state);
      const showExitButton = showExitButtonInWidget(state, pageIds, currentPageId, registrationActionsDisabled);
      const classes = registrationActionsDisabled ? getWidgetClasses(props.classes || emptyClasses) : props.classes;
      const disableAllButtons = isRegCartUpdateInProgress(state);
      return {
        pageIds,
        classes,
        currentPageId,
        disableForwardNavigation: registrationActionsDisabled,
        showExitButton,
        reverseButtonOrderOnMobile: true,
        disableAllButtons,
        useDefaultCursorWhenDisabled: true
      };
    },
    (dispatch: $TSFixMe, props: $TSFixMe) =>
      bindActionCreators(
        {
          onExitRequest: exitRegistration,
          onNavigateRequest: saveRegistrationAndRouteToPage.bind(null, withScrollToFirstError(props.submitForm)),
          onCompleteRequest: completeRegistration.bind(null, withScrollToFirstError(props.submitForm))
        },
        dispatch
      )
  )(LinearPageNavigatorWidget)
);
