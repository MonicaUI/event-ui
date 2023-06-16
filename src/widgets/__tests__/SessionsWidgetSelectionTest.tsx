import React from 'react';
import renderer from 'react-test-renderer';
import SessionsWidgetComponent from '../SessionsWidget';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { selectSession } from '../../redux/registrationForm/regCart/sessions';
import { REGISTERING } from '../../redux/registrationIntents';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';

jest.mock('../../redux/registrationForm/regCart/sessions');

let plannerReg = false;
let filterKeyword = '';

const getAttendeeLinkDataMock = jest.fn();
getAttendeeLinkDataMock.mockReturnValue(
  Promise.resolve({
    paging: {
      _links: {
        self: {
          href: 'https://api-platform-dev.cvent.com/ea-staging/webcasts/attendee-links?token=43a4cf41-e2de-4e1e-9be0-8aaf60bd5571'
        }
      },
      limit: 100,
      totalCount: 2,
      currentToken: '43a4cf41-e2de-4e1e-9be0-8aaf60bd5571'
    },
    data: [
      {
        id: '990c56b3-f478-4e96-a37c-479ed423aad1',
        created: '2021-01-13T10:38:33.308Z',
        createdBy: 'nneopane-02@j.mail',
        lastModified: '2021-01-13T10:38:33.308Z',
        lastModifiedBy: 'nneopane-02@j.mail',
        webcast: {
          id: 'f6e033f4-9793-4de3-9575-0cd008dcaffe'
        },
        event: {
          id: '673e74b2-b699-442d-9e73-b6ac70cc09be'
        },
        session: {
          id: '4ff6e279-85c5-4935-b3a2-26f025095982'
        },
        attendee: {
          id: '5c7b8277-733c-4753-ae7d-1eecd1a7e361'
        },
        sourceId: 'attendee link data',
        join: {
          href: 'attendee link data',
          code: 'attendee link data'
        }
      }
    ]
  })
);

