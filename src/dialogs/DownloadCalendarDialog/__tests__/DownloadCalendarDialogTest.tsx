/* eslint-disable multiline-comment-style */
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import React from 'react';
import { Provider } from 'react-redux';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { openDownloadCalendarDialog } from '../index';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import { shallow, mount } from 'enzyme';
import { keyBy } from 'lodash';
import { dstInfo } from '../../../../fixtures/EasternTimeDstInfoFixture';
import addToCalendarResponse from '../../../../fixtures/addToCalendarResponse.json';
import { CalendarType, fileSelectionOptions } from '../CalendarDownloadFileType';
import DownloadCalendarDialog, { getSessions } from '../DownloadCalendarDialog';
import * as addToCalendarUtils from '../../../utils/addToCalendarUtils';

jest.mock('../../../redux/pathInfo', () => ({
  redirectToPage: jest.fn(() => () => {})
}));
jest.mock('nucleus-core/containers/Transition');

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../../__mocks__/documentElementMock';
import { AddToCalendarExperiment } from '../../../utils/addToCalendarUtils';

getMockedMessageContainer();
const basicReducer = (x = {}) => x;
const addToCalendarServiceResponse = {
  calendarType: 'google',
  calendarUrl:
    'http://www.google.com/calendar/event?action=TEMPLATE&text=Are You a Event?&dates=20210206T230000Z/20210207T000000Z&location=&trp=false&details=',
  encodedFileName: null,
  errorResponse: null
};

const eventGuestClient = {
  identifyByConfirm: jest.fn(() => ({ accessToken: 'fakeAuthByConfirmToken' }))
};
const eventSnapshotClient = {
  getAccountSnapshot: jest.fn(() => EventSnapshot.accountSnapshot),
  getEventSnapshot: jest.fn(() => EventSnapshot.eventSnapshot)
};
const productVisibilityClient = {
  getVisibleProducts: jest.fn(() => (EventSnapshot as $TSFixMe).getVisibleProducts)
};
const calendarClient = {
  getEventCalendar: jest.fn(() => addToCalendarServiceResponse),
  getSessionCalendar: jest.fn(() => addToCalendarServiceResponse)
};

const eventData = EventSnapshot.eventSnapshot.siteEditor.eventData;
const registrationPathSettings = keyBy(eventData.registrationSettings.registrationPaths, 'id');
const openDownloadCalendarDialogParms = {
  modalStyles: {
    headerStyles: {
      styleMapping: 'header3'
    },
    instructionTextStyles: {
      styleMapping: 'body2'
    },
    cardStyles: {
      styleMapping: 'header3'
    },
    titleStyles: {
      styleMapping: 'label'
    },
    dateTimeStyles: {
      styleMapping: 'body2'
    },
    downloadLinkStyles: {
      styleMapping: 'link'
    },
    loginButtonStyles: {
      styleMapping: 'secondaryButton',
      customSettings: {
        text: {
          textAlign: 'center'
        }
      }
    },
    calendarTypeNameStyles: {
      styleMapping: 'body1'
    }
  }
};

const addToEventCalendarVirtualEventState = {
  google: {
    [addToCalendarUtils.CALENDAR_EVENT_ID]:
      'http://www.google.com/calendar/event?action=TEMPLATE&text=Flex Virtual Event&dates=20210205T230000Z/20210206T030000Z&location=https://cvent.zoom.us/j/94720449889?pwd=Y2JIZjlmN1I4dU0yOE9NNndmTE1Cdz09&from=msft;&trp=false&details=Flex event description<br/><br/>Event URL: https://cvent.zoom.us/j/94720449889?pwd=Y2JIZjlmN1I4dU0yOE9NNndmTE1Cdz09&from=msft;"',
    '22b2fa58-a446-46cd-8888-2720925fb669':
      'http://www.google.com/calendar/event?action=TEMPLATE&text=Flex Virtual Session&dates=20210205T230000Z/20210206T030000Z&location=https://cvent.zoom.us/j/94720449889?pwd=Y2JIZjlmN1I4dU0yOE9NNndmTE1Cdz09&from=msft;&trp=false&details=Flex session description<br/><br/>Session URL: https://cvent.zoom.us/j/94720449889?pwd=Y2JIZjlmN1I4dU0yOE9NNndmTE1Cdz09&from=msft;'
  },
  outlook: {
    [addToCalendarUtils.CALENDAR_EVENT_ID]:
      'https://outlook.live.com/owa/?path=/calendar/action/compose&rru=addevent&startdt=2021-02-26T23:00:00Z&enddt=2021-02-27T03:00:00Z&subject=Calendar-testing&body=Custom+Event+Description%21%21%21%3Cbr%2F%3E%3Cbr%2F%3EEvent+URL%3A+https%3A%2F%2Fattendee.com%3Cbr%2F%3EPassword%3A+attendeePassword&location=Delhi%2C+4%2F2834+C+Cannught-Place%2C+Delhi+110001+IN%2C+https%3A%2F%2Fattendee.com'
  }
};

