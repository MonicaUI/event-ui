import {
  evaluateQuestionVisibilityLogic,
  getQuestionRegistrantMapping,
  transformQuestionVisibility,
  getVisibilityLogicQuery,
  loadGuestRegistrationContent,
  loadLandingWebsitePageContent,
  createRestoreRegTypesAction,
  loadLandingPageContent,
  loadRegistrationContent,
  loadMultipleRegistrationContent,
  eventSnapshotVersionVar,
  createLoadEventSnapshotAction
} from '../actions';
import EventGuestClient from '../../clients/EventGuestClient';
import regCartClient from '../../clients/RegCartClient';
import { getRegistrationPathIdOrNull } from '../selectors/currentRegistrationPath';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { createAnswer } from '../../utils/questionUtils';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { RESTORE_ALL_REG_TYPES_FOR_EVENT } from '../actionTypes';
import reducer, { SELECTED_TIMEZONE } from '../timeZoneSelection';

const registrationQuestions = ['fa8f543f-5ae3-4d1b-8c46-5abfa133902c', 'guest-5ae3-4d1b-8c46-5abfa133902c'];
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../../clients/EventGuestClient');
(EventGuestClient.prototype.getWebsiteContent as $TSFixMe).mockImplementation(() => {
  return {
    pages: {
      summary: { id: 'summary', name: 'summary' },
      postregpages: { id: 'postregpages', name: 'postregpages' },
      website_custom1: { id: 'custom1', name: 'Page1' }
    },
    pluginData: {
      eventWebsiteNavigation: {
        childIds: ['summary', 'postregpages', 'custom1']
      }
    }
  };
});

jest.mock('../../clients/RegCartClient', () => {
  return {
    evaluateVisibilityLogic: jest.fn(() => {
      return {
        primaryEventRegId: {
          'fa8f543f-5ae3-4d1b-8c46-5abfa133902c': false
        }
      };
    })
  };
});

jest.mock('../../utils/questionUtils', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../utils/questionUtils'),
    createAnswer: jest.fn(() => {
      return {
        questionId: 'fa8f543f-5ae3-4d1b-8c46-5abfa133902c',
        answers: [
          {
            answerType: 'Text',
            text: ''
          }
        ]
      };
    })
  };
});

jest.mock('../selectors/currentRegistrationPath', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../selectors/currentRegistrationPath'),
    getRegistrationPathIdOrNull: jest.fn(() => {
      return 'testRegPath';
    })
  };
});

let store;
const eventSnapshotClient = {
  getEventSnapshot: jest.fn(() => EventSnapshot.eventSnapshot)
};