function getDefaultState() {
  return {
    appData: {
      registrationSettings: {
        registrationPaths: {
          'b5463d12-2f6f-4696-9b30-e38aa4144b86': {
            isGuestProductSelectionEnabled: false
          }
        }
      },
      timeZoneSetting: {
        displayTimeZone: true,
        selectedWidgets: ['sessions']
      }
    },
    experiments: {
      flexProductVersion: 34
    },
    transparentWrapper: {
      showTransparentWrapper: false
    },
    spinnerSelection: {
      pendingSpinnerSelection: ''
    },
    event: {
      timezone: 35,
      products: {
        sessionContainer: {
          includedSessions: {},
          optionalSessions: {
            FreeSession: {
              associatedRegistrationTypes: [],
              associatedWithAdmissionItems: [],
              availableToAdmissionItems: [],
              capacityId: 'unlimitedCapacity',
              categoryId: 'WorkShopsCategory',
              code: 'FS',
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              description: '',
              displayPriority: 0,
              endTime: '2018-04-27T23:00:00.000Z',
              fees: {},
              id: 'FreeSession',
              isIncludedSession: false,
              isOpenForRegistration: true,
              name: 'Free Session',
              registeredCount: 0,
              sessionCustomFieldValues: {},
              showOnAgenda: true,
              speakerIds: {},
              startTime: '2018-04-27T22:00:00.000Z',
              status: 2,
              type: 'Session'
            },
            ClosedSession: {
              associatedRegistrationTypes: [],
              associatedWithAdmissionItems: [],
              availableToAdmissionItems: [],
              capacityId: 'unlimitedCapacity',
              categoryId: '00000000-0000-0000-0000-000000000000',
              code: 'CS',
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              description: '',
              displayPriority: 0,
              endTime: '2018-04-27T23:00:00.000Z',
              fees: {},
              id: 'ClosedSession',
              isIncludedSession: false,
              isOpenForRegistration: false,
              name: 'Closed Session',
              registeredCount: 0,
              sessionCustomFieldValues: {},
              showOnAgenda: true,
              speakerIds: {},
              startTime: '2018-04-27T22:00:00.000Z',
              status: 2,
              type: 'Session'
            },
            CancelledSession: {
              associatedRegistrationTypes: [],
              associatedWithAdmissionItems: [],
              availableToAdmissionItems: [],
              capacityId: 'unlimitedCapacity',
              categoryId: '00000000-0000-0000-0000-000000000000',
              code: 'CAS',
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              description: '',
              displayPriority: 0,
              endTime: '2018-04-27T23:00:00.000Z',
              fees: {},
              id: 'CancelledSession',
              isIncludedSession: false,
              isOpenForRegistration: false,
              name: 'Cancelled Session',
              registeredCount: 0,
              sessionCustomFieldValues: {},
              showOnAgenda: false,
              speakerIds: {},
              startTime: '2018-04-27T22:00:00.000Z',
              status: 7,
              type: 'Session'
            },
            FullSession: {
              associatedRegistrationTypes: [],
              associatedWithAdmissionItems: [],
              availableToAdmissionItems: [],
              capacity: 2,
              capacityId: 'fullCapacity',
              categoryId: '00000000-0000-0000-0000-000000000000',
              code: 'Full Session',
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              description: '',
              displayPriority: 0,
              endTime: '2018-04-27T23:00:00.000Z',
              fees: {},
              id: 'FullSession',
              isIncludedSession: false,
              isOpenForRegistration: true,
              name: 'Full Session',
              registeredCount: 0,
              sessionCustomFieldValues: {},
              showOnAgenda: true,
              speakerIds: {},
              startTime: '2018-04-27T22:00:00.000Z',
              status: 2,
              type: 'Session'
            },
            SessionWithFee: {
              associatedRegistrationTypes: [],
              associatedWithAdmissionItems: [],
              availableToAdmissionItems: [],
              capacityId: 'unlimitedCapacity',
              categoryId: '00000000-0000-0000-0000-000000000000',
              code: 'SWF',
              defaultFeeId: 'd13a6096-1d67-423b-b299-b8ff374500c4',
              description: '',
              displayPriority: 0,
              endTime: '2018-04-27T23:00:00.000Z',
              fees: {
                'd13a6096-1d67-423b-b299-b8ff374500c4': {
                  amount: 100,
                  chargePolicies: [
                    {
                      amount: 100,
                      effectiveUntil: '2999-12-31T00:00:00.000Z',
                      id: 'a5704516-54d0-41b7-be83-8fabb85327ab',
                      isActive: true,
                      maximumRefundAmount: 100
                    }
                  ],
                  id: 'd13a6096-1d67-423b-b299-b8ff374500c4',
                  isActive: true,
                  isRefundable: true,
                  name: 'Attendance',
                  refundPolicies: [],
                  registrationTypes: []
                }
              },
              id: 'SessionWithFee',
              isIncludedSession: false,
              isOpenForRegistration: true,
              name: 'Session with Fee',
              registeredCount: 0,
              sessionCustomFieldValues: {},
              showOnAgenda: true,
              speakerIds: {},
              startTime: '2018-04-27T22:00:00.000Z',
              status: 2,
              type: 'Session'
            }
          },
          sessionCategoryListOrders: {
            WorkShopsCategory: {
              categoryId: 'WorkShopsCategory',
              categoryOrder: 1
            }
          },
          sessionGroups: {
            SessionGroup: {
              allowedSessionDisplayFields: [1, 2, 8],
              categoryId: '00000000-0000-0000-0000-000000000000',
              code: 'Group',
              description: '',
              displayFormat: 1,
              displayOrder: 1,
              id: 'SessionGroup',
              isOpenForRegistration: true,
              isPlacementTimeDisplayed: true,
              isSessionSelectionRequired: false,
              name: 'Group',
              placementDateTime: '2018-02-27T00:00:00.000Z',
              sessions: {
                ClosedSessionInGroup: {
                  associatedRegistrationTypes: [],
                  associatedWithAdmissionItems: [],
                  availableToAdmissionItems: [],
                  capacityId: 'unlimitedCapacity',
                  categoryId: '00000000-0000-0000-0000-000000000000',
                  code: 'SiGC',
                  defaultFeeId: 'd83ab588-3d3b-4b8c-a613-2084506dd306',
                  description: '',
                  displayPriority: 0,
                  endTime: '2018-04-27T23:00:00.000Z',
                  fees: {
                    'd83ab588-3d3b-4b8c-a613-2084506dd306': {
                      amount: 100,
                      chargePolicies: [
                        {
                          amount: 100,
                          effectiveUntil: '2999-12-31T00:00:00.000Z',
                          id: 'b151d75b-6217-4eb7-b272-643af54c1fc7',
                          isActive: true,
                          maximumRefundAmount: 100
                        }
                      ],
                      id: 'd83ab588-3d3b-4b8c-a613-2084506dd306',
                      isActive: true,
                      isRefundable: true,
                      name: 'Attendance',
                      refundPolicies: [],
                      registrationTypes: []
                    }
                  },
                  id: 'ClosedSessionInGroup',
                  isIncludedSession: false,
                  isOpenForRegistration: false,
                  name: 'Session in Group Closed',
                  registeredCount: 0,
                  sessionCustomFieldValues: {},
                  showOnAgenda: true,
                  speakerIds: {},
                  startTime: '2018-04-27T22:00:00.000Z',
                  status: 2,
                  type: 'Session'
                },
                FreeSessionInGroup: {
                  associatedRegistrationTypes: [],
                  associatedWithAdmissionItems: [],
                  availableToAdmissionItems: [],
                  capacityId: 'unlimitedCapacity',
                  categoryId: '00000000-0000-0000-0000-000000000000',
                  code: 'FSiG',
                  defaultFeeId: '00000000-0000-0000-0000-000000000000',
                  description: '',
                  displayPriority: 0,
                  endTime: '2018-04-27T23:00:00.000Z',
                  fees: {},
                  id: 'FreeSessionInGroup',
                  isIncludedSession: false,
                  isOpenForRegistration: true,
                  name: 'Free Session in Group',
                  registeredCount: 0,
                  sessionCustomFieldValues: {},
                  showOnAgenda: true,
                  speakerIds: {},
                  startTime: '2018-04-27T22:00:00.000Z',
                  status: 2,
                  type: 'Session'
                },
                SessionInGroupWithFee: {
                  associatedRegistrationTypes: [],
                  associatedWithAdmissionItems: [],
                  availableToAdmissionItems: [],
                  capacityId: 'unlimitedCapacity',
                  categoryId: '00000000-0000-0000-0000-000000000000',
                  code: 'SiG',
                  defaultFeeId: 'db050cd9-a3f5-4b05-81f0-ed36723694db',
                  description: '',
                  displayPriority: 0,
                  endTime: '2018-04-27T23:00:00.000Z',
                  fees: {
                    'db050cd9-a3f5-4b05-81f0-ed36723694db': {
                      amount: 100,
                      chargePolicies: [
                        {
                          amount: 100,
                          effectiveUntil: '2999-12-31T00:00:00.000Z',
                          id: 'a9665771-b0bd-45d8-ab59-944a96d8cf29',
                          isActive: true,
                          maximumRefundAmount: 100
                        }
                      ],
                      id: 'db050cd9-a3f5-4b05-81f0-ed36723694db',
                      isActive: true,
                      isRefundable: true,
                      name: 'Attendance',
                      refundPolicies: [],
                      registrationTypes: []
                    }
                  },
                  id: 'SessionInGroupWithFee',
                  isIncludedSession: false,
                  isOpenForRegistration: true,
                  name: 'Session in Group',
                  registeredCount: 0,
                  sessionCustomFieldValues: {},
                  showOnAgenda: true,
                  speakerIds: {},
                  startTime: '2018-04-27T22:00:00.000Z',
                  status: 2,
                  type: 'Session'
                }
              }
            }
          },
          sessionBundles: {}
        }
      }
    },
    website: {
      pluginData: {
        registrationProcessNavigation: {
          registrationPaths: {
            regPathId: {
              pageIds: ['regProcessStep1', 'regPage:Sessions', 'regPage:Payment']
            }
          }
        }
      },
      layoutItems: {
        'widget:sessions': {
          id: 'widget:sessions',
          widgetType: 'Sessions',
          config: {
            sort: {
              selectedSortOrder: ['startDate', 'startTime', 'category']
            }
          }
        }
      },
      theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
    },
    pathInfo: {
      currentPageId: 'regPage:Sessions'
    },
    registrationForm: {
      currentEventRegistrationId: 'eventRegistrationId',
      regCart: {
        regCartId: 'regCartId',
        eventRegistrations: {
          eventRegistrationId: 'eventRegistrationId'
        }
      }
    },
    regCartStatus: {
      staregistrationIntenttus: REGISTERING
    },
    capacity: {
      unlimitedCapacity: {
        active: true,
        availableCapacity: -1,
        capacityId: 'unlimitedCapacity',
        totalCapacityAvailable: -1
      },
      fullCapacity: {
        active: true,
        availableCapacity: 0,
        capacityId: 'fullCapacity',
        totalCapacityAvailable: 0
      }
    },
    text: {
      resolver: {
        date: () => 'some date ',
        currency: x => x
      },
      translate: x => x,
      translateDate: (value, format) => {
        if (format === 'date') {
          return value.toUTCString().split(' ').slice(0, 4).join(' ');
        }
        return value.toUTCString();
      },
      translateTime: value => {
        return value.toISOString().slice(11, 16);
      }
    },
    timezones: {
      35: {
        id: 35,
        name: 'Eastern Time',
        nameResourceKey: 'Event_Timezone_Name_35__resx',
        plannerDisplayName: '(GMT-05:00) Eastern [US & Canada]',
        hasDst: true,
        utcOffset: -300,
        abbreviation: 'ET',
        abbreviationResourceKey: 'Event_Timezone_Abbr_35__resx',
        dstInfo: []
      }
    },
    account: {
      sessionCategories: {
        WorkShopsCategory: {
          id: 'WorkShopsCategory',
          name: 'Workshops',
          description: ''
        }
      },
      sessionCustomFields: []
    },
    defaultUserSession: {
      isPlanner: plannerReg
    },
    sessionFilters: {
      keywordFilterValue: filterKeyword,
      selectedFilterChoices: {}
    },
    clients: {
      universalWebcastClient: {
        getAttendeeLinkData: getAttendeeLinkDataMock
      }
    }
  };
}
function getState() {
  if (plannerReg) {
    return {
      ...getDefaultState(),
      ...getVisibleProductsWithClosedSessions()
    };
  }
  return {
    ...getDefaultState(),
    ...getVisibleProducts()
  };
}

