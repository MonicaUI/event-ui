import React from 'react';
import { mount } from 'enzyme';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import registrantLogin from '../../../redux/registrantLogin';
import registrationForm from '../../../redux/registrationForm/reducer';
import { Provider } from 'react-redux';
import EventSnapshot from '../../../../fixtures/EventSnapshotWithGuestRegPage.json';
import { LOAD_ACCOUNT_SNAPSHOT } from '../../../redux/actionTypes';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import dialogContainer, * as dialogContainerActions from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import transformEventData from 'event-widgets/utils/transformEventData';
import EventGuestSideWidgetFactory from '../../../widgetFactory';
import { openGuestDetailsDialog } from '../GuestDetailsDialog';
import EventGuestClient from '../../../clients/EventGuestClient';
import LookupClient from 'event-widgets/clients/LookupClient';

jest.mock('event-widgets/clients/LookupClient');
jest.mock('../../../clients/EventGuestClient');
jest.mock('../../../redux/pathInfo', () => ({
  routeToPage: jest.fn(() => () => {}),
  getCurrentPageId: jest.fn(() => () => {})
}));

jest.mock('../../../redux/registrationForm/regCart/guests');

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../../__mocks__/documentElementMock';
getMockedMessageContainer();

const guestEventRegId = '00000000-0000-0000-0000-000000000002';
const primaryEventRegId = '00000000-0000-0000-0000-000000000001';

dialogContainerActions.showLoadingDialog = jest.fn(() => () => {});
dialogContainerActions.hideLoadingDialog = jest.fn(() => () => {});
dialogContainerActions.hideLoadingOnError = jest.fn(() => () => {});

const regCartClient = {
  authorizeByConfirm: jest.fn(() => ({ accessToken: 'fakeAuthByConfirmToken' }))
};

const eventEmailClient = {};
function account(state = {}, action) {
  return action.type === LOAD_ACCOUNT_SNAPSHOT ? action.payload.account : state;
}
const eventSnapshotClient = {
  getAccountSnapshot: jest.fn(() => EventSnapshot.accountSnapshot),
  getEventSnapshot: jest.fn(() => EventSnapshot.eventSnapshot)
};

const flexFileClient = {
  getFileUploadUrl: jest.fn()
};

const lastSavedRegCart = {
  regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
  status: 'INPROGRESS',
  eventRegistrations: {
    '00000000-0000-0000-0000-000000000001': {
      attendee: {
        personalInformation: {
          emailAddress: 'lroling-384934@j.mail'
        },
        attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
      },
      confirmationNumber: '123456789',
      productRegistrations: [],
      attendeeType: 'ATTENDEE',
      registrationPathId: '3db844da-2ce1-46e0-b1af-4fc1f4bad512'
    }
  }
};

const guestEventRegistration = {
  eventRegistrationId: '00000000-0000-0000-0000-000000000002',
  attendee: {
    personalInformation: {},
    eventAnswers: {}
  },
  attendeeType: 'GUEST',
  primaryRegistrationId: primaryEventRegId,
  productRegistrations: [
    {
      productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
      productType: 'AdmissionItem',
      quantity: 1,
      requestedAction: 'REGISTER'
    }
  ],
  registrationPathId: '3db844da-2ce1-46e0-b1af-4fc1f4bad512'
};

const regCartWithGuestReg = {
  ...lastSavedRegCart,
  eventRegistrations: {
    ...lastSavedRegCart.eventRegistrations,
    [guestEventRegId]: {
      ...guestEventRegistration
    }
  }
};

const basicReducer = (x = {}) => x;

const store = createStoreWithMiddleware(
  combineReducers({
    account,
    dialogContainer,
    registrantLogin,
    registrationForm,
    website: basicReducer,
    appData: basicReducer,
    clients: basicReducer,
    userSession: basicReducer,
    defaultUserSession: basicReducer,
    registrationStatus: basicReducer,
    regCartStatus: basicReducer,
    text: basicReducer,
    widgetFactory: basicReducer,
    countries: basicReducer,
    states: basicReducer,
    event: basicReducer
  }),
  {
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    appData: transformEventData(
      EventSnapshot.eventSnapshot.siteEditor.eventData,
      EventSnapshot.accountSnapshot,
      EventSnapshot.eventSnapshot,
      EventSnapshot.eventSnapshot.siteEditor.website
    ),
    account: {
      settings: {
        dupMatchKeyType: 'EMAIL_ONLY'
      }
    },
    event: {
      id: 'eventId'
    },
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
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    },
    clients: {
      regCartClient,
      eventEmailClient,
      eventSnapshotClient,
      eventGuestClient: new EventGuestClient(),
      flexFileClient,
      lookupClient: new LookupClient()
    },
    defaultUserSession: {
      isPreview: false
    },
    registrationForm: {
      regCart: regCartWithGuestReg,
      currentGuestEventRegistrationId: guestEventRegId,
      currentGuestEventRegistration: guestEventRegistration
    },
    regCartStatus: {
      lastSavedRegCart: regCartWithGuestReg,
      registrationIntent: 'REGISTERING'
    },
    widgetFactory: {
      loadMetaData: x => (new EventGuestSideWidgetFactory() as $TSFixMe).loadMetaData(x),
      loadComponent: x => (new EventGuestSideWidgetFactory() as $TSFixMe).loadComponent(x)
    },
    countries: {
      countries: {
        '': { nameResourceKey: '', name: '' },
        US: { nameResourceKey: 'us_name_resx', name: 'US' },
        GB3: { nameResourceKey: 'wales_name_resx', name: 'Wales' }
      }
    },
    states: {}
  }
);

