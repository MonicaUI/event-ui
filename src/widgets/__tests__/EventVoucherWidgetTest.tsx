import React from 'react';
import EventVoucherWidget from '../EventVoucherWidget';
import { shallow } from 'enzyme';

let isRegMod = false;
let isPlanner = false;
function getState() {
  return {
    registrationForm: {
      regCart: {
        regMod: isRegMod,
        currentEventRegistrationId: 'CURRENT_REGISTRATION_ID',
        eventRegistrations: {
          CURRENT_REGISTRATION_ID: {
            registrationStatus: null
          }
        }
      }
    },
    defaultUserSession: {
      isPlanner
    }
  };
}
const subscribe = () => {};
async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState);
  }
}
const props = {
  store: { getState, subscribe, dispatch },
  translate: (res, opts) => (opts ? `${res}:${JSON.stringify(opts)}` : res),
  style: {},
  config: {
    displayText: ''
  },
  classes: {}
};

describe('EventVoucherWidget', () => {
  test('should render', () => {
    const widget = shallow(<EventVoucherWidget {...props} />);
    expect(widget).toMatchSnapshot();
  });

  test('should not render when hidden', () => {
    isRegMod = true;
    const widget = shallow(<EventVoucherWidget {...props} />);
    expect(widget).toMatchSnapshot();
    isRegMod = false;
  });

  test('should not be required for planner', () => {
    isPlanner = true;
    const widget = shallow(<EventVoucherWidget {...props} />);
    expect(widget).toMatchSnapshot();
    isPlanner = false;
  });
});
