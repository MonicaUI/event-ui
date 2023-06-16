import { closeDialogContainer, openDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import EventStatusStyles from '../EventStatusDialog.less';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import React from 'react';
import { withStyles } from '../ThemedDialog';
import StandardDialogStyles from '../styles/StandardDialog.less';
import SharedPromptDialogStyle from './SharePromptDialog.less';
import { SharePromptDialog } from './SharePromptDialog';
import { areCookiesAllowedForSocialMedia } from '../../utils/cookieConsentUtils';

const Dialog = withStyles(SharePromptDialog);

const classes = {
  ...StandardDialogStyles,
  ...SharedPromptDialogStyle
};

/**
 * Helper function to open the share prompt dialog.
 */
export const openSharePromptDialog = (translate: $TSFixMe, sharePromptData: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const boundCloseDialog = () => dispatch(closeDialogContainer());
    const dialog = (
      <Dialog
        onClose={boundCloseDialog}
        translate={translate}
        sharePromptData={sharePromptData}
        classes={classes}
        isShareBarVisible={areCookiesAllowedForSocialMedia(getState())}
      />
    );
    return dispatch(
      openDialogContainer(dialog, boundCloseDialog, {
        classes: { dialogContainer: EventStatusStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
