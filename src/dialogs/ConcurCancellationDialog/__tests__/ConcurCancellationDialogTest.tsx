/* eslint-env jest */
import React from 'react';
import { mount } from 'enzyme';
import ConcurCancellationDialog from '../ConcurCancellationDialog';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { Provider } from 'react-redux';
import { routeToPage } from '../../../redux/pathInfo';

jest.mock('../../../redux/pathInfo', () => ({
  routeToPage: jest.fn(() => () => {})
}));

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../../__mocks__/documentElementMock';
getMockedMessageContainer();

const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    text: (x = {}) => x
  }),
  {
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    }
  }
);

const defaultProps = {
  dialogConfig: {
    style: {},
    classes: {}
  },
  continueSelection: jest.fn(),
  translate: text => text
};

describe('Concur cancellation warning pop up', () => {
  test('Check if Concur cancellation warning pop up is rendered.', async () => {
    const wrapper = mount(
      <Provider store={store}>
        <span>
          <ConcurCancellationDialog {...defaultProps} />
        </span>
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  test('On clicking continue button on cancellation warning pop up, user redirected to cancellation.', async () => {
    const wrapper = mount(
      <Provider store={store}>
        <span>
          <ConcurCancellationDialog {...defaultProps} />
        </span>
      </Provider>
    );
    wrapper.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
    expect(routeToPage).toHaveBeenCalledWith('cancelRegistration');
  });
});
