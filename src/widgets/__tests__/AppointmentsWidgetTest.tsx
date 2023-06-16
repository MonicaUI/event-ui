import React from 'react';
import AppointmentsWidget from '../AppointmentsWidget';
import * as currentRegistrant from '../../redux/selectors/currentRegistrant';
import Adapter from 'enzyme-adapter-react-16';
import Enzyme from 'enzyme';
import { mount, shallow } from 'enzyme';
import * as selectors from '../../redux/registrationForm/regCart/selectors';

Enzyme.configure({ adapter: new Adapter() });

const mockRegistrationId = '4271b4be-af1e-44a3-8549-445ab41da5f9';

jest.mock('../../redux/selectors/currentRegistrant');
jest.mock('../../redux/registrationForm/regCart/selectors');

afterEach(() => {
  jest.clearAllMocks();
});

const subscribe = () => {};

const props = {
  classes: {},
  style: { palette: {} },
  translate: (res, opts) => (opts ? `${res}:${JSON.stringify(opts)}` : res),
  store: { dispatch, subscribe, getState: () => {} }
};

async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, (props as $TSFixMe).getState);
  }
}

describe('AppointmentsWidget', () => {
  test('should match snapshot', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        appointments: {
          appointmentEventStatus: 'ACTIVE'
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    const widget = mount(<AppointmentsWidget {...props} />);
    expect(widget).toMatchSnapshot();
  });

  test('should not be visible if regcart is absent', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        appointments: {
          appointmentEventStatus: 'ACTIVE'
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().display).toBe(false);
  });

  test('should not throw an exception if regcart is absent', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    expect(() => mount(<AppointmentsWidget {...props} />)).not.toThrow();
  });

  test('should not be visible if getEventRegistrationId is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return undefined;
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().display).toBe(false);
  });

  test('should not throw exception if is admin and there are no registration ids', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return true;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return undefined;
    };
    // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'getPrimaryRegistrationId' becaus... Remove this comment to see the full error message
    // eslint-disable-next-line import/namespace
    selectors.getPrimaryRegistrationId = () => {
      throw Error('mock error');
    };
    expect(() => mount(<AppointmentsWidget {...props} />)).not.toThrow();
  });

  test('should not be visible if is admin and primaryRegistrationId is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return true;
    };
    // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'getPrimaryRegistrationId' becaus... Remove this comment to see the full error message
    // eslint-disable-next-line import/namespace
    selectors.getPrimaryRegistrationId = () => {
      return undefined;
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().display).toBe(false);
  });

  test('should not throw exception if is admin and primaryRegistrationId is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        appointments: {
          appointmentEventStatus: 'ACTIVE'
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return true;
    };
    // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'getPrimaryRegistrationId' becaus... Remove this comment to see the full error message
    // eslint-disable-next-line import/namespace
    selectors.getPrimaryRegistrationId = () => {
      return undefined;
    };
    expect(() => mount(<AppointmentsWidget {...props} />)).not.toThrow();
  });

  test('should not be visible if is admin and getConfirmationNumber is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        registrationForm: {
          regCart: {}
        },
        text: {
          translate: props.translate
        },
        appointments: {
          appointmentEventStatus: 'ACTIVE'
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return true;
    };
    // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'getPrimaryRegistrationId' becaus... Remove this comment to see the full error message
    // eslint-disable-next-line import/namespace
    selectors.getPrimaryRegistrationId = () => {
      return 'mockId';
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().display).toBe(false);
  });

  test('should use group leader confirmation number for admin', () => {
    props.store.getState = () => {
      return {
        registrationForm: {
          regCart: {}
        },
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        appointments: {
          appointmentEventStatus: 'ACTIVE'
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return true;
    };
    // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'getPrimaryRegistrationId' becaus... Remove this comment to see the full error message
    // eslint-disable-next-line import/namespace
    selectors.getPrimaryRegistrationId = () => {
      return 'mockId';
    };
    // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'getConfirmationNumber' because i... Remove this comment to see the full error message
    // eslint-disable-next-line import/namespace
    selectors.getConfirmationNumber = () => {
      return 'groupLeaderNumber';
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().config.link).toBe('mockUrl/event/code/groupLeaderNumber');
  });

  test('should not be visible if is not admin and getConfirmationInfo is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return undefined;
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().display).toBe(false);
  });

  test('should not throw exception if is not admin and getConfirmationInfo is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        appointments: {
          appointmentEventStatus: 'ACTIVE'
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return undefined;
    };
    expect(() => mount(<AppointmentsWidget {...props} />)).not.toThrow();
  });

  test('should not be visible if is not admin and confirmationNumber is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return { confirmationInfo: undefined };
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().display).toBe(false);
  });

  test('should use currentRegistrant confirmation number for non-admin', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        appointments: {
          appointmentEventStatus: 'ACTIVE'
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().config.link).toBe('mockUrl/event/code/confirmationNumber');
  });

  test('should not be visible if appointmentsUrl is undefined', () => {
    props.store.getState = () => {
      return {
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        appointments: {
          appointmentEventStatus: 'ACTIVE'
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().display).toBe(false);
  });

  test('should not be visible if event is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().display).toBe(false);
  });

  test('should not throw exception if event is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    expect(() => mount(<AppointmentsWidget {...props} />)).not.toThrow();
  });

  test('should not be visible if linkedAppointmentEvent is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {},
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().display).toBe(false);
  });

  test('should not throw exception if linkedAppointmentEvent is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {},
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    expect(() => mount(<AppointmentsWidget {...props} />)).not.toThrow();
  });

  test('should not be visible if linkedAppointmentEvent is undefined 1', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {},
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().display).toBe(false);
  });

  test('should not be visible if eventCode is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {}
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().display).toBe(false);
  });

  test('should not throw exception if eventCode is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {}
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    expect(() => mount(<AppointmentsWidget {...props} />)).not.toThrow();
  });

  test('should not throw exception if userSession is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {}
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    expect(() => mount(<AppointmentsWidget {...props} />)).not.toThrow();
  });

  test('should not throw exception if isTestMode is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {}
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {}
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    expect(() => mount(<AppointmentsWidget {...props} />)).not.toThrow();
  });

  test('should not be visible if appointments is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().display).toBe(false);
  });

  test('should not throw exception if appointments is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    expect(() => mount(<AppointmentsWidget {...props} />)).not.toThrow();
  });

  test('should not be visible if appointmentEventStatus is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        appointments: {},
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().display).toBe(false);
  });

  test('should not throw exception if appointmentEventStatus is undefined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        appointments: {},
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    expect(() => mount(<AppointmentsWidget {...props} />)).not.toThrow();
  });

  test('should not be visible if linkedAppointmentEvent, confirmationNumber, and an eventRegistration are defined, and appointment event status is not ACTIVE', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        appointments: {
          appointmentEventStatus: 'PENDING'
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().display).toBe(false);
  });

  test('should be visible in Test Mode if appointment event status is not ACTIVE', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        appointments: {
          appointmentEventStatus: 'PENDING'
        },
        defaultUserSession: {
          isTestMode: true
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().display).toBe(true);
  });

  test('should be visible if linkedAppointmentEvent, confirmationNumber, and an eventRegistration are defined', () => {
    props.store.getState = () => {
      return {
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        registrationForm: {
          regCart: {}
        },
        appointments: {
          appointmentEventStatus: 'ACTIVE'
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getConfirmationInfo = () => {
      return {
        confirmationNumber: 'confirmationNumber'
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return false;
    };
    const widget = shallow(<AppointmentsWidget {...props} />);
    expect(widget.dive().props().display).toBe(true);
  });

  test('should call getConfirmationNumber with regCart, primaryRegistrationId if admin', () => {
    props.store.getState = () => {
      return {
        registrationForm: {
          regCart: {}
        },
        appointmentsUrl: 'mockUrl',
        event: {
          linkedAppointmentEvent: {
            eventCode: 'code'
          }
        },
        text: {
          translate: props.translate
        },
        appointments: {
          appointmentEventStatus: 'ACTIVE'
        },
        defaultUserSession: {
          isTestMode: false
        }
      };
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.getEventRegistrationId = () => {
      return mockRegistrationId;
    };
    // eslint-disable-next-line import/namespace
    currentRegistrant.isAdminRegistration = () => {
      return true;
    };
    // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'getPrimaryRegistrationId' becaus... Remove this comment to see the full error message
    // eslint-disable-next-line import/namespace
    selectors.getPrimaryRegistrationId = () => {
      return 'mockId';
    };
    // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'getConfirmationNumber' because i... Remove this comment to see the full error message
    // eslint-disable-next-line import/namespace
    selectors.getConfirmationNumber = jest.fn();
    mount(<AppointmentsWidget {...props} />);
    expect(selectors.getConfirmationNumber).toBeCalledWith({}, 'mockId');
  });
});
