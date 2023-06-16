// eslint-disable-next-line @typescript-eslint/no-var-requires
const LookupClient = require('event-widgets/clients/LookupClient').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const EventSnapshotClient = require('../../clients/EventSnapshotClient').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ProductVisibilityClient = require('../../clients/ProductVisibilityClient').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CapacityClient = require('event-widgets/clients/CapacityClient').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const EventFeeClient = require('event-widgets/clients/EventFeeClient').default;

import React from 'react';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import EventGuestSideWidgetFactory from '../index';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import pageContainingWidgetFixture from '../../testUtils/pageContainingWidgetFixture';

const baseUrl = '/event_guest/v1/';
const eventId = '';
const environment = 'S408';
const accessToken = '';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const locale = 'en';
const defaultCountryCode = 'AD';
const workAddressFieldName = 'Work Address';

LookupClient.prototype.getStates = jest.fn(() => {
  const countryCode = 'AD';
  return {
    states: {
      AA: {
        categoryId: 8,
        categoryName: 'U.S. Armed Forces Codes',
        categoryNameResourceKey: 'cvt_lu4_0004',
        categoryOrder: 14,
        code: 'AA',
        countryCode,
        id: 2,
        name: 'Armed Forces Americas',
        nameResourceKey: 'cvt_lu3_0002'
      },
      AE: {
        categoryId: 8,
        categoryName: 'U.S. Armed Forces Codes',
        categoryNameResourceKey: 'cvt_lu4_0004',
        categoryOrder: 14,
        code: 'AE',
        countryCode,
        id: 7,
        name: 'Armed Forces Europe',
        nameResourceKey: 'cvt_lu3_0007'
      },
      AK: {
        categoryId: 1,
        categoryName: 'U.S. States',
        categoryNameResourceKey: 'cvt_lu4_0001',
        categoryOrder: 10,
        code: 'AK',
        countryCode,
        id: 10,
        name: 'Alaska',
        nameResourceKey: 'cvt_lu3_0010'
      }
    },
    translations: {
      en: {
        cvt_lu3_0002: 'Armed Forces Americas',
        cvt_lu3_0007: 'Armed Forces Europe',
        cvt_lu3_0010: 'Alaska'
      }
    }
  };
});
LookupClient.prototype.getCountries = jest.fn(() => {
  return {
    countries: {
      AD: {
        alphaThreeCode: 'AND',
        code: 'AD',
        id: 1,
        isoCode: 20,
        metroAreaGroupId: 7,
        name: 'Andorra',
        nameResourceKey: 'cvt_lu2_0001',
        requireZipCodeFlag: false,
        sort: 999
      },
      AE: {
        alphaThreeCode: 'ARE',
        code: 'AE',
        id: 2,
        isoCode: 784,
        metroAreaGroupId: 11,
        name: 'United Arab Emirates',
        nameResourceKey: 'cvt_lu2_0002',
        requireZipCodeFlag: false,
        sort: 999
      },
      AF: {
        alphaThreeCode: 'AFG',
        code: 'AF',
        id: 3,
        isoCode: 4,
        metroAreaGroupId: 11,
        name: 'Afghanistan',
        nameResourceKey: 'cvt_lu2_0003',
        requireZipCodeFlag: false,
        sort: 999
      }
    },
    translations: {
      en: {
        cvt_lu2_0001: 'Andorra',
        cvt_lu2_0002: 'United Arab Emirates',
        cvt_lu2_0003: 'Afghanistan'
      }
    }
  };
});

