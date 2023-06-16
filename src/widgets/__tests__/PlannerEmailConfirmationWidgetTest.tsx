import React from 'react';
import renderer from 'react-test-renderer';
import PlannerEmailConfirmationWidget from '../PlannerEmailConfirmationWidget/PlannerEmailConfirmationWidget';
import { createStore } from 'redux';

jest.mock('../../redux/registrationForm/regCart/actions', () => {
  return {
    setSendEmailFlag: jest.fn(x => x)
  };
});
jest.mock('../../redux/pathInfo', () => {
  return {
    getCurrentPageId: () => {
      return '12345';
    }
  };
});

const initialState = {
  event: {},
  text: {
    translate: () => jest.fn(x => x)
  },
  guestText: {
    translate: () => jest.fn(x => x)
  },
  defaultUserSession: {
    isPlanner: true
  },
  website: {
    theme: {
      global: {
        elements: {}
      }
    }
  },
  customFonts: {},
  registrationForm: {
    regCart: {
      sendEmail: true
    }
  }
};

const defaultProps = {
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

describe('PlannerEmailConfirmationWidget', () => {
  test('should render', () => {
    const widget = renderer.create(
      <PlannerEmailConfirmationWidget
        {...defaultProps}
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ store: Store<unknown, Action<any>>; classe... Remove this comment to see the full error message
        store={createStore((state = initialState) => {
          return state;
        })}
      />
    );
    expect(widget).toMatchSnapshot();
  });
});
