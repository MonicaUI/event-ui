import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import {
  loadRelatedContactsForInvitee,
  toggleRelatedContactsView,
  searchRelatedContactsForInvitee,
  clearRelatedContactsSearchData,
  setCurrentGuestRegistrationForSelectedRelatedContact
} from '../actions';
import addGuestFromRelatedContactsReducer, { setRelatedContacts } from '../reducer';
import { setIn } from 'icepick';

const accessToken = 'some access token';
const eventId = 'some-event-id';
const contactId1 = 'some-contact-id-1';
const relatedContacts1 = [
  {
    firstName: 'firstName11',
    lastName: 'lastName11',
    emailAddress: 'emailAddress11',
    relatedContactStub: 'relatedContactStub11'
  },
  {
    firstName: 'firstName12',
    lastName: 'lastName12',
    emailAddress: 'emailAddress12',
    relatedContactStub: 'relatedContactStub12'
  }
];

const contactId2 = 'some-contact-id-2';
const relatedContacts2 = [
  {
    firstName: 'firstName21',
    lastName: 'lastName21',
    emailAddress: 'emailAddress21',
    relatedContactStub: 'relatedContactStub21'
  },
  {
    firstName: 'firstName22',
    lastName: 'lastName22',
    emailAddress: 'emailAddress22',
    relatedContactStub: 'relatedContactStub22'
  },
  {
    firstName: 'firstName23',
    lastName: 'lastName23',
    emailAddress: 'emailAddress23',
    relatedContactStub: 'relatedContactStub23'
  }
];

const searchResultsContact1 = [
  {
    firstName: 'firstName11',
    lastName: 'lastName11',
    emailAddress: 'ssahai-emailAddress11',
    relatedContactStub: 'relatedContactStub11'
  },
  {
    firstName: 'firstName12',
    lastName: 'lastName12',
    emailAddress: 'ssahai-emailAddress12',
    relatedContactStub: 'relatedContactStub12'
  }
];

const getRelatedContactsMock = jest.fn();
getRelatedContactsMock.mockReturnValue(
  new Promise(resolve => {
    return resolve(relatedContacts2);
  })
);

const regCartClient = {
  updateRegCart: jest.fn(() => {
    return {
      regCart: {}
    };
  })
};

