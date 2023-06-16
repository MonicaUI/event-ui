import React from 'react';
import StandardDialog from '../dialogs/shared/StandardDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogStyles from './NetworkErrorDialog.less';
import { setNetworkErrorHandler } from './loggingAndErrors';
import getDialogContainerStyle from '../dialogs/shared/getDialogContainerStyle';
import { merge } from 'lodash';
import ThemeableComponent from 'nucleus-widgets/lib/ThemeableComponent';
import { resolve } from '@cvent/nucleus-dynamic-css';
import { httpLogPageLoadId } from '@cvent/nucleus-networking';

/**
 * Function to get the style object to pass into the event status dialog.
 */
function dialogStyle(state) {
  const { global, sections } = state.website.theme;
  return {
    ...global,
    dialogHeader: { styleMapping: 'header3' },
    subMessage: { styleMapping: 'body1' },
    errorBox: { styleMapping: 'body1' },
    dragHandle: { ...merge({}, global, sections.content2), styleMapping: 'custom' }
  };
}

class NetworkErrorDialog extends ThemeableComponent<$TSFixMe, $TSFixMe> {
  getElementBackground: $TSFixMe;
  getElementInlineStyle: $TSFixMe;
  getElementText: $TSFixMe;
  props: $TSFixMe;
  getStyleObject() {
    return {
      dialogHeader: this.getElementInlineStyle('dialogHeader'),
      subMessage: this.getElementInlineStyle('subMessage'),
      errorBox: this.getElementText('errorBox'),
      dragHandle: this.getElementBackground('dragHandle')
    };
  }
  render() {
    const { translate, closeDialog, date } = this.props;
    const style = this.getStyleObject();
    return (
      <StandardDialog
        onClose={closeDialog}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        title={translate('EventGuestSide_NetworkError_Title__resx')}
        subMessage={translate('EventGuestSide_NetworkError_CheckYourConnection__resx')}
        icon="error"
        iconModifier="error"
        classes={DialogStyles}
        style={style}
      >
        <div {...resolve({ classes: DialogStyles, style }, 'errorBox')}>
          <div>{translate('EventGuestSide_NetworkError_ContactCustomerCenter__resx')}</div>
          <div>
            <span className={DialogStyles.errorBoxLabel}>{translate('Flex_ErrorPage_Time_Label__resx')}</span>:{' '}
            {date.toISOString()}
          </div>
          <div>
            <span className={DialogStyles.errorBoxLabel}>{translate('Flex_ErrorPage_sessionId_Label__resx')}</span>:{' '}
            {httpLogPageLoadId}
          </div>
        </div>
      </StandardDialog>
    );
  }
}

function openNetworkErrorDialog() {
  return (dispatch, getState) => {
    const { translate } = getState().text;
    const boundCloseDialog = () => {
      dispatch(closeDialogContainer());
    };
    const dialog = (
      <NetworkErrorDialog
        closeDialog={boundCloseDialog}
        translate={translate}
        style={dialogStyle(getState())}
        date={new Date(Date.now())}
      />
    );
    return dispatch(
      openDialogContainer(dialog, boundCloseDialog, {
        classes: { dialogContainer: DialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
}

export function initializeNetworkErrorDialog(store: $TSFixMe): $TSFixMe {
  setNetworkErrorHandler(() => store.dispatch(openNetworkErrorDialog()));
}