function getVisibleProducts() {
  return {
    visibleProducts: {
      Sessions: {
        eventRegistrationId: {
          sessionProducts: {
            SessionGroup: {
              allowedSessionDisplayFields: [1, 2, 8],
              categoryId: '00000000-0000-0000-0000-000000000000',
              code: 'Group',
              description: '',
              displayFormat: 1,
              displayOrder: 1,
              id: 'SessionGroup',
              isOpenForRegistration: true,
              isPlacementTimeDisplayed: true,
              isSessionSelectionRequired: false,
              name: 'Group',
              placementDateTime: '2018-02-27T00:00:00.000Z',
              sessions: {
                FreeSessionInGroup: {
                  associatedRegistrationTypes: [],
                  associatedWithAdmissionItems: [],
                  availableToAdmissionItems: [],
                  capacityId: 'unlimitedCapacity',
                  categoryId: '00000000-0000-0000-0000-000000000000',
                  code: 'FSiG',
                  defaultFeeId: '00000000-0000-0000-0000-000000000000',
                  description: '',
                  displayPriority: 0,
                  endTime: '2018-04-27T23:00:00.000Z',
                  fees: {},
                  id: 'FreeSessionInGroup',
                  isIncludedSession: false,
                  isOpenForRegistration: true,
                  name: 'Free Session in Group',
                  registeredCount: 0,
                  sessionCustomFieldValues: {},
                  showOnAgenda: true,
                  speakerIds: {},
                  startTime: '2018-04-27T22:00:00.000Z',
                  status: 2,
                  type: 'Session'
                },
                SessionInGroupWithFee: {
                  associatedRegistrationTypes: [],
                  associatedWithAdmissionItems: [],
                  availableToAdmissionItems: [],
                  capacityId: 'unlimitedCapacity',
                  categoryId: '00000000-0000-0000-0000-000000000000',
                  code: 'SiG',
                  defaultFeeId: 'db050cd9-a3f5-4b05-81f0-ed36723694db',
                  description: '',
                  displayPriority: 0,
                  endTime: '2018-04-27T23:00:00.000Z',
                  fees: {
                    'db050cd9-a3f5-4b05-81f0-ed36723694db': {
                      amount: 100,
                      chargePolicies: [
                        {
                          amount: 100,
                          effectiveUntil: '2999-12-31T00:00:00.000Z',
                          id: 'a9665771-b0bd-45d8-ab59-944a96d8cf29',
                          isActive: true,
                          maximumRefundAmount: 100
                        }
                      ],
                      id: 'db050cd9-a3f5-4b05-81f0-ed36723694db',
                      isActive: true,
                      isRefundable: true,
                      name: 'Attendance',
                      refundPolicies: [],
                      registrationTypes: []
                    }
                  },
                  id: 'SessionInGroupWithFee',
                  isIncludedSession: false,
                  isOpenForRegistration: true,
                  name: 'Session in Group',
                  registeredCount: 0,
                  sessionCustomFieldValues: {},
                  showOnAgenda: true,
                  speakerIds: {},
                  startTime: '2018-04-27T22:00:00.000Z',
                  status: 2,
                  type: 'Session'
                }
              }
            },
            FreeSession: {
              associatedRegistrationTypes: [],
              associatedWithAdmissionItems: [],
              availableToAdmissionItems: [],
              capacityId: 'unlimitedCapacity',
              categoryId: 'WorkShopsCategory',
              code: 'FS',
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              description: '',
              displayPriority: 0,
              endTime: '2018-04-27T23:00:00.000Z',
              fees: {},
              id: 'FreeSession',
              isIncludedSession: false,
              isOpenForRegistration: true,
              name: 'Free Session',
              registeredCount: 0,
              sessionCustomFieldValues: {},
              showOnAgenda: true,
              speakerIds: {},
              startTime: '2018-04-27T22:00:00.000Z',
              status: 2,
              type: 'Session'
            },
            FullSession: {
              associatedRegistrationTypes: [],
              associatedWithAdmissionItems: [],
              availableToAdmissionItems: [],
              capacity: 2,
              capacityId: 'fullCapacity',
              categoryId: '00000000-0000-0000-0000-000000000000',
              code: 'Full Session',
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              description: '',
              displayPriority: 0,
              endTime: '2018-04-27T23:00:00.000Z',
              fees: {},
              id: 'FullSession',
              isIncludedSession: false,
              isOpenForRegistration: true,
              name: 'Full Session',
              registeredCount: 0,
              sessionCustomFieldValues: {},
              showOnAgenda: true,
              speakerIds: {},
              startTime: '2018-04-27T22:00:00.000Z',
              status: 2,
              type: 'Session'
            },
            SessionWithFee: {
              associatedRegistrationTypes: [],
              associatedWithAdmissionItems: [],
              availableToAdmissionItems: [],
              capacityId: 'unlimitedCapacity',
              categoryId: '00000000-0000-0000-0000-000000000000',
              code: 'SWF',
              defaultFeeId: 'd13a6096-1d67-423b-b299-b8ff374500c4',
              description: '',
              displayPriority: 0,
              endTime: '2018-04-27T23:00:00.000Z',
              fees: {
                'd13a6096-1d67-423b-b299-b8ff374500c4': {
                  amount: 100,
                  chargePolicies: [
                    {
                      amount: 100,
                      effectiveUntil: '2999-12-31T00:00:00.000Z',
                      id: 'a5704516-54d0-41b7-be83-8fabb85327ab',
                      isActive: true,
                      maximumRefundAmount: 100
                    }
                  ],
                  id: 'd13a6096-1d67-423b-b299-b8ff374500c4',
                  isActive: true,
                  isRefundable: true,
                  name: 'Attendance',
                  refundPolicies: [],
                  registrationTypes: []
                }
              },
              id: 'SessionWithFee',
              isIncludedSession: false,
              isOpenForRegistration: true,
              name: 'Session with Fee',
              registeredCount: 0,
              sessionCustomFieldValues: {},
              showOnAgenda: true,
              speakerIds: {},
              startTime: '2018-04-27T22:00:00.000Z',
              status: 2,
              type: 'Session'
            }
          },
          sortKeys: {
            SessionGroup: ['startDate', 'startTime', 'category'],
            FreeSessionInGroup: ['startDate', 'startTime', 'category'],
            SessionInGroupWithFee: ['startDate', 'startTime', 'category'],
            FreeSession: ['startDate', 'startTime', 'category'],
            FullSession: ['startDate', 'startTime', 'category'],
            SessionWithFee: ['startDate', 'startTime', 'category']
          }
        }
      }
    }
  };
}
function getVisibleProductsWithClosedSessions() {
  return {
    visibleProducts: {
      Sessions: {
        eventRegistrationId: {
          sessionProducts: {
            SessionGroup: {
              allowedSessionDisplayFields: [1, 2, 8],
              categoryId: '00000000-0000-0000-0000-000000000000',
              code: 'Group',
              description: '',
              displayFormat: 1,
              displayOrder: 1,
              id: 'SessionGroup',
              isOpenForRegistration: true,
              isPlacementTimeDisplayed: true,
              isSessionSelectionRequired: false,
              name: 'Group',
              placementDateTime: '2018-02-27T00:00:00.000Z',
              sessions: {
                ClosedSessionInGroup: {
                  associatedRegistrationTypes: [],
                  associatedWithAdmissionItems: [],
                  availableToAdmissionItems: [],
                  capacityId: 'unlimitedCapacity',
                  categoryId: '00000000-0000-0000-0000-000000000000',
                  code: 'SiGC',
                  defaultFeeId: 'd83ab588-3d3b-4b8c-a613-2084506dd306',
                  description: '',
                  displayPriority: 0,
                  endTime: '2018-04-27T23:00:00.000Z',
                  fees: {
                    'd83ab588-3d3b-4b8c-a613-2084506dd306': {
                      amount: 100,
                      chargePolicies: [
                        {
                          amount: 100,
                          effectiveUntil: '2999-12-31T00:00:00.000Z',
                          id: 'b151d75b-6217-4eb7-b272-643af54c1fc7',
                          isActive: true,
                          maximumRefundAmount: 100
                        }
                      ],
                      id: 'd83ab588-3d3b-4b8c-a613-2084506dd306',
                      isActive: true,
                      isRefundable: true,
                      name: 'Attendance',
                      refundPolicies: [],
                      registrationTypes: []
                    }
                  },
                  id: 'ClosedSessionInGroup',
                  isIncludedSession: false,
                  isOpenForRegistration: false,
                  name: 'Session in Group Closed',
                  registeredCount: 0,
                  sessionCustomFieldValues: {},
                  showOnAgenda: true,
                  speakerIds: {},
                  startTime: '2018-04-27T22:00:00.000Z',
                  status: 2,
                  type: 'Session'
                },
                FreeSessionInGroup: {
                  associatedRegistrationTypes: [],
                  associatedWithAdmissionItems: [],
                  availableToAdmissionItems: [],
                  capacityId: 'unlimitedCapacity',
                  categoryId: '00000000-0000-0000-0000-000000000000',
                  code: 'FSiG',
                  defaultFeeId: '00000000-0000-0000-0000-000000000000',
                  description: '',
                  displayPriority: 0,
                  endTime: '2018-04-27T23:00:00.000Z',
                  fees: {},
                  id: 'FreeSessionInGroup',
                  isIncludedSession: false,
                  isOpenForRegistration: true,
                  name: 'Free Session in Group',
                  registeredCount: 0,
                  sessionCustomFieldValues: {},
                  showOnAgenda: true,
                  speakerIds: {},
                  startTime: '2018-04-27T22:00:00.000Z',
                  status: 2,
                  type: 'Session'
                },
                SessionInGroupWithFee: {
                  associatedRegistrationTypes: [],
                  associatedWithAdmissionItems: [],
                  availableToAdmissionItems: [],
                  capacityId: 'unlimitedCapacity',
                  categoryId: '00000000-0000-0000-0000-000000000000',
                  code: 'SiG',
                  defaultFeeId: 'db050cd9-a3f5-4b05-81f0-ed36723694db',
                  description: '',
                  displayPriority: 0,
                  endTime: '2018-04-27T23:00:00.000Z',
                  fees: {
                    'db050cd9-a3f5-4b05-81f0-ed36723694db': {
                      amount: 100,
                      chargePolicies: [
                        {
                          amount: 100,
                          effectiveUntil: '2999-12-31T00:00:00.000Z',
                          id: 'a9665771-b0bd-45d8-ab59-944a96d8cf29',
                          isActive: true,
                          maximumRefundAmount: 100
                        }
                      ],
                      id: 'db050cd9-a3f5-4b05-81f0-ed36723694db',
                      isActive: true,
                      isRefundable: true,
                      name: 'Attendance',
                      refundPolicies: [],
                      registrationTypes: []
                    }
                  },
                  id: 'SessionInGroupWithFee',
                  isIncludedSession: false,
                  isOpenForRegistration: true,
                  name: 'Session in Group',
                  registeredCount: 0,
                  sessionCustomFieldValues: {},
                  showOnAgenda: true,
                  speakerIds: {},
                  startTime: '2018-04-27T22:00:00.000Z',
                  status: 2,
                  type: 'Session'
                }
              }
            },
            FreeSession: {
              associatedRegistrationTypes: [],
              associatedWithAdmissionItems: [],
              availableToAdmissionItems: [],
              capacityId: 'unlimitedCapacity',
              categoryId: 'WorkShopsCategory',
              code: 'FS',
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              description: '',
              displayPriority: 0,
              endTime: '2018-04-27T23:00:00.000Z',
              fees: {},
              id: 'FreeSession',
              isIncludedSession: false,
              isOpenForRegistration: true,
              name: 'Free Session',
              registeredCount: 0,
              sessionCustomFieldValues: {},
              showOnAgenda: true,
              speakerIds: {},
              startTime: '2018-04-27T22:00:00.000Z',
              status: 2,
              type: 'Session'
            },
            ClosedSession: {
              associatedRegistrationTypes: [],
              associatedWithAdmissionItems: [],
              availableToAdmissionItems: [],
              capacityId: 'unlimitedCapacity',
              categoryId: '00000000-0000-0000-0000-000000000000',
              code: 'CS',
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              description: '',
              displayPriority: 0,
              endTime: '2018-04-27T23:00:00.000Z',
              fees: {},
              id: 'ClosedSession',
              isIncludedSession: false,
              isOpenForRegistration: false,
              name: 'Closed Session',
              registeredCount: 0,
              sessionCustomFieldValues: {},
              showOnAgenda: true,
              speakerIds: {},
              startTime: '2018-04-27T22:00:00.000Z',
              status: 2,
              type: 'Session'
            },
            FullSession: {
              associatedRegistrationTypes: [],
              associatedWithAdmissionItems: [],
              availableToAdmissionItems: [],
              capacity: 2,
              capacityId: 'fullCapacity',
              categoryId: '00000000-0000-0000-0000-000000000000',
              code: 'Full Session',
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              description: '',
              displayPriority: 0,
              endTime: '2018-04-27T23:00:00.000Z',
              fees: {},
              id: 'FullSession',
              isIncludedSession: false,
              isOpenForRegistration: true,
              name: 'Full Session',
              registeredCount: 0,
              sessionCustomFieldValues: {},
              showOnAgenda: true,
              speakerIds: {},
              startTime: '2018-04-27T22:00:00.000Z',
              status: 2,
              type: 'Session'
            },
            SessionWithFee: {
              associatedRegistrationTypes: [],
              associatedWithAdmissionItems: [],
              availableToAdmissionItems: [],
              capacityId: 'unlimitedCapacity',
              categoryId: '00000000-0000-0000-0000-000000000000',
              code: 'SWF',
              defaultFeeId: 'd13a6096-1d67-423b-b299-b8ff374500c4',
              description: '',
              displayPriority: 0,
              endTime: '2018-04-27T23:00:00.000Z',
              fees: {
                'd13a6096-1d67-423b-b299-b8ff374500c4': {
                  amount: 100,
                  chargePolicies: [
                    {
                      amount: 100,
                      effectiveUntil: '2999-12-31T00:00:00.000Z',
                      id: 'a5704516-54d0-41b7-be83-8fabb85327ab',
                      isActive: true,
                      maximumRefundAmount: 100
                    }
                  ],
                  id: 'd13a6096-1d67-423b-b299-b8ff374500c4',
                  isActive: true,
                  isRefundable: true,
                  name: 'Attendance',
                  refundPolicies: [],
                  registrationTypes: []
                }
              },
              id: 'SessionWithFee',
              isIncludedSession: false,
              isOpenForRegistration: true,
              name: 'Session with Fee',
              registeredCount: 0,
              sessionCustomFieldValues: {},
              showOnAgenda: true,
              speakerIds: {},
              startTime: '2018-04-27T22:00:00.000Z',
              status: 2,
              type: 'Session'
            }
          },
          sortKeys: {
            SessionGroup: ['startDate', 'startTime', 'category'],
            ClosedSessionInGroup: ['startDate', 'startTime', 'category'],
            FreeSessionInGroup: ['startDate', 'startTime', 'category'],
            SessionInGroupWithFee: ['startDate', 'startTime', 'category'],
            FreeSession: ['startDate', 'startTime', 'category'],
            ClosedSession: ['startDate', 'startTime', 'category'],
            FullSession: ['startDate', 'startTime', 'category'],
            SessionWithFee: ['startDate', 'startTime', 'category']
          }
        }
      }
    }
  };
}

