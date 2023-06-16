import { setEventRegistrationFieldValue } from './actions';
import { getEventRegistrationId } from '../../selectors/currentRegistrant';
import { getDonationItemsForCurrentReg } from '../../selectors/productSelectors';

/**
 * add/update donation amount for the current registrant in the reg cart locally
 * @param donationItemId which donation they want to donate towards
 * @param inputAmount amount they want to donate
 */
export function updateDonationAmount(donationItemId: $TSFixMe, inputAmount: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const eventRegistrationId = getEventRegistrationId(state);
    const { [donationItemId]: existing, ...rest } = getDonationItemsForCurrentReg(state);
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const previouslyDonated = existing && existing.previousAmount && existing.previousAmount > 0;
    const donationItemRegistrationsToUpdate =
      inputAmount > 0 || previouslyDonated
        ? {
            [donationItemId]: {
              productId: donationItemId,
              productType: 'DonationItem',
              amount: inputAmount > 0 ? inputAmount : 0,
              previousAmount: previouslyDonated ? existing.previousAmount : 0
            },
            ...rest
          }
        : { ...rest };
    dispatch(
      setEventRegistrationFieldValue(
        eventRegistrationId,
        ['donationItemRegistrations'],
        donationItemRegistrationsToUpdate
      )
    );
  };
}
