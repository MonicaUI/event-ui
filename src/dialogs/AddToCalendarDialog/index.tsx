import React from 'react';
import { closeDialogContainer, openDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import AddToCalendarDialog from './AddToCalendarDialog';
import { injectTestId } from '@cvent/nucleus-test-automation';
import AddToCalendarDialogStyles from './AddToCalendarDialog.less';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import {
  isMobileView,
  isFlexAddToGoogleCalendarVirtualEventVariant,
  isFlexAddToGoogleCalendarInPersonEventVariant,
  getPreviewToken,
  getTestModeHash,
  getGoogleCalendar,
  getOutlookCalendar,
  isAddToCalendarEnabled
} from '../../utils/addToCalendarUtils';
import { loadAddToCalendarProviders, loadEventCalendarUrl } from '../../redux/addToCalendar/actions';
import { CalendarType } from '../DownloadCalendarDialog/CalendarDownloadFileType';
import { getAttendeeId } from '../../redux/selectors/currentRegistrant';

const getDialogContainerStyles = state => {
  const width = '350px';
  const borderRadius = '5px';
  const minWidth = isMobileView() ? window.innerWidth : width;
  return {
    ...getDialogContainerStyle(state),
    minWidth,
    borderRadius
  };
};

export const openAddToCalendarDialog = ({ modalStyles }: { modalStyles?: $TSFixMe }) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const attendeeId = getAttendeeId(state) ?? state.userSession?.inviteeId;
    const {
      pathInfo,
      calendarProviders,
      defaultUserSession: { isPreview, isTestMode },
      multiLanguageLocale: locale
    } = state;
    const boundCloseDialog = () => {
      dispatch(closeDialogContainer());
    };

    const dialog = (
      <AddToCalendarDialog
        {...injectTestId('add-to-calendar-dialog')}
        onClose={boundCloseDialog}
        classes={AddToCalendarDialogStyles}
        modalStyles={modalStyles}
      />
    );

    if (isAddToCalendarEnabled(getState()) && !getOutlookCalendar(calendarProviders)) {
      await dispatch(
        loadEventCalendarUrl(
          CalendarType.OUTLOOK,
          attendeeId,
          null,
          getPreviewToken(isPreview, pathInfo),
          getTestModeHash(isTestMode, pathInfo),
          locale
        )
      );
    }

    /**
     * If virtual event variant is on, we will not be hitting oslo-lookups service for calendar providers
     * Instead, we would be using new calendar service which supports In-Person and virtual events for calendar types
     */
    if (isFlexAddToGoogleCalendarVirtualEventVariant(getState())) {
      if (!getGoogleCalendar(calendarProviders)) {
        await dispatch(
          loadEventCalendarUrl(
            CalendarType.GOOGLE,
            attendeeId,
            null,
            getPreviewToken(isPreview, pathInfo),
            getTestModeHash(isTestMode, pathInfo),
            locale
          )
        );
      }
    } else if (isFlexAddToGoogleCalendarInPersonEventVariant(getState())) {
      await dispatch(loadAddToCalendarProviders());
    }

    return dispatch(
      openDialogContainer(dialog, () => boundCloseDialog(), {
        style: { dragContainer: getDialogContainerStyles(getState()) },
        classes: { dialogContainer: AddToCalendarDialogStyles.dialogContainer }
      })
    );
  };
};
