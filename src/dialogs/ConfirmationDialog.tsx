import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { merge } from 'lodash';
import ThemeableComponent from 'nucleus-widgets/lib/ThemeableComponent';
import { openDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import StandardDialog from './shared/StandardDialog';
import EventStatusStyles from './EventStatusDialog.less';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import { resolve } from '@cvent/nucleus-dynamic-css';

/**
 * Component for showing confirmation dialog
 */
class ConfirmationDialog extends ThemeableComponent<$TSFixMe, $TSFixMe> {
  static propTypes = {
    style: PropTypes.object,
    classes: PropTypes.object,
    translate: PropTypes.func,
    confirm: PropTypes.func,
    cancel: PropTypes.func,
    title: PropTypes.string,
    message: PropTypes.string,
    subMessage: PropTypes.string,
    primaryButtonText: PropTypes.string,
    secondaryButtonText: PropTypes.string
  };

  static defaultProps = {
    classes: EventStatusStyles,
    icon: 'warning',
    primaryButtonText: 'EventWidgets_GenericText_Yes__resx',
    secondaryButtonText: 'EventWidgets_GenericText_No__resx'
  };

  getElementBackground: $TSFixMe;
  getElementInlineStyle: $TSFixMe;
  props: $TSFixMe;

  getStyleObject() {
    return {
      dialogHeader: this.getElementInlineStyle('header'),
      title: this.getElementInlineStyle('title'),
      subMessage: this.getElementInlineStyle('subTitle'),
      dragHandle: this.getElementBackground('content2'),
      dragContainer: this.getElementBackground('content1'),
      body: this.getElementInlineStyle('body1'),
      primaryButton: this.getElementInlineStyle('primaryButton'),
      secondaryButton: this.getElementInlineStyle('secondaryButton')
    };
  }

  render() {
    const {
      translate,
      cancel,
      confirm,
      classes,
      title,
      message,
      subMessage,
      icon,
      primaryButtonText,
      secondaryButtonText
    } = this.props;
    const style = this.getStyleObject();
    return (
      <StandardDialog
        title={translate(title)}
        message={translate(message)}
        subMessage={translate(subMessage)}
        icon={icon}
        classes={classes}
        style={style}
        onClose={cancel}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
      >
        <button type="button" {...resolve({ style, classes }, 'secondaryButton')} onClick={cancel}>
          {translate(secondaryButtonText)}
        </button>
        <button type="button" {...resolve({ style, classes }, 'primaryButton')} onClick={confirm}>
          {translate(primaryButtonText)}
        </button>
      </StandardDialog>
    );
  }
}

function dialogStyle(globalTheme, sections) {
  return {
    ...globalTheme,
    header: globalTheme.dialog ? globalTheme.dialog.header : { styleMapping: 'header3' },
    title: globalTheme.dialog ? globalTheme.dialog.headerText : { styleMapping: 'header2' },
    subTitle: { styleMapping: 'header4' },
    content1: { ...merge({}, globalTheme, sections.content1), styleMapping: 'custom' },
    content2: { ...merge({}, globalTheme, sections.content2), styleMapping: 'custom' },
    body1: { styleMapping: 'body1' },
    primaryButton: { styleMapping: 'primaryButton' },
    secondaryButton: { styleMapping: 'secondaryButton' }
  };
}

const ConnectedConfirmationDialog = connect((state: $TSFixMe, props: $TSFixMe) => {
  const {
    customFonts,
    website: {
      theme: { global, sections }
    }
  } = state;
  return {
    ...props.dialogConfig,
    translate: state.text.translate,
    style: merge({}, dialogStyle(global, sections), { customFonts })
  };
})(ConfirmationDialog);

/**
 * Helper function to open dialog.
 */
export const openConfirmationDialog = (dialogOptions: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const dialog = <ConnectedConfirmationDialog {...dialogOptions} />;
    const { cancel } = dialogOptions;
    return dispatch(
      openDialogContainer(dialog, () => dispatch(cancel()), {
        classes: { dialogContainer: EventStatusStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};

export default openConfirmationDialog;
