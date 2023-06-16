import React from 'react';
import AgendaWidget from '../AgendaWidget';
import { shallow } from 'enzyme';
import { updateIn } from 'icepick';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { dstInfo } from '../../../fixtures/EasternTimeDstInfoFixture';

const state = {
  text: {
    translate: resx => resx,
    translateTime() {},
    translateDate() {},
    resolver: {}
  },
  appData: {
    timeZoneSetting: {
      displayTimeZone: true,
      selectedWidgets: ['agenda']
    }
  },
  event: {
    timezone: 35,
    products: {
      sessionContainer: {
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
          displayOnWebsite: true,
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
        },
        speakerId3: {
          id: 'speakerId3',
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
            }
          },
          trackRegistrations: {},
          registrationTypeName: '',
          registrationPathId: 'b5463d12-2f6f-4696-9b30-e38aa4144b86'
        }
      }
    }
  },
  userSession: {},
  defaultUserSession: {
    isPlanner: false
  },
  registrationTypeId: {
    '00000000-0000-0000-0000-000000000000': {
      id: '00000000-0000-0000-0000-000000000000'
    }
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
  visibleProducts: {
    'Agenda:agendaWidgetId': {
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
          showOnAgenda: true,
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
          },
          speakerIds: {
            speakerId1: {
              speakerId: 'speakerId1',
              speakerCategoryId: '59f34dba-0c33-4fc8-a83b-7ae3bfb16bea',
              sessionId: '2f7209f5-e42b-4792-b6fd-504873b467072'
            },
            speakerId2: {
              speakerId: 'speakerId2',
              speakerCategoryId: '59f34dba-0c33-4fc8-a83b-7ae3bfb16bea',
              sessionId: '2f7209f5-e42b-4792-b6fd-504873b46707'
            },
            speakerId3: {
              speakerId: 'speakerId3',
              speakerCategoryId: '59f34dba-0c33-4fc8-a83b-7ae3bfb16bea',
              sessionId: '2f7209f5-e42b-4792-b6fd-504873b46707'
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
          showOnAgenda: true,
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
          showOnAgenda: true,
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
          showOnAgenda: true,
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
  }
};

test('AgendaWidget produces props from state', () => {
  const store = {
    getState() {
      return state;
    },
    subscribe() {},
    dispatch() {}
  };

  const props = {
    id: 'agendaWidgetId'
  };

  const widget = shallow(<AgendaWidget {...props} store={store} config={{}} />);

  // Hack to stop pretty-format from breaking on this object
  const propsExpected = updateIn(widget.props(), ['classes', 'sessionFilter', 'multiselect', 'menu'], x => ({ ...x }));

  expect(propsExpected).toMatchSnapshot();
});

test('selecting device timezone from timezone dialog changes the session timings to be displayed', () => {
  const store = {
    getState() {
      return {
        ...state,
        appData: {
          ...state.appData,
          timeZoneSetting: {
            displayTimeZone: true,
            selectedWidgets: ['agenda']
          }
        },
        selectedTimeZone: {
          utcOffset: 330,
          value: 1001,
          abbreviation: 'IST'
        }
      };
    },
    subscribe() {},
    dispatch() {}
  };
  const props = {
    id: 'agendaWidgetId'
  };

  const getTimezoneOffset = Date.prototype.getTimezoneOffset;
  // eslint-disable-next-line no-extend-native
  Date.prototype.getTimezoneOffset = () => {
    return -330;
  };

  const widget = shallow(<AgendaWidget {...props} store={store} config={{}} />);

  const startTime = '2017-09-08T22:00:00.000Z';
  const endTime = '2017-09-08T23:00:00.000Z';
  let k = 0;
  while (k < 4) {
    const adjustedStartTime = widget.getElement().props.children.props.sessions[k].startTime;
    const adjustedEndTime = widget.getElement().props.children.props.sessions[k].endTime;
    // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    const differenceStart = new Date(adjustedStartTime) - new Date(startTime);
    // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    const differenceEnd = new Date(adjustedEndTime) - new Date(endTime);
    expect(differenceStart / 3600000).toBe(9.5); // The hour difference between IST and ET with daylight savings
    expect(differenceEnd / 3600000).toBe(9.5);
    k = k + 1;
  }
  // eslint-disable-next-line no-extend-native
  Date.prototype.getTimezoneOffset = getTimezoneOffset;
});

test('selecting event timezone from timezone dialog does not change the session timings', () => {
  const store = {
    getState() {
      return {
        ...state,
        appData: {
          ...state.appData,
          timeZoneSetting: {
            displayTimeZone: true,
            selectedWidgets: ['agenda']
          }
        },
        selectedTimeZone: {
          utcOffset: -240,
          value: 35,
          abbreviation: 'ET'
        }
      };
    },
    subscribe() {},
    dispatch() {}
  };
  const props = {
    id: 'agendaWidgetId'
  };

  const widget = shallow(<AgendaWidget {...props} store={store} config={{}} />);

  const startTime = '2017-09-08T22:00:00.000Z';
  const endTime = '2017-09-08T23:00:00.000Z';
  let k = 0;
  while (k < 4) {
    const adjustedStartTime = widget.getElement().props.children.props.sessions[k].startTime;
    const adjustedEndTime = widget.getElement().props.children.props.sessions[k].endTime;
    // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    const differenceStart = new Date(adjustedStartTime) - new Date(startTime);
    // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    const differenceEnd = new Date(adjustedEndTime) - new Date(endTime);
    expect(differenceStart / 3600000).toBe(0); // No change as selected timezone is the event timezone
    expect(differenceEnd / 3600000).toBe(0);
    k = k + 1;
  }
});
