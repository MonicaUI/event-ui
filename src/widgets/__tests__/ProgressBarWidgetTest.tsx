import React from 'react';
import ProgressBarWidget from '../ProgressBarWidget';
import { getPageNames } from '../ProgressBarWidget';
import { shallow } from 'enzyme';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import withForm from 'nucleus-form/src/components/withForm';

jest.mock('../../redux/pathInfo', () => {
  return {
    getCurrentPageId: () => 'current-page'
  };
});

jest.mock('../../redux/website/registrationProcesses', () => {
  return {
    isRegistrationPage: () => true
  };
});

jest.mock('../../redux/selectors/currentRegistrant', () => {
  return {
    getRegistrationPathId: () => 'regpath1'
  };
});

jest.mock('../RegistrationNavigator/RegistrationNavigatorWidget', () => {
  return {
    saveRegistrationAndRouteToPage: () => true,
    withScrollToFirstError: () => true
  };
});

function getState() {
  const state = {
    text: {
      translate: x => x
    },
    website: ['pluginData', 'registrationProcessNavigation', 'registrationPaths', 'regpath1']
      .reverse()
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      .reduce((prev, current) => ({ [current]: { ...prev } }), { pageIds: ['current-page', 'next-page'] })
  };
  (state.website as $TSFixMe).pages = {
    'current-page': {
      name: 'current-page'
    },
    'next-page': {
      name: 'next-page'
    }
  };

  return state;
}

async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState);
  }
}

const subscribe = jest.fn();
const defaultProps = {
  classes: {},
  style: {},
  translate: c => c,
  store: { dispatch, getState, subscribe }
};

describe('ProgressBar produces props from state', () => {
  test('should match', () => {
    const widget = shallow(
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'withForm' does not exist on type 'JSX.In... Remove this comment to see the full error message
      <withForm>
        <ProgressBarWidget {...defaultProps} />
        {/* @ts-expect-error ts-migrate(2339) FIXME: Property 'withForm' does not exist on type 'JSX.In... Remove this comment to see the full error message */}
      </withForm>
    );
    expect(widget.props()).toMatchSnapshot();
  });
});

describe('getPageNames', () => {
  it('should get names of the pages for the progress bar when the pages has the correct pageIds', () => {
    const widgets = getPageNames(getState(), ['current-page', 'next-page']);
    expect(widgets.length).toBe(2);
  });
  it('should get names of the pages for the progress bar even when the pages do not have those pageIds', () => {
    const widgets = getPageNames(getState(), ['current-page1']);
    expect(widgets[0]).toBe(undefined);
  });
});
