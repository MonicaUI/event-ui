import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import React from 'react';
import { wait } from '../../../testUtils';
import CheckoutProcessingDialog from '..';
import CheckoutProcessing from '../CheckoutProcessing';
import { CHECKING_OUT, CHECKED_OUT } from '../../../redux/registrationIntents';
import DialogStylesContext from '../../DialogStylesContext';

jest.mock('nucleus-core/containers/Transition');

const store = createStoreWithMiddleware(
  combineReducers({
    text: (x = {}) => x,
    regCartStatus: (x = {}, action = {}) => {
      if (action.type === 'SET_INTENT') {
        // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
        return { ...x, registrationIntent: action.val };
      }
      return x;
    },
    registrationForm: (x = {}) => x
  }),
  {
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    },
    regCartStatus: {
      registrationIntent: CHECKING_OUT
    },
    registrationForm: {
      regCart: {}
    }
  }
);

const dialogStyles = { transitions: {}, base: {} };

describe('CheckoutProcessingDialog', () => {
  test('matches snapshot when dialog is shown', async () => {
    const dialog = mount(
      <Provider store={store}>
        <DialogStylesContext.Provider value={dialogStyles}>
          <CheckoutProcessingDialog />
        </DialogStylesContext.Provider>
      </Provider>
    );
    expect(dialog.find(CheckoutProcessing)).toMatchSnapshot('dialog shown');
  });

  test('matches snapshot when dialog is shown and then closed', async () => {
    const dialog = mount(
      <Provider store={store}>
        <DialogStylesContext.Provider value={dialogStyles}>
          <CheckoutProcessingDialog />
        </DialogStylesContext.Provider>
      </Provider>
    );
    expect(dialog.find(CheckoutProcessing)).toMatchSnapshot('dialog shown before closing');
    store.dispatch({
      type: 'SET_INTENT',
      val: CHECKED_OUT
    });
    wait(0);
    expect(dialog.find(CheckoutProcessing)).toMatchSnapshot('dialog closed');
  });

  test('matches snapshot when decline reg', async () => {
    const declineStore = createStoreWithMiddleware(
      combineReducers({
        text: (x = {}) => x,
        regCartStatus: (x = {}, action = {}) => {
          if (action.type === 'SET_INTENT') {
            // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
            return { ...x, registrationIntent: action.val };
          }
          return x;
        },
        registrationForm: (x = {}) => x
      }),
      {
        text: {
          translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
        },
        regCartStatus: {
          registrationIntent: CHECKING_OUT
        },
        registrationForm: {
          regCart: { regDecline: true }
        }
      }
    );
    const dialog = mount(
      <Provider store={declineStore}>
        <DialogStylesContext.Provider value={dialogStyles}>
          <CheckoutProcessingDialog />
        </DialogStylesContext.Provider>
      </Provider>
    );
    expect(dialog.find('[children="EventGuestSide_DeclineProcessingHeader__resx"]')).toBeTruthy();
    expect(dialog.find('[children="EventGuestSide_DeclineProcessingMessage__resx"]')).toBeTruthy();
  });
});
