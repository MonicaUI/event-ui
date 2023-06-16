import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import TransparentWrapper from '../TransparentWrapper';
import configureStore from 'redux-mock-store';
import { SHOW_TRANSPARENT_WRAPPER, HIDE_TRANSPARENT_WRAPPER } from '../../redux/actionTypes';
import reducer from '../../redux/transparentWrapper';

class TransparentWrapperTest extends React.Component {
  shouldShowWrapper: $TSFixMe;
  render() {
    return <TransparentWrapper {...this.shouldShowWrapper} />;
  }
}

describe('the TransparentWrapper', () => {
  const initialState = {
    transparentWrapper: {
      showTransparentWrapper: true
    }
  };

  const mockStore = configureStore();
  let store;
  let wrapper;

  beforeEach(() => {
    store = mockStore(initialState);
    wrapper = mount(
      <Provider store={store}>
        <TransparentWrapperTest />
      </Provider>
    );
  });

  it('should render the wrapper component', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should render with 2 divs', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should render with transparent-wrapper-preview when state prop is true', () => {
    const shouldShowWrapper = wrapper.find('[data-cvent-id="transparent-wrapper-preview"]');
    expect(shouldShowWrapper.length).toEqual(1);
  });

  it('should not render with transparent-wrapper-preview when state prop is false', () => {
    const updateState = {
      transparentWrapper: {
        showTransparentWrapper: false
      }
    };
    store = mockStore(updateState);
    wrapper = mount(
      <Provider store={store}>
        <TransparentWrapperTest />
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
    const shouldShowWrapper = wrapper.find('[data-cvent-id="transparent-wrapper-preview"]');
    expect(shouldShowWrapper.length).toEqual(0);
  });

  it('should have correct action on dispatching', () => {
    let action;
    store.dispatch({ type: SHOW_TRANSPARENT_WRAPPER });
    store.dispatch({ type: HIDE_TRANSPARENT_WRAPPER });
    // eslint-disable-next-line prefer-const
    action = store.getActions();
    expect(action[0].type).toBe('event-guestside-site/SHOW_TRANSPARENT_WRAPPER');
    expect(action[1].type).toBe('event-guestside-site/HIDE_TRANSPARENT_WRAPPER');
  });
});

describe('the transparentWrapper reducer test', () => {
  it('should change state to true when dispatch SHOW_TRANSPARENT_WRAPPER', () => {
    let state = {
      showTransparentWrapper: false
    };
    state = reducer(state, { type: SHOW_TRANSPARENT_WRAPPER });
    expect(state).toEqual({
      showTransparentWrapper: true
    });
  });
  it('should change state to false when dispatch SHOW_TRANSPARENT_WRAPPER', () => {
    let state = {
      showTransparentWrapper: true
    };
    state = reducer(state, { type: HIDE_TRANSPARENT_WRAPPER });
    expect(state).toEqual({
      showTransparentWrapper: false
    });
  });
});
