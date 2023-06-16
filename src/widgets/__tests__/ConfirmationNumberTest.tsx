import React from 'react';
import { mount } from 'enzyme';
import ConfirmationNumber from '../ConfirmationNumber';
import { Provider } from 'react-redux';
import configureStore from '../../redux/configureStore';

const state = {
  registrationForm: {
    regCart: {
      eventRegistrations: {
        '00000': {
          confirmationNumber: '012345'
        }
      }
    }
  }
};
const mockStore = configureStore(state);

const props = {
  config: {
    headerText: ''
  },
  style: {},
  translate: jest.fn(s => s)
};

describe('ConfirmationNumber', () => {
  test('renders', () => {
    const widget = mount(
      <Provider store={mockStore}>
        <ConfirmationNumber {...props} />
      </Provider>
    );
    expect(widget.someWhere(wrapper => wrapper.text() === '012345')).toBeTruthy();
  });
});