function getState(overrides = {}) {
  return {
    text: {
      translate: (resx, tokens?) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx),
      translateWithDatatags: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx),
      translateDate: () => 'date',
      translateTime: () => 'time',
      resolver: {}
    },
    environment: 'Some',
    defaultUserSession: {
      isPlanner: false,
      isPreview: false,
      eventId: 'someid'
    },
    registrantLogin: {
      form: {
        firstName: 'firstName',
        lastName: 'lastName',
        emailAddress: 'emailAddress@email.com',
        confirmationNumber: 'confirmationNumber'
      },
      status: {
        login: {},
        resendConfirmation: {}
      }
    },
    calendarProviders: addToCalendarResponse.calendarProviders,
    account: {
      settings: {
        dupMatchKeyType: 'EMAIL_ONLY'
      }
    },
    website: {
      theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
    },
    experiments: {
      flexAddToGoogleCalendarExperimentVariant: AddToCalendarExperiment.ICS_CALENDAR_VARIANT
    },
    event: {
      ...EventSnapshot.eventSnapshot
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
    appData: {
      calendarSettings: {
        calendarContentType:
          overrides && (overrides as $TSFixMe).calendarContentType ? (overrides as $TSFixMe).calendarContentType : 'all'
      },
      registrationSettings: {
        ...eventData.registrationSettings,
        registrationPaths: registrationPathSettings
      },
      timeZoneSetting: {
        displayTimeZone: true,
        selectedWidgets: ['addToCalendar']
      }
    },
    pathInfo: {
      calendarBasePath: 'somePath'
    },
    clients: { eventGuestClient, eventSnapshotClient, calendarClient, productVisibilityClient },
    multiLanguageLocale: {
      locale: overrides && (overrides as $TSFixMe).locale ? (overrides as $TSFixMe).locale : 'en-US'
    },
    eventSnapshotVersion: 'randomstringnotreally'
  };
}

const registrationForm = {
  regCart: {
    sendEmail: true,
    regMod: true,
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
          attendeeId: '7129fc9a-5106-4c32-8eed-9c3ab7e16291',
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
          }
        },
        trackRegistrations: {},
        registrationTypeName: '',
        registrationPathId: 'b5463d12-2f6f-4696-9b30-e38aa4144b86',
        confirmationNumber: 'one'
      }
    }
  }
};

const event = {
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
  }
};

const visibleProducts = {
  Sessions: {
    '00000000-0000-0000-0000-000000000001': {
      sessionProducts: {
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
      }
    }
  },
  Widget: {
    sessionProducts: {
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
    }
  }
};

function mockAllReducers() {
  return {
    dialogContainer,
    text: basicReducer,
    website: basicReducer,
    event: basicReducer,
    appData: basicReducer,
    pathInfo: basicReducer,
    account: basicReducer,
    registrantLogin: basicReducer,
    userSession: basicReducer,
    defaultUserSession: basicReducer,
    clients: basicReducer,
    eventSnapshotVersion: basicReducer,
    timezones: basicReducer,
    selectedTimeZone: basicReducer,
    experiments: basicReducer,
    calendarProviders: basicReducer,
    registrationForm: basicReducer,
    visibleProducts: basicReducer,
    environment: basicReducer,
    multiLanguageLocale: basicReducer
  };
}

describe('User Not logged in', () => {
  const getStore = (overrides = {}) => {
    return createStoreWithMiddleware(combineReducers(mockAllReducers()), getState(overrides));
  };
  test('matches snapshot when opened for events and sessions', async () => {
    const store = getStore();
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    expect(dialog).toMatchSnapshot();
    dialog.update();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-event-container"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-login"]').hostNodes().length).toBe(1);
  });
  test('matches snapshot when opened for sessions only', async () => {
    const store = getStore({ calendarContentType: 'sessions' });
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    expect(dialog).toMatchSnapshot();
    dialog.update();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-event-container"]').hostNodes().length).toBe(0);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-login"]').hostNodes().length).toBe(1);
  });
  test('matches snapshot when opened for events and sessions and FlexAddToGoogleCalendar is enabled', async () => {
    const state = overrides => {
      return {
        ...getState(overrides),
        experiments: {
          flexAddToGoogleCalendarExperimentVariant: AddToCalendarExperiment.GOOGLE_CALENDAR_FOR_INPERSON_VARIANT
        }
      };
    };
    const getCustomStore = (overrides = {}) => {
      return createStoreWithMiddleware(combineReducers(mockAllReducers()), state(overrides));
    };
    const store = getCustomStore();
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    expect(dialog).toMatchSnapshot();
    dialog.update();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-event-container"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-dropdown-container"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-session-container"]').hostNodes().length).toBe(0);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-login"]').hostNodes().length).toBe(1);
  });
  test('matches snapshot when opened for sessions only and FlexAddToGoogleCalendar is enabled', async () => {
    const state = overrides => {
      return {
        ...getState(overrides),
        experiments: {
          flexAddToGoogleCalendarExperimentVariant: AddToCalendarExperiment.GOOGLE_CALENDAR_FOR_INPERSON_VARIANT
        }
      };
    };
    const getCustomStore = (overrides = {}) => {
      return createStoreWithMiddleware(combineReducers(mockAllReducers()), state(overrides));
    };
    const store = getCustomStore({ calendarContentType: 'sessions' });
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    expect(dialog).toMatchSnapshot();
    dialog.update();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-event-container"]').hostNodes().length).toBe(0);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-dropdown-container"]').hostNodes().length).toBe(0);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-login"]').hostNodes().length).toBe(1);
  });
  test('Login button works', async () => {
    const store = getStore({ calendarContentType: 'sessions' });
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    dialog.update();
    dialog.find('[data-cvent-id="download-calendar-dialog-login"]').hostNodes().simulate('click');
    expect(dialog).toMatchSnapshot();
    expect(dialog.find('[data-cvent-id="already-registered"]').hostNodes().length).toBe(1);
  });
  test('Cancel works after clicking login', async () => {
    const store = getStore({ calendarContentType: 'sessions' });
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    dialog.update();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-login"]').hostNodes().length).toBe(1);
    dialog.find('[data-cvent-id="download-calendar-dialog-login"]').hostNodes().simulate('click');
    expect(dialog.find('[data-cvent-id="already-registered"]').hostNodes().length).toBe(1);
    dialog.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    dialog.update();
    expect(dialog).toMatchSnapshot();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-login"]').hostNodes().length).toBe(1);
  });
});

