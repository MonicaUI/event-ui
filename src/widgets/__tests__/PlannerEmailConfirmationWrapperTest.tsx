import React from 'react';
import renderer from 'react-test-renderer';
import PlannerEmailConfirmationWrapper from '../PlannerEmailConfirmationWidget/PlannerEmailConfirmationWrapper';
import RegistrationNavigatorWidget from '../RegistrationNavigator/RegistrationNavigatorWidget';
import { createStore } from 'redux';
import { createLocalNucleusForm } from 'nucleus-form/src/NucleusForm';

jest.mock('../../redux/website/registrationProcesses', () => {
  return {
    REGISTRATION: {
      forPathContainingWidget: () => {
        return {
          pageIds: () => {
            return ['67890', '12345'];
          }
        };
      }
    }
  };
});

jest.mock('../../ExperimentHelper', () => ({
  ...jest.requireActual<$TSFixMe>('../../ExperimentHelper'),
  useGraphQLForSkippingPages: () => false
}));

const defaultProps = {
  nucleusForm: createLocalNucleusForm(),
  classes: {},
  style: {},
  translate: jest.fn(x => x),
  config: {
    displayText: {
      backward: 'backward',
      forward: 'forward',
      complete: 'complete',
      exit: 'exit'
    }
  }
};

let initialState = {};

describe('PlannerEmailConfirmationWrapper', () => {
  beforeEach(() => {
    initialState = {
      text: {
        translate: () => jest.fn(x => x)
      },
      defaultUserSession: {
        isPlanner: true
      },
      pathInfo: {
        currentPageId: '12345'
      },
      website: {
        theme: {
          global: {
            elements: {}
          }
        }
      },
      registrationForm: {
        regCart: {
          sendEmail: true
        }
      }
    };
    jest.clearAllMocks();
  });
  test('should render with no checkbox visible on non-last page', () => {
    (initialState as $TSFixMe).pathInfo.currentPageId = '67890';
    const widget = renderer.create(
      <PlannerEmailConfirmationWrapper
        {...defaultProps}
        store={createStore((state = initialState) => {
          return state;
        })}
        NavigatorWidget={RegistrationNavigatorWidget}
      />
    );
    expect(widget).toMatchSnapshot();
  });
  test('should render with no checkbox visible when not planner', () => {
    (initialState as $TSFixMe).defaultUserSession.isPlanner = false;
    const widget = renderer.create(
      <PlannerEmailConfirmationWrapper
        {...defaultProps}
        store={createStore((state = initialState) => {
          return state;
        })}
        NavigatorWidget={RegistrationNavigatorWidget}
      />
    );
    expect(widget).toMatchSnapshot();
  });
  test('pre-load checkbox widget for test', () => {
    const widget = renderer.create(
      <PlannerEmailConfirmationWrapper
        {...defaultProps}
        store={createStore((state = initialState) => {
          return state;
        })}
        NavigatorWidget={RegistrationNavigatorWidget}
      />
    );
    expect(widget).toMatchSnapshot();
  });
  test('should render with checkbox visible when planner', () => {
    const widget = renderer.create(
      <PlannerEmailConfirmationWrapper
        {...defaultProps}
        store={createStore((state = initialState) => {
          return state;
        })}
        NavigatorWidget={RegistrationNavigatorWidget}
      />
    );
    expect(widget).toMatchSnapshot();
  });
});
