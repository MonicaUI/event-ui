import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import React from 'react';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { ShoulderDateApprovalWarningDialog } from '../ShoulderDateApprovalWarningDialog';

const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    text: (x = {}) => x,
    website: (x = {}) => x
  }),
  {
    website: {
      theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
    },
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    }
  }
);

const defaultProps = {
  dialogConfig: {
    style: EventSnapshot.eventSnapshot.siteEditor.website.theme.global,
    classes: {}
  },
  title: 'EventGuestSide_HotelShoulderDateWarning_Title__resx',
  confirmChoice: jest.fn(),
  translate: text => text
};

describe('Shoulder Date Approval Warning pop up', () => {
  test('Check if pop up is rendered.', async () => {
    const wrapper = mount(
      <Provider store={store}>
        <span>
          <ShoulderDateApprovalWarningDialog {...defaultProps} />
        </span>
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
