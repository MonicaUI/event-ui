import React from 'react';
import { mount } from 'enzyme';
import { openGroupRegistrationTypeDialog } from '..';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import registrantLogin from '../../../redux/registrantLogin';
import registrationForm from '../../../redux/registrationForm/reducer';
import { Provider } from 'react-redux';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { LOAD_ACCOUNT_SNAPSHOT } from '../../../redux/actionTypes';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import dialogContainer, * as dialogContainerActions from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import transformEventData from 'event-widgets/utils/transformEventData';

jest.mock('../../../redux/pathInfo', () => ({
  routeToPage: jest.fn(() => () => {})
}));

dialogContainerActions.showLoadingDialog = jest.fn(() => () => {});
dialogContainerActions.hideLoadingDialog = jest.fn(() => () => {});
dialogContainerActions.hideLoadingOnError = jest.fn(() => () => {});

// eslint-disable-next-line jest/no-mocks-import
import { getMockedFieldInputs } from '../../__mocks__/documentElementMock';
getMockedFieldInputs(['RegTypeRadioButtonList']);

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

const groupMemberEventRegId = '00000000-0000-0000-0000-000000000002';
const groupLeaderEventRegId = '00000000-0000-0000-0000-000000000001';

const regCartWithNewEventReg = {
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
      attendeeType: 'GROUP_LEADER',
      registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
    },
    [groupMemberEventRegId]: {
      eventRegistrationId: '02',
      attendee: {
        personalInformation: {},
        eventAnswers: {}
      },
      attendeeType: 'ATTENDEE',
      primaryRegistrationId: groupLeaderEventRegId,
      productRegistrations: [
        {
          productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
          productType: 'AdmissionItem',
          quantity: 1,
          requestedAction: 'REGISTER'
        }
      ]
    }
  }
};

const nextButtonCallBack = jest.fn(() => () => {});
const inviteeId = 'dummyInviteeId';
const contactId = 'dummyContactId';

const store = createStoreWithMiddleware(
  combineReducers({
    account,
    dialogContainer,
    registrantLogin,
    registrationForm,
    website: (x = {}) => x,
    appData: (x = {}) => x,
    text: (x = {}) => x,
    clients: (x = {}) => x,
    userSession: (x = {}) => x,
    defaultUserSession: (x = {}) => x
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
    clients: { regCartClient, eventEmailClient, eventSnapshotClient },
    defaultUserSession: {
      isPreview: false
    },
    registrationForm: {
      regCart: regCartWithNewEventReg
    }
  }
);

const visibleRegTypes = [];
visibleRegTypes.push({
  id: '001',
  name: 'RegType1'
});
visibleRegTypes.push({
  id: '002',
  name: 'RegType2'
});

const regTypeHasAvailableAdmissionItemMap = {
  '001': true,
  '002': true
};

describe('GroupRegistrationTypeDialog render tests', () => {
  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('renders list of registration types when opened', () => {
    store.dispatch(
      openGroupRegistrationTypeDialog(
        visibleRegTypes,
        regCartWithNewEventReg,
        groupMemberEventRegId,
        nextButtonCallBack,
        inviteeId,
        contactId,
        regTypeHasAvailableAdmissionItemMap,
        true
      )
    );
    expect(dialog).toMatchSnapshot();
  });

  test('click on cancel closes group regType dialog', () => {
    store.dispatch(
      openGroupRegistrationTypeDialog(
        visibleRegTypes,
        regCartWithNewEventReg,
        groupMemberEventRegId,
        nextButtonCallBack,
        inviteeId,
        contactId,
        regTypeHasAvailableAdmissionItemMap,
        true
      )
    );
    dialog.update();
    dialog.find('[data-cvent-id="CancelButton"]').hostNodes().simulate('click');
    expect(dialog).toMatchSnapshot();
  });

  test('click on x closes group regType dialog', () => {
    store.dispatch(
      openGroupRegistrationTypeDialog(
        visibleRegTypes,
        regCartWithNewEventReg,
        groupMemberEventRegId,
        nextButtonCallBack,
        inviteeId,
        contactId,
        regTypeHasAvailableAdmissionItemMap,
        true
      )
    );
    dialog.update();
    dialog.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    expect(dialog).toMatchSnapshot();
  });
});

describe('GroupRegistrationTypeDialog user interaction tests', () => {
  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('Next button is disabled if no registration type is selected', () => {
    store.dispatch(
      openGroupRegistrationTypeDialog(
        visibleRegTypes,
        regCartWithNewEventReg,
        groupMemberEventRegId,
        nextButtonCallBack,
        inviteeId,
        contactId,
        regTypeHasAvailableAdmissionItemMap,
        true
      )
    );
    dialog.update();
    // click next
    dialog.find('[data-cvent-id="NextButton"]').hostNodes().simulate('click');
    expect(nextButtonCallBack).not.toBeCalled();
  });

  test('Can switch between registration types and internal state is updated', () => {
    store.dispatch(
      openGroupRegistrationTypeDialog(
        visibleRegTypes,
        regCartWithNewEventReg,
        groupMemberEventRegId,
        nextButtonCallBack,
        inviteeId,
        contactId,
        regTypeHasAvailableAdmissionItemMap,
        true
      )
    );
    // choose the first reg type
    dialog
      .find('[id="RegTypeRadioButtonList_0"]')
      .hostNodes()
      .simulate('change', { target: { checked: true } });
    expect(dialog).toMatchSnapshot();

    // choose the second reg type
    dialog.find('[id="RegTypeRadioButtonList_1"]').simulate('change', { target: { checked: true } });
    expect(dialog).toMatchSnapshot();
  });

  test('Clicking next button calls the appropiate callback function with the updated internal regCart', () => {
    store.dispatch(
      openGroupRegistrationTypeDialog(
        visibleRegTypes,
        regCartWithNewEventReg,
        groupMemberEventRegId,
        nextButtonCallBack,
        inviteeId,
        contactId,
        regTypeHasAvailableAdmissionItemMap,
        true
      )
    );
    const expectedRegCart = {
      ...regCartWithNewEventReg,
      eventRegistrations: {
        ...regCartWithNewEventReg.eventRegistrations,
        [groupMemberEventRegId]: {
          ...regCartWithNewEventReg.eventRegistrations[groupMemberEventRegId],
          registrationTypeId: '001'
        }
      }
    };
    // choose the first reg type
    dialog.find('[id="RegTypeRadioButtonList_0"]').simulate('change', { target: { checked: true } });
    expect(dialog).toMatchSnapshot();

    // click next
    dialog.find('[data-cvent-id="NextButton"]').hostNodes().simulate('click');
    expect(dialog).toMatchSnapshot();

    // verify that the callback was called with the correct regType set.
    expect(nextButtonCallBack).toHaveBeenCalledWith(expectedRegCart, groupMemberEventRegId, inviteeId, contactId);
  });

  test('Registration Type in disabled state if no admissionItem available for it', () => {
    const regTypeAdmissionItemMap = {
      '001': false,
      '002': true
    };

    store.dispatch(
      openGroupRegistrationTypeDialog(
        visibleRegTypes,
        regCartWithNewEventReg,
        groupMemberEventRegId,
        nextButtonCallBack,
        inviteeId,
        contactId,
        regTypeAdmissionItemMap,
        true
      )
    );
    // Snapshot shows that regType 001 is disabled.
    expect(dialog).toMatchSnapshot();
  });
});
