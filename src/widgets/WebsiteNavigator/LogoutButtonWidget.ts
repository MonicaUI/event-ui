import { connect } from 'react-redux';
import ContainerlessButtonWidget from 'nucleus-widgets/lib/Button/ContainerlessButtonWidget';
import { routeToUrl, getPagePath, getCurrentPageId } from '../../redux/pathInfo';
import { getDefaultWebsitePageId } from '../../redux/website';
import { logoutRegistrant } from '../../redux/registrantLogin/actions';
import {
  showLoadingDialog,
  hideLoadingDialog,
  hideLoadingOnError
} from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import qs from 'querystring';
import {
  REGISTRATION,
  APPROVAL_DENIED,
  CANCELLATION,
  GUEST_REGISTRATION,
  PENDING_APPROVAL,
  POST_REGISTRATION,
  POST_REGISTRATION_PAYMENT
} from '../../redux/website/registrationProcesses';
import { filterEventSnapshot } from '../../redux/actions';
import { getDefaultRegistrationPath } from 'event-widgets/redux/selectors/appData';
import { invalidateDatatagCache } from '../../utils/datatagUtils';

export const stripInviteeFromUrl = (url: $TSFixMe): $TSFixMe => {
  const path = url.split('?')[0];
  const query = qs.parse(url.split('?')[1]) || {};
  delete query.inviteeId;
  // The i query param is the incoded version of the inviteeId.
  delete query.i;
  // The tm query param store a hash for test mode
  delete query.tm;

  // we need to delete marketo and eloqua param from url on log out
  delete query.MarketoID;
  delete query.EloquaID;

  return path + (Object.keys(query).length ? `?${qs.stringify(query)}` : '');
};

function currentPageNeedsLoggedInUser(state) {
  return (
    REGISTRATION.isTypeOfCurrentPage(state) ||
    GUEST_REGISTRATION.isTypeOfCurrentPage(state) ||
    POST_REGISTRATION.isTypeOfCurrentPage(state) ||
    CANCELLATION.isTypeOfCurrentPage(state) ||
    PENDING_APPROVAL.isTypeOfCurrentPage(state) ||
    APPROVAL_DENIED.isTypeOfCurrentPage(state) ||
    POST_REGISTRATION_PAYMENT.isTypeOfCurrentPage(state)
  );
}

function logout() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    dispatch(showLoadingDialog());
    let state = getState();
    const { eventSnapshotVersion, appData } = state;
    const defaultRegPathId = getDefaultRegistrationPath(appData);
    try {
      const isInviteeRedirectedToOktaLogoutUrl = await dispatch(logoutRegistrant());
      // after logout is complete, reset website to default regTypeId and default regPathId
      await dispatch(filterEventSnapshot(eventSnapshotVersion, defaultRegistrationTypeId, defaultRegPathId));
      state = getState();
      const nextPageId = currentPageNeedsLoggedInUser(state) ? getDefaultWebsitePageId(state) : getCurrentPageId(state);
      if (!isInviteeRedirectedToOktaLogoutUrl) {
        if (state.defaultUserSession.isTestMode) {
          // setting href instead of using replace so that back button works correctly
          global.location.href = stripInviteeFromUrl(getPagePath(state, nextPageId));
        } else {
          await dispatch(routeToUrl(stripInviteeFromUrl(getPagePath(state, nextPageId))));
        }
      }
    } catch (error) {
      dispatch(hideLoadingOnError());
      throw error;
    }
    dispatch(hideLoadingDialog());
    invalidateDatatagCache();
  };
}

export function mapStateToProps(): $TSFixMe {
  return {
    kind: 'button'
  };
}
export const mapDispatchToProps = {
  clickHandler: logout
};

/**
 * Data wrapper for the log out widget.
 */
export default connect(mapStateToProps, mapDispatchToProps)(ContainerlessButtonWidget);
