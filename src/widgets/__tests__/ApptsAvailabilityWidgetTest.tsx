import React from 'react';
import ApptsAvailabilityWidget from '../ApptsAvailabilityWidget';
import { mount } from 'enzyme';
import { utcToDisplayDate } from 'event-widgets/redux/modules/timezones';

const timeZone = {
  id: 35,
  name: 'Eastern Time',
  nameResourceKey: 'Event_Timezone_Name_35__resx',
  plannerDisplayName: '(GMT-05:00) Eastern [US & Canada]',
  hasDst: true,
  utcOffset: -300,
  abbreviation: 'ET',
  abbreviationResourceKey: 'Event_Timezone_Abbr_35__resx',
  dstInfo: []
};

const subscribe = () => {};

const defaultProps = {
  classes: {},
  style: { palette: {} },
  translate: (res, opts) => (opts ? `${res}:${JSON.stringify(opts)}` : res),
  isRegistrationPage: true,
  id: 'widget:apptsAvailability',
  'data-cvent-id': 'widget-ApptsAvailability-widget:apptsAvailability',
  type: 'ApptsAvailability',
  store: { dispatch, getState, subscribe },
  config: {
    headerText: 'Appts Availability',
    instructionalText: 'Sample Instructions',
    appData: {
      availabilityConfigOption: 'unavailability',
      apptEventDayInfo: [
        {
          date: '2019-06-28',
          dateEnabled: false,
          startTime: '09:00',
          endTime: '17:00'
        },
        {
          date: '2019-06-29',
          dateEnabled: false,
          startTime: '09:00',
          endTime: '17:00'
        }
      ]
    }
  }
};

const loadMetaDataFunction = jest.fn(() => {
  return {};
});

function getState() {
  return {
    guestText: {
      translate: resx => resx,
      translateTime() {},
      translateDate() {},
      resolver: {}
    },
    appointments: {
      appointmentEvent: {
        isValid: true,
        startTime: utcToDisplayDate('2019-06-28T09:00:00.000Z', timeZone),
        endTime: utcToDisplayDate('2019-06-29T10:00:00.000Z', timeZone),
        timeZone
      }
    },
    timezones: {
      35: timeZone
    },
    event: {
      timezone: 35,
      products: {
        admissionItems: {
          admissionItemNoFee: {
            id: 'admissionItemNoFee',
            capacityId: 'admissionItem1',
            name: 'Admission Item No Fee',
            code: 'Admission Item Code 2',
            description: 'Admission Item Description',
            associatedOptionalSessions: [],
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {},
            displayOrder: 2,
            isOpenForRegistration: true,
            applicableContactTypes: []
          }
        },
        sessionContainer: {
          optionalSessions: {
            associatedSession: {
              capacityId: 'associatedSessionCapacityId'
            },
            fullAssociatedSession: {
              capacityId: 'fullAssociatedSessionCapacityId'
            }
          }
        }
      }
    },
    website: {
      theme: {
        global: {}
      },
      pluginData: {
        registrationProcessNavigation: {
          registrationPaths: {
            regProcessStep1: {
              pageIds: ['regProcessStep1', 'regProcessStep2']
            }
          }
        }
      },
      siteInfo: {
        sharedConfigs: {}
      },
      layoutItems: {}
    },
    widgetFactory: {
      loadMetaData: loadMetaDataFunction
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          defaultRegPath: {
            name: 'reg_path_1'
          },
          newRegPath: {
            name: 'reg_path_2'
          }
        }
      }
    },
    pathInfo: {
      currentPageId: 'regProcessStep2'
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
    capacity: {},
    text: {
      resolver: {
        date: () => 'some date ',
        currency: x => x
      },
      translate: x => x
    },
    userSession: {},
    defaultUserSession: {
      isPlanner: false
    },
    config: {
      headerText: 'Appts Availability',
      instructionalText: 'Sample Instructions',
      availabilityConfigOption: 'unavailability',
      apptEventDayInfo: [
        {
          date: '2019-06-28',
          dateEnabled: false,
          startTime: '09:00',
          endTime: '17:00'
        },
        {
          date: '2019-06-29',
          dateEnabled: false,
          startTime: '09:00',
          endTime: '17:00'
        }
      ]
    },
    type: 'ApptsAvailability'
  };
}

async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState);
  }
}

describe('ApptsAvailabilityWidget', () => {
  test('should match snapshot', () => {
    const widget = mount(<ApptsAvailabilityWidget {...defaultProps} />);
    expect(widget.props()).toMatchSnapshot();
  });
});