ProductVisibilityClient.prototype.getVisibleProducts = jest.fn(() => {
  return {
    admissionItems: {
      '2819f92f-e09a-4463-b597-37f5ed1d4335': {
        limitOptionalItemsToSelect: false,
        isOpenForRegistration: true,
        limitGuestsByContactType: false,
        includeWaitlistSessionsTowardsMaximumLimit: false,
        applicableContactTypes: [],
        limitOptionalSessionsToSelect: false,
        associatedOptionalSessions: [],
        applicableOptionalItems: [],
        minimumNumberOfSessionsToSelect: 0,
        availableOptionalSessions: [],
        capacityByGuestContactTypes: [],
        displayOrder: 1,
        code: 'A1 Included Session',
        description: '',
        id: '2819f92f-e09a-4463-b597-37f5ed1d4335',
        capacityId: '2819f92f-e09a-4463-b597-37f5ed1d4335',
        name: 'A1 Included Session',
        status: 2,
        type: 'AdmissionItem',
        defaultFeeId: '00000000-0000-0000-0000-000000000000',
        fees: {}
      }
    },
    sessionProducts: {
      '9272e9d2-ad86-4e41-9038-267c6d87d38b': {
        categoryId: '00000000-0000-0000-0000-000000000000',
        startTime: '2018-04-14T22:00:00.000Z',
        endTime: '2018-04-14T23:00:00.000Z',
        isOpenForRegistration: true,
        isIncludedSession: false,
        registeredCount: 1,
        associatedWithAdmissionItems: [],
        availableToAdmissionItems: [],
        associatedRegistrationTypes: [],
        sessionCustomFieldValues: {},
        displayPriority: 0,
        showOnAgenda: true,
        speakerIds: {},
        code: '',
        description: '',
        id: '9272e9d2-ad86-4e41-9038-267c6d87d38b',
        capacityId: '9272e9d2-ad86-4e41-9038-267c6d87d38b',
        name: 'Session 1',
        status: 2,
        type: 'Session',
        defaultFeeId: '00000000-0000-0000-0000-000000000000',
        fees: {}
      },
      '08a7f564-5c0e-4aa3-99c1-34a27b789161': {
        categoryId: '00000000-0000-0000-0000-000000000000',
        startTime: '2018-04-14T22:00:00.000Z',
        endTime: '2018-04-14T23:00:00.000Z',
        isOpenForRegistration: true,
        isIncludedSession: false,
        registeredCount: 0,
        associatedWithAdmissionItems: [],
        availableToAdmissionItems: [],
        associatedRegistrationTypes: [],
        sessionCustomFieldValues: {},
        displayPriority: 2,
        showOnAgenda: true,
        speakerIds: {},
        code: '',
        description: '',
        id: '08a7f564-5c0e-4aa3-99c1-34a27b789161',
        capacityId: '08a7f564-5c0e-4aa3-99c1-34a27b789161',
        name: 'Session 2',
        status: 2,
        type: 'Session',
        defaultFeeId: '00000000-0000-0000-0000-000000000000',
        fees: {}
      },
      '8e68e719-a008-4120-92ec-4525d83cd54c': {
        categoryId: '00000000-0000-0000-0000-000000000000',
        startTime: '2018-04-14T22:00:00.000Z',
        endTime: '2018-04-14T23:00:00.000Z',
        isOpenForRegistration: true,
        isIncludedSession: true,
        registeredCount: 5,
        associatedWithAdmissionItems: [],
        availableToAdmissionItems: [],
        associatedRegistrationTypes: [],
        sessionCustomFieldValues: {},
        displayPriority: 4,
        showOnAgenda: true,
        speakerIds: {},
        code: '',
        description: '',
        id: '8e68e719-a008-4120-92ec-4525d83cd54c',
        capacityId: '8e68e719-a008-4120-92ec-4525d83cd54c',
        name: 'Included 1',
        status: 2,
        type: 'Session',
        defaultFeeId: '00000000-0000-0000-0000-000000000000',
        fees: {}
      },
      '6578f0ab-b554-43d6-8872-4bcf8b0fe1f1': {
        id: '6578f0ab-b554-43d6-8872-4bcf8b0fe1f1',
        name: 'Group 1',
        code: 'Group 1',
        description: '',
        placementDateTime: '2018-02-28T23:55:00.000Z',
        categoryId: '00000000-0000-0000-0000-000000000000',
        displayFormat: 1,
        displayOrder: 1,
        allowedSessionDisplayFields: [1, 2, 8],
        sessions: {
          '9272e9d2-ad86-4e41-9038-267c6d87d38b': {
            categoryId: '00000000-0000-0000-0000-000000000000',
            startTime: '2018-04-14T22:00:00.000Z',
            endTime: '2018-04-14T23:00:00.000Z',
            isOpenForRegistration: true,
            isIncludedSession: false,
            registeredCount: 1,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            displayPriority: 0,
            showOnAgenda: true,
            speakerIds: {},
            code: '',
            description: '',
            id: '9272e9d2-ad86-4e41-9038-267c6d87d38b',
            capacityId: '9272e9d2-ad86-4e41-9038-267c6d87d38b',
            name: 'Session 1',
            status: 2,
            type: 'Session',
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {}
          }
        },
        isPlacementTimeDisplayed: true,
        isSessionSelectionRequired: true,
        isOpenForRegistration: true
      }
    },
    quantityItems: {},
    sessionGroups: {},
    sessions: {},
    sortKeys: {}
  };
});

