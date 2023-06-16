import React from 'react';
import SurveyWidget from '../SurveyWidget';
import { shallow } from 'enzyme';

function getState() {
  return {
    event: {
      eventFeatureSetup: {
        registrationProcess: {
          inquisiumFeedbackSurvey: true
        }
      }
    },
    text: {
      translate: x => x,
      translateWithDatatags: x => x
    }
  };
}
const dispatch = () => {};
const subscribe = () => {};

const defaultProps = {
  config: {
    link: 'www.fakeLink',
    text: 'survey widget',
    target: 'blank'
  },
  translate: jest.fn(x => x),
  enableHyperlink: true,
  style: {},
  store: { dispatch, getState, subscribe }
};

describe('SurveyWidget', () => {
  test('should match', () => {
    const widget = shallow(<SurveyWidget {...defaultProps} />);
    expect(widget.props()).toMatchSnapshot();
  });
});

describe('SurveyWidget: if survey feature is turned off should not display widget', () => {
  test('should match', () => {
    const state = getState();
    function getLocalState() {
      return {
        ...state,
        event: {
          eventFeatureSetup: {
            registrationProcess: {
              inquisiumFeedbackSurvey: false
            }
          }
        }
      };
    }
    const props = {
      ...defaultProps,
      store: { dispatch, getState: getLocalState, subscribe }
    };
    const widget = shallow(<SurveyWidget {...props} />);
    expect(widget.props()).toMatchSnapshot();
  });
});
