import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import RegCartClient from '../../clients/RegCartClient';

const eventId = '11111111-2222-3333-4444-555555555555';
const fakePath = `/${eventId}/`;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
jest.mock('../../clients/RegCartClient');
// RegCartClient.prototype.authorizeByConfirm.mockImplementation(() => Promise.resolve({ accessToken: 'fakeAuthByConfirmToken' }));
(RegCartClient.prototype.getRegCartPricing as $TSFixMe).mockImplementation(() => Promise.resolve({}));
(RegCartClient.prototype.identifyByConfirm as $TSFixMe).mockImplementation(() =>
  Promise.resolve({ regCart: { regCartId: 'regCartId', status: 'TRANSIENT' }, validationMessages: [] })
);

describe('success', () => {
  test('confirm identifyByConfirm was called', async () => {
    const url = 'https://www.abc.com' + fakePath + 'confirmation/?cn=confNumber&em=email@cvent.com&i=inviteeId';
    Object.defineProperty(window, 'location', {
      value: new URL(url)
    });

    await renderMainApp(
      {
        eventContext: {
          eventId
        },
        eventLaunchWizardSettings: '{}'
      },
      fakePath + 'confirmation/?cn=confNumber&em=email@cvent.com&i=inviteeId',
      event => ({
        ...event,
        status: eventStatus.PENDING
      })
    );
    await wait(0);
    expect(RegCartClient.prototype.identifyByConfirm).toHaveBeenCalled();
  });
});
