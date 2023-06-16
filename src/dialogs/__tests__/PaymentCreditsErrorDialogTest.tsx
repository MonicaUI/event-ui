/* eslint-env jest */
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import React from 'react';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';

import { openPaymentCreditsErrorDialog } from '../PaymentCreditsErrorDialog';
import { wait } from '../../testUtils';

jest.mock('nucleus-core/containers/Transition');

const accessToken = 'access-token';
const eventId = EventSnapshot.eventSnapshot.id;
function RegCartClient() {}
const regCartClient = new RegCartClient();
const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    text: (x = {}) => x,
    website: (x = {}) => x,
    registrationForm: (x = {}) => x,
    clients: (x = {}) => x,
    accessToken: (x = {}) => x,
    event: (x = {}) => x,
    userSession: (x = {}) => x,
    defaultUserSession: (x = {}) => x
  }),
  {
    accessToken,
    clients: {
      regCartClient
    },
    registrationForm: {
      regCartPayment: {
        pricingInfo: {
          selectedPaymentMethod: null
        }
      },
      regCart: {
        regCartId: 'reg-cart-id',
        status: 'INPROGRESS',
        eventSnapshotVersions: {
          [(EventSnapshot as $TSFixMe).id]: 'fake-eventSnapshot-version'
        },
        eventRegistrations: {
          '00000000-0000-0000-0000-000000000001': {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001',
            eventId,
            attendee: {
              availablePaymentCredits: 100,
              personalInformation: {
                contactId: 'd10d9eab-743f-4b3e-80ee-adb520920281',
                emailAddress: 'lroling-384934@j.mail',
                firstName: 'Luke',
                lastName: 'Roling',
                primaryAddressType: 'WORK'
              },
              attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
            },
            attendeeType: 'ATTENDEE',
            productRegistrations: [
              {
                productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
                productType: 'AdmissionItem',
                quantity: 1,
                requestedAction: 'REGISTER'
              }
            ],
            sessionRegistrations: {},
            donationItemRegistrations: {
              donationItem2: {
                productId: 'donationItem2',
                amount: '7'
              }
            },
            registrationTypeId: '00000000-0000-0000-0000-000000000000',
            registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
          }
        }
      },
      errors: {}
    },
    event: {
      eventFeatureSetup: {
        fees: 10
      },
      products: {
        quantityItems: {
          quantityItemId: {
            id: 'quantityItemId',
            capacityId: 'quantityItemId'
          }
        }
      }
    },
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    },
    website: {
      theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
    },
    defaultUserSession: {
      regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f'
    }
  }
);

RegCartClient.prototype.updatePaymentCreditsInRegCart = jest.fn(() => {});

describe('PaymentCreditsErrorDialog', () => {
  test('matches snapshot when opened', () => {
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openPaymentCreditsErrorDialog());
    expect(dialog).toMatchSnapshot();
  });

  test('calls updatePaymentCredits when closed', async () => {
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openPaymentCreditsErrorDialog());
    dialog.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(regCartClient.updatePaymentCreditsInRegCart).toHaveBeenCalledTimes(1);
  });
});