async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState);
  }
}

function translateDate(value, format) {
  return `${format}:${value.toISOString().slice(0, 10)}`;
}

function keyDownHandler(event) {
  if (this.props.showTransparentWrapper && (event.keyCode === 9 || event.keyCode === 13)) {
    event.preventDefault();
  }
}

const subscribe = () => {};
const defaultProps = {
  classes: {},
  style: {
    palette: {},
    elements: {
      link: {}
    }
  },
  translate: (res, opts) => (opts ? `${res}:${JSON.stringify(opts)}` : res),
  translateDate,
  translateTime: value => {
    return value.toISOString().slice(11, 16);
  },
  config: {
    headerText: 'Header',
    instructionalText: 'Instructional text',
    display: {
      capacity: true,
      description: true,
      fees: true,
      code: true,
      locationName: false,
      sessionCustomField: false
    },
    sessionBundles: {
      sessionBundlesDisplay: {
        capacity: true,
        code: true,
        description: true,
        fees: true,
        includedSessionsLink: true
      },
      sessionBundlesHeaderText: 'Header Text',
      sessionBundlesInstructionalText: 'Instructional Text'
    },
    filter: {
      displayKeywordFilter: true,
      selectedFilterOrder: []
    },
    sort: {
      selectedSortOrder: ['startDate', 'startTime', 'category']
    }
  },
  timeZone: 'ET',
  isRegistrationPage: true,
  isGuest: true,
  isPlanner: false,
  isRegMod: false,
  id: 'widget:sessions',
  'data-cvent-id': 'widget-Sessions-widget:sessions',
  store: { dispatch, getState, subscribe },
  onKeyDown: { keyDownHandler },
  layout: {
    cellSize: 4
  }
};