describe('User Logged in', () => {
  let getStore = (overrides = {}) => {
    return createStoreWithMiddleware(combineReducers(mockAllReducers()), {
      ...getState(overrides),
      event,
      registrationForm,
      visibleProducts
    });
  };
  test('matches snapshot when opened for event and sessions', () => {
    const store = getStore();
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    expect(dialog).toMatchSnapshot();
    dialog.update();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-login"]').hostNodes().length).toBe(0);
  });
  test('matches snapshot when opened for sessions only', () => {
    const store = getStore({ calendarContentType: 'sessions' });
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    expect(dialog).toMatchSnapshot();
    dialog.update();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-event-container"]').hostNodes().length).toBe(0);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-login"]').hostNodes().length).toBe(0);
  });
  test('matches snapshot when user has registered for event and virtual session and flexGoogleCalendar is enabled with variant 2', async () => {
    getStore = (overrides = {}) => {
      return createStoreWithMiddleware(combineReducers(mockAllReducers()), {
        ...getState(overrides),
        event,
        registrationForm,
        visibleProducts,
        experiments: {
          flexAddToGoogleCalendarExperimentVariant: AddToCalendarExperiment.GOOGLE_CALENDAR_FOR_VIRTUAL_VARIANT
        }
      });
    };
    const store = getStore();
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    expect(dialog).toMatchSnapshot();
    dialog.update();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-event-container"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-dropdown-container"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-session-container"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-sessioncalender-nosession"]').hostNodes().length).toBe(
      0
    );
  });
});

