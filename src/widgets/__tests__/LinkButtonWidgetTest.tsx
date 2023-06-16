import React from 'react';
import LinkButtonWidget from '../LinkButtonWidget';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';

const state = {};

const store = {
  getState() {
    return state;
  },
  subscribe() {},
  dispatch() {}
};

describe('LinkButtonWidget', () => {
  test('renders', async () => {
    const props = {
      translate: x => {
        return x;
      },
      classes: {},
      style: {},
      config: {
        text: 'Custom Link Button',
        link: 'http://cvent.com',
        target: '_self'
      }
    };
    const wrapper = renderer
      .create(
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <Provider store={store}>
          {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ store: { getState(): {}; subscribe(): void... Remove this comment to see the full error message */}
          <LinkButtonWidget {...props} store={store} />
        </Provider>
      )
      .toJSON();
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.children[0].children[0].children[0]).toBe('Custom Link Button');
    expect(wrapper.children[0].children[0].props.href).toBe('http://cvent.com');
  });

  test('renders by escaping special characters and creating valid url', async () => {
    const props = {
      translate: x => {
        return x;
      },
      classes: {},
      style: {},
      config: {
        text: 'http://cvent.com?environment=S437&amp;locale=en-US',
        link: 'http://cvent.com?environment=S437&amp;locale=en-US',
        target: '_self'
      }
    };
    const wrapper = renderer
      .create(
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <Provider store={store}>
          {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ store: { getState(): {}; subscribe(): void... Remove this comment to see the full error message */}
          <LinkButtonWidget {...props} store={store} />
        </Provider>
      )
      .toJSON();
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.children[0].children[0].children[0]).toBe('http://cvent.com?environment=S437&locale=en-US');
    expect(wrapper.children[0].children[0].props.href).toBe('http://cvent.com?environment=S437&locale=en-US');
  });
});