function getState() {
  return {
    clients: { eventGuestClient: new EventGuestClient(), regCartClient, eventSnapshotClient },
    userSession: {
      defaultRegPathId: 'dummyRegPathId'
    },
    defaultUserSession: {
      eventId: 'dummyEventId',
      isPreview: false
    },
    registrationForm: {
      regCart: {
        eventRegistrations: {
          primaryEventRegId: {
            eventRegistrationId: 'primaryEventRegId',
            registrationTypeId: '001',
            registrationPathId: 'testRegPath',
            sessionRegistrations: {
              '831e0045-86d3-4133-89a8-4f26172b9d10': {}
            }
          },
          guestEventRegId: {
            eventRegistrationId: 'guestEventRegId',
            primaryRegistrationId: 'primaryEventRegId',
            registrationTypeId: '001',
            registrationPathId: 'testRegPath',
            attendeeType: 'GUEST',
            sessionRegistrations: {
              '831e0045-86d3-4133-89a8-4f26172b9d10': {}
            }
          }
        }
      },
      currentGuestEventRegistration: {
        eventRegistrationId: 'guestEventRegId'
      }
    },
    eventSnapshotVersion: EventSnapshot.eventSnapshot.version,
    account: EventSnapshot.accountSnapshot,
    appData: {
      registrationSettings: {
        registrationQuestions: {
          [registrationQuestions[0]]: {
            question: {
              additionalInfo: {
                audienceType: 'InviteeOnly'
              },
              visibilityLogic: {
                filters: [
                  {
                    nodeType: 'Criterion',
                    fieldName: '3073f3ae-d07e-49eb-a964-a9e1969c43e4'
                  }
                ]
              }
            },
            registrationPathQuestionAssociations: ['testRegPath']
          },
          [registrationQuestions[1]]: {
            question: {
              additionalInfo: {
                audienceType: 'GuestOnly'
              },
              visibilityLogic: {
                filters: [
                  {
                    nodeType: 'Criterion',
                    fieldName: 'guest-d07e-49eb-a964-a9e1969c43e4'
                  }
                ]
              }
            },
            registrationPathQuestionAssociations: ['testRegPath']
          }
        },
        productQuestions: {
          '0ad14b86-d305-4c50-9f0c-d6014ca7ec9b': {
            question: {
              visibilityLogic: {
                filters: [
                  {
                    nodeType: 'Criterion',
                    fieldName: 'fa8f543f-5ae3-4d1b-8c46-5abfa133902c'
                  }
                ]
              }
            },
            registrationPathQuestionAssociations: ['testRegPath'],
            productQuestionAssociations: ['831e0045-86d3-4133-89a8-4f26172b9d10']
          }
        },
        registrationPaths: {
          testRegPath: {
            id: 'testRegPath',
            isDefault: true,
            guestRegistrationSettings: {
              isGuestRegistrationEnabled: true
            }
          }
        }
      }
    },
    event: {
      id: 'eventId'
    },
    website: {
      pages: {
        summary: { id: 'summary', name: 'summary' },
        postregpages: { id: 'postregpages', name: 'postregpages' },
        website_custom1: { id: 'custom1', name: 'Page1' },
        website_custom2: { id: 'custom2', name: 'Page2' }
      },
      pluginData: {
        eventWebsiteNavigation: {
          childIds: ['summary', 'postregpages', 'custom1', 'custom2']
        }
      }
    }
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  store = mockStore(getState());
});

