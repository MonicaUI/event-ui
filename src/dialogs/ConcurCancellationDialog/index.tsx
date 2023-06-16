import React from 'react';
import ConcurCancellationDialogStyles from './ConcurCancellationDialog.less';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { openDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import ConcurCancellationDialog from './ConcurCancellationDialog';
import ButtonStyles from 'nucleus-core/less/cv/Button.less';
import ButtonGroupStyles from 'nucleus-core/less/cv/ButtonGroup.less';

export const openConcurWarningDialog = (openDialogConfig: $TSFixMe, translate: $TSFixMe): $TSFixMe => {
  const popupConfigs = {
    ...openDialogConfig,
    classes: {
      ...ConcurCancellationDialogStyles,
      button: ButtonStyles,
      buttonGroup: ButtonGroupStyles
    }
  };
  return (dispatch, getState) => {
    const dialog = <ConcurCancellationDialog translate={translate} dialogConfig={popupConfigs} />;
    return dispatch(
      openDialogContainer(dialog, undefined, {
        classes: { dialogContainer: ConcurCancellationDialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