function SessionsWidget(props) {
  return (
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    <Provider store={defaultProps.store}>
      <SessionsWidgetComponent {...props} />
    </Provider>
  );
}

describe('SessionsSelectionTest', () => {
  test('should render', () => {
    const component = renderer.create(<SessionsWidget {...defaultProps} />);
    expect(component).toMatchSnapshot();
  });

  test('should be able to select multiple sessions', () => {
    const widget = mount(<SessionsWidget {...defaultProps} />);
    widget
      .find('[data-cvent-id="session-FreeSession-section"]')
      .find('[data-cvent-id="select-button"]')
      .hostNodes()
      .simulate('click');
    expect(selectSession).toHaveBeenCalled();

    widget
      .find('[data-cvent-id="session-SessionWithFee-section"]')
      .find('[data-cvent-id="select-button"]')
      .hostNodes()
      .simulate('click');
    expect(selectSession).toHaveBeenCalled();
  });

  test('should not be able to select full session', () => {
    const widget = mount(<SessionsWidget {...defaultProps} />);
    const hasSelectButton = widget
      .find('[data-cvent-id="session-FullSession-section"]')
      .find('[data-cvent-id="select-button"]')
      .exists();
    expect(hasSelectButton).toBe(false);
  });

  test('should not see closed session', () => {
    const widget = mount(<SessionsWidget {...defaultProps} />);
    const hasClosedSession = widget.find('[data-cvent-id="session-ClosedSession-section"]').exists();
    expect(hasClosedSession).toBe(false);
  });

  test('should not see cancelled session', () => {
    const widget = mount(<SessionsWidget {...defaultProps} />);
    const hasCancelledSession = widget.find('[data-cvent-id="session-CancelledSession-section"]').exists();
    expect(hasCancelledSession).toBe(false);
  });
});