describe('loadLandingPageContent', () => {
  it('calls event-guestside-service to load website page content if landing on a custom page', () => {
    store.dispatch(loadLandingPageContent('WEBSITE'));
    expect(EventGuestClient.prototype.getWebsiteContent).toHaveBeenCalled();
  });
  it('calls event-guestside-service to load website page content if pageVariety is not explicit', () => {
    store.dispatch(loadLandingPageContent(undefined));
    expect(EventGuestClient.prototype.getWebsiteContent).toHaveBeenCalled();
  });
  it('calls event-guestside-service to load website page content when plugin data mismatch if pageVariety is registration page.', () => {
    store.dispatch(loadLandingPageContent('POST_REGISTRATION'));
    expect(EventGuestClient.prototype.getWebsiteContent).toHaveBeenCalled();
  });

  it('calls event-guestside-service to load registration content when regPath is fetched from regCart if pageVariety is registration page.', async () => {
    await store.dispatch(loadLandingPageContent('REGISTRATION'));
    expect(EventGuestClient.prototype.getRegistrationContent).toHaveBeenCalledWith(
      'dummyEventId',
      'dummySnapshotVersion',
      'REGISTRATION',
      'testRegPath',
      '001'
    );
  });

  it('calls event-guestside-service to load guest registration content when guest registration is enabled when reloading registration', async () => {
    await store.dispatch(loadLandingPageContent('REGISTRATION'));
    expect(EventGuestClient.prototype.getRegistrationContent).toHaveBeenCalledWith(
      'dummyEventId',
      'dummySnapshotVersion',
      'GUEST_REGISTRATION',
      'testRegPath',
      '001'
    );

    // if not registration page verify guest registration content is not retrieved
    (EventGuestClient.prototype.getRegistrationContent as $TSFixMe).mockClear();
    await store.dispatch(loadLandingPageContent('POST_REGISTRATION'));
    expect(EventGuestClient.prototype.getRegistrationContent).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'GUEST_REGISTRATION',
      expect.anything(),
      expect.anything()
    );

    // turn guest reg off and verify guest registration content is not retrieved
    (EventGuestClient.prototype.getRegistrationContent as $TSFixMe).mockClear();
    const state = getState();
    const testRegPath = state.appData.registrationSettings.registrationPaths.testRegPath;
    testRegPath.guestRegistrationSettings.isGuestRegistrationEnabled = false;
    const customStore = mockStore(state);
    await customStore.dispatch(loadLandingPageContent('REGISTRATION'));
    expect(EventGuestClient.prototype.getRegistrationContent).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'GUEST_REGISTRATION',
      expect.anything(),
      expect.anything()
    );
  });

  it('calls event-guestside-service to load registration content when regPath is fetched from userSession  if pageVariety is registration page.', async () => {
    (getRegistrationPathIdOrNull as $TSFixMe).mockImplementationOnce(() => null);
    await store.dispatch(loadLandingPageContent('REGISTRATION'));
    expect(EventGuestClient.prototype.getRegistrationContent).toHaveBeenCalledWith(
      'dummyEventId',
      'dummySnapshotVersion',
      'REGISTRATION',
      'dummyRegPathId',
      '001'
    );
    expect(eventSnapshotClient.getEventSnapshot).toHaveBeenCalled();
  });
  it('calls event-guestside-service to load registration content when regPath is an empty stub and fetched from userSession if pageVariety is registration page.', async () => {
    const state = getState();
    state.userSession.defaultRegPathId = '00000000-0000-0000-0000-000000000000';
    const customStore = mockStore(state);
    (getRegistrationPathIdOrNull as $TSFixMe).mockImplementationOnce(() => null);
    await customStore.dispatch(loadLandingPageContent('REGISTRATION'));
    expect(EventGuestClient.prototype.getRegistrationContent).toHaveBeenCalledWith(
      'dummyEventId',
      'dummySnapshotVersion',
      'REGISTRATION',
      null,
      '001'
    );
    expect(eventSnapshotClient.getEventSnapshot).not.toHaveBeenCalled();
  });
  it('calls event-guestside-service to load registration content when userSession regpath is default and fetched from userSession if pageVariety is registration page.', async () => {
    const state = getState();
    state.userSession.defaultRegPathId = 'testRegPath';
    const customStore = mockStore(state);
    (getRegistrationPathIdOrNull as $TSFixMe).mockImplementationOnce(() => null);
    await customStore.dispatch(loadLandingPageContent('REGISTRATION'));
    expect(EventGuestClient.prototype.getRegistrationContent).toHaveBeenCalledWith(
      'dummyEventId',
      'dummySnapshotVersion',
      'REGISTRATION',
      'testRegPath',
      '001'
    );
    expect(eventSnapshotClient.getEventSnapshot).not.toHaveBeenCalled();
  });
});

describe('loadRegistrationContent', () => {
  it('calls event-guestside-service to load post page content with regTypeId', () => {
    store.dispatch(loadRegistrationContent({ name: 'POST_REGISTRATION' }));
    expect(EventGuestClient.prototype.getRegistrationContent).toHaveBeenCalledWith(
      'dummyEventId',
      'dummySnapshotVersion',
      'POST_REGISTRATION',
      null,
      '001'
    );
  });
  it('Calls action to update imageLookup value in redux store after getting website content, if value is present', async () => {
    (EventGuestClient.prototype.getWebsiteContent as $TSFixMe).mockImplementation(() => {
      return {
        pages: {
          summary: { id: 'summary', name: 'summary' },
          postregpages: { id: 'postregpages', name: 'postregpages' },
          website_custom1: { id: 'custom1', name: 'Page1' }
        },
        pluginData: {
          eventWebsiteNavigation: {
            childIds: ['summary', 'postregpages', 'custom1']
          }
        },
        imageLookup: {
          'https://silo408-custom.core.cvent.org/3ADF3575C9904248ABCA145D7C9B70D0/pix/937ae9e5738548ac98c9134c1dc082cf.jpg':
            {
              hashedURL:
                'https://images-lower.cvent.com/S408/3adf3575c9904248abca145d7c9b70d0/pix/937ae9e5738548ac98c9134c1dc082cf!_!c19877ed9fc51dff19f03909b18ba323.jpg',
              width: 1466,
              height: 2443
            },
          'https://silo408-custom.core.cvent.org/3ADF3575C9904248ABCA145D7C9B70D0/pix/937ae9e5738548ac98c9134c1dc082cf_thumbnail.jpg':
            {
              hashedURL:
                'https://images-lower.cvent.com/S408/3adf3575c9904248abca145d7c9b70d0/pix/937ae9e5738548ac98c9134c1dc082cf_thumbnail!_!1f349f162e654fc314d9b9736abf86b6.jpg',
              width: 120,
              height: 200
            }
        }
      };
    });
    await store.dispatch(loadRegistrationContent('custom1'));
    expect(store.getActions()).toMatchSnapshot();
  });
});

