import React from 'react';
import { combineReducers } from 'redux';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import PasskeyBanner from '../PasskeyBanner';

const website = EventSnapshot.eventSnapshot.siteEditor.website;
const registrationPaths = website.pluginData.registrationProcessNavigation.registrationPaths;
const regPathId = Object.getOwnPropertyNames(registrationPaths)[0];
const cancellationPageId = registrationPaths[regPathId].registrationCancellationPageIds[0];

const eventRegId = 'eventRegistrationId1';

const appState = {
  defaultUserSession: {
    isTestMode: false,
    isPlanner: false,
    isPreview: false
  },
  website,
  text: {
    translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
  },
  pathInfo: {
    currentPageId: cancellationPageId
  },
  eventTravel: {
    hotelsData: {
      isPasskeyEnabled: true
    }
  },
  travelCart: {
    cart: {
      bookings: [
        {
          id: eventRegId,
          hotelRoomBookings: [
            {
              requestedAction: 'BOOK',
              id: 'hotelRoomBookingId1',
              hotelReservationDetailId: 'hotelReservationDetailId1'
            }
          ]
        }
      ]
    }
  },
  registrationForm: {
    currentEventRegistrationId: eventRegId,
    regCart: {
      eventRegistrations: {
        [eventRegId]: {}
      }
    }
  },
  appData: {
    registrationSettings: {
      registrationPaths: {
        [regPathId]: {}
      }
    }
  }
};

const createStore = initialState => {
  return createStoreWithMiddleware(
    combineReducers({
      userSession: (x = {}) => x,
      defaultUserSession: (x = {}) => x,
      website: (x = {}) => x,
      text: (x = {}) => x,
      pathInfo: (x = {}) => x,
      eventTravel: (x = {}) => x,
      travelCart: (x = {}) => x,
      registrationForm: (x = {}) => x,
      appData: (x = {}) => x
    }),
    initialState
  );
};

describe('Passkey Banner', () => {
  test('should render', () => {
    const store = createStore(appState);
    const page = mount(
      <Provider store={store}>
        <PasskeyBanner />
      </Provider>
    );
    expect(page.find('PasskeyBanner').first()).toMatchSnapshot();
  });

  test('should NOT render when passkey is not enabled', () => {
    const initialState = {
      ...appState,
      eventTravel: {
        ...appState.eventTravel,
        hotelsData: {
          ...appState.eventTravel.hotelsData,
          isPasskeyEnabled: false
        }
      }
    };
    const store = createStore(initialState);
    const page = mount(
      <Provider store={store}>
        <PasskeyBanner />
      </Provider>
    );
    expect(page.find('PasskeyBanner').first()).toMatchSnapshot();
  });

  test('should NOT render when there are no active passkey bookings', () => {
    const initialState = {
      ...appState,
      travelCart: {
        ...appState.travelCart,
        cart: {
          ...appState.travelCart.cart,
          bookings: [
            {
              ...appState.travelCart.cart.bookings[0],
              hotelRoomBookings: [
                {
                  ...appState.travelCart.cart.bookings[0].hotelRoomBookings[0],
                  requestedAction: 'CANCEL'
                }
              ]
            }
          ]
        }
      }
    };
    const store = createStore(initialState);
    const page = mount(
      <Provider store={store}>
        <PasskeyBanner />
      </Provider>
    );
    expect(page.find('PasskeyBanner').first()).toMatchSnapshot();
  });

  test('should NOT render when page is not cancellation page', () => {
    const initialState = {
      ...appState,
      pathInfo: {
        ...appState.pathInfo,
        currentPageId: 'notCancellation'
      }
    };
    const store = createStore(initialState);
    const page = mount(
      <Provider store={store}>
        <PasskeyBanner />
      </Provider>
    );
    expect(page.find('PasskeyBanner').first()).toMatchSnapshot();
  });
});