EventSnapshotClient.prototype.getRegCartVisibleProducts = jest.fn(() => {
  return {
    admissionItems: {
      '2819f92f-e09a-4463-b597-37f5ed1d4335': {
        limitOptionalItemsToSelect: false,
        isOpenForRegistration: true,
        limitGuestsByContactType: false,
        includeWaitlistSessionsTowardsMaximumLimit: false,
        applicableContactTypes: [],
        limitOptionalSessionsToSelect: false,
        associatedOptionalSessions: [],
        applicableOptionalItems: [],
        minimumNumberOfSessionsToSelect: 0,
        availableOptionalSessions: [],
        capacityByGuestContactTypes: [],
        displayOrder: 1,
        code: 'A1 Included Session',
        description: '',
        id: '2819f92f-e09a-4463-b597-37f5ed1d4335',
        capacityId: '2819f92f-e09a-4463-b597-37f5ed1d4335',
        name: 'A1 Included Session',
        status: 2,
        type: 'AdmissionItem',
        defaultFeeId: '00000000-0000-0000-0000-000000000000',
        fees: {}
      }
    },
    sessionProducts: {
      '9272e9d2-ad86-4e41-9038-267c6d87d38b': {
        categoryId: '00000000-0000-0000-0000-000000000000',
        startTime: '2018-04-14T22:00:00.000Z',
        endTime: '2018-04-14T23:00:00.000Z',
        isOpenForRegistration: true,
        isIncludedSession: false,
        registeredCount: 1,
        associatedWithAdmissionItems: [],
        availableToAdmissionItems: [],
        associatedRegistrationTypes: [],
        sessionCustomFieldValues: {},
        displayPriority: 0,
        showOnAgenda: true,
        speakerIds: {},
        code: '',
        description: '',
        id: '9272e9d2-ad86-4e41-9038-267c6d87d38b',
        capacityId: '9272e9d2-ad86-4e41-9038-267c6d87d38b',
        name: 'Session 1',
        status: 2,
        type: 'Session',
        defaultFeeId: '00000000-0000-0000-0000-000000000000',
        fees: {}
      },
      '08a7f564-5c0e-4aa3-99c1-34a27b789161': {
        categoryId: '00000000-0000-0000-0000-000000000000',
        startTime: '2018-04-14T22:00:00.000Z',
        endTime: '2018-04-14T23:00:00.000Z',
        isOpenForRegistration: true,
        isIncludedSession: false,
        registeredCount: 0,
        associatedWithAdmissionItems: [],
        availableToAdmissionItems: [],
        associatedRegistrationTypes: [],
        sessionCustomFieldValues: {},
        displayPriority: 2,
        showOnAgenda: true,
        speakerIds: {},
        code: '',
        description: '',
        id: '08a7f564-5c0e-4aa3-99c1-34a27b789161',
        capacityId: '08a7f564-5c0e-4aa3-99c1-34a27b789161',
        name: 'Session 2',
        status: 2,
        type: 'Session',
        defaultFeeId: '00000000-0000-0000-0000-000000000000',
        fees: {}
      },
      '8e68e719-a008-4120-92ec-4525d83cd54c': {
        categoryId: '00000000-0000-0000-0000-000000000000',
        startTime: '2018-04-14T22:00:00.000Z',
        endTime: '2018-04-14T23:00:00.000Z',
        isOpenForRegistration: true,
        isIncludedSession: true,
        registeredCount: 5,
        associatedWithAdmissionItems: [],
        availableToAdmissionItems: [],
        associatedRegistrationTypes: [],
        sessionCustomFieldValues: {},
        displayPriority: 4,
        showOnAgenda: true,
        speakerIds: {},
        code: '',
        description: '',
        id: '8e68e719-a008-4120-92ec-4525d83cd54c',
        capacityId: '8e68e719-a008-4120-92ec-4525d83cd54c',
        name: 'Included 1',
        status: 2,
        type: 'Session',
        defaultFeeId: '00000000-0000-0000-0000-000000000000',
        fees: {}
      },
      '6578f0ab-b554-43d6-8872-4bcf8b0fe1f1': {
        id: '6578f0ab-b554-43d6-8872-4bcf8b0fe1f1',
        name: 'Group 1',
        code: 'Group 1',
        description: '',
        placementDateTime: '2018-02-28T23:55:00.000Z',
        categoryId: '00000000-0000-0000-0000-000000000000',
        displayFormat: 1,
        displayOrder: 1,
        allowedSessionDisplayFields: [1, 2, 8],
        sessions: {
          '9272e9d2-ad86-4e41-9038-267c6d87d38b': {
            categoryId: '00000000-0000-0000-0000-000000000000',
            startTime: '2018-04-14T22:00:00.000Z',
            endTime: '2018-04-14T23:00:00.000Z',
            isOpenForRegistration: true,
            isIncludedSession: false,
            registeredCount: 1,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            displayPriority: 0,
            showOnAgenda: true,
            speakerIds: {},
            code: '',
            description: '',
            id: '9272e9d2-ad86-4e41-9038-267c6d87d38b',
            capacityId: '9272e9d2-ad86-4e41-9038-267c6d87d38b',
            name: 'Session 1',
            status: 2,
            type: 'Session',
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {}
          }
        },
        isPlacementTimeDisplayed: true,
        isSessionSelectionRequired: true,
        isOpenForRegistration: true
      }
    },
    quantityItems: {},
    sessionGroups: {},
    sessions: {},
    sortKeys: {}
  };
});

