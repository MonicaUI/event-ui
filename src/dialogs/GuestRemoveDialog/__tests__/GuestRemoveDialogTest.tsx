import React from 'react';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { openGuestRemoveDialog } from '..';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { handleRegistrantRemovalInTravelCart } from '../../../redux/travelCart/workflow';
import { updateGuestsInRegCart, removeGuestByEventRegistrationId } from '../../../redux/registrationForm/regCart';
import { wait } from '../../../testUtils';

const PRIMARY_REGISTRATION_ID = 'primary';
const GUEST_1_REGISTRATION_ID = 'guest1';

const regCart = {
  eventRegistrations: {
    primary: {
      eventRegistrationId: PRIMARY_REGISTRATION_ID,
      productRegistrations: [
        {
          productId: '1',
          requestedAction: 'REGISTER'
        }
      ],
      requestedAction: 'REGISTER'
    },
    guest1: {
      eventRegistrationId: GUEST_1_REGISTRATION_ID,
      primaryRegistrationId: PRIMARY_REGISTRATION_ID,
      productRegistrations: [
        {
          productId: '1',
          requestedAction: 'REGISTER'
        }
      ],
      requestedAction: 'REGISTER'
    }
  }
};

jest.mock('../../../redux/travelCart/workflow', () => {
  return {
    handleRegistrantRemovalInTravelCart: jest.fn(() => () => {})
  };
});

jest.mock('../../../redux/registrationForm/regCart', () => {
  return {
    updateGuestsInRegCart: jest.fn(() => () => {}),
    removeGuestByEventRegistrationId: jest.fn(() => {
      return {
        eventRegistrations: {
          primary: {
            eventRegistrationId: 'primary',
            productRegistrations: [
              {
                productId: '1',
                requestedAction: 'REGISTER'
              }
            ],
            requestedAction: 'REGISTER'
          },
          guest1: {
            eventRegistrationId: 'guest1',
            primaryRegistrationId: 'primary',
            productRegistrations: [
              {
                productId: '1',
                requestedAction: 'REGISTER'
              }
            ],
            requestedAction: 'UNREGISTER'
          }
        }
      };
    })
  };
});

const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    text: (x = {}) => x,
    website: (x = {}) => x,
    registrationForm: (x = {}) => x
  }),
  {
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    },
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    registrationForm: {
      regCart
    }
  }
);

describe('GuestRemoveDialog', () => {
  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('matches snapshot when opened', () => {
    store.dispatch(openGuestRemoveDialog('01'));
    expect(dialog).toMatchSnapshot();
  });

  test('click on cancel closes guest remove dialog', () => {
    store.dispatch(openGuestRemoveDialog('01'));
    dialog.update();
    dialog.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    expect(dialog).toMatchSnapshot();
  });

  test('tries to update the travel cart on clicking yes', async () => {
    store.dispatch(openGuestRemoveDialog('guest1'));
    dialog.update();
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    await wait(1);
    expect(handleRegistrantRemovalInTravelCart).toHaveBeenCalledWith(GUEST_1_REGISTRATION_ID);
  });

  test('updates the reg cart on clicking yes and sets the guest to unregister', async () => {
    store.dispatch(openGuestRemoveDialog(GUEST_1_REGISTRATION_ID));
    dialog.update();
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    await wait(1);
    expect(removeGuestByEventRegistrationId).toHaveBeenCalledWith(regCart, GUEST_1_REGISTRATION_ID);
    wait(1);
    const updatedRegCart = {
      eventRegistrations: {
        primary: {
          eventRegistrationId: PRIMARY_REGISTRATION_ID,
          productRegistrations: [
            {
              productId: '1',
              requestedAction: 'REGISTER'
            }
          ],
          requestedAction: 'REGISTER'
        },
        guest1: {
          eventRegistrationId: GUEST_1_REGISTRATION_ID,
          primaryRegistrationId: PRIMARY_REGISTRATION_ID,
          productRegistrations: [
            {
              productId: '1',
              requestedAction: 'REGISTER'
            }
          ],
          requestedAction: 'UNREGISTER'
        }
      }
    };
    expect(updateGuestsInRegCart).toHaveBeenCalledWith(updatedRegCart);
  });
});