describe('User logged in and registered for session and flexGoogleCalendar is enabled', () => {
  const getStore = (overrides = {}) => {
    return createStoreWithMiddleware(combineReducers(mockAllReducers()), {
      ...getState(overrides),
      event,
      registrationForm,
      visibleProducts,
      experiments: {
        flexAddToGoogleCalendarExperimentVariant: AddToCalendarExperiment.GOOGLE_CALENDAR_FOR_INPERSON_VARIANT
      }
    });
  };
  test('matches snapshot when user has registered for session', async () => {
    const store = getStore();
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    expect(dialog).toMatchSnapshot();
    dialog.update();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-event-container"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-dropdown-container"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-session-container"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-sessioncalender-nosession"]').hostNodes().length).toBe(
      0
    );
  });
  test('when user has registered for a session but that session is deleted by planner in test mode', async () => {
    const getCustomStore = (overrides = {}) => {
      return createStoreWithMiddleware(combineReducers(mockAllReducers()), {
        ...getState(overrides),
        event,
        registrationForm,
        visibleProducts: {
          ...visibleProducts.Sessions,
          Widget: {
            sessionProducts: {}
          }
        }
      });
    };
    const store = getCustomStore();
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    dialog.update();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-session-container"]').hostNodes().length).toBe(0);
  });
  test('matches snapshot when user has registered for session and opened for sessions only', async () => {
    const store = getStore({ calendarContentType: 'sessions' });
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    expect(dialog).toMatchSnapshot();
    dialog.update();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-event-container"]').hostNodes().length).toBe(0);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-dropdown-container"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-session-container"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-sessioncalender-nosession"]').hostNodes().length).toBe(
      0
    );
  });
  test('matches snapshot when user has registered for all sessions and displayPriority is not set', () => {
    const state = {
      ...getState(),
      registrationForm: {
        regCart: {
          ...registrationForm.regCart,
          eventRegistrations: {
            '00000000-0000-0000-0000-000000000001': {
              ...registrationForm.regCart.eventRegistrations['00000000-0000-0000-0000-000000000001'],
              sessionRegistrations: {
                '2f7209f5-e42b-4792-b6fd-504873b46707': {
                  requestedAction: 'REGISTER',
                  productId: '2f7209f5-e42b-4792-b6fd-504873b46707',
                  registrationSourceType: 'Selected',
                  includedInAgenda: false
                },
                '22b2fa58-a446-46cd-8888-2720925fb669': {
                  requestedAction: 'REGISTER',
                  productId: '22b2fa58-a446-46cd-8888-2720925fb669',
                  registrationSourceType: 'Selected',
                  includedInAgenda: false
                },
                '333e1842-b448-46d1-8aeb-5b74a7c72bb7': {
                  requestedAction: 'REGISTER',
                  productId: '333e1842-b448-46d1-8aeb-5b74a7c72bb7',
                  registrationSourceType: 'Selected',
                  includedInAgenda: false
                },
                '133ece28-1582-4205-af64-f7fb431a76e8': {
                  requestedAction: 'REGISTER',
                  productId: '133ece28-1582-4205-af64-f7fb431a76e8',
                  registrationSourceType: 'Selected',
                  includedInAgenda: false
                }
              }
            }
          }
        }
      },
      visibleProducts
    };
    const displayedSessions = getSessions(state);
    // When displayPriority not set and startDate is same, sessions will sorted according to title.
    expect(displayedSessions).toMatchObject([
      { title: 'Session 1' },
      { title: 'Session 2' },
      { title: 'Session 3' },
      { title: 'Session 4' }
    ]);
  });
  test('matches snapshot when user has registered for all sessions and displayPriority is set', () => {
    const state = {
      ...getState(),
      registrationForm: {
        regCart: {
          ...registrationForm.regCart,
          eventRegistrations: {
            '00000000-0000-0000-0000-000000000001': {
              ...registrationForm.regCart.eventRegistrations['00000000-0000-0000-0000-000000000001'],
              sessionRegistrations: {
                '2f7209f5-e42b-4792-b6fd-504873b46707': {
                  requestedAction: 'REGISTER',
                  productId: '2f7209f5-e42b-4792-b6fd-504873b46707',
                  registrationSourceType: 'Selected',
                  includedInAgenda: false
                },
                '22b2fa58-a446-46cd-8888-2720925fb669': {
                  requestedAction: 'REGISTER',
                  productId: '22b2fa58-a446-46cd-8888-2720925fb669',
                  registrationSourceType: 'Selected',
                  includedInAgenda: false
                },
                '333e1842-b448-46d1-8aeb-5b74a7c72bb7': {
                  requestedAction: 'REGISTER',
                  productId: '333e1842-b448-46d1-8aeb-5b74a7c72bb7',
                  registrationSourceType: 'Selected',
                  includedInAgenda: false
                },
                '133ece28-1582-4205-af64-f7fb431a76e8': {
                  requestedAction: 'REGISTER',
                  productId: '133ece28-1582-4205-af64-f7fb431a76e8',
                  registrationSourceType: 'Selected',
                  includedInAgenda: false
                }
              }
            }
          }
        }
      },
      visibleProducts: {
        ...visibleProducts.Sessions,
        Widget: {
          sessionProducts: {
            '2f7209f5-e42b-4792-b6fd-504873b46707': {
              ...visibleProducts.Widget.sessionProducts['2f7209f5-e42b-4792-b6fd-504873b46707'],
              displayPriority: 2
            },
            '333e1842-b448-46d1-8aeb-5b74a7c72bb7': {
              ...visibleProducts.Widget.sessionProducts['333e1842-b448-46d1-8aeb-5b74a7c72bb7'],
              displayPriority: 0
            },
            '133ece28-1582-4205-af64-f7fb431a76e8': {
              ...visibleProducts.Widget.sessionProducts['133ece28-1582-4205-af64-f7fb431a76e8'],
              displayPriority: 1
            },
            '22b2fa58-a446-46cd-8888-2720925fb669': {
              ...visibleProducts.Widget.sessionProducts['22b2fa58-a446-46cd-8888-2720925fb669'],
              displayPriority: 0
            }
          }
        }
      }
    };
    const displayedSessions = getSessions(state);

    expect(displayedSessions).toMatchObject([
      { title: 'Session 4' },
      { title: 'Session 1' },
      { title: 'Session 2' },
      { title: 'Session 3' }
    ]);
  });
});