LookupClient.prototype.getCurrencies = jest.fn(() => {
  return {
    currencies: {
      1: {
        id: '1',
        iSOCode: 123,
        nameOfSymbol: 'Double Dollars',
        symbol: '$$',
        name: 'Double Dollars',
        resourceKey: 'resourceKey1'
      }
    }
  };
});

CapacityClient.prototype.getCapacitySummaries = jest.fn();

EventFeeClient.prototype.getEventFee = jest.fn();

function getStandardFields() {
  return {
    '2e305875-4f49-4ce3-85f1-abc7d9247c8a': {
      id: '2e305875-4f49-4ce3-85f1-abc7d9247c8a',
      defaultCountry: { name: 'cvt_lu2_0001', value: defaultCountryCode },
      fieldName: workAddressFieldName
    }
  };
}

function getState() {
  return {
    accessToken,
    text: {
      locale,
      translate: () => ''
    },
    eventSnapshotVersion: 'version',
    clients: {
      lookupClient: new LookupClient(baseUrl, eventId, environment),
      productVisibilityClient: new ProductVisibilityClient(baseUrl, eventId, environment),
      capacityClient: new CapacityClient(baseUrl, eventId, environment),
      eventFeeClient: new EventFeeClient(baseUrl, eventId, environment),
      eventSnapshotClient: new EventSnapshotClient(baseUrl, eventId, environment)
    },
    website: {
      ...pageContainingWidgetFixture('pageId', 'widgetId'),
      pluginData: {
        registrationProcessNavigation: {
          registrationPaths: {
            RegPathIdPlaceholder: {
              id: 'RegPathIdPlaceholder',
              pageIds: ['pageId']
            }
          }
        }
      }
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          RegPathIdPlaceholder: {
            registrationPageFields: {
              1: {
                registrationFields: getStandardFields()
              }
            }
          }
        },
        productQuestions: {
          productQuestionId: {
            question: {
              id: 'productQuestionId'
            }
          }
        }
      }
    },
    countries: {
      countries: []
    },
    defaultUserSession: {
      eventId
    },
    userSession: {
      regTypeId: '',
      persistRegType: false
    },
    event: {
      products: {
        admissionItems: {
          admItem1: {
            id: 'admItem1',
            capacityId: 'admItem1'
          }
        },
        sessionContainer: {
          optionalSessions: {
            session1: {
              id: 'session1',
              capacityId: 'session1'
            }
          }
        }
      }
    }
  };
}

