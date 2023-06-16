import React from 'react';
import SessionsWidget from '../SessionsWidget';
import { mount } from 'enzyme';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { Provider } from 'react-redux';
import createStore from 'nucleus-guestside-site/src/redux/prodCreateStoreWithMiddleware';
import { dstInfo } from '../../../fixtures/EasternTimeDstInfoFixture';
import { act } from 'react-dom/test-utils';
import { createMockApolloClient } from 'event-widgets/utils/testUtils';
import { GET_VISIBLE_SESSION_BUNDLES } from 'event-widgets/lib/Sessions/useVisibleSessionBundles';
import { ApolloProvider } from '@apollo/client';
import { createMockSessionBundleProduct } from 'event-widgets/lib/Sessions/utils/visibleSessionBundlesTestUtils';

jest.mock('react-redux', () => {
  const reactRedux = jest.requireActual<$TSFixMe>('react-redux');

  let currentData = null;
  function connect(...args) {
    const connected = reactRedux.connect(...args);
    return Component => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      class InstrumentedComponent extends require('react').Component {
        componentDidUpdate(prevProps) {
          if (currentData) {
            const updateReason = Object.keys(this.props).filter(k => this.props[k] !== prevProps[k]);
            if (!currentData[Component]) {
              currentData[Component] = [];
            }
            currentData[Component].push(updateReason);
          }
        }
        render() {
          return <Component {...this.props} />;
        }
      }
      return connected(InstrumentedComponent);
    };
  }
  return {
    ...reactRedux,
    connect,
    async collectRenderData(f) {
      currentData = {};
      await f();
      const collected = currentData;
      currentData = null;
      return collected;
    }
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { collectRenderData } = require('react-redux');

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

const initialState = {
  text: {
    translate: resx => resx,
    translateTime() {},
    translateDate() {},
    resolver: {
      currency() {}
    }
  },
  transparentWrapper: {
    showTransparentWrapper: false
  },
  spinnerSelection: {
    pendingSpinnerSelection: ''
  },
  event: {
    eventFeatureSetup: {
      agendaItems: {
        tracks: true
      }
    },
    timezone: 35,
    products: {
      sessionContainer: {
        includedSessions: {},
        optionalSessions: {
          '2f7209f5-e42b-4792-b6fd-504873b46707': {
            categoryId: '83f2e39d-7284-42b5-aef6-643e0ddd5003',
            capacity: 20,
            startTime: '2017-09-08T22:00:00.000Z',
            endTime: '2017-09-08T23:00:00.000Z',
            isOpenForRegistration: true,
            isIncludedSession: false,
            registeredCount: 0,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            code: 'SESS1',
            description: '',
            id: '2f7209f5-e42b-4792-b6fd-504873b46707',
            capacityId: '2f7209f5-e42b-4792-b6fd-504873b46707',
            name: 'Session 1',
            status: 2,
            type: 'Session',
            defaultFeeId: '983ba5fa-7ff0-451c-acc5-7360693ec502',
            fees: {
              '983ba5fa-7ff0-451c-acc5-7360693ec502': {
                chargePolicies: [
                  {
                    id: '6d8d8c57-6393-4d55-9be5-6fabb4b1db8e',
                    isActive: true,
                    effectiveUntil: '2999-12-31T00:00:00.000Z',
                    amount: 10,
                    maximumRefundAmount: 10
                  }
                ],
                refundPolicies: [],
                isActive: true,
                isRefundable: true,
                registrationTypes: [],
                name: 'Fee 3',
                id: '983ba5fa-7ff0-451c-acc5-7360693ec502',
                amount: 10
              }
            }
          },
          '333e1842-b448-46d1-8aeb-5b74a7c72bb7': {
            categoryId: 'c707709a-44fa-4745-b01e-84cce1fab036',
            capacity: 1000,
            startTime: '2017-09-08T22:00:00.000Z',
            endTime: '2017-09-08T23:00:00.000Z',
            isOpenForRegistration: true,
            isIncludedSession: false,
            registeredCount: 0,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            code: 'SESS3',
            description: '',
            id: '333e1842-b448-46d1-8aeb-5b74a7c72bb7',
            capacityId: '333e1842-b448-46d1-8aeb-5b74a7c72bb7',
            name: 'Session 3',
            status: 2,
            type: 'Session',
            defaultFeeId: 'a8024710-ff21-48e2-a005-f69f459da7a5',
            fees: {
              'a8024710-ff21-48e2-a005-f69f459da7a5': {
                chargePolicies: [
                  {
                    id: 'ffcb3714-3c73-4046-b8a8-0466cbcc461c',
                    isActive: true,
                    effectiveUntil: '2999-12-31T00:00:00.000Z',
                    amount: 1000,
                    maximumRefundAmount: 1000
                  }
                ],
                refundPolicies: [],
                isActive: true,
                isRefundable: true,
                registrationTypes: [],
                name: 'Fee 5',
                id: 'a8024710-ff21-48e2-a005-f69f459da7a5',
                amount: 1000
              }
            }
          },
          '133ece28-1582-4205-af64-f7fb431a76e8': {
            categoryId: 'c5346826-863c-4030-a4c9-3fb5cc0a1c94',
            startTime: '2017-09-08T22:00:00.000Z',
            endTime: '2017-09-08T23:00:00.000Z',
            isOpenForRegistration: true,
            isIncludedSession: false,
            registeredCount: 0,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            code: '',
            description: '',
            id: '133ece28-1582-4205-af64-f7fb431a76e8',
            capacityId: '133ece28-1582-4205-af64-f7fb431a76e8',
            name: 'Session 4',
            status: 2,
            type: 'Session',
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {}
          },
          '22b2fa58-a446-46cd-8888-2720925fb669': {
            categoryId: '83f2e39d-7284-42b5-aef6-643e0ddd5003',
            capacity: 100,
            startTime: '2017-09-08T22:00:00.000Z',
            endTime: '2017-09-08T23:00:00.000Z',
            isOpenForRegistration: true,
            isIncludedSession: false,
            registeredCount: 0,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            code: 'SESS2',
            description: '',
            id: '22b2fa58-a446-46cd-8888-2720925fb669',
            capacityId: '22b2fa58-a446-46cd-8888-2720925fb669',
            name: 'Session 2',
            status: 2,
            type: 'Session',
            defaultFeeId: '9b80d956-60e8-463f-8f66-76147919bc0e',
            fees: {
              '9b80d956-60e8-463f-8f66-76147919bc0e': {
                chargePolicies: [
                  {
                    id: '6aa88aa9-d93a-450d-a948-cf13f717192c',
                    isActive: true,
                    effectiveUntil: '2999-12-31T00:00:00.000Z',
                    amount: 100,
                    maximumRefundAmount: 100
                  },
                  {
                    id: '835f464f-feab-4367-a736-a4ccd821c6b7',
                    isActive: true,
                    effectiveUntil: '2017-07-21T00:00:00.000Z',
                    amount: 95,
                    maximumRefundAmount: 95
                  }
                ],
                refundPolicies: [],
                isActive: true,
                isRefundable: true,
                registrationTypes: [],
                name: 'Fee 4',
                id: '9b80d956-60e8-463f-8f66-76147919bc0e',
                amount: 100
              }
            }
          }
        },
        sessionGroups: {},
        sessionBundles: {},
        sessionCategoryListOrders: {
          '83f2e39d-7284-42b5-aef6-643e0ddd5003': {
            categoryId: '83f2e39d-7284-42b5-aef6-643e0ddd5003',
            categoryOrder: 2
          },
          'c707709a-44fa-4745-b01e-84cce1fab036': {
            categoryId: 'c707709a-44fa-4745-b01e-84cce1fab036',
            categoryOrder: 3
          },
          'c5346826-863c-4030-a4c9-3fb5cc0a1c94': {
            categoryId: 'c5346826-863c-4030-a4c9-3fb5cc0a1c94',
            categoryOrder: 1
          }
        }
      }
    },
    speakerInfoSnapshot: {
      categoryOrder: {
        '3ae9e6fa-c8e9-43e3-928c-1cf316d04073': 1
      },
      speakers: {
        speakerId1: {
          id: 'speakerId1',
          categoryId: '3ae9e6fa-c8e9-43e3-928c-1cf316d04073',
          firstName: 'James',
          lastName: 'Anderson',
          prefix: 'Dr',
          company: 'Company Name 5',
          title: 'Title 5',
          code: 'JamesAnderson',
          biography: "James' biography goes here.",
          designation: 'Director',
          displayOnWebsite: true,
          internalNote: '',
          facebookUrl: 'http://www.fb.com',
          twitterUrl: 'https://www.twitter.com',
          linkedInUrl: 'http://www.linkedin.com',
          emailAddress: 'james@j.mail',
          order: 5,
          documents: {
            '263e250e-61e3-492e-8de8-455c2f790dae': {
              id: '263e250e-61e3-492e-8de8-455c2f790dae',
              speakerId: 'speakerId1',
              isDisplay: true
            }
          },
          websites: {}
        },
        speakerId2: {
          id: 'speakerId2',
          categoryId: '3ae9e6fa-c8e9-43e3-928c-1cf316d04073',
          firstName: 'Pam',
          lastName: 'Pam',
          prefix: 'Mrs',
          company: 'Company Name 2',
          title: 'Title2',
          code: 'PamPam',
          biography: 'Biography for pam is here.',
          designation: 'Senior Accountant',
          displayOnWebsite: false,
          internalNote: '',
          facebookUrl: 'https://www.facebook.com',
          twitterUrl: 'https://www.twitter.com',
          linkedInUrl: 'http://www.linkedin.com',
          emailAddress: 'pam@j.mail',
          order: 2,
          profileImageFileName: 'icon.jpg',
          profileImageUri: 'https://silo408-custom.core.cvent.org/89a848/2db7fc76a7d04d10aa7bb44c3820081b.jpg',
          documents: {},
          websites: {}
        }
      }
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
      dstInfo
    }
  },
  account: {
    sessionCategories: {
      '83f2e39d-7284-42b5-aef6-643e0ddd5003': {
        id: '83f2e39d-7284-42b5-aef6-643e0ddd5003',
        name: 'Workshops',
        description: ''
      }
    },
    sessionCustomFields: [],
    speakerCategories: {
      '38898c9b-6319-4466-8b83-00b0d8cc00d4': {
        id: '38898c9b-6319-4466-8b83-00b0d8cc00d4',
        name: 'Panelists',
        isActive: true
      },
      '3ae9e6fa-c8e9-43e3-928c-1cf316d04073': {
        id: '3ae9e6fa-c8e9-43e3-928c-1cf316d04073',
        name: 'Speakers',
        isActive: true
      },
      'be398d64-0877-4ecd-bfbb-645bdb83e3bc': {
        id: 'be398d64-0877-4ecd-bfbb-645bdb83e3bc',
        name: 'Keynote Speaker',
        isActive: true
      },
      '59f34dba-0c33-4fc8-a83b-7ae3bfb16bea': {
        id: '59f34dba-0c33-4fc8-a83b-7ae3bfb16bea',
        name: 'Presenters',
        isActive: true
      },
      '1726296e-def7-4ebc-993f-7e59bd90ae82': {
        id: '1726296e-def7-4ebc-993f-7e59bd90ae82',
        name: 'Moderators',
        isActive: true
      },
      '86bc3210-945e-40f1-a0a8-c7489dab0021': {
        id: '86bc3210-945e-40f1-a0a8-c7489dab0021',
        name: 'Hosts',
        isActive: true
      }
    }
  },
  registrationForm: {
    regCart: {
      sendEmail: true,
      eventSnapshotVersions: {
        '4d57a132-93e5-4187-a25f-e06ad2f4bb67': 'M5HcyXxFIl8rfhRD4FIcFlwDSNM_nWae'
      },
      regCartId: '6b6cb8f0-812b-4ccc-b0af-e7ec08750fc5',
      status: 'INPROGRESS',
      groupRegistration: false,
      eventRegistrations: {
        '00000000-0000-0000-0000-000000000001': {
          eventRegistrationId: '00000000-0000-0000-0000-000000000001',
          attendee: {
            personalInformation: {
              contactGroups: [],
              customFields: {},
              emailAddressDomain: '',
              homeAddress: {
                countryCode: 'US'
              }
            },
            eventAnswers: {}
          },
          attendeeType: 'ATTENDEE',
          displaySequence: 1,
          productRegistrations: [],
          registrationTypeId: '00000000-0000-0000-0000-000000000000',
          requestedAction: 'REGISTER',
          eventId: '4d57a132-93e5-4187-a25f-e06ad2f4bb67',
          primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
          sessionRegistrations: {
            '22b2fa58-a446-46cd-8888-2720925fb669': {
              requestedAction: 'REGISTER',
              productId: '22b2fa58-a446-46cd-8888-2720925fb669',
              registrationSourceType: 'Selected',
              includedInAgenda: false
            },
            '3253430c-d19a-421b-9592-70b8b2b7c4c5': {
              productId: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
              requestedAction: 'REGISTER',
              registrationSourceType: 'Track',
              includedInAgenda: false
            }
          },
          sessionBundleRegistrations: {
            'b338eb83-630d-40cd-b242-943e214d236e': {
              requestedAction: 'REGISTER',
              productId: 'b338eb83-630d-40cd-b242-943e214d236e'
            }
          },
          registrationTypeName: '',
          registrationPathId: 'b5463d12-2f6f-4696-9b30-e38aa4144b86'
        }
      }
    }
  },
  defaultUserSession: {
    isPlanner: false
  },
  regCartStatus: {
    registrationIntent: 'REGISTERING',
    checkoutProgress: 0
  },
  website: {
    layoutItems: {
      'widget:id': {
        widgetType: 'Sessions',
        config: {
          sort: {
            selectedSortOrder: []
          }
        }
      }
    },
    theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
  },
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
  visibleProducts: {
    Sessions: {
      '00000000-0000-0000-0000-000000000001': {
        sessionProducts: {
          '2f7209f5-e42b-4792-b6fd-504873b46707': {
            categoryId: '83f2e39d-7284-42b5-aef6-643e0ddd5003',
            capacity: 20,
            startTime: '2017-09-08T22:00:00.000Z',
            endTime: '2017-09-08T23:00:00.000Z',
            displayPriority: 0,
            isOpenForRegistration: true,
            isIncludedSession: false,
            registeredCount: 0,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            code: 'SESS1',
            description: '',
            id: '2f7209f5-e42b-4792-b6fd-504873b46707',
            capacityId: '2f7209f5-e42b-4792-b6fd-504873b46707',
            name: 'Session 1',
            status: 2,
            type: 'Session',
            defaultFeeId: '983ba5fa-7ff0-451c-acc5-7360693ec502',
            fees: {
              '983ba5fa-7ff0-451c-acc5-7360693ec502': {
                chargePolicies: [
                  {
                    id: '6d8d8c57-6393-4d55-9be5-6fabb4b1db8e',
                    isActive: true,
                    effectiveUntil: '2999-12-31T00:00:00.000Z',
                    amount: 10,
                    maximumRefundAmount: 10
                  }
                ],
                refundPolicies: [],
                isActive: true,
                isRefundable: true,
                registrationTypes: [],
                name: 'Fee 3',
                id: '983ba5fa-7ff0-451c-acc5-7360693ec502',
                amount: 10
              }
            }
          },
          '333e1842-b448-46d1-8aeb-5b74a7c72bb7': {
            categoryId: 'c707709a-44fa-4745-b01e-84cce1fab036',
            capacity: 1000,
            startTime: '2017-09-08T22:00:00.000Z',
            endTime: '2017-09-08T23:00:00.000Z',
            displayPriority: 0,
            isOpenForRegistration: true,
            isIncludedSession: false,
            registeredCount: 0,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            code: 'SESS3',
            description: '',
            id: '333e1842-b448-46d1-8aeb-5b74a7c72bb7',
            capacityId: '333e1842-b448-46d1-8aeb-5b74a7c72bb7',
            name: 'Session 3',
            status: 2,
            type: 'Session',
            defaultFeeId: 'a8024710-ff21-48e2-a005-f69f459da7a5',
            fees: {
              'a8024710-ff21-48e2-a005-f69f459da7a5': {
                chargePolicies: [
                  {
                    id: 'ffcb3714-3c73-4046-b8a8-0466cbcc461c',
                    isActive: true,
                    effectiveUntil: '2999-12-31T00:00:00.000Z',
                    amount: 1000,
                    maximumRefundAmount: 1000
                  }
                ],
                refundPolicies: [],
                isActive: true,
                isRefundable: true,
                registrationTypes: [],
                name: 'Fee 5',
                id: 'a8024710-ff21-48e2-a005-f69f459da7a5',
                amount: 1000
              }
            }
          },
          '133ece28-1582-4205-af64-f7fb431a76e8': {
            categoryId: 'c5346826-863c-4030-a4c9-3fb5cc0a1c94',
            startTime: '2017-09-08T22:00:00.000Z',
            endTime: '2017-09-08T23:00:00.000Z',
            displayPriority: 0,
            isOpenForRegistration: true,
            isIncludedSession: false,
            registeredCount: 0,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            code: '',
            description: '',
            id: '133ece28-1582-4205-af64-f7fb431a76e8',
            capacityId: '133ece28-1582-4205-af64-f7fb431a76e8',
            name: 'Session 4',
            status: 2,
            type: 'Session',
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {}
          },
          '22b2fa58-a446-46cd-8888-2720925fb669': {
            categoryId: '83f2e39d-7284-42b5-aef6-643e0ddd5003',
            capacity: 100,
            startTime: '2017-09-08T22:00:00.000Z',
            endTime: '2017-09-08T23:00:00.000Z',
            displayPriority: 0,
            isOpenForRegistration: true,
            isIncludedSession: false,
            registeredCount: 0,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            code: 'SESS2',
            description: '',
            id: '22b2fa58-a446-46cd-8888-2720925fb669',
            capacityId: '22b2fa58-a446-46cd-8888-2720925fb669',
            name: 'Session 2',
            status: 2,
            type: 'Session',
            defaultFeeId: '9b80d956-60e8-463f-8f66-76147919bc0e',
            fees: {
              '9b80d956-60e8-463f-8f66-76147919bc0e': {
                chargePolicies: [
                  {
                    id: '6aa88aa9-d93a-450d-a948-cf13f717192c',
                    isActive: true,
                    effectiveUntil: '2999-12-31T00:00:00.000Z',
                    amount: 100,
                    maximumRefundAmount: 100
                  },
                  {
                    id: '835f464f-feab-4367-a736-a4ccd821c6b7',
                    isActive: true,
                    effectiveUntil: '2017-07-21T00:00:00.000Z',
                    amount: 95,
                    maximumRefundAmount: 95
                  }
                ],
                refundPolicies: [],
                isActive: true,
                isRefundable: true,
                registrationTypes: [],
                name: 'Fee 4',
                id: '9b80d956-60e8-463f-8f66-76147919bc0e',
                amount: 100
              }
            },
            webcast: {
              joiningURL: 'as.com',
              joiningPassword: 132,
              recordingURL: 'qweqw',
              recordingPassword: 'weqw',
              sessionWebcastId: 'f6e033f4-9793-4de3-9575-0cd008dcaffe'
            }
          }
        },
        sortKeys: {
          '2f7209f5-e42b-4792-b6fd-504873b46707': ['startDate', 'startTime', 'category'],
          '333e1842-b448-46d1-8aeb-5b74a7c72bb7': ['startDate', 'startTime', 'category'],
          '133ece28-1582-4205-af64-f7fb431a76e8': ['startDate', 'startTime', 'category'],
          '22b2fa58-a446-46cd-8888-2720925fb669': ['startDate', 'startTime', 'category']
        }
      }
    }
  },
  experiments: {
    flexProductVersion: 34,
    flexSessionRendering: 1
  },
  capacity: {},
  clients: {
    universalWebcastClient: {
      getAttendeeLinkData: getAttendeeLinkDataMock
    }
  }
};

const defaultProps = {
  config: {
    headerText: 'Header',
    instructionalText: 'Instructional text',
    display: {
      description: true,
      locationName: true,
      code: true,
      capacity: true,
      sessionCustomField: true,
      virtualPill: true
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
    sort: {
      selectedSortOrder: ['startDate', 'startTime', 'category']
    }
  },
  style: {
    palette: {},
    elements: {
      link: {}
    }
  },
  layout: {
    cellSize: 4
  },
  id: 'widgetId',
  translate: (resx, opts) => (opts ? `${resx}:${JSON.stringify(opts)}` : resx)
};

async function waitWithAct() {
  // Act is used because the Redux store is updated during wait
  return act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}

async function mountComponent(store) {
  const client = createMockApolloClient();
  client.setRequestHandler(GET_VISIBLE_SESSION_BUNDLES, () =>
    Promise.resolve({
      data: {
        products: {
          snapshotVersion: 'VERSION',
          sessionBundles: {
            bundle1: createMockSessionBundleProduct()
          }
        }
      }
    })
  );

  const widget = mount(
    <Provider store={store}>
      <ApolloProvider client={client}>
        <SessionsWidget {...defaultProps} />
      </ApolloProvider>
    </Provider>
  );
  await waitWithAct();
  widget.update();
  return widget;
}

test('SessionWidget should render', async () => {
  const store = createStore(state => state, initialState);
  const widget = await mountComponent(store);
  expect(widget).toMatchSnapshot();
  /*
    Session with session id: 133ece28-1582-4205-af64-f7fb431a76e8 does not have a webcast,
    Session with session id: 22b2fa58-a446-46cd-8888-2720925fb669 has a webcast
   */
  expect(
    widget.find('[data-cvent-id="session-133ece28-1582-4205-af64-f7fb431a76e8-virtualIdentifier"]').hostNodes().length
  ).toBe(0);
  expect(
    widget.find('[data-cvent-id="session-22b2fa58-a446-46cd-8888-2720925fb669-virtualIdentifier"]').hostNodes().length
  ).toBe(1);
});

test('SessionsWidget produces props from state', async () => {
  const store = createStore(
    (state, action) => (action.type === 'TEST_INCREMENT' ? { ...state, fakeProperty: state.fakeProperty + 1 } : state),
    initialState
  );

  const widget = await mountComponent(store);

  // Updating a fake property in state should not cause any part of the widget to re-render
  const renderData = await collectRenderData(async () => {
    store.dispatch({ type: 'TEST_INCREMENT' });
    await waitWithAct();
    widget.update();
  });
  expect(renderData).toStrictEqual({});
});

test('selecting device timezone from timezone dialog changes the session timings to be displayed', async () => {
  const localState = {
    ...initialState,
    appData: {
      ...initialState.appData,
      timeZoneSetting: {
        displayTimeZone: true,
        selectedWidgets: ['sessions']
      }
    },
    selectedTimeZone: {
      utcOffset: 330,
      value: 1001,
      abbreviation: 'IST'
    }
  };

  const store = createStore(
    (state, action) => (action.type === 'TEST_INCREMENT' ? { ...state, fakeProperty: state.fakeProperty + 1 } : state),
    localState
  );

  const getTimezoneOffset = Date.prototype.getTimezoneOffset;
  // eslint-disable-next-line no-extend-native
  Date.prototype.getTimezoneOffset = () => {
    return -330;
  };

  const widget = await mountComponent(store);

  const sessions = [
    '2f7209f5-e42b-4792-b6fd-504873b46707',
    '333e1842-b448-46d1-8aeb-5b74a7c72bb7',
    '133ece28-1582-4205-af64-f7fb431a76e8',
    '22b2fa58-a446-46cd-8888-2720925fb669'
  ];
  const startTime = '2017-09-08T22:00:00.000Z';
  const endTime = '2017-09-08T23:00:00.000Z';
  sessions.forEach(session => {
    const adjustedStartTime = widget.find('[data-cvent-id="session-' + session + '"]').getElements()[0].props
      .session.startTime;
    const adjustedEndTime = widget.find('[data-cvent-id="session-' + session + '"]').getElements()[0].props
      .session.endTime;
    // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    const differenceStart = new Date(adjustedStartTime) - new Date(startTime);
    // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    const differenceEnd = new Date(adjustedEndTime) - new Date(endTime);
    expect(differenceStart / 3600000).toBe(9.5); // The hour difference between IST and ET with daylight savings
    expect(differenceEnd / 3600000).toBe(9.5);
  });

  const renderData = await collectRenderData(async () => {
    store.dispatch({ type: 'TEST_INCREMENT' });
    await waitWithAct();
    widget.update();
  });
  expect(renderData).toStrictEqual({});
  // eslint-disable-next-line no-extend-native
  Date.prototype.getTimezoneOffset = getTimezoneOffset;
});

test('selecting event timezone from timezone dialog does not change the session timings', async () => {
  const localState = {
    ...initialState,
    appData: {
      ...initialState.appData,
      timeZoneSetting: {
        displayTimeZone: true,
        selectedWidgets: ['sessions']
      }
    },
    selectedTimeZone: {
      utcOffset: -240,
      value: 35,
      abbreviation: 'ET'
    }
  };

  const store = createStore(
    (state, action) => (action.type === 'TEST_INCREMENT' ? { ...state, fakeProperty: state.fakeProperty + 1 } : state),
    localState
  );

  const widget = await mountComponent(store);

  const sessions = [
    '2f7209f5-e42b-4792-b6fd-504873b46707',
    '333e1842-b448-46d1-8aeb-5b74a7c72bb7',
    '133ece28-1582-4205-af64-f7fb431a76e8',
    '22b2fa58-a446-46cd-8888-2720925fb669'
  ];
  const startTime = '2017-09-08T22:00:00.000Z';
  const endTime = '2017-09-08T23:00:00.000Z';
  sessions.forEach(session => {
    const adjustedStartTime = widget.find('[data-cvent-id="session-' + session + '"]').getElements()[0].props
      .session.startTime;
    const adjustedEndTime = widget.find('[data-cvent-id="session-' + session + '"]').getElements()[0].props
      .session.endTime;
    // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    const differenceStart = new Date(adjustedStartTime) - new Date(startTime);
    // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    const differenceEnd = new Date(adjustedEndTime) - new Date(endTime);
    expect(differenceStart / 3600000).toBe(0); // No change as selected timezone is the event timezone
    expect(differenceEnd / 3600000).toBe(0);
  });

  const renderData = await collectRenderData(async () => {
    store.dispatch({ type: 'TEST_INCREMENT' });
    await waitWithAct();
    widget.update();
  });
  expect(renderData).toStrictEqual({});
});

test('selecting device timezone from timezone dialog changes the session timings to be displayed for session groups', async () => {
  const sessionGroup = {
    id: '291ff6a9-49ee-461a-a8dc-b875d093a479',
    name: 'Day 3',
    code: 'Day 3',
    description: '',
    placementDateTime: '2020-12-18T14:00:00.000Z',
    categoryId: '00000000-0000-0000-0000-000000000000',
    displayFormat: 2,
    displayOrder: 1,
    allowedSessionDisplayFields: [1, 2, 4, 8],
    sessions: {
      '851b0cae-2708-4acd-a108-6fe0595327b1': {
        categoryId: '00000000-0000-0000-0000-000000000000',
        waitlistCapacityId: '851b0cae-2708-4acd-a108-6fe0595327b1_waitlist',
        dataTagCode: 'Session H',
        startTime: '2020-12-18T14:00:00.000Z',
        endTime: '2020-12-18T19:00:00.000Z',
        isOpenForRegistration: true,
        isIncludedSession: false,
        isWaitlistEnabled: false,
        registeredCount: 0,
        associatedWithAdmissionItems: [],
        availableToAdmissionItems: [],
        associatedRegistrationTypes: [],
        sessionCustomFieldValues: {},
        richTextDescription:
          '{"format":"draftjs-nucleus","version":1,"content":{"blocks":[{"key":"2jqa","text":"Day 3 Session Choice 2","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}}',
        plainTextDescription: 'Day 3 Session Choice 2',
        displayPriority: 0,
        showOnAgenda: true,
        featuredSession: false,
        speakerIds: {},
        documents: {},
        createdDate: '2020-06-13T10:55:16.377Z',
        code: '',
        description: 'Day 3 Session Choice 2',
        id: '851b0cae-2708-4acd-a108-6fe0595327b1',
        capacityId: '851b0cae-2708-4acd-a108-6fe0595327b1',
        name: 'Session H',
        status: 2,
        type: 'Session',
        defaultFeeId: '00000000-0000-0000-0000-000000000000',
        fees: {},
        closedReasonType: 'NotClosed',
        capacity: 300
      },
      'c6d036c0-8fb3-47a4-b95c-7c786c30406c': {
        categoryId: '00000000-0000-0000-0000-000000000000',
        waitlistCapacityId: 'c6d036c0-8fb3-47a4-b95c-7c786c30406c_waitlist',
        dataTagCode: 'Session G',
        startTime: '2020-12-18T14:00:00.000Z',
        endTime: '2020-12-18T19:00:00.000Z',
        isOpenForRegistration: true,
        isIncludedSession: false,
        isWaitlistEnabled: false,
        registeredCount: 0,
        associatedWithAdmissionItems: [],
        availableToAdmissionItems: [],
        associatedRegistrationTypes: [],
        sessionCustomFieldValues: {},
        richTextDescription:
          '{"format":"draftjs-nucleus","version":1,"content":{"blocks":[{"key":"as2cn","text":"Day 3 Session Choice 1","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}}',
        plainTextDescription: 'Day 3 Session Choice 1',
        displayPriority: 0,
        showOnAgenda: true,
        featuredSession: false,
        speakerIds: {},
        documents: {},
        createdDate: '2020-06-13T10:53:49.843Z',
        code: '',
        description: 'Day 3 Session Choice 1',
        id: 'c6d036c0-8fb3-47a4-b95c-7c786c30406c',
        capacityId: 'c6d036c0-8fb3-47a4-b95c-7c786c30406c',
        name: 'Session G',
        status: 2,
        type: 'Session',
        defaultFeeId: '00000000-0000-0000-0000-000000000000',
        fees: {},
        closedReasonType: 'NotClosed',
        capacity: 300
      }
    },
    isPlacementTimeDisplayed: true,
    isSessionSelectionRequired: true,
    isOpenForRegistration: true
  };

  const localState = {
    ...initialState,
    appData: {
      ...initialState.appData,
      timeZoneSetting: {
        displayTimeZone: true,
        selectedWidgets: ['sessions']
      }
    },
    selectedTimeZone: {
      utcOffset: 330,
      value: 1001,
      abbreviation: 'IST'
    },
    event: {
      ...initialState.event,
      products: {
        ...initialState.event.products,
        sessionContainer: {
          ...initialState.event.products.sessionContainer,
          sessionGroups: {
            '291ff6a9-49ee-461a-a8dc-b875d093a479': sessionGroup
          }
        }
      }
    },
    visibleProducts: {
      ...initialState.visibleProducts,
      Sessions: {
        ...initialState.visibleProducts.Sessions,
        '00000000-0000-0000-0000-000000000001': {
          ...initialState.visibleProducts.Sessions['00000000-0000-0000-0000-000000000001'],
          sessionProducts: {
            ...initialState.visibleProducts.Sessions['00000000-0000-0000-0000-000000000001'].sessionProducts,
            '291ff6a9-49ee-461a-a8dc-b875d093a479': sessionGroup
          },
          sortKeys: {
            ...initialState.visibleProducts.Sessions['00000000-0000-0000-0000-000000000001'].sortKeys,
            '851b0cae-2708-4acd-a108-6fe0595327b1': ['startDate', 'startTime', 'category'],
            'c6d036c0-8fb3-47a4-b95c-7c786c30406c': ['startDate', 'startTime', 'category'],
            '291ff6a9-49ee-461a-a8dc-b875d093a479': ['startDate', 'startTime', 'category']
          }
        }
      }
    },
    capacity: {
      ...initialState.capacity,
      '851b0cae-2708-4acd-a108-6fe0595327b1': {
        totalCapacityAvailable: 300,
        availableCapacity: 300
      },
      'c6d036c0-8fb3-47a4-b95c-7c786c30406c': {
        totalCapacityAvailable: 300,
        availableCapacity: 300
      }
    }
  };

  const store = createStore(
    (state, action) => (action.type === 'TEST_INCREMENT' ? { ...state, fakeProperty: state.fakeProperty + 1 } : state),
    localState
  );

  const getTimezoneOffset = Date.prototype.getTimezoneOffset;
  // eslint-disable-next-line no-extend-native
  Date.prototype.getTimezoneOffset = () => {
    return -330;
  };

  const widget = await mountComponent(store);

  const props = widget.find('[data-cvent-id="session-291ff6a9-49ee-461a-a8dc-b875d093a479"]').getElements()[0].props;

  const sessions = ['c6d036c0-8fb3-47a4-b95c-7c786c30406c', '851b0cae-2708-4acd-a108-6fe0595327b1'];
  const startTime = '2020-12-18T14:00:00.000Z';
  const endTime = '2020-12-18T19:00:00.000Z';
  sessions.forEach(session => {
    const adjustedStartTime = props.sessionGroup.sessions[session].startTime;
    const adjustedEndTime = props.sessionGroup.sessions[session].endTime;
    // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    const differenceStart = new Date(adjustedStartTime) - new Date(startTime);
    // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    const differenceEnd = new Date(adjustedEndTime) - new Date(endTime);
    expect(differenceStart / 3600000).toBe(10.5); // The hour difference between IST and ET without daylight savings
    expect(differenceEnd / 3600000).toBe(10.5);
  });
  const placementDateTime = '2020-12-18T14:00:00.000Z';
  // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
  expect((new Date(props.sessionGroup.placementDateTime) - new Date(placementDateTime)) / 3600000).toBe(10.5);

  const renderData = await collectRenderData(async () => {
    store.dispatch({ type: 'TEST_INCREMENT' });
    await waitWithAct();
    widget.update();
  });
  expect(renderData).toStrictEqual({});
  // eslint-disable-next-line no-extend-native
  Date.prototype.getTimezoneOffset = getTimezoneOffset;
});
