import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import EventSnapshot from '../../../../../fixtures/EventSnapshot.json';
import transformEventData from 'event-widgets/utils/transformEventData';
import { setIn } from 'icepick';
import { addGroupMemberInRegCart } from '../group';
import {
  createAdmissionItem,
  createRegistrationType,
  createAutoAppliedAdmissionItem
} from '../../../../testUtils/index';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';

const PRIMARY_INVITEE_REGISTRATION_ID = 'primaryEventRegId';
const GROUP_MEMBER_REGISTRATION_ID = 'groupMemberEventRegId';
const accessToken = '';

jest.mock('uuid', () => {
  return {
    v4: jest.fn().mockReturnValue('groupMemberEventRegId')
  };
});

jest.mock('../../../actions', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../../actions'),
    filterEventSnapshot: () => () => {},
    loadRegistrationContent: () => () => {},
    loadGuestRegistrationContent: () => () => {}
  };
});

const regCartClient = {
  updateRegCart: jest.fn(() => {
    return {
      regCart: {}
    };
  })
};
const capacityClient = {
  getCapacitySummaries: jest.fn(() => {})
};
const eventEmailClient = {};

const eventSnapshotClient = {
  getAccountSnapshot: jest.fn(() => EventSnapshot.accountSnapshot),
  getEventSnapshot: jest.fn(() => EventSnapshot.eventSnapshot)
};
const productVisibilityClient = {
  getVisibleProducts: jest.fn(() => ({ Sessions: {} }))
};
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const defaultRegCart = {
  regCartId: 'regCartAId',
  eventRegistrations: {
    [PRIMARY_INVITEE_REGISTRATION_ID]: {
      eventRegistrationId: PRIMARY_INVITEE_REGISTRATION_ID,
      eventId: 'EventAId',
      registrationTypeId: defaultRegistrationTypeId,
      attendee: {
        attendeeId: 'attendeeAId',
        personalInformation: {
          firstName: 'floofykins',
          lastName: 'snuffles',
          emailAddress: 'floofykins.snuffles@j.mail',
          socialMediaUrls: {
            FACEBOOK: 'http://www.facebook.com/YourChosenName'
          },
          customFields: {
            customFieldAId: {
              questionId: 'customFieldAId',
              answers: [
                {
                  answerType: 'I am a dragon!',
                  text: 'text answer'
                }
              ]
            }
          }
        },
        eventAnswers: {
          eventAnswerAId: {
            questionId: 'eventAnswerAId',
            answers: [
              {
                answerType: 'Im Hungry!',
                text: 'text answer'
              }
            ]
          }
        }
      },
      attendeeType: 'ATTENDEE',
      productRegistrations: [
        {
          productId: 'admissionItemAId',
          productType: 'AdmissionItem',
          quantity: 1,
          requestedAction: 'REGISTER'
        }
      ],
      sessionRegistrations: {
        sessionAId: {
          productId: 'sessionAId',
          productType: 'Session',
          quantity: 1,
          requestedAction: 'REGISTER'
        }
      }
    }
  }
};

const initialState = {
  accessToken,
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
    eventFeatureSetup: {
      fees: {
        fees: true
      }
    },
    registrationTypes: EventSnapshot.eventSnapshot.registrationTypes,
    products: EventSnapshot.eventSnapshot.products,
    id: EventSnapshot.eventSnapshot.id,
    capacityId: 'event_capacity'
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
  clients: { regCartClient, capacityClient, eventEmailClient, eventSnapshotClient, productVisibilityClient },
  userSession: {},
  defaultUserSession: {
    isPreview: false
  },
  registrationForm: {
    currentEventRegistrationId: PRIMARY_INVITEE_REGISTRATION_ID,
    regCart: defaultRegCart
  },
  pathInfo: {
    rootPath: 'events/dummyId',
    currentPageId: 'regProcessStep1'
  }
};

let store;
let regCartUtils;
let currentRegistrationPathSelectors;
beforeEach(() => {
  jest.clearAllMocks();
  store = mockStore(initialState);
  regCartUtils = require('../../../../utils/regTypeCapacities');
  currentRegistrationPathSelectors = require('../../../selectors/currentRegistrationPath');
});

describe('limit group member reg type tests', () => {
  test('correct regTypeId and admissionItem are set if only one regType is availble to group members', async () => {
    const regTypeA = createRegistrationType('regTypeA');
    const regTypeB = createRegistrationType('regTypeB');
    const admItemA = createAdmissionItem('AdmissionItemAId', [defaultRegistrationTypeId, regTypeA.id]);
    const defaultAdmissionItem = Object.values(initialState.event.products.admissionItems)[0];

    const updatedEventSnapshot = {
      ...initialState.event,
      registrationTypes: {
        ...initialState.event.registrationTypes,
        [regTypeA.id]: regTypeA,
        [regTypeB.id]: regTypeB
      },
      products: {
        admissionItems: {
          [defaultAdmissionItem.id]: {
            ...defaultAdmissionItem,
            applicableContactTypes: [regTypeB.id]
          },
          [admItemA.id]: admItemA
        }
      }
    };

    regCartUtils.getAvailableGroupRegTypeCapacities = jest.fn(() => {
      return {
        regTypeCapacitiesAvailable: [{ id: regTypeB.id, available: Infinity }]
      };
    });

    currentRegistrationPathSelectors.getRegistrationStartPageId = jest.fn(() => 'regProcessStep1');
    const updatedInitialState = setIn(initialState, ['event'], updatedEventSnapshot);
    const regCart = initialState.registrationForm.regCart;
    /**
     * Group members can only get regTypeB and the only visible admission item to regTypeB is the default one
     *
     */
    const expectedRegCart = {
      ...regCart,
      eventRegistrations: {
        [PRIMARY_INVITEE_REGISTRATION_ID]: {
          ...regCart.eventRegistrations[PRIMARY_INVITEE_REGISTRATION_ID],
          attendeeType: 'GROUP_LEADER'
        },
        [GROUP_MEMBER_REGISTRATION_ID]: {
          eventId: initialState.event.id,
          eventRegistrationId: GROUP_MEMBER_REGISTRATION_ID,
          attendee: {
            personalInformation: {},
            eventAnswers: {}
          },
          attendeeType: 'ATTENDEE',
          primaryRegistrationId: PRIMARY_INVITEE_REGISTRATION_ID,
          productRegistrations: [createAutoAppliedAdmissionItem(defaultAdmissionItem)],
          registrationTypeId: regTypeB.id
        }
      }
    };
    store = mockStore(updatedInitialState);
    const eventId = initialState.event.id;
    await store.dispatch(addGroupMemberInRegCart(eventId));
    expect(regCartClient.updateRegCart).toHaveBeenCalledWith(accessToken, expectedRegCart);
    expect(store.getActions()).toMatchSnapshot();
  });
});