describe('loadLandingWebsitePageContent', () => {
  it('Updates the state when plugin data mismatch', async () => {
    await store.dispatch(loadLandingWebsitePageContent('001'));
    expect(EventGuestClient.prototype.getWebsiteContent).toHaveBeenCalled();
    expect(store.getActions()).toMatchSnapshot();
  });
  it('Do not Updates the state when plugin data match', async () => {
    const state = getState();
    (state.website.pluginData.eventWebsiteNavigation as $TSFixMe).disabledPageIds = ['custom2'];
    const customStore = mockStore(state);
    await customStore.dispatch(loadLandingWebsitePageContent('001'));
    expect(store.getActions()).toEqual([]);
  });
  it('Calls action to update imageLookup value in redux store after getting website content, if value is present', async () => {
    (EventGuestClient.prototype.getWebsiteContent as $TSFixMe).mockImplementation(() => {
      return {
        pages: {
          summary: { id: 'summary', name: 'summary' },
          postregpages: { id: 'postregpages', name: 'postregpages' },
          website_custom1: { id: 'custom1', name: 'Page1' }
        },
        pluginData: {
          eventWebsiteNavigation: {
            childIds: ['summary', 'postregpages', 'custom1']
          }
        },
        imageLookup: {
          'https://silo408-custom.core.cvent.org/3ADF3575C9904248ABCA145D7C9B70D0/pix/937ae9e5738548ac98c9134c1dc082cf.jpg':
            {
              hashedURL:
                'https://images-lower.cvent.com/S408/3adf3575c9904248abca145d7c9b70d0/pix/937ae9e5738548ac98c9134c1dc082cf!_!c19877ed9fc51dff19f03909b18ba323.jpg',
              width: 1466,
              height: 2443
            },
          'https://silo408-custom.core.cvent.org/3ADF3575C9904248ABCA145D7C9B70D0/pix/937ae9e5738548ac98c9134c1dc082cf_thumbnail.jpg':
            {
              hashedURL:
                'https://images-lower.cvent.com/S408/3adf3575c9904248abca145d7c9b70d0/pix/937ae9e5738548ac98c9134c1dc082cf_thumbnail!_!1f349f162e654fc314d9b9736abf86b6.jpg',
              width: 120,
              height: 200
            }
        }
      };
    });
    await store.dispatch(loadLandingPageContent('001'));
    expect(store.getActions()).toMatchSnapshot();
  });
});

describe('loadGuestRegistrationContent', () => {
  it('calls event-guestside-service to load post page content with regTypeId', () => {
    store.dispatch(loadGuestRegistrationContent('testRegPath'));
    expect(EventGuestClient.prototype.getRegistrationContent).toHaveBeenCalledWith(
      'dummyEventId',
      'dummySnapshotVersion',
      'GUEST_REGISTRATION',
      'testRegPath',
      '001'
    );
  });
});

