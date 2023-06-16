import React from 'react';
import { connect } from 'react-redux';
import { ConfirmationDialog } from '../shared/ConfirmationDialog';
import { closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import ConfirmationStyles from '../shared/Confirmation.less';
import { injectTestId } from '@cvent/nucleus-test-automation';
import ShoulderDateApprovalWarningContent from 'event-widgets/lib/HotelRequest/components/ShoulderDateApprovalWarningContent';
import getInlineStyle from 'nucleus-widgets/utils/style/getInlineStyle';
import { withStyles } from '../ThemedDialog';

export const expandHotelForBooking = (confirmCallback: $TSFixMe) => {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    confirmCallback();
    dispatch(closeDialogContainer());
  };
};

const getContentDetails = (
  translate,
  translateDate,
  translateCurrency,
  style,
  shoulderDates,
  roomRates,
  eventTimezone
) => (
  <ShoulderDateApprovalWarningContent
    translate={translate}
    translateDate={translateDate}
    translateCurrency={translateCurrency}
    style={style}
    shoulderDates={shoulderDates}
    roomRates={roomRates}
    eventTimezone={eventTimezone}
  />
);

export const ShoulderDateApprovalWarningDialog = (props: $TSFixMe): $TSFixMe => {
  const { style } = props;

  return (
    <ConfirmationDialog
      {...injectTestId('shoulder-date-approval-warning-dialog')}
      {...props}
      style={style}
      classes={{ ...ConfirmationStyles }}
    />
  );
};

export default connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    const { global } = state.website.theme;
    const { style, ...otherDialogConfig } = props.dialogConfig;
    const { confirmCallback, shoulderDates, roomRates, translateCurrency, eventTimezone } = props;
    const contentDetailsStyles = getInlineStyle(global.elements.body1, {}, global.palette, global.fontPalette);
    const contentDetailsStyle = {
      instruction: contentDetailsStyles,
      tableHeader: contentDetailsStyles,
      tableContentRow: contentDetailsStyles
    };
    return {
      ...otherDialogConfig,
      title: 'EventGuestSide_HotelShoulderDateWarning_Title__resx',
      translate: state.text.translate,
      useSuccessComponent: false,
      style,
      buttonText: { no: 'EventWidgets_GenericText_Cancel__resx', yes: 'EventWidgets_GenericText_Continue__resx' },
      contentDetails: getContentDetails(
        props.translate,
        props.translateDate,
        translateCurrency,
        contentDetailsStyle,
        shoulderDates,
        roomRates,
        eventTimezone
      ),
      confirmCallback
    };
  },
  {
    requestClose: closeDialogContainer,
    expandHotelForBooking
  },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      confirmChoice: dispatchProps.expandHotelForBooking.bind(null, ownProps.confirmCallback)
    };
  }
)(withStyles(ShoulderDateApprovalWarningDialog));
