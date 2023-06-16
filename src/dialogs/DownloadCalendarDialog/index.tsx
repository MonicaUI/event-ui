import {
  openDialogContainer,
  closeDialogContainer,
  hideLoadingDialog
} from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import React from 'react';
import DownloadCalendarDialog from './DownloadCalendarDialog';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import DownloadCalendarDialogStyles from './DownloadCalendarDialog.less';
import { injectTestId } from '@cvent/nucleus-test-automation';
import { openAlreadyRegisteredDialog } from '../AlreadyRegisteredDialog';
import { populateAllProducts } from '../../redux/visibleProducts';
import { resetStatus } from '../../redux/registrantLogin/actions';
import { getRegistrationTypeId } from '../../redux/selectors/currentRegistrant';
import { getRegTypeVisibility } from '../../redux/selectors/shared';
import { getCurrentPageId, routeToPage } from '../../redux/pathInfo';
import { isValidPageForRegType, getConfirmationPageIdForInvitee } from '../../utils/confirmationUtil';
import { loadAddToCalendarProviders } from '../../redux/addToCalendar/actions';
import { get } from 'lodash';
import { isFlexAddToGoogleCalendarInPersonEventVariant } from '../../utils/addToCalendarUtils';
import { invalidateDatatagCache } from '../../utils/datatagUtils';

export const openDownloadCalendarDialog = ({ modalStyles }: { modalStyles?: $TSFixMe }) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const loadDownloadCalendarDialogProducts = async () => {
      if (!get(getState(), ['visibleProducts', 'Widget'])) {
        await dispatch(populateAllProducts('Widget'));
      }
    };
    /**
     * If virtual event variant is on, we will not be hitting oslo-lookups service for calendar providers
     * Instead, we would be using new calendar service which supports In-Person and virtual events for calendar types
     */
    if (isFlexAddToGoogleCalendarInPersonEventVariant(getState())) {
      await dispatch(loadAddToCalendarProviders());
    }

    const postLoginOverride = async () => {
      const regTypeId = getRegistrationTypeId(getState());
      const regTypeVisibility = getRegTypeVisibility(getState());
      const currentPage = getCurrentPageId(getState());
      const isCurrentPageVisible = isValidPageForRegType(currentPage, regTypeId, regTypeVisibility);
      if (isCurrentPageVisible) {
        await dispatch(populateAllProducts('Widget'));
        dispatch(closeDialogContainer());
        dispatch(hideLoadingDialog());
        dispatch(openDownloadCalendarDialog({ modalStyles }));
      } else {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        const confirmationPageId = await dispatch(getConfirmationPageIdForInvitee(getState()));
        dispatch(routeToPage(confirmationPageId));
        dispatch(closeDialogContainer());
        invalidateDatatagCache();
        dispatch(hideLoadingDialog());
      }
    };
    const cancelAlreadyRegistered = () => {
      dispatch(resetStatus());
      dispatch(closeDialogContainer());
      dispatch(openDownloadCalendarDialog({ modalStyles }));
    };
    const boundCloseDialog = () => {
      dispatch(closeDialogContainer());
    };
    const dialog = (
      <DownloadCalendarDialog
        {...injectTestId('download-calendar-dialog')}
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onClose: () => void; classes: Record<strin... Remove this comment to see the full error message
        onClose={boundCloseDialog}
        classes={DownloadCalendarDialogStyles}
        modalStyles={modalStyles}
        login={() =>
          dispatch(openAlreadyRegisteredDialog({ postLoginOverride, onCloseOverride: cancelAlreadyRegistered }))
        }
      />
    );
    await loadDownloadCalendarDialogProducts();
    return dispatch(
      openDialogContainer(dialog, () => boundCloseDialog(), {
        style: { dragContainer: getDialogContainerStyle(getState()) },
        classes: { dialogContainer: DownloadCalendarDialogStyles.dialogContainer }
      })
    );
  };
};
