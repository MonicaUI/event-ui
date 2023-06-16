import { connect } from 'react-redux';
import LinearPageNavigatorWidget from 'nucleus-widgets/lib/LinearPageNavigator/LinearPageNavigatorWidget';
import { getCurrentPageId, routeToPage } from '../redux/pathInfo';
import { POST_REGISTRATION_PAYMENT } from '../redux/website/registrationProcesses';
import { bindActionCreators } from 'redux';
import withForm from 'nucleus-form/src/components/withForm';
import { SUBMIT_WEB_PAYMENT } from '../redux/postRegistrationPayment/actionTypes';
import { getConfirmationPageIdForInvitee } from '../utils/confirmationUtil';
import { waitForRegCartCheckoutCompletionUi } from '../redux/registrationForm/regCart';
import { openPaymentSuccessfulDialog } from '../dialogs';
import { returnProperErrorDialog } from './RegistrationNavigator/RegistrationNavigatorWidget';
import { routeToPageWithoutQueryString } from '../redux/pathInfo';
import { redirectToConfirmation } from '../errorHandling/confirmation';

export function completePostRegPayment() {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    dispatch({ type: SUBMIT_WEB_PAYMENT });
  };
}

export function cancelPostRegPayment() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
    const confirmationPageId = await dispatch(getConfirmationPageIdForInvitee(getState()));
    dispatch(routeToPage(confirmationPageId));
  };
}

export function continuePostRegPayment() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    let regStatus;
    try {
      regStatus = await dispatch(waitForRegCartCheckoutCompletionUi(getState));
    } catch (error) {
      await dispatch(routeToPageWithoutQueryString('PostRegistrationPayment'));
      await returnProperErrorDialog(error, dispatch, getState);
      return;
    }
    await redirectToConfirmation(regStatus, dispatch, getState, false);
    await dispatch(openPaymentSuccessfulDialog());
  };
}

/**
 * Connects the RegistrationNavigator widget to the application.
 */
export default withForm(
  () => ({}),
  formActions => ({ submitForm: formActions.submitForm })
)(
  connect(
    (state: $TSFixMe, props: $TSFixMe) => {
      const pageIds = POST_REGISTRATION_PAYMENT.forPathContainingWidget(props.id).pageIds(state);
      return {
        pageIds,
        currentPageId: getCurrentPageId(state),
        disableForwardNavigation: state.postRegistrationPaymentData.isCheckingOut,
        showCompleteForAllSteps: true
      };
    },
    (dispatch: $TSFixMe) =>
      bindActionCreators(
        {
          onCompleteRequest: completePostRegPayment,
          onExitRequest: cancelPostRegPayment
        },
        dispatch
      )
  )(LinearPageNavigatorWidget)
);