describe('User Logged in without session registered', () => {
  let getStore = (overrides = {}) => {
    return createStoreWithMiddleware(combineReducers(mockAllReducers()), {
      ...getState(overrides),
      event,
      registrationForm: {
        ...registrationForm,
        regCart: {
          ...registrationForm.regCart,
          eventRegistrations: {
            ...(registrationForm as $TSFixMe).eventRegistrations,
            sessionRegistrations: {}
          }
        }
      },
      visibleProducts
    });
  };
  test('matches snapshot when opened for sessions only and no sessions selected', async () => {
    const store = getStore({ calendarContentType: 'sessions' });
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    expect(dialog).toMatchSnapshot();
    dialog.update();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-sessioncalender-nosession"]').hostNodes().length).toBe(
      1
    );
  });
  test('matches snapshot when opened for all and no session is selected and flexGoogleCalendar is enabled', async () => {
    getStore = (overrides = {}) => {
      return createStoreWithMiddleware(combineReducers(mockAllReducers()), {
        ...getState(overrides),
        environment: 'Some',
        event,
        registrationForm: {
          ...registrationForm,
          regCart: {
            ...registrationForm.regCart,
            eventRegistrations: {
              ...(registrationForm as $TSFixMe).eventRegistrations,
              sessionRegistrations: {}
            }
          }
        },
        visibleProducts,
        experiments: {
          flexAddToGoogleCalendarExperimentVariant: AddToCalendarExperiment.GOOGLE_CALENDAR_FOR_INPERSON_VARIANT
        }
      });
    };
    const store = getStore();
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    expect(dialog).toMatchSnapshot();
    dialog.update();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-event-container"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-dropdown-container"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-sessioncalender-nosession"]').hostNodes().length).toBe(
      1
    );
  });
  test('matches snapshot when opened for sessions only and no sessions selected and flexGoogleCalendar is enabled', async () => {
    getStore = (overrides = {}) => {
      return createStoreWithMiddleware(combineReducers(mockAllReducers()), {
        ...getState(overrides),
        environment: 'Some',
        event,
        registrationForm: {
          ...registrationForm,
          regCart: {
            ...registrationForm.regCart,
            eventRegistrations: {
              ...(registrationForm as $TSFixMe).eventRegistrations,
              sessionRegistrations: {}
            }
          }
        },
        visibleProducts,
        experiments: {
          flexAddToGoogleCalendarExperimentVariant: AddToCalendarExperiment.GOOGLE_CALENDAR_FOR_INPERSON_VARIANT
        }
      });
    };
    const store = getStore({ calendarContentType: 'sessions' });
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    expect(dialog).toMatchSnapshot();
    dialog.update();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-dropdown-container"]').hostNodes().length).toBe(0);
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-sessioncalender-nosession"]').hostNodes().length).toBe(
      1
    );
  });
});

describe('Download Calendar dialog selected timezone tests', () => {
  test('selecting device timezone does not append any abbreviation at the end of time', async () => {
    const getStore = (overrides = {}) => {
      return createStoreWithMiddleware(combineReducers(mockAllReducers()), {
        ...getState(overrides),
        text: {
          ...getState(overrides).text,
          translateTime: value => {
            return value.toISOString().slice(11, 16);
          }
        },
        registrationForm,
        visibleProducts,
        selectedTimeZone: {
          utcOffset: 330,
          value: 1001,
          abbreviation: 'IST',
          nameResourceKey: 'your device timezone'
        }
      });
    };
    const store = getStore({ calendarContentType: 'all' });
    const getTimezoneOffset = Date.prototype.getTimezoneOffset;
    // eslint-disable-next-line no-extend-native
    Date.prototype.getTimezoneOffset = () => {
      return -330;
    };
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    dialog.update();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-event-container"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="download-calendar-date-time-range"]').at(0).text()).toMatch(/.*21:30.*07:30$/);
    expect(dialog.find('[data-cvent-id="download-calendar-date-time-range"]').at(1).text()).toMatch(/.*07:30.*08:30$/);
    // Asserting the timezone switch widget shows correct text
    expect(dialog.find('[data-cvent-id="timeZoneWidget"]').getElement().props.children[1]).toBe(
      'Event_GuestSide_TimeZone_ViewText__resx:{"timeZone":"your device timezone"}'
    );
    expect(dialog.find('[data-cvent-id="timeZoneWidget"]').getElement().props.children[2]).toBeFalsy();
    // eslint-disable-next-line no-extend-native
    Date.prototype.getTimezoneOffset = getTimezoneOffset;
  });

  test('selecting event timezone appends timezone abbreviation at the end of time', async () => {
    const getStore = (overrides = {}) => {
      return createStoreWithMiddleware(combineReducers(mockAllReducers()), {
        ...getState(overrides),
        text: {
          ...getState(overrides).text,
          translateTime: value => {
            return value.toISOString().slice(11, 16);
          }
        },
        registrationForm,
        visibleProducts,
        selectedTimeZone: {
          utcOffset: -240,
          value: 35,
          abbreviation: 'ET',
          abbreviationResourceKey: 'ET translation',
          nameResourceKey: 'Eastern Time'
        }
      });
    };
    const store = getStore({ calendarContentType: 'all' });
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    dialog.update();
    expect(dialog.find('[data-cvent-id="download-calendar-dialog-event-container"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="download-calendar-date-time-range"]').at(0).text()).toMatch(
      /.*12:00.*22:00.*ET translation$/
    );
    expect(dialog.find('[data-cvent-id="download-calendar-date-time-range"]').at(1).text()).toMatch(
      /.*22:00.*23:00.*ET translation$/
    );
    // Asserting the timezone switch widget shows correct text
    expect(dialog.find('[data-cvent-id="timeZoneWidget"]').getElement().props.children[1]).toBe(
      'Event_GuestSide_TimeZone_ViewText__resx:{"timeZone":"Eastern Time"}'
    );
    expect(dialog.find('[data-cvent-id="timeZoneWidget"]').getElement().props.children[2]).toBeFalsy();
  });
});

