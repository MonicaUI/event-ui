import React from 'react';
import { routeToPage } from '../../redux/pathInfo';
import { openDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { WebsitePasswordDialog } from './WebsitePasswordDialog';
import { withStyles } from '../ThemedDialog';
import { connect } from 'react-redux';
import { setVerifiedWebsitePasswordInUserSession } from '../../redux/userSession';
import { setReferrer } from '../../redux/actions';
import { closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';

// Styles
import WebsitePasswordDialogStyles from './WebsitePasswordDialog.less';
import StandardDialogStyles from '../styles/StandardDialog.less';
import FormElementStyles from 'nucleus-core/less/cv/Forms.less';
import TextInputStyles from 'nucleus-core/less/cv/TextInput.less';
import FormLabelStyles from 'nucleus-core/less/cv/Labels.less';

const Dialog = withStyles(WebsitePasswordDialog);

const classes = {
  ...StandardDialogStyles,
  ...WebsitePasswordDialogStyles,
  form: {
    ...FormElementStyles,
    ...TextInputStyles,
    inputContainer: FormElementStyles.inputContainerOnRight,
    element: WebsitePasswordDialogStyles.element,
    label: {
      ...FormLabelStyles,
      label: FormLabelStyles.labelOnTop
    },
    errorMessages: {
      errorText: FormElementStyles.errorText
    }
  }
};

const mapStateToProps = (state: $TSFixMe) => {
  const {
    clients: { websitePasswordClient }
  } = state;
  return {
    eventId: state.event.id,
    eventTitle: state.event.title,
    translate: state.text.translate,
    referrer: state.website.referrer,
    websitePasswordClient
  };
};

const mapDispatchToProps = (dispatch: $TSFixMe) => {
  return {
    setIsPasswordValid: isPasswordValid => {
      dispatch(setVerifiedWebsitePasswordInUserSession(isPasswordValid));
    },
    closeDialog: referrer => {
      if (referrer) {
        dispatch(setReferrer(null));
        dispatch(routeToPage(referrer));
      }

      dispatch(closeDialogContainer());
    }
  };
};

const ConnectedWebsitePasswordDialog = connect(mapStateToProps, mapDispatchToProps)(Dialog);

export const openWebsitePasswordDialog = () => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ classes: { form: { inputContainer: string;... Remove this comment to see the full error message
    const dialog = <ConnectedWebsitePasswordDialog classes={classes} />;
    return dispatch(
      openDialogContainer(dialog, () => {}, {
        classes: {
          dialogContainer: WebsitePasswordDialogStyles.dialogContainer
        },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