describe('Test for EventGuestSideWidgetFactory', () => {
  let eventGuestSideWidgetFactory;
  let lookupClient;
  let store;
  let productVisibilityClient;
  let eventSnapshotClient;
  let eventFeeClient;
  let capacityClient;
  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore(getState());
    eventGuestSideWidgetFactory = new EventGuestSideWidgetFactory();
    lookupClient = store.getState().clients.lookupClient;
    productVisibilityClient = store.getState().clients.productVisibilityClient;
    eventSnapshotClient = store.getState().clients.eventSnapshotClient;
    eventFeeClient = store.getState().clients.eventFeeClient;
    capacityClient = store.getState().clients.capacityClient;
  });
  test('verify metadata loads for all the widget', () => {
    expect(eventGuestSideWidgetFactory.getAllMetaData()).toMatchSnapshot();
  });

  test('verify metadata loads for a single widget', () => {
    expect(eventGuestSideWidgetFactory.loadMetaData('OpenEndedTextQuestion')).toMatchSnapshot();
  });

  test('verify loading of all components', async () => {
    await Promise.all(
      Object.values(eventGuestSideWidgetFactory.getAllMetaData()).map(async metadata => {
        const widget = await eventGuestSideWidgetFactory.loadComponent((metadata as $TSFixMe).type);
        expect(
          typeof widget === 'function' ||
            widget instanceof React.Component ||
            (typeof widget === 'object' && typeof widget.type === 'function')
        ).toBeTruthy();
      })
    );
  });

  test('verify loading of resources for standard contact address field widget', async () => {
    eventGuestSideWidgetFactory = new EventGuestSideWidgetFactory();
    const widget = {
      widgetType: 'EventStandardContactFieldAddress',
      config: {
        fieldId: '2e305875-4f49-4ce3-85f1-abc7d9247c8a',
        registrationFieldPageType: registrationFieldPageType.Registration
      },
      id: 'widgetId'
    };
    await store.dispatch(eventGuestSideWidgetFactory.loadWidgetResources([widget]));
    expect(lookupClient.getStates).toHaveBeenCalledWith(defaultCountryCode, locale);
    expect(store.getActions()).toMatchSnapshot();
  });

  test('verify loading of names for standard contact fields widget', async () => {
    const metadata = eventGuestSideWidgetFactory.loadMetaData('EventStandardContactFieldAddress');
    const widget = {
      config: {
        fieldId: '2e305875-4f49-4ce3-85f1-abc7d9247c8a',
        registrationFieldPageType: registrationFieldPageType.Registration
      },
      id: 'widgetId'
    };
    expect(metadata.name(getState(), widget)).toEqual(workAddressFieldName);
  });

  test('verify appDataFieldPaths for standard contact fields widget', async () => {
    const metadata = eventGuestSideWidgetFactory.loadMetaData('EventStandardContactFieldAddress');
    const config = {
      fieldId: '2e305875-4f49-4ce3-85f1-abc7d9247c8a',
      registrationFieldPageType: registrationFieldPageType.Registration
    };
    expect(metadata.appDataFieldPaths.sectionHeader(getState(), config, 'widgetId')).toMatchSnapshot();
    expect(metadata.appDataFieldPaths.address1(getState(), config, 'widgetId')).toMatchSnapshot();
    expect(metadata.appDataFieldPaths.address2(getState(), config, 'widgetId')).toMatchSnapshot();
    expect(metadata.appDataFieldPaths.city(getState(), config, 'widgetId')).toMatchSnapshot();
  });

  test('verify appDataFieldPaths for standard contact image widget', async () => {
    const metadata = eventGuestSideWidgetFactory.loadMetaData('EventStandardContactFieldImage');
    const config = {
      fieldId: '52844a85-1896-42b6-9cef-78c0629ed1d7',
      registrationFieldPageType: registrationFieldPageType.Registration
    };
    expect(metadata.appDataFieldPaths.displayName(getState(), config, 'widgetId')).toMatchSnapshot();
    expect(metadata.appDataFieldPaths.display(getState(), config, 'widgetId')).toMatchSnapshot();
  });

  test('verify appDataFieldPaths for question widgets', async () => {
    const metadata = eventGuestSideWidgetFactory.loadMetaData('OpenEndedTextQuestion');
    let config = { id: 'questionId' };
    expect(metadata.appDataFieldPaths.question(getState(), config, 'widgetId')).toMatchSnapshot();
    config = { id: 'productQuestionId' };
    expect(metadata.appDataFieldPaths.question(getState(), config, 'widgetId')).toMatchSnapshot();
    const travelState = {
      ...getState(),
      appData: {
        registrationSettings: {
          registrationPaths: {
            RegPathIdPlaceholder: {
              registrationPageFields: {
                1: {
                  registrationFields: getStandardFields()
                }
              }
            }
          },
          productQuestions: {},
          travelQuestions: {
            travelQuestionId: {
              question: {
                id: 'travelQuestionId'
              }
            }
          }
        }
      }
    };
    config = { id: 'travelQuestionId' };
    expect(metadata.appDataFieldPaths.question(travelState, config, 'widgetId')).toMatchSnapshot();
  });

  test('verify loading of resources for registration summary widget', async () => {
    eventGuestSideWidgetFactory = new EventGuestSideWidgetFactory();
    const widget = {
      widgetType: 'RegistrationSummary',
      config: {
        registrationFieldPageType: registrationFieldPageType.Registration
      },
      id: 'regSummaryWidgetId'
    };
    await store.dispatch(eventGuestSideWidgetFactory.loadWidgetResources([widget]));
    expect(productVisibilityClient.getVisibleProducts).toHaveBeenCalledWith(accessToken, eventId, {
      version: 'version',
      widgetType: 'Widget',
      widgetId: null,
      admissionId: null
    });
    expect(store.getActions()).toMatchSnapshot();
  });

  test('verify loading of resources for agenda widget limited by reg type', async () => {
    eventGuestSideWidgetFactory = new EventGuestSideWidgetFactory();
    const widget = {
      widgetType: 'Agenda',
      config: {
        registrationFieldPageType: registrationFieldPageType.Registration,
        display: {
          limitByRegistrationType: true
        }
      },
      id: 'agendaWidgetId'
    };
    CapacityClient.prototype.getCapacitySummaries.mockImplementationOnce(() => {
      return {
        session1: {
          active: true,
          capacityId: 'session1',
          totalCapacityAvailable: -1,
          availableCapacity: -1
        }
      };
    });
    await store.dispatch(eventGuestSideWidgetFactory.loadWidgetResources([widget]));
    expect(productVisibilityClient.getVisibleProducts).toHaveBeenCalledWith(accessToken, eventId, {
      version: 'version',
      widgetType: widget.widgetType,
      widgetId: widget.id,
      registrationTypeId: '00000000-0000-0000-0000-000000000000'
    });
    expect(store.getActions()).toMatchSnapshot();
  });

  test('verify loading of resources for agenda widget for all products without registrant', async () => {
    eventGuestSideWidgetFactory = new EventGuestSideWidgetFactory();
    const widget = {
      widgetType: 'Agenda',
      config: {
        registrationFieldPageType: registrationFieldPageType.Registration
      },
      id: 'agendaWidgetId'
    };
    CapacityClient.prototype.getCapacitySummaries.mockImplementationOnce(() => {
      return {
        session1: {
          active: true,
          capacityId: 'session1',
          totalCapacityAvailable: -1,
          availableCapacity: -1
        }
      };
    });
    await store.dispatch(eventGuestSideWidgetFactory.loadWidgetResources([widget]));
    expect(productVisibilityClient.getVisibleProducts).toHaveBeenCalledWith(accessToken, eventId, {
      version: 'version',
      widgetType: widget.widgetType,
      widgetId: widget.id,
      admissionId: null
    });
    expect(store.getActions()).toMatchSnapshot();
  });

  test('verify loading of resources for invitee agenda widget', async () => {
    eventGuestSideWidgetFactory = new EventGuestSideWidgetFactory();
    const widget = {
      widgetType: 'InviteeAgenda',
      config: {
        registrationFieldPageType: registrationFieldPageType.Registration
      },
      id: 'inviteeAgendaWidgetId'
    };
    await store.dispatch(eventGuestSideWidgetFactory.loadWidgetResources([widget]));
    expect(productVisibilityClient.getVisibleProducts).toHaveBeenCalledWith(accessToken, eventId, {
      version: 'version',
      widgetType: widget.widgetType,
      widgetId: widget.id,
      admissionId: null
    });
    expect(store.getActions()).toMatchSnapshot();
  });

  test('verify loading resources for registration summary widget', async () => {
    eventGuestSideWidgetFactory = new EventGuestSideWidgetFactory();
    const widget = {
      widgetType: 'RegistrationSummary',
      config: {
        registrationFieldPageType: registrationFieldPageType.Registration
      },
      id: 'registrationSummaryWidgetId'
    };
    const initialState = {
      ...getState(),
      registrationForm: {
        regCart: {
          eventRegistrations: {
            '00000000-0000-0000-0000-000000000001': {
              eventId,
              eventRegistrationId: '00000000-0000-0000-0000-000000000001',
              attendee: {
                personalInformation: {},
                eventAnswers: {}
              },
              productRegistrations: [
                {
                  productId: '00000000-0000-0000-0000-000000000002',
                  productType: 'AdmissionItem',
                  quantity: 1,
                  requestedAction: 'REGISTER'
                }
              ]
            }
          }
        }
      }
    };
    store = mockStore(initialState);
    await store.dispatch(eventGuestSideWidgetFactory.loadWidgetResources([widget]));
    expect(productVisibilityClient.getVisibleProducts).toHaveBeenCalledWith(accessToken, eventId, {
      version: 'version',
      widgetType: 'Widget',
      widgetId: null,
      admissionId: '00000000-0000-0000-0000-000000000002'
    });
    expect(store.getActions()).toMatchSnapshot();
  });

  test('verify loading resources for page with admission items and fees', async () => {
    eventGuestSideWidgetFactory = new EventGuestSideWidgetFactory();
    const widgets = [
      {
        widgetType: 'AdmissionItems',
        config: {},
        id: 'AdmissionItemsWidgetId'
      },
      {
        widgetType: 'Fees',
        config: {},
        id: 'FeesWidgetId'
      }
    ];
    const initialState = {
      ...getState()
    };
    store = mockStore(initialState);
    await store.dispatch(eventGuestSideWidgetFactory.loadWidgetResources(widgets));
    expect(productVisibilityClient.getVisibleProducts).toHaveBeenCalled();
    expect(eventFeeClient.getEventFee).toHaveBeenCalled();
  });

  test('verify loading of resources for event location widget', async () => {
    eventGuestSideWidgetFactory = new EventGuestSideWidgetFactory();
    const widget = {
      widgetType: 'EventLocation'
    };
    await store.dispatch(eventGuestSideWidgetFactory.loadWidgetResources([widget]));
    expect(lookupClient.getCountries).toHaveBeenCalledWith(locale);
    expect(store.getActions()).toMatchSnapshot();
  });

  test('verify loading of resources for event session widget', async () => {
    const initialState = {
      ...getState(),
      registrationForm: {
        regCart: {
          eventRegistrations: {
            '00000000-0000-0000-0000-000000000001': {
              eventId,
              eventRegistrationId: '00000000-0000-0000-0000-000000000001',
              attendeeType: 'ATTENDEE'
            }
          }
        }
      }
    };
    store = mockStore(initialState);
    const experiments = {
      flexSessionRendering: 1
    };
    eventGuestSideWidgetFactory = new EventGuestSideWidgetFactory(experiments);
    productVisibilityClient = store.getState().clients.productVisibilityClient;
    const widget = {
      widgetType: 'Sessions'
    };
    CapacityClient.prototype.getCapacitySummaries.mockImplementationOnce(() => {
      return {
        session1: {
          active: true,
          capacityId: 'session1',
          totalCapacityAvailable: -1,
          availableCapacity: -1
        }
      };
    });
    await store.dispatch(eventGuestSideWidgetFactory.loadWidgetResources([widget]));
    expect(productVisibilityClient.getVisibleProducts).toHaveBeenCalledWith(accessToken, eventId, {
      version: 'version',
      registrationTypeId: '00000000-0000-0000-0000-000000000000',
      registrationPathId: undefined,
      primaryRegistrationTypeId: undefined,
      admissionId: null,
      attendeeType: 'ATTENDEE',
      widgetType: widget.widgetType
    });
    expect(store.getActions()).toMatchSnapshot();
  });

  test('verify loading of resources for event session widget with reg mod', async () => {
    const initialState = {
      ...getState(),
      registrationForm: {
        regCart: {
          eventRegistrations: {
            '00000000-0000-0000-0000-000000000001': {
              eventId,
              eventRegistrationId: '00000000-0000-0000-0000-000000000001',
              attendeeType: 'ATTENDEE'
            }
          },
          regMod: true,
          regCartId: '00000000-0000-0000-0000-000000000002'
        }
      }
    };
    store = mockStore(initialState);
    const experiments = {
      flexSessionRendering: 1
    };
    eventGuestSideWidgetFactory = new EventGuestSideWidgetFactory(experiments);
    productVisibilityClient = store.getState().clients.productVisibilityClient;
    const widget = {
      widgetType: 'Sessions'
    };
    CapacityClient.prototype.getCapacitySummaries.mockImplementationOnce(() => {
      return {
        session1: {
          active: true,
          capacityId: 'session1',
          totalCapacityAvailable: -1,
          availableCapacity: -1
        }
      };
    });
    await store.dispatch(eventGuestSideWidgetFactory.loadWidgetResources([widget]));
    expect(eventSnapshotClient.getRegCartVisibleProducts).toHaveBeenCalledWith(accessToken, eventId, {
      version: 'version',
      regCartId: '00000000-0000-0000-0000-000000000002'
    });
    expect(store.getActions()).toMatchSnapshot();
  });

  test('verify loading of resources for appointments meeting interest widget', async () => {
    const initialState = {
      ...getState(),
      registrationForm: {
        regCart: {
          eventRegistrations: {
            '00000000-0000-0000-0000-000000000001': {
              eventId,
              eventRegistrationId: '00000000-0000-0000-0000-000000000001',
              attendeeType: 'ATTENDEE'
            }
          }
        }
      }
    };
    store = mockStore(initialState);
    const metadata = eventGuestSideWidgetFactory.loadMetaData('ApptsMeetingInterest');
    expect(metadata.appDataFieldPaths.companyList(initialState)).toMatchSnapshot();
    expect(metadata.appDataFieldPaths.useInterestLevels(initialState)).toMatchSnapshot();
    expect(metadata.appDataFieldPaths.interestLevelsMenu(initialState)).toMatchSnapshot();
    expect(metadata.appDataFieldPaths.useMeetingTypes(initialState)).toMatchSnapshot();
    expect(metadata.appDataFieldPaths.meetingTypesMenu(initialState)).toMatchSnapshot();
    expect(metadata.appDataFieldPaths.useComments(initialState)).toMatchSnapshot();
    expect(metadata.appDataFieldPaths.limitSelections(initialState)).toMatchSnapshot();
    expect(metadata.appDataFieldPaths.limitSelectionMin(initialState)).toMatchSnapshot();
    expect(metadata.appDataFieldPaths.limitSelectionMax(initialState)).toMatchSnapshot();
    expect(metadata.appDataFieldPaths.useExhibitorData(initialState)).toMatchSnapshot();
  });

  test('verify loading resources for session widget and registration summary widget at the same time', async () => {
    eventGuestSideWidgetFactory = new EventGuestSideWidgetFactory();
    const regSummaryWidget = {
      widgetType: 'RegistrationSummary',
      config: {
        registrationFieldPageType: registrationFieldPageType.Registration
      },
      id: 'registrationSummaryWidgetId'
    };
    const sessionWidget = {
      widgetType: 'Sessions'
    };
    const initialState = {
      ...getState(),
      registrationForm: {
        regCart: {
          eventRegistrations: {
            '00000000-0000-0000-0000-000000000001': {
              eventId,
              eventRegistrationId: '00000000-0000-0000-0000-000000000001',
              attendee: {
                personalInformation: {},
                eventAnswers: {}
              },
              productRegistrations: [
                {
                  productId: '00000000-0000-0000-0000-000000000002',
                  productType: 'AdmissionItem',
                  quantity: 1,
                  requestedAction: 'REGISTER'
                }
              ]
            }
          }
        }
      }
    };
    CapacityClient.prototype.getCapacitySummaries.mockImplementationOnce(() => {
      return {
        session1: {
          active: true,
          capacityId: 'session1',
          totalCapacityAvailable: -1,
          availableCapacity: -1
        }
      };
    });
    store = mockStore(initialState);
    await store.dispatch(eventGuestSideWidgetFactory.loadWidgetResources([sessionWidget, regSummaryWidget]));
    expect(capacityClient.getCapacitySummaries).toHaveBeenCalledTimes(2);
    expect(productVisibilityClient.getVisibleProducts).toHaveBeenCalledWith(accessToken, eventId, {
      version: 'version',
      widgetType: 'Widget',
      widgetId: null,
      admissionId: '00000000-0000-0000-0000-000000000002'
    });
    expect(store.getActions()).toMatchSnapshot();
    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        {
          payload: {
            capacity: {
              session1: {
                active: true,
                availableCapacity: -1,
                capacityId: 'session1',
                totalCapacityAvailable: -1
              }
            }
          },
          type: 'event-widgets/capacity/LOAD_CAPACITY'
        },
        {
          payload: { capacity: undefined },
          type: 'event-widgets/capacity/LOAD_EVENT_REGISTRATION_CAPACITY'
        }
      ])
    );
  });

  test('verify hotel request resources are not loaded if passkey is enabled', async () => {
    const initialState = {
      ...getState(),
      eventTravel: {
        hotelsData: {
          isPasskeyEnabled: true
        }
      }
    };
    store = mockStore(initialState);
    const widget = {
      widgetType: 'HotelRequest'
    };
    eventGuestSideWidgetFactory = new EventGuestSideWidgetFactory();
    await store.dispatch(eventGuestSideWidgetFactory.loadWidgetResources([widget]));
    expect(capacityClient.getCapacitySummaries).not.toHaveBeenCalled();
    expect(store.getActions()).toMatchSnapshot();
  });
});