describe('Calendar Dropdown tests', () => {
  const componentState = fileSelectionOptions(getState().text.translate);
  const props = {
    style: EventSnapshot.eventSnapshot.siteEditor.website.theme.global,
    locale: 'en-US',
    ...openDownloadCalendarDialogParms
  };
  const eventInfo = {
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et hendrerit dolor, eu laoreet libero. Proin vitae neque id dui consectetur consequat. Quisque at porttitor arcu. Maecenas rhoncus nec arcu non viverra. Quisque maximus euismod quam non rutrum. Donec cursus interdum lectus, rutrum placerat sapien pulvinar at.',
    endDate: '2020-06-18T22:00:00.000Z',
    location: 'Museum of Science and Industry',
    startDate: '2020-06-16T12:00:00.000Z',
    title: 'Annual Space Technology And Engineering Meeting'
  };
  const eventDescription = {
    customDescription: undefined,
    descriptionSource: undefined
  };
  const sessionInfo = {
    description: '',
    sessionId: '22b2fa58-a446-46cd-8888-2720925fb669',
    endTime: '2017-09-08T23:00:00.000Z',
    startTime: '2017-09-08T22:00:00.000Z',
    title: 'Session 2',
    location: undefined
  };
  let getCalendarUrlSpy = jest.spyOn(addToCalendarUtils, 'getCalendarUrl');
  test('when opened for both event and session but no session is registered and dropdown selected value is Google calendar', () => {
    const eventTitle = {
      'dd48b4c4-672e-431c-be8d-5abfec299844.title': 'Annual Space Technology And Engineering Meeting'
    };
    const customState = overrides => {
      return {
        ...getState(overrides),
        event: {
          ...EventSnapshot.eventSnapshot,
          title: eventTitle['dd48b4c4-672e-431c-be8d-5abfec299844.title']
        }
      };
    };
    const getStore = (overrides = {}) => {
      return createStoreWithMiddleware(combineReducers(mockAllReducers()), customState(overrides));
    };
    const store = getStore();
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ modalStyles: { headerStyles: { styleMappin... Remove this comment to see the full error message
    const dialog = shallow(<DownloadCalendarDialog store={store} {...props} />);
    const component = dialog.dive().shallow();
    component.instance().setState({
      selectOptions: {
        optionArray: componentState.optionArray,
        selectedValue: CalendarType.GOOGLE
      }
    });
    component.simulate('click');
    expect(getCalendarUrlSpy).toHaveBeenCalledWith(
      addToCalendarResponse.calendarProviders.Google.calendarProviderURL,
      eventInfo,
      true,
      eventDescription
    );
    const expectedTranslatedTitle = customState({}).text.translate(customState({}).event.title);
    expect(expectedTranslatedTitle).toEqual(eventInfo.title);
  });

  test('when opened for both event and session, user has registered for a session and dropdown selected value is Google calendar', () => {
    const getStore = (overrides = {}) => {
      return createStoreWithMiddleware(combineReducers(mockAllReducers()), {
        ...getState(overrides),
        event: {
          ...eventInfo,
          ...event
        },
        registrationForm,
        visibleProducts
      });
    };
    const store = getStore();
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ modalStyles: { headerStyles: { styleMappin... Remove this comment to see the full error message
    const dialog = shallow(<DownloadCalendarDialog store={store} {...props} />);
    const component = dialog.dive().shallow();
    component.instance().setState({
      selectOptions: {
        optionArray: componentState.optionArray,
        selectedValue: CalendarType.GOOGLE
      }
    });
    component.simulate('click');
    expect(getCalendarUrlSpy).toHaveBeenCalledWith(
      addToCalendarResponse.calendarProviders.Google.calendarProviderURL,
      eventInfo,
      true,
      eventDescription
    );
    expect(getCalendarUrlSpy).toHaveBeenCalledWith(
      addToCalendarResponse.calendarProviders.Google.calendarProviderURL,
      sessionInfo
    );
  });

  test('when opened for event and dropdown selected value is Google calendar and flexGoogleCalendar experiment is enabled with variant 2', async () => {
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'SpyInstance<any, [calendarState: any, entity... Remove this comment to see the full error message
    getCalendarUrlSpy = jest.spyOn(addToCalendarUtils, 'getGoogleCalendar');
    const eventTitle = {
      'dd48b4c4-672e-431c-be8d-5abfec299844.title': 'Annual Space Technology And Engineering Meeting'
    };
    const customState = overrides => {
      return {
        ...getState(overrides),
        event: {
          ...EventSnapshot.eventSnapshot,
          title: eventTitle['dd48b4c4-672e-431c-be8d-5abfec299844.title']
        },
        experiments: {
          flexAddToGoogleCalendarExperimentVariant: AddToCalendarExperiment.GOOGLE_CALENDAR_FOR_VIRTUAL_VARIANT
        },
        calendarProviders: addToEventCalendarVirtualEventState
      };
    };
    const getStore = (overrides = {}) => {
      return createStoreWithMiddleware(combineReducers(mockAllReducers()), customState(overrides));
    };
    const store = getStore();
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ modalStyles: { headerStyles: { styleMappin... Remove this comment to see the full error message
    const dialog = shallow(<DownloadCalendarDialog store={store} {...props} />);
    const component = dialog.dive().shallow();
    component.instance().setState({
      selectOptions: {
        optionArray: componentState.optionArray,
        selectedValue: CalendarType.GOOGLE
      }
    });
    expect(getCalendarUrlSpy).toHaveBeenCalledWith(addToEventCalendarVirtualEventState);
  });

  test('when opened for both event and session and dropdown selected value is Google calendar and flexGoogleCalendar experiment is enabled with variant 2', async () => {
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'SpyInstance<any, [calendarState: any, entity... Remove this comment to see the full error message
    getCalendarUrlSpy = jest.spyOn(addToCalendarUtils, 'getGoogleCalendar');
    const getStore = (overrides = {}) => {
      return createStoreWithMiddleware(combineReducers(mockAllReducers()), {
        ...getState(overrides),
        event: {
          ...eventInfo,
          ...event
        },
        experiments: {
          flexAddToGoogleCalendarExperimentVariant: AddToCalendarExperiment.GOOGLE_CALENDAR_FOR_VIRTUAL_VARIANT
        },
        calendarProviders: addToEventCalendarVirtualEventState,
        registrationForm,
        visibleProducts
      });
    };
    const store = getStore();
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ modalStyles: { headerStyles: { styleMappin... Remove this comment to see the full error message
    const dialog = shallow(<DownloadCalendarDialog store={store} {...props} />);
    const component = dialog.dive().shallow();
    component.instance().setState({
      selectOptions: {
        optionArray: componentState.optionArray,
        selectedValue: CalendarType.GOOGLE
      }
    });
    expect(getCalendarUrlSpy).toHaveBeenCalledWith(addToEventCalendarVirtualEventState);
    expect(getCalendarUrlSpy).toHaveBeenCalledWith(
      addToEventCalendarVirtualEventState,
      '22b2fa58-a446-46cd-8888-2720925fb669'
    );
  });

  test('when opened for event and session in ics calendar format', () => {
    const getStore = (overrides = {}) => {
      return createStoreWithMiddleware(combineReducers(mockAllReducers()), {
        ...getState(overrides),
        event,
        registrationForm,
        visibleProducts,
        experiments: {
          flexAddToGoogleCalendarExperimentVariant: AddToCalendarExperiment.GOOGLE_CALENDAR_FOR_INPERSON_VARIANT
        }
      });
    };
    const store = getStore();
    const formatDownloadEventIcsFileUrlSpy = jest.spyOn(addToCalendarUtils, 'formatDownloadIcsFileUrl');
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ modalStyles: { headerStyles: { styleMappin... Remove this comment to see the full error message
    const dialog = shallow(<DownloadCalendarDialog store={store} {...props} />);
    const component = dialog.dive().shallow();
    component.simulate('click');
    expect(formatDownloadEventIcsFileUrlSpy).toHaveBeenCalledTimes(2);
  });

  test('when opened for event and session in ics calendar format for ical', () => {
    const getStore = (overrides = {}) => {
      return createStoreWithMiddleware(combineReducers(mockAllReducers()), {
        ...getState(overrides),
        event,
        registrationForm,
        visibleProducts,
        experiments: {
          flexAddToGoogleCalendarExperimentVariant: AddToCalendarExperiment.OUTLOOK_ICS_ICAL_CALENDAR_VARIANT
        }
      });
    };
    const store = getStore();
    const formatDownloadEventIcsFileUrlSpy = jest.spyOn(addToCalendarUtils, 'formatDownloadIcsFileUrl');
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ modalStyles: { headerStyles: { styleMappin... Remove this comment to see the full error message
    const dialog = shallow(<DownloadCalendarDialog store={store} {...props} />);
    const component = dialog.dive().shallow();
    component.instance().setState({
      selectOptions: {
        optionArray: componentState.optionArray,
        selectedValue: CalendarType.ICAL
      }
    });
    expect(formatDownloadEventIcsFileUrlSpy).toHaveBeenCalledWith({
      addToCalendarEnabled: true,
      attendeeId: '7129fc9a-5106-4c32-8eed-9c3ab7e16291',
      calendarBasePath: undefined,
      calendarType: 'ical',
      environment: 'Some',
      eventId: undefined,
      getPreviewToken: null,
      locale: 'en-US',
      testModeHash: null
    });
  });

  test('when opened for event and dropdown selected value is Outlook calendar and flexGoogleCalendar experiment is enabled with variant 3', async () => {
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'SpyInstance<any, [calendarState: any, entity... Remove this comment to see the full error message
    getCalendarUrlSpy = jest.spyOn(addToCalendarUtils, 'getOutlookCalendar');
    const eventTitle = {
      'dd48b4c4-672e-431c-be8d-5abfec299844.title': 'Annual Space Technology And Engineering Meeting'
    };
    const customState = overrides => {
      return {
        ...getState(overrides),
        event: {
          ...EventSnapshot.eventSnapshot,
          title: eventTitle['dd48b4c4-672e-431c-be8d-5abfec299844.title']
        },
        experiments: {
          flexAddToGoogleCalendarExperimentVariant: AddToCalendarExperiment.OUTLOOK_ICS_ICAL_CALENDAR_VARIANT
        },
        calendarProviders: addToEventCalendarVirtualEventState
      };
    };
    const getStore = (overrides = {}) => {
      return createStoreWithMiddleware(combineReducers(mockAllReducers()), customState(overrides));
    };
    const store = getStore();
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ modalStyles: { headerStyles: { styleMappin... Remove this comment to see the full error message
    const dialog = shallow(<DownloadCalendarDialog store={store} {...props} />);
    const component = dialog.dive().shallow();
    component.instance().setState({
      selectOptions: {
        optionArray: componentState.optionArray,
        selectedValue: CalendarType.OUTLOOK
      }
    });
    expect(getCalendarUrlSpy).toHaveBeenCalledWith(addToEventCalendarVirtualEventState);
  });
});

describe('Tests for attendee id and locale is passed to Event and Session calendars', () => {
  const testLocale = 'es-ES';

  const props = {
    ...openDownloadCalendarDialogParms
  };

  const getStore = (overrides = {}) => {
    return createStoreWithMiddleware(combineReducers(mockAllReducers()), {
      ...getState(overrides),
      event,
      registrationForm,
      visibleProducts,
      experiments: {
        flexAddToGoogleCalendarExperimentVariant: AddToCalendarExperiment.OUTLOOK_ICS_ICAL_CALENDAR_VARIANT
      },
      clients: {
        calendarClient,
        productVisibilityClient
      }
    });
  };

  test('download link has locale for ICS calendar', async () => {
    const store = getStore({ calendarContentType: 'event', locale: testLocale });
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openDownloadCalendarDialog(openDownloadCalendarDialogParms));
    dialog.update();
    const downloadUrl = dialog.find('[data-cvent-id="download-calendar-dialog-event-download"]').props().href;
    expect(downloadUrl.includes(testLocale)).toBeTruthy();
  });

  test('attendee id and locale is passed while calling calendar client for Event Calendar', async () => {
    const componentState = fileSelectionOptions(getState().text.translate);
    const store = getStore({ calendarContentType: 'event', locale: testLocale });
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ modalStyles: { headerStyles: { styleMappin... Remove this comment to see the full error message
    const dialog = shallow(<DownloadCalendarDialog store={store} {...props} />);
    const component = dialog.dive().shallow();
    component.instance().setState({
      selectOptions: {
        optionArray: componentState.optionArray,
        selectedValue: CalendarType.OUTLOOK
      }
    });

    component.find('a').simulate('click');
    expect(calendarClient.getEventCalendar).toHaveBeenCalledWith(
      CalendarType.OUTLOOK,
      '7129fc9a-5106-4c32-8eed-9c3ab7e16291',
      null,
      null,
      null,
      'es-ES'
    );
  });

  test('attendee id and locale is passed while calling calendar client for Event Calendar in Pending mode', async () => {
    const componentState = fileSelectionOptions(getState().text.translate);
    const getCustomStore = (overrides = { calendarContentType: 'event', locale: testLocale }) => {
      return createStoreWithMiddleware(combineReducers(mockAllReducers()), {
        ...getState(overrides),
        userSession: {
          inviteeId: '7129fc9a-5106-4c32-8eed-9c3ab7e16291'
        },
        event,
        visibleProducts: {
          ...visibleProducts.Sessions,
          Widget: {
            sessionProducts: {}
          }
        }
      });
    };
    const store = getCustomStore();
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ modalStyles: { headerStyles: { styleMappin... Remove this comment to see the full error message
    const dialog = shallow(<DownloadCalendarDialog store={store} {...props} />);
    const component = dialog.dive().shallow();
    component.instance().setState({
      selectOptions: {
        optionArray: componentState.optionArray,
        selectedValue: CalendarType.OUTLOOK
      }
    });

    component.find('a').simulate('click');
    expect(calendarClient.getEventCalendar).toHaveBeenCalledWith(
      CalendarType.OUTLOOK,
      '7129fc9a-5106-4c32-8eed-9c3ab7e16291',
      null,
      null,
      null,
      'es-ES'
    );
  });

  test('attendee id and locale is passed while calling calendar client for Session Calendar', async () => {
    const componentState = fileSelectionOptions(getState().text.translate);
    const store = getStore({ calendarContentType: 'sessions', locale: testLocale });
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ modalStyles: { headerStyles: { styleMappin... Remove this comment to see the full error message
    const dialog = shallow(<DownloadCalendarDialog store={store} {...props} />);
    const component = dialog.dive().shallow();
    component.instance().setState({
      selectOptions: {
        optionArray: componentState.optionArray,
        selectedValue: CalendarType.OUTLOOK
      }
    });

    component.find('a').simulate('click');
    expect(calendarClient.getSessionCalendar).toHaveBeenCalledWith(
      CalendarType.OUTLOOK,
      expect.anything(),
      '7129fc9a-5106-4c32-8eed-9c3ab7e16291',
      null,
      null,
      null,
      'es-ES'
    );
  });
});