describe('loadMultipleRegistrationContent', () => {
  const regPathId1 = 'regPathId1';
  const regPathId2 = 'regPathId2';
  const regPathId3 = 'regPathId3';

  it('if no reg paths, expect no calls', () => {
    const registrantPathIds = [];
    store.dispatch(loadMultipleRegistrationContent(registrantPathIds));

    expect(EventGuestClient.prototype.getRegistrationContent).not.toHaveBeenCalled();
  });
  it('if multiple unique reg paths, expect a call for each', async () => {
    const registrantPathIds = [regPathId1, regPathId2, regPathId3];
    await store.dispatch(loadMultipleRegistrationContent(registrantPathIds));

    expect(EventGuestClient.prototype.getRegistrationContent).toHaveBeenCalledWith(
      'dummyEventId',
      'dummySnapshotVersion',
      'REGISTRATION',
      regPathId2,
      '001'
    );
    expect(EventGuestClient.prototype.getRegistrationContent).toHaveBeenCalledWith(
      'dummyEventId',
      'dummySnapshotVersion',
      'REGISTRATION',
      regPathId3,
      '001'
    );
    expect(EventGuestClient.prototype.getRegistrationContent).toHaveBeenCalledWith(
      'dummyEventId',
      'dummySnapshotVersion',
      'REGISTRATION',
      regPathId1,
      '001'
    );
  });
  it('if multiple not unique reg paths, expect only one call per unique path', () => {
    const registrantPathIds = [regPathId1, regPathId2, regPathId2, regPathId1];
    store.dispatch(loadMultipleRegistrationContent(registrantPathIds));

    expect(EventGuestClient.prototype.getRegistrationContent).toHaveBeenCalledWith(
      'dummyEventId',
      'dummySnapshotVersion',
      'REGISTRATION',
      regPathId2,
      '001'
    );
    expect(EventGuestClient.prototype.getRegistrationContent).toHaveBeenCalledWith(
      'dummyEventId',
      'dummySnapshotVersion',
      'REGISTRATION',
      regPathId1,
      '001'
    );
  });
});

describe('evaluateVisibilityLogic tests', () => {
  it('should not call the reg service, if no questions have a field as a basis for visibility logic', async () => {
    store.dispatch(evaluateQuestionVisibilityLogic('fieldId'));
    expect((regCartClient as $TSFixMe).evaluateVisibilityLogic).not.toHaveBeenCalled();
    expect(store.getActions()).toMatchSnapshot();
  });
  it('should call the reg service, if the field is the source for at least one question with visibility logic', async () => {
    store.dispatch(evaluateQuestionVisibilityLogic('3073f3ae-d07e-49eb-a964-a9e1969c43e4'));
    expect((regCartClient as $TSFixMe).evaluateVisibilityLogic).toHaveBeenCalled();
    expect(store.getActions()).toMatchSnapshot();
  });
  it('should remove the answer for any questions that are not visible', async () => {
    await store.dispatch(evaluateQuestionVisibilityLogic('3073f3ae-d07e-49eb-a964-a9e1969c43e4'));
    expect((regCartClient as $TSFixMe).evaluateVisibilityLogic).toHaveBeenCalled();
    expect(createAnswer).toHaveBeenCalledWith('fa8f543f-5ae3-4d1b-8c46-5abfa133902c');
    expect(store.getActions()).toMatchSnapshot();
  });
});

describe('evaluateVisibilityLogic tests for guest', () => {
  it('should not call the reg service, if no questions have a field as a basis for guest visibility logic', async () => {
    store.dispatch(evaluateQuestionVisibilityLogic('fieldId', false, true));
    expect((regCartClient as $TSFixMe).evaluateVisibilityLogic).not.toHaveBeenCalled();
    expect(store.getActions()).toMatchSnapshot();
  });
  it('should call the reg service, if the field is the source for at least one question with guest visibility logic', async () => {
    store.dispatch(evaluateQuestionVisibilityLogic('guest-d07e-49eb-a964-a9e1969c43e4', false, true));
    expect((regCartClient as $TSFixMe).evaluateVisibilityLogic).toHaveBeenCalled();
    expect(store.getActions()).toMatchSnapshot();
  });
  it('should remove the answer for any questions that are not visible for guests', async () => {
    await store.dispatch(evaluateQuestionVisibilityLogic('guest-d07e-49eb-a964-a9e1969c43e4', false, true));
    expect((regCartClient as $TSFixMe).evaluateVisibilityLogic).toHaveBeenCalled();
    expect(store.getActions()).toMatchSnapshot();
  });
});

