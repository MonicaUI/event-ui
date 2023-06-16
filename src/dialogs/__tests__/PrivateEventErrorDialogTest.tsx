import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { openPrivateEventErrorDialog } from '../PrivateEventErrorDialog';
import React from 'react';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { wait } from '../../testUtils';
import { routeToHomePage, routeToPage } from '../../redux/pathInfo';
import { CREATE_REG_CART_SUCCESS } from '../../redux/registrationForm/regCart/actionTypes';
import { REGISTERING } from '../../redux/registrationIntents';
import * as InviteeStatus from 'event-widgets/utils/InviteeStatus';
import { personaReducer } from '../../redux/persona';
import registrantLogin from '../../redux/registrantLogin';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { isRegistrationModification, isGroupMember } from '../../redux/selectors/currentRegistrant';
import { getEventRegistration as getEventRegistrationRegCart } from '../../redux/registrationForm/regCart/selectors';
import { loginRegistrant, logoutRegistrant } from '../../redux/registrantLogin/actions';
import EventGuestClient from '../../clients/EventGuestClient';
import { getPageWithRegistrationSummary } from '../../redux/website/pageContents';

jest.mock('../../redux/pathInfo', () => ({
  routeToHomePage: jest.fn(() => () => {}),
  routeToPage: jest.fn(() => () => {})
}));

jest.mock('../../redux/selectors/currentRegistrant', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/selectors/currentRegistrant'),
    __esModule: true,
    isRegistrationModification: jest.fn().mockReturnValue(false),
    isGroupMember: jest.fn().mockReturnValue(false),
    getEventRegistrationId: jest.fn(() => () => {})
  };
});

jest.mock('../../redux/registrationForm/regCart/selectors', () => ({
  getEventRegistration: jest.fn().mockReturnValue({ attendeeType: 'GROUP_LEADER' }),
  getPrimaryRegistrationId: jest.fn(() => () => {}),
  getAttendeePersonalInformation: jest.fn(() => () => {})
}));

jest.mock('../../redux/registrantLogin/actions', () => ({
  loginRegistrant: jest.fn(() => () => {}),
  logoutRegistrant: jest.fn(() => () => {})
}));

jest.mock('../../redux/website/pageContents', () => ({
  getPageWithRegistrationSummary: jest.fn().mockReturnValue({ id: 'regSummary' })
}));

jest.mock('nucleus-core/containers/Transition');
jest.mock('../../clients/EventGuestClient');

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../__mocks__/documentElementMock';
getMockedMessageContainer();

const identifiedInvitee = { inviteeStatus: InviteeStatus.NoResponse };
const eventPersonaClient = {
  identifyInvitee: jest.fn().mockReturnValue(
    new Promise(resolve => {
      resolve(identifiedInvitee);
    })
  )
};
const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    text: (x = {}) => x,
    regCartStatus: (x = {}, action) => {
      if (action.type === CREATE_REG_CART_SUCCESS) {
        // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
        return { ...x, registrationIntent: REGISTERING };
      }
      return x;
    },
    website: (x = {}) => x,
    pathInfo: (x = {}) => x,
    clients: (x = {}) => x,
    event: (x = {}) => x,
    userSession: (x = {}) => x,
    defaultUserSession: (x = {}) => x,
    plannerRegSettings: (x = {}) => x,
    accessToken: (x = {}) => x,
    registrantLogin,
    registrationForm: (x = {}) => x,
    appData: (x = {}) => x,
    persona: (x = {}) => x,
    account: (x = {}) => x
  }),
  {
    account: {},
    event: {
      id: 'eventId'
    },
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    clients: { eventGuestClient: new EventGuestClient(), eventPersonaClient },
    userSession: {
      inviteeId: 'inviteeId'
    },
    defaultUserSession: {
      isPreview: false,
      isPlanner: false
    },
    accessToken: 'accessToken',
    registrantLogin: {
      form: {
        firstName: 'firstName',
        lastName: 'lastName',
        emailAddress: 'emailAddress',
        confirmationNumber: 'confirmationNumber'
      },
      status: {
        login: {},
        resendConfirmation: {}
      }
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          todoThisShouldBeRegPathId: {
            id: 'todoThisShouldBeRegPathId',
            isDefault: true
          }
        }
      }
    },
    persona: personaReducer,
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    }
  }
);

describe('PrivateEventErrorDialog', () => {
  test('matches snapshot when opened', () => {
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openPrivateEventErrorDialog());
    expect(dialog).toMatchSnapshot();
  });
  test('make sure close handler is set up - Not Registering', async () => {
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openPrivateEventErrorDialog());

    await wait(0);

    dialog.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(routeToHomePage).toBeCalled();
  });
  test('make sure close handler is set up -  Registering', async () => {
    store.dispatch({
      type: CREATE_REG_CART_SUCCESS,
      payload: { regCart: {} }
    });
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openPrivateEventErrorDialog());
    dialog.update();
    await wait(0);
    dialog.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(dialog).toMatchSnapshot();
  });
  test('Goes to confirmation page on clicking close during reg mod', async () => {
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    (isRegistrationModification as $TSFixMe).mockReturnValue(true);
    store.dispatch(openPrivateEventErrorDialog());
    dialog.update();
    dialog.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(getEventRegistrationRegCart).toBeCalled();
    expect(loginRegistrant).toBeCalled();
    expect(routeToPage).toHaveBeenCalledWith('confirmation');
  });

  test('Doesnt go to summary/home page when closing for group member', async () => {
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    (isRegistrationModification as $TSFixMe).mockReturnValue(false);
    (isGroupMember as $TSFixMe).mockReturnValue(true);
    store.dispatch(openPrivateEventErrorDialog(null, () => () => {}));
    dialog.update();
    dialog.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(getPageWithRegistrationSummary).toHaveBeenCalled();
    expect(routeToPage).toHaveBeenCalledWith('regSummary');
  });

  test('Goes to summary/home page when closing for group member', async () => {
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    (isRegistrationModification as $TSFixMe).mockReturnValue(false);
    store.dispatch(openPrivateEventErrorDialog());
    dialog.update();
    dialog.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(logoutRegistrant).toBeCalled();
    expect(routeToHomePage).toBeCalled();
  });
});
