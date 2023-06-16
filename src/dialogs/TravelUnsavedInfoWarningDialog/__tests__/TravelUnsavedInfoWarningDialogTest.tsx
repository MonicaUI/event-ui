/* eslint-env jest */
import React from 'react';
import { mount } from 'enzyme';
import { TravelUnsavedInfoWarningDialog } from '../TravelUnsavedInfoWarningDialog';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { Provider } from 'react-redux';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';

jest.mock('../../../redux/pathInfo', () => ({
  routeToPage: jest.fn(() => () => {})
}));

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
    style: {},
    classes: {}
  },
  title: 'EventGuestSide_HotelShoulderDateWarning_Title__resx',
  informationalText: 'EventWidgets_TravelWidgets_UnsavedInfo_WarningText__resx',
  cancelSelectionLabel: 'EventGuestSide_AdmissionItemRegistrationTypeConflict_Cancel__resx',
  continueSelectionLabel: 'EventGuestSide_AdmissionItemRegistrationTypeConflict_Ok__resx',
  cancelSelection: jest.fn(),
  navigationHandler: jest.fn(),
  translate: text => text
};

describe('Travel unsaved info warning pop up', () => {
  test('Check if pop up is rendered.', async () => {
    const wrapper = mount(
      <Provider store={store}>
        <span>
          <TravelUnsavedInfoWarningDialog {...defaultProps} />
        </span>
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  test('On clicking -No Thanks- button on pop up, user redirected to cancellation.', async () => {
    const wrapper = mount(
      <Provider store={store}>
        <span>
          <TravelUnsavedInfoWarningDialog {...defaultProps} />
        </span>
      </Provider>
    );
    wrapper.find('[data-cvent-id="cancel-selection"]').hostNodes().simulate('click');
    expect(defaultProps.cancelSelection).toHaveBeenCalled();
  });
});