describe('evaluateVisibilityLogic tests for multiple registrants', () => {
  it('should call the reg service, if the field is the source for at least one question', async () => {
    jest.mock('../../clients/RegCartClient', () => {
      return {
        evaluateVisibilityLogic: jest.fn(() => {
          return {
            primaryEventRegId: {
              '0ad14b86-d305-4c50-9f0c-d6014ca7ec9b': true
            },
            guestEventRegId: {
              '0ad14b86-d305-4c50-9f0c-d6014ca7ec9b': false
            }
          };
        })
      };
    });

    store.dispatch(evaluateQuestionVisibilityLogic(null, true, false));
    const expectedRequestPayloadShape = {
      primaryEventRegId: {
        answers: expect.any(Array),
        questionIds: expect.any(Array)
      },
      guestEventRegId: {
        answers: expect.any(Array),
        questionIds: expect.any(Array)
      }
    };
    expect((regCartClient as $TSFixMe).evaluateVisibilityLogic).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining(expectedRequestPayloadShape),
      expect.anything(),
      expect.anything(),
      undefined
    );
    expect(store.getActions()).toMatchSnapshot();
  });
});

const appData = {
  registrationSettings: {
    productQuestions: {
      question1: {
        productQuestionAssociations: ['session1']
      },
      question2: {
        productQuestionAssociations: ['product2']
      }
    }
  }
};
const registrations = {
  registrantId1: {
    eventRegistrationId: 'registrantId1',
    attendeeType: 'ATTENDEE',
    productRegistrations: [{ productId: 'product2' }],
    sessionRegistrations: {}
  },
  registrantId2: {
    eventRegistrationId: 'registrantId2',
    primaryRegistrationId: 'differentRegistraionId',
    attendeeType: 'ATTENDEE',
    productRegistrations: [{ productId: 'product2' }],
    sessionRegistrations: { session1: {} }
  },
  guestRegistrant1Id: {
    eventRegistrationId: 'guestRegistrant1Id',
    primaryRegistrationId: 'registrantId1',
    attendeeType: 'GUEST',
    productRegistrations: [],
    sessionRegistrations: { session1: {} }
  },
  guestRegistrant2Id: {
    eventRegistrationId: 'guestRegistrant2Id',
    primaryRegistrationId: 'registrantId1',
    attendeeType: 'GUEST',
    productRegistrations: [{ productId: 'product2' }],
    sessionRegistrations: {}
  },
  guestRegistrant3Id: {
    eventRegistrationId: 'guestRegistrant2Id',
    primaryRegistrationId: 'registrantId2',
    attendeeType: 'GUEST',
    productRegistrations: [{ productId: 'product2' }],
    sessionRegistrations: { session1: {} }
  }
};

const questionRegistrantMapping = {
  question1: ['guestRegistrant1Id'],
  question2: ['registrantId1', 'guestRegistrant2Id'],
  question3: ['registrantId1']
};

describe('getQuestionRegistrantMapping', () => {
  it('should return the question id to registrant id mapping for provided questions', async () => {
    const mapping = getQuestionRegistrantMapping({ appData }, registrations, 'registrantId1', [
      'question1',
      'question2',
      'question3'
    ]);
    expect(mapping).toMatchObject(questionRegistrantMapping);
  });
});

const questionState = {
  appData: {
    registrationSettings: {
      productQuestions: {
        question1: {
          question: {
            visibilityLogic: {
              filters: [
                {
                  nodeType: 'Criterion',
                  fieldName: 'fa8f543f-5ae3-4d1b-8c46-5abfa133902c'
                }
              ]
            }
          }
        },
        question2: {
          question: {
            visibilityLogic: {
              filters: [
                {
                  nodeType: 'Criterion',
                  fieldName: 'fa8f543f-5ae3-4d1b-8c46-5abfa133902c'
                }
              ]
            }
          }
        },
        question3: {
          question: {
            visibilityLogic: {
              filters: [
                {
                  nodeType: 'Criterion',
                  fieldName: 'fa8f543f-5ae3-4d1b-8c46-5abfa133902c'
                }
              ]
            }
          }
        }
      }
    }
  }
};

