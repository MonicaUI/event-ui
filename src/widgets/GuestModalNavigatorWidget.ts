import { connect } from 'react-redux';
import LinearPageNavigatorWidget from 'nucleus-widgets/lib/LinearPageNavigator/LinearPageNavigatorWidget';
import { getCurrentPageId } from '../redux/pathInfo';
import {
  updateGuestDetails,
  updateGuestsInRegCart,
  removeGuestByEventRegistrationId,
  clearTemporaryGuestInformation
} from '../redux/registrationForm/regCart';
import { closeDialogContainer, withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { bindActionCreators } from 'redux';
import InvalidFormError from 'nucleus-form/src/utils/InvalidFormError';
import withForm from 'nucleus-form/src/components/withForm';
import { openGuestDetailsDialog, openKnownErrorDialog } from '../dialogs';
import {
  validateUserRegistrationTypeSelection,
  handleRegistrationTypeSelectionConflict
} from '../dialogs/selectionConflictDialogs';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import * as eventRegistrationData from '../utils/eventRegistrationData';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import { isAdministratorRegistrationEnabled } from '../redux/selectors/shared';
import { getIn } from 'icepick';

// selectors
import { getRegCart } from '../redux/selectors/shared';
import {
  getAdminPersonalInformation,
  isRegistrationModification,
  getTemporaryGuestEventRegistrationId,
  getTemporaryGuestEventRegistration,
  isGuestEditMode
} from '../redux/selectors/currentRegistrant';
import {
  getLeadersRegistrationPathId,
  isGuestProductSelectionEnabledOnRegPath
} from '../redux/selectors/currentRegistrationPath';
import { getRegistrationTypeId } from '../redux/registrationForm/regCart/selectors';
import { runningVisibilityLogicEvaluations } from '../redux/actions';
import { hasGuestQuestionRuleValidationWarning } from '../redux/registrationForm/warnings';

/**
 * A simple no op function for navigation as the site editor
 * does not have navigation defined for the widget.
 */
const noOp = (): void => {};

/**
 * Wraps the submitForm action to detect if the failure was due to validations
 * Currently does not handle scrolling toerro in guest widget
 * TODO: If modal is open, scroll to error in modal instead of in page
 */
const withInvalidFormErrorHandler = submitForm => {
  return async (...args) => {
    try {
      return await submitForm(...args);
    } catch (error) {
      if (error instanceof InvalidFormError) {
        return;
      }
      throw error;
    }
  };
};

const restoreRegTypeAndOpenGuestDetailDialog = (
  previouslySelectedRegTypeId,
  openGuestInfoModal,
  restoreGuestRegType
) => {
  return dispatch => {
    dispatch(restoreGuestRegType(previouslySelectedRegTypeId));
    dispatch(openGuestInfoModal());
  };
};

const validateAdminRegistrationFields = (getState, currentGuestEventRegistration) => {
  const regPathId = getLeadersRegistrationPathId(getState());
  const administratorRegistrationEnabled = isAdministratorRegistrationEnabled(getState(), regPathId);
  const admin = getAdminPersonalInformation(getState());
  const isRegMod = isRegistrationModification(getState());
  /*
   * Admin enabled or not matters only in initial reg.
   * In reg modification, if admin info exists, we should validate it.
   */
  if ((administratorRegistrationEnabled && admin && admin.selectedValue) || (admin && isRegMod)) {
    const existingEmail = getIn(currentGuestEventRegistration, ['attendee', 'personalInformation', 'emailAddress']);
    if (existingEmail && admin.emailAddress) {
      return existingEmail.toLowerCase() === admin.emailAddress.toLowerCase();
    }
  }
  return false;
};

function updateGuestDetailsWithLoading(submitForm, restoreGuestRegType) {
  return async (dispatch, getState, apolloClient) => {
    async function submitGuestDetails() {
      dispatch(closeDialogContainer());
      const isEditMode = isGuestEditMode(getState());
      const currentGuestEventRegistrationId = getTemporaryGuestEventRegistrationId(getState());
      const currentGuestEventRegistration = getTemporaryGuestEventRegistration(getState());
      if (validateAdminRegistrationFields(getState, currentGuestEventRegistration)) {
        return await dispatch(
          openKnownErrorDialog(
            getState().text.translate('EventGuestSide_AdminEmailExist_ErrorMessage__resx'),
            null,
            openGuestDetailsDialog
          )
        );
      }
      const regCart = getRegCart(getState());
      const previouslySelectedRegTypeId = getRegistrationTypeId(regCart, currentGuestEventRegistrationId);
      const regTypeIdSelectedInDialog =
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        (currentGuestEventRegistration && currentGuestEventRegistration.registrationTypeId) ||
        defaultRegistrationTypeId;
      const boundUpdateGuestDetails = updateGuestDetails.bind(null, openGuestDetailsDialog);
      const isGuestProductSelectionEnabled = isGuestProductSelectionEnabledOnRegPath(getState());
      // If regType was updated in the modal, check for conflicts and dispatch conflict modal if necessary
      if (previouslySelectedRegTypeId !== regTypeIdSelectedInDialog && isGuestProductSelectionEnabled) {
        const validationResults = {};
        validationResults[currentGuestEventRegistrationId] = await validateUserRegistrationTypeSelection(
          getState(),
          regTypeIdSelectedInDialog,
          currentGuestEventRegistrationId,
          false,
          apolloClient
        );
        const boundRestoreRegTypeAndOpenGuestDetailsDialog = restoreRegTypeAndOpenGuestDetailDialog.bind(
          null,
          previouslySelectedRegTypeId,
          openGuestDetailsDialog,
          restoreGuestRegType
        );
        if (!validationResults[currentGuestEventRegistrationId].isValid) {
          return dispatch(
            handleRegistrationTypeSelectionConflict(
              validationResults,
              boundUpdateGuestDetails,
              boundRestoreRegTypeAndOpenGuestDetailsDialog
            )
          );
        }
      }
      await dispatch(boundUpdateGuestDetails());
      if (hasGuestQuestionRuleValidationWarning(getState(), currentGuestEventRegistrationId)) {
        // reopen the guest dialog as there are validation errors
        return dispatch(openGuestDetailsDialog(currentGuestEventRegistrationId, isEditMode));
      }
    }
    await runningVisibilityLogicEvaluations();
    await submitForm(submitGuestDetails);
  };
}

const mapDispatchToProps = () => {
  return (dispatch, props) => {
    const actions = {
      onCompleteRequest: withLoading(
        updateGuestDetailsWithLoading.bind(null, withInvalidFormErrorHandler(props.submitForm))
      ),
      // @ts-expect-error ts-migrate(2555) FIXME: Expected at least 1 arguments, but got 0.
      onExitRequest: withLoading(removeGuestWithLoading.bind())
    };
    return bindActionCreators(actions, dispatch);
  };
};

function removeGuestWithLoading() {
  return async (dispatch, getState) => {
    const currentGuestEventRegistrationId = getTemporaryGuestEventRegistrationId(getState());
    if (isGuestEditMode(getState())) {
      await dispatch(clearTemporaryGuestInformation());
      return dispatch(closeDialogContainer());
    }
    const {
      registrationForm: { regCart }
    } = getState();
    const updatedRegCart = await removeGuestByEventRegistrationId(regCart, currentGuestEventRegistrationId);
    await dispatch(updateGuestsInRegCart(updatedRegCart, false));
    await dispatch(clearTemporaryGuestInformation());
    dispatch(closeDialogContainer());
  };
}

export default withForm(
  () => ({}),
  formActions => ({ submitForm: formActions.submitForm })
)(
  connect(
    (state: $TSFixMe) => {
      const guestPage = getCurrentPageId(state);

      const eventRegistrationStatePath = ['registrationTypeId'];

      const widgetConfig = {
        registrationFieldPageType: registrationFieldPageType.GuestRegistration
      };

      const answer = eventRegistrationData.answer({
        state,
        widgetConfig,
        eventRegistrationPath: eventRegistrationStatePath,
        getAnswerFormatter: regTypeId => (regTypeId === defaultRegistrationTypeId ? null : regTypeId)
      });

      return {
        pageIds: [guestPage],
        currentPageId: guestPage,
        onNavigateRequest: noOp,
        /*
         * Forward navigation is not disabled. Maybe at some point this could be configurable
         * for planner to see the difference when it is disabled.
         */
        disableForwardNavigation: false,
        guestSetterAction: answer.setterAction,
        reverseButtonOrderOnMobile: true
      };
    },
    mapDispatchToProps,
    (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
      const boundRestoreGuestRegType = eventRegistrationData.setAnswerAction.bind(null, stateProps.guestSetterAction);
      return {
        ...ownProps,
        ...stateProps,
        ...dispatchProps,
        onCompleteRequest: dispatchProps.onCompleteRequest.bind(null, boundRestoreGuestRegType)
      };
    }
  )(LinearPageNavigatorWidget)
);