const initialState = {
  defaultUserSession: {
    eventId
  },
  accessToken,
  clients: {
    eventGuestClient: {
      getRelatedContacts: getRelatedContactsMock
    },
    regCartClient
  },
  registrationForm: {
    regCart: {
      regCartId: 'some-regCart-id',
      eventRegistrations: {
        primaryEventRegId: {
          eventRegistrationId: 'primaryEventRegId',
          registrationTypeId: '001',
          registrationPathId: 'testRegPath',
          attendeeType: 'ATTENDEE',
          attendee: {
            personalInformation: {
              contactId: 'some-contact-id-2'
            }
          }
        },
        guestEventRegId: {
          eventRegistrationId: 'guestEventRegId',
          primaryRegistrationId: 'primaryEventRegId',
          registrationTypeId: '001',
          registrationPathId: 'testRegPath',
          attendeeType: 'GUEST',
          addGuestFromRelatedContacts: false
        }
      }
    },
    currentGuestEventRegistration: {
      eventRegistrationId: 'guestEventRegId'
    }
  }
};
const getState = (state = initialState) => state;
function clearMocksAndCreateStore(mockState = initialState) {
  jest.clearAllMocks();
  return createStore(
    (state, action) => {
      return {
        ...state,
        addGuestFromRelatedContacts: addGuestFromRelatedContactsReducer(
          (state as $TSFixMe).addGuestFromRelatedContacts,
          action
        )
      };
    },
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ defaultUserSession: { eventId:... Remove this comment to see the full error message
    getState(mockState),
    applyMiddleware(thunk)
  );
}
let mockStore;
beforeEach(() => {
  mockStore = clearMocksAndCreateStore();
});

test('set related contacts in state', () => {
  const newState = addGuestFromRelatedContactsReducer(getState, setRelatedContacts(contactId1, relatedContacts1));
  expect(newState).not.toBeNull();
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 3.
  expect(newState).toHaveProperty([contactId1], 'relatedContacts', relatedContacts1);
});

describe('load related contacts', () => {
  test('matches snapshot', async () => {
    await mockStore.dispatch(loadRelatedContactsForInvitee(contactId2));
    expect(getRelatedContactsMock).toHaveBeenCalled();
    expect(mockStore.getState().addGuestFromRelatedContacts[contactId2].relatedContacts).toEqual(relatedContacts2);
    expect(mockStore.getState()).toMatchSnapshot();
  });

  test('toggle showRelatedContactsView', async () => {
    await mockStore.dispatch(toggleRelatedContactsView());
    expect(mockStore.getState().addGuestFromRelatedContacts.showRelatedContactsView).toBeTruthy();
    expect(mockStore.getState().addGuestFromRelatedContacts[contactId2].relatedContacts).toEqual(relatedContacts2);
    expect(getRelatedContactsMock).toHaveBeenCalled();
    await mockStore.dispatch(toggleRelatedContactsView());
    expect(mockStore.getState().addGuestFromRelatedContacts.showRelatedContactsView).toBeFalsy();
    expect(getRelatedContactsMock).toHaveBeenCalledTimes(1);
  });
});

describe('search related contacts', () => {
  test('with less than 3 characters', async () => {
    await mockStore.dispatch(loadRelatedContactsForInvitee(contactId2));
    await mockStore.dispatch(searchRelatedContactsForInvitee(contactId2, 'Na'));

    expect(getRelatedContactsMock).toHaveBeenCalledTimes(1); // count is 1 for load action
    expect(mockStore.getState().addGuestFromRelatedContacts[contactId2].relatedContactsSearchCriteria).toBeUndefined();
    expect(mockStore.getState().addGuestFromRelatedContacts[contactId2].relatedContactsSearchResults).toBeUndefined();
  });

  test('with invitee resetting the search to empty', async () => {
    await mockStore.dispatch(loadRelatedContactsForInvitee(contactId2));
    await mockStore.dispatch(searchRelatedContactsForInvitee(contactId2, ''));

    expect(getRelatedContactsMock).toHaveBeenCalledTimes(1); // count is 1 for load action
    expect(mockStore.getState().addGuestFromRelatedContacts[contactId2].relatedContactsSearchCriteria).toBe('');
    expect(mockStore.getState().addGuestFromRelatedContacts[contactId2].relatedContactsSearchResults).toEqual(
      relatedContacts2
    );
  });

  test('with more than 3 characters and search among state', async () => {
    await mockStore.dispatch(loadRelatedContactsForInvitee(contactId2));
    await mockStore.dispatch(searchRelatedContactsForInvitee(contactId2, 'Name2'));

    expect(getRelatedContactsMock).toHaveBeenCalledTimes(1); // count is 1 for load action
    expect(mockStore.getState().addGuestFromRelatedContacts[contactId2].relatedContactsSearchCriteria).toBe('Name2');
    expect(mockStore.getState().addGuestFromRelatedContacts[contactId2].relatedContactsSearchResults).toEqual(
      relatedContacts2
    );
  });

  test('with more than 3 characters and search via service call', async () => {
    getRelatedContactsMock.mockReturnValue(
      new Promise(resolve => {
        return resolve(searchResultsContact1);
      })
    );
    await mockStore.dispatch(searchRelatedContactsForInvitee(contactId1, 'ssahai'));

    expect(getRelatedContactsMock).toHaveBeenCalledTimes(1); // count is 1 for search action, no load action
    expect(mockStore.getState().addGuestFromRelatedContacts[contactId1].relatedContactsSearchCriteria).toBe('ssahai');
    expect(mockStore.getState().addGuestFromRelatedContacts[contactId1].relatedContactsSearchResults).toEqual(
      searchResultsContact1
    );
  });
});

test('clear related contacts search data', async () => {
  await mockStore.dispatch(loadRelatedContactsForInvitee(contactId2));
  await mockStore.dispatch(searchRelatedContactsForInvitee(contactId2, 'Name2'));
  expect(mockStore.getState().addGuestFromRelatedContacts[contactId2].relatedContacts).not.toBeUndefined();
  expect(mockStore.getState().addGuestFromRelatedContacts[contactId2].relatedContactsSearchResults).not.toBeUndefined();

  await mockStore.dispatch(clearRelatedContactsSearchData());
  expect(mockStore.getState().addGuestFromRelatedContacts[contactId2].relatedContactsSearchCriteria).toBeUndefined();
  expect(mockStore.getState().addGuestFromRelatedContacts[contactId2].relatedContactsSearchResults).toBeUndefined();
});

test('add related contact as guest to be populated as current guest registration', async () => {
  await mockStore.dispatch(loadRelatedContactsForInvitee(contactId2));
  await mockStore.dispatch(searchRelatedContactsForInvitee(contactId2, 'Name2'));

  // mock personal information of related contact to be added as guest
  const personalInformation = {
    firstName: relatedContacts2[1].firstName,
    lastName: relatedContacts2[1].lastName,
    emailAddress: relatedContacts2[1].emailAddress,
    contactId: relatedContacts2[1].relatedContactStub
  };

  let regCartToPost = initialState.registrationForm.regCart;
  regCartToPost = setIn(
    regCartToPost,
    ['eventRegistrations', 'guestEventRegId', 'attendee', 'personalInformation'],
    personalInformation
  );
  regCartToPost = setIn(regCartToPost, ['eventRegistrations', 'guestEventRegId', 'addGuestFromRelatedContacts'], true);

  regCartClient.updateRegCart = jest.fn(() => {
    return {
      regCart: regCartToPost
    };
  });

  await mockStore.dispatch(setCurrentGuestRegistrationForSelectedRelatedContact(relatedContacts2[1]));

  expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.updateRegCart).toHaveBeenCalledWith(accessToken, regCartToPost);

  await mockStore.dispatch(clearRelatedContactsSearchData());
  expect(mockStore.getState().addGuestFromRelatedContacts[contactId2].relatedContactsSearchCriteria).toBeUndefined();
  expect(mockStore.getState().addGuestFromRelatedContacts[contactId2].relatedContactsSearchResults).toBeUndefined();

  await mockStore.dispatch(toggleRelatedContactsView());
  expect(mockStore.getState().addGuestFromRelatedContacts.showRelatedContactsView).toBeFalsy();
});
