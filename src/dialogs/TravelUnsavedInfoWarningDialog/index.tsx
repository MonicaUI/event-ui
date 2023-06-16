import React from 'react';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { closeDialogContainer, openDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import ButtonStyles from 'nucleus-core/less/cv/Button.less';
import ButtonGroupStyles from 'nucleus-core/less/cv/ButtonGroup.less';
import { injectTestId } from '@cvent/nucleus-test-automation';
import { TravelUnsavedInfoWarningDialog } from './TravelUnsavedInfoWarningDialog';
import TravelUnsavedInfoWarningDialogStyles from './TravelUnsavedInfoWarningDialog.less';
import { resetTravelWidgetsSummaryView } from '../../redux/travelCart';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles } from '../ThemedDialog';

const Dialog = withStyles(TravelUnsavedInfoWarningDialog);

const navigate = navigationHandler => {
  return async dispatch => {
    // we need to reset session data to reset summary view state, so that pop up doesnt appear on every page
    dispatch(resetTravelWidgetsSummaryView());
    dispatch(closeDialogContainer());
    // navigate as per action
    await navigationHandler();
  };
};

const ConnectedTravelUnsavedInfoWarningDialog = connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    const {
      translate,
      dialogConfig: { classes, styles },
      title,
      informationalText,
      cancelSelectionLabel,
      continueSelectionLabel
    } = props;
    return {
      title,
      informationalText,
      cancelSelectionLabel,
      continueSelectionLabel,
      classes,
      styles,
      translate
    };
  },
  (dispatch: $TSFixMe, props: $TSFixMe) =>
    bindActionCreators(
      {
        cancelSelection: () => navigate(props.navigationHandler),
        continueSelection: closeDialogContainer
      },
      dispatch
    )
)(Dialog);

export const openTravelUnsavedInfoWarningDialog = (navigationHandler: $TSFixMe, translate: $TSFixMe): $TSFixMe => {
  const dialogConfig = {
    classes: {
      ...TravelUnsavedInfoWarningDialogStyles,
      button: ButtonStyles,
      buttonGroup: ButtonGroupStyles
    }
  };
  return (dispatch, getState) => {
    const dialog = (
      <ConnectedTravelUnsavedInfoWarningDialog
        {...injectTestId('travel-unsaved-information-warning-dialog')}
        translate={translate}
        title={translate('EventGuestSide_HotelShoulderDateWarning_Title__resx')}
        informationalText={translate('EventWidgets_TravelWidgets_UnsavedInfo_WarningText__resx')}
        cancelSelectionLabel={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_Cancel__resx')}
        continueSelectionLabel={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_Ok__resx')}
        dialogConfig={dialogConfig}
        navigationHandler={navigationHandler}
      />
    );
    return dispatch(
      openDialogContainer(dialog, undefined, {
        classes: { dialogContainer: TravelUnsavedInfoWarningDialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
