import { connect } from 'react-redux';
import PageBanner from './PageBanner';
import { injectTestId } from '@cvent/nucleus-test-automation';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { logoutPlanner } from '../redux/registrantLogin/actions';
import { showLoadingDialog } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';

/**
 * Planner side registration (Planner Reg) page banner for event guestside site.
 */
export default connect(
  (state: $TSFixMe) => {
    return {
      ...injectTestId('planner-reg'),
      bannerText: 'EventGuestSide_BannerText_PlannerReg__resx',
      bannerHelpText: 'EventGuestSide_BannerHelpText_PlannerReg__resx',
      translate: state.text.translate
    };
  },
  {
    closeBannerHandler: withLoading(() => {
      return async (dispatch, getState) => {
        const {
          plannerRegSettings: { exitUrl }
        } = getState();
        dispatch(showLoadingDialog());
        await dispatch(logoutPlanner(exitUrl));
      };
    })
  }
)(PageBanner);
