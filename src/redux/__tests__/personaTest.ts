import { createInviteeIdentifiedAction, identifyInvitee, setPendingApprovalStatus, personaReducer } from '../persona';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import * as InviteeStatus from 'event-widgets/utils/InviteeStatus';

const accessToken = 'some token';
const eventId = 'some-event-id';
const inviteeId = 'some-invitee-id';
const contactId = 'some-contact-id';

const identifiedInvitee = { inviteeId, eventId, inviteeStatus: InviteeStatus.NoResponse };

const initialState = {
  clients: {
    eventPersonaClient: {
      identifyInvitee: jest.fn().mockReturnValue(
        new Promise(resolve => {
          resolve(identifiedInvitee);
        })
      )
    }
  },
  accessToken,
  userSession: { inviteeId },
  event: {
    id: eventId
  }
};
const getState = (state = initialState) => state;
let mockStore;

beforeEach(() => {
  jest.clearAllMocks();
  mockStore = createStore(
    (state, action) => {
      return {
        ...state,
        persona: personaReducer((state as $TSFixMe).persona, action)
      };
    },
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { eventPersonaClient:... Remove this comment to see the full error message
    getState(),
    applyMiddleware(thunk)
  );
});

describe('Test identifyInvitee', () => {
  it('persona updated and match snapshot', async () => {
    await mockStore.dispatch(identifyInvitee());
    expect(mockStore.getState()).toMatchSnapshot();
  });
});

describe('Test identifyInvitee when contact id is required', () => {
  it('persona updated and match snapshot', async () => {
    await mockStore.dispatch(identifyInvitee(true));
    expect(mockStore.getState()).toMatchSnapshot();
  });
});

describe('Test setPendingApprovalStatus', () => {
  it('persona updated and match snapshot', async () => {
    await mockStore.dispatch(setPendingApprovalStatus());
    expect(mockStore.getState()).toMatchSnapshot();
  });
});

describe('Test reducer', () => {
  it('createInviteeIdentifiedAction with NoResponse invitee', () => {
    const invitee = { inviteeId, eventId, inviteeStatus: InviteeStatus.NoResponse };
    expect(
      personaReducer((initialState as $TSFixMe).persona, createInviteeIdentifiedAction(invitee))
    ).toMatchSnapshot();
  });
  it('createInviteeIdentifiedAction with Accepted invitee', () => {
    const invitee = { inviteeId, eventId, inviteeStatus: InviteeStatus.Accepted };
    expect(
      personaReducer((initialState as $TSFixMe).persona, createInviteeIdentifiedAction(invitee))
    ).toMatchSnapshot();
  });
  it('createInviteeIdentifiedAction with Declined invitee', () => {
    const invitee = { inviteeId, eventId, inviteeStatus: InviteeStatus.Declined };
    expect(
      personaReducer((initialState as $TSFixMe).persona, createInviteeIdentifiedAction(invitee))
    ).toMatchSnapshot();
  });
  it('createInviteeIdentifiedAction with Visited invitee', () => {
    const invitee = { inviteeId, eventId, inviteeStatus: InviteeStatus.Visited };
    expect(
      personaReducer((initialState as $TSFixMe).persona, createInviteeIdentifiedAction(invitee))
    ).toMatchSnapshot();
  });
  it('createInviteeIdentifiedAction with Waitlisted invitee', () => {
    const invitee = { inviteeId, eventId, inviteeStatus: InviteeStatus.Waitlisted };
    expect(
      personaReducer((initialState as $TSFixMe).persona, createInviteeIdentifiedAction(invitee))
    ).toMatchSnapshot();
  });
  it('createInviteeIdentifiedAction with Cancelled invitee', () => {
    const invitee = { inviteeId, eventId, inviteeStatus: InviteeStatus.Cancelled };
    expect(
      personaReducer((initialState as $TSFixMe).persona, createInviteeIdentifiedAction(invitee))
    ).toMatchSnapshot();
  });
  it('createInviteeIdentifiedAction with PendingApproval invitee', () => {
    const invitee = { inviteeId, eventId, inviteeStatus: InviteeStatus.PendingApproval };
    expect(
      personaReducer((initialState as $TSFixMe).persona, createInviteeIdentifiedAction(invitee))
    ).toMatchSnapshot();
  });
  it('createInviteeIdentifiedAction with DeniedApproval invitee', () => {
    const invitee = { inviteeId, eventId, inviteeStatus: InviteeStatus.DeniedApproval };
    expect(
      personaReducer((initialState as $TSFixMe).persona, createInviteeIdentifiedAction(invitee))
    ).toMatchSnapshot();
  });
  it('test contact id will be added to persona info', () => {
    const invitee = { inviteeId, eventId, inviteeStatus: InviteeStatus.NoResponse, contactId };
    expect(
      personaReducer((initialState as $TSFixMe).persona, createInviteeIdentifiedAction(invitee))
    ).toMatchSnapshot();
  });
});