describe('getVisibilityLogicQuery', () => {
  it('should build the visibility logic request payload', async () => {
    const payload = getVisibilityLogicQuery(questionState, registrations, questionRegistrantMapping, false);
    expect(payload).toMatchObject({
      guestRegistrant1Id: {
        questionIds: ['question1'],
        answers: [
          {
            answers: [{ answerType: 'Text', text: '' }],
            questionId: 'fa8f543f-5ae3-4d1b-8c46-5abfa133902c'
          }
        ]
      },
      registrantId1: {
        questionIds: ['question2', 'question3'],
        answers: [
          {
            answers: [{ answerType: 'Text', text: '' }],
            questionId: 'fa8f543f-5ae3-4d1b-8c46-5abfa133902c'
          }
        ]
      },
      guestRegistrant2Id: {
        questionIds: ['question2'],
        answers: [
          {
            answers: [{ answerType: 'Text', text: '' }],
            questionId: 'fa8f543f-5ae3-4d1b-8c46-5abfa133902c'
          }
        ]
      }
    });
  });
});

describe('transformQuestionVisibility', () => {
  it('should transform the question visibiity logic response', async () => {
    const response = {
      registrantId1: {
        question1: true
      },
      registrantId2: {
        question1: false,
        question2: true
      },
      registrantId3: {
        question3: false
      },
      registrantId4: {
        question3: true
      }
    };

    const transformedResponse = transformQuestionVisibility(response);
    expect(transformedResponse).toMatchObject({
      question1: { registrantId1: true, registrantId2: false },
      question2: { registrantId2: true },
      question3: { registrantId3: false, registrantId4: true }
    });
  });
});

describe('createRestoreRegTypesAction', () => {
  it('should create an action object of type RESTORE_ALL_REG_TYPES_FOR_EVENT', async () => {
    const eventSnapshot = EventSnapshot.eventSnapshot;
    const receivedObject = createRestoreRegTypesAction(eventSnapshot);
    expect(receivedObject).toMatchObject({
      type: RESTORE_ALL_REG_TYPES_FOR_EVENT,
      payload: eventSnapshot
    });
  });
});

const eventTimeZone = {
  id: 35,
  name: 'Eastern Time',
  nameResourceKey: 'Event_Timezone_Name_35__resx',
  plannerDisplayName: '(GMT-05:00) Eastern [US & Canada]',
  hasDst: true,
  utcOffset: -660,
  abbreviation: 'ET',
  abbreviationResourceKey: 'Event_Timezone_Abbr_35__resx',
  dstInfo: [
    {
      utcStartTime: '2000-03-12T07:00Z',
      utcEndTime: '2000-11-05T06:00Z',
      dstOffset: 60
    }
  ]
};
const setEventTimeZoneAction = { type: SELECTED_TIMEZONE, payload: { ...eventTimeZone } };
const selectedTimeZone = {
  id: 1,
  name: 'Samoa Time',
  nameResourceKey: 'Event_Timezone_Name_1__resx',
  plannerDisplayName: '(GMT-11:00) Samoa',
  abbreviation: 'ST',
  abbreviationResourceKey: 'Event_Timezone_Abbr_1__resx',
  dstInfo: [{}],
  value: 1001,
  hasDst: true,
  utcOffset: -660
};

it('SELECTED_TIMEZONE sets selectedTimeZone to event time zones.', () => {
  const newState = reducer(selectedTimeZone, setEventTimeZoneAction);
  expect(newState).toEqual(eventTimeZone);
});

describe('createLoadEventSnapshotAction', () => {
  it('sets eventSnapshotVersionVar when different', async () => {
    eventSnapshotVersionVar('test1');
    await createLoadEventSnapshotAction({ version: 'test2' }, {});
    expect(eventSnapshotVersionVar()).toBe('test2');
  });

  it('does NOT set eventSnapshotVersionVar when the same', async () => {
    eventSnapshotVersionVar('test1');
    await createLoadEventSnapshotAction({ version: 'test1' }, {});
    expect(eventSnapshotVersionVar()).toBe('test1');
  });
});
