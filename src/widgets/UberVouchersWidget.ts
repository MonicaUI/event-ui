import { connect } from 'react-redux';
import UberVouchersWidget from 'event-widgets/lib/UberVouchers/UberVouchersWidget';
import * as currentRegistrant from '../redux/selectors/currentRegistrant';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';

const DEFAULT_PRIMARY_REGISTRANT = Object.freeze({});
const DEFAULT_SELECTED_VOUCHER_PROGRAMS = Object.freeze([]);

/**
 * handler for Uber Vouchers Claim button
 * @param voucherRedemptionLink
 * @returns {Function}
 */
function redirectToUber(voucherRedemptionUrl) {
  return () => {
    // Open the Voucher Redemption Url in a new tab
    window.open(voucherRedemptionUrl, null);
  };
}

function getAttendeeTravelVouchers(primaryRegistrant, selectedVoucherPrograms, widgetId) {
  const primaryRegistrantTravelVouchersMap = primaryRegistrant.travelVouchers
    ? primaryRegistrant.travelVouchers.map(voucher => ({
        id: voucher.program_id,
        redemptionLink: voucher.redemption_link
      }))
    : DEFAULT_SELECTED_VOUCHER_PROGRAMS;

  const voucherProgramsForWidget = selectedVoucherPrograms.filter(programWidget => programWidget.id === widgetId)[0]
    ?.voucherPrograms;

  let filteredVouchers = DEFAULT_SELECTED_VOUCHER_PROGRAMS;
  if (voucherProgramsForWidget?.length > 0) {
    filteredVouchers = voucherProgramsForWidget.map(voucher => {
      const matchIndex = primaryRegistrantTravelVouchersMap.findIndex(
        regVoucher => regVoucher.id === voucher.programID
      );
      if (matchIndex !== -1) {
        return { ...voucher, redemptionLink: primaryRegistrantTravelVouchersMap[matchIndex].redemptionLink };
      }
    });
  }
  return filteredVouchers.filter(x => x !== undefined);
}

export default withMappedWidgetConfig(
  connect(
    withMemoizedFunctions({ getAttendeeTravelVouchers })(memoized => (state: $TSFixMe, widget: $TSFixMe) => {
      const primaryRegistrant = currentRegistrant.getEventRegistration(state) || DEFAULT_PRIMARY_REGISTRANT;
      const selectedVoucherPrograms =
        state.appData.selectedUberVoucherPrograms === undefined
          ? DEFAULT_SELECTED_VOUCHER_PROGRAMS
          : state.appData.selectedUberVoucherPrograms;
      return {
        selectedUberVoucherPrograms: memoized.getAttendeeTravelVouchers(
          primaryRegistrant,
          selectedVoucherPrograms,
          widget.id
        )
      };
    }),
    { clickHandler: redirectToUber }
  )(UberVouchersWidget)
);
