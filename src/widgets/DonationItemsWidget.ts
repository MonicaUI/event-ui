import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import DonationItemsWidget from 'event-widgets/lib/DonationItems/DonationItemsWidget';
import { updateDonationAmount } from '../redux/registrationForm/regCart/donationItems';
import { getSelectedAdmissionItemDefinition, isRegApprovalRequired } from '../redux/selectors/currentRegistrant';
import {
  getDonationItemsForCurrentReg,
  getPrimarySortedVisibleDonationItems
} from '../redux/selectors/productSelectors';
import { optionalItemIsVisibleForAdmissionItem } from '../redux/selectors/shared';

const getDonationItems = createSelector(
  getPrimarySortedVisibleDonationItems,
  getDonationItemsForCurrentReg,
  (visibleDonationItems, donationItemRegInfo) => {
    return Object.values(visibleDonationItems).filter(item => {
      if (donationItemRegInfo) {
        const regInfo = donationItemRegInfo[(item as $TSFixMe).id];
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (regInfo && regInfo.previousAmount && regInfo.previousAmount >= (item as $TSFixMe).maxDonation) {
          return false;
        }
      }
      return true;
    });
  }
);

export default connect(
  (state: $TSFixMe) => {
    const {
      text: {
        resolver: { currency }
      },
      defaultUserSession: { isPlanner },
      // @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
      regCartStatus: { isPartialCart } = {}
    } = state;
    let donationItems = getDonationItems(state);
    const donationItemRegInfo = getDonationItemsForCurrentReg(state);
    const isApprovalRequired = isRegApprovalRequired(state);
    if (isApprovalRequired && !isPlanner) {
      const selectedAdmissionItem = getSelectedAdmissionItemDefinition(state);
      donationItems = donationItems.filter(item => {
        if (donationItemRegInfo) {
          const regInfo = donationItemRegInfo[(item as $TSFixMe).id];
          if (regInfo && !regInfo.amount && !optionalItemIsVisibleForAdmissionItem(selectedAdmissionItem, item)) {
            return false;
          }
        }
        return true;
      });
    }
    return {
      donationItems,
      currency,
      donationItemRegInfo,
      disabled: isPlanner && isApprovalRequired,
      isPartialCart,
      updateDonationAmount
    };
  },
  { updateDonationAmount }
)(DonationItemsWidget);