describe('GuestDetailsDialog render tests', () => {
  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('renders configured page when dialog is opened', async () => {
    await store.dispatch(openGuestDetailsDialog());
    await new Promise(resolve => setTimeout(resolve, 0));
    dialog.update();
    expect(dialog).toMatchSnapshot();

    dialog
      .find('[name^="countryCode"]')
      .hostNodes()
      .simulate('change', { target: { value: '2' } });
    expect(
      store.getState().registrationForm.currentGuestEventRegistration.attendee.personalInformation.homeAddress
        .countryCode
    ).toBe('GB3');
    expect(
      store.getState().registrationForm.currentGuestEventRegistration.attendee.personalInformation.homeAddress.country
    ).toBe('Wales');
  });
  test('closes dialog', async () => {
    dialog.find('[id="exit"]').hostNodes().simulate('click');
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(dialog).toMatchSnapshot();
  });
});

describe('GuestDetailsDialog functionality tests', () => {
  test('no change in regCart when coming from edit link after pressing close', async () => {
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openGuestDetailsDialog('00000000-0000-0000-0000-000000000002'));
    await new Promise(resolve => setTimeout(resolve, 0));
    dialog.update();
    dialog.find('[id="exit"]').hostNodes().simulate('click');
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(dialog).toMatchSnapshot();
    expect(store.getState().registrationForm.regCart).toMatchSnapshot(regCartWithGuestReg);
  });

  test('show the file upload question if it is a sub question', async () => {
    const storeWithGuestQuestions = createStoreWithMiddleware(
      combineReducers({
        account,
        dialogContainer,
        registrantLogin,
        registrationForm,
        website: basicReducer,
        appData: basicReducer,
        clients: basicReducer,
        userSession: basicReducer,
        defaultUserSession: basicReducer,
        registrationStatus: basicReducer,
        regCartStatus: basicReducer,
        text: basicReducer,
        widgetFactory: basicReducer,
        countries: basicReducer,
        states: basicReducer,
        event: basicReducer
      }),
      {
        website: EventSnapshot.eventSnapshot.siteEditor.website,
        appData: transformEventData(
          EventSnapshot.eventSnapshot.siteEditor.eventData,
          EventSnapshot.accountSnapshot,
          EventSnapshot.eventSnapshot,
          EventSnapshot.eventSnapshot.siteEditor.website
        ),
        account: {
          settings: {
            dupMatchKeyType: 'EMAIL_ONLY'
          }
        },
        event: {
          id: 'eventId'
        },
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
        text: {
          translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
        },
        clients: {
          regCartClient,
          eventEmailClient,
          eventSnapshotClient,
          eventGuestClient: new EventGuestClient(),
          flexFileClient
        },
        defaultUserSession: {
          isPreview: false
        },
        registrationForm: {
          regCart: regCartWithGuestReg,
          currentGuestEventRegistrationId: guestEventRegId,
          currentGuestEventRegistration: {
            ...guestEventRegistration,
            attendee: {
              ...guestEventRegistration.attendee,
              eventAnswers: {
                questionWithSubQuestion: {
                  answers: [
                    {
                      answerType: 'Choice',
                      choice: 'Choice B'
                    }
                  ],
                  id: 'questionWithSubQuestion'
                }
              }
            }
          }
        },
        regCartStatus: {
          lastSavedRegCart: regCartWithGuestReg,
          registrationIntent: 'REGISTERING'
        },
        widgetFactory: {
          loadMetaData: x => (new EventGuestSideWidgetFactory() as $TSFixMe).loadMetaData(x),
          loadComponent: x => (new EventGuestSideWidgetFactory() as $TSFixMe).loadComponent(x)
        },
        countries: {
          countries: {
            '': { nameResourceKey: '', name: '' },
            US: { nameResourceKey: 'us_name_resx', name: 'US' },
            GB3: { nameResourceKey: 'wales_name_resx', name: 'Wales' }
          }
        },
        states: {}
      }
    );
    const GuestDetailsDialog = mount(
      <Provider store={storeWithGuestQuestions}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await storeWithGuestQuestions.dispatch(openGuestDetailsDialog());
    await new Promise(resolve => setTimeout(resolve, 0));
    GuestDetailsDialog.update();
    expect(GuestDetailsDialog).toMatchSnapshot();
  });
});
