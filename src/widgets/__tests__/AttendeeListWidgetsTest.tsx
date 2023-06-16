import React from 'react';
import AttendeeListWidget from '../AttendeeListWidget';
import { shallow } from 'enzyme';

function getState() {
  return {
    attendeeList: {
      attendeeEmailSuccess: false,
      attendeeEmailError: false
    }
  };
}

const subscribe = () => {};
const defaultProps = {
  classes: {},
  style: {},
  translate: c => c,
  store: { dispatch, getState, subscribe }
};

async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState);
  }
}

describe('AttendeeListWidget', () => {
  test('should match snapshot', () => {
    const widget = shallow(<AttendeeListWidget {...defaultProps} />);
    expect(widget.props()).toMatchSnapshot();
  });
});