describe('PlannerRegSessionsSelectionTest', () => {
  test('should render', () => {
    plannerReg = true;
    const component = renderer.create(<SessionsWidget {...defaultProps} />);
    expect(component).toMatchSnapshot();
    plannerReg = false;
  });

  test('should be able to select full session', () => {
    plannerReg = true;
    const widget = mount(<SessionsWidget {...defaultProps} />);
    widget
      .find('[data-cvent-id="session-FullSession-section"]')
      .find('[data-cvent-id="select-button"]')
      .hostNodes()
      .simulate('click');
    expect(selectSession).toHaveBeenCalled();
    plannerReg = false;
  });

  test('should be able to select closed session', () => {
    plannerReg = true;
    const widget = mount(<SessionsWidget {...defaultProps} />);
    widget
      .find('[data-cvent-id="session-ClosedSession-section"]')
      .find('[data-cvent-id="select-button"]')
      .hostNodes()
      .simulate('click');
    expect(selectSession).toHaveBeenCalled();
    plannerReg = false;
  });
});

describe('SessionsFilteringTest', () => {
  test('should render', () => {
    filterKeyword = 'Free';
    const component = renderer.create(<SessionsWidget {...defaultProps} />);
    expect(component).toMatchSnapshot();
    filterKeyword = '';
  });

  test('should be able to select session with free in the name', () => {
    filterKeyword = 'Free';
    const widget = mount(<SessionsWidget {...defaultProps} />);
    widget
      .find('[data-cvent-id="session-FreeSession-section"]')
      .find('[data-cvent-id="select-button"]')
      .hostNodes()
      .simulate('click');
    expect(selectSession).toHaveBeenCalled();
    filterKeyword = '';
  });

  test('should not see sessions without free in the name', () => {
    filterKeyword = 'Free';
    const widget = mount(<SessionsWidget {...defaultProps} />);
    const hasNoneFreeSession = widget.find('[data-cvent-id="session-SessionWithFee-section"]').exists();
    expect(hasNoneFreeSession).toBe(false);
    filterKeyword = '';
  });
});
