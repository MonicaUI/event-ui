import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import { openTimeZoneDialog } from '..';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import transformEventData from 'event-widgets/utils/transformEventData';
import { wait } from '../../../testUtils';
import { setSelectedTimeZone } from '../../../redux/timeZoneSelection';
import { updateTimeZonePreference } from '../../../redux/timezones';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';

const timeZone = {
  utcOffset: new Date().getTimezoneOffset,
  id: 190,
  name: 'Event_GuestSide_DeviceTimeZone_resx',
  nameResourceKey: 'Event_GuestSide_DeviceTimeZone_resx'
};

jest.mock('../../../redux/timeZoneSelection');
(setSelectedTimeZone as $TSFixMe).mockImplementation(() => () => {});

jest.mock('../../../redux/timezones');
(updateTimeZonePreference as $TSFixMe).mockImplementation(() => () => {});

const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    event: (x = {}) => x,
    website: (x = {}) => x,
    appData: (x = {}) => x,
    text: (x = {}) => x,
    clients: (x = {}) => x,
    userSession: (x = {}) => x,
    defaultUserSession: (x = {}) => x,
    selectedTimeZone: (x = {}) => x,
    timezones: (x = {}) => x,
    pathInfo: (x = {}) => x
  }),
  {
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    appData: transformEventData(
      EventSnapshot.eventSnapshot.siteEditor.eventData,
      EventSnapshot.accountSnapshot,
      EventSnapshot.eventSnapshot,
      EventSnapshot.eventSnapshot.siteEditor.website
    ),
    timezones: [timeZone],
    event: {
      id: 'eventId',
      timezone: 190
    },
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    },
    defaultUserSession: {
      isPreview: false
    },
    pathInfo: {
      currentPageId: 'page1'
    }
  }
);

describe('TimeZoneDialog render tests', () => {
  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('renders list of different time zones when opened', () => {
    store.dispatch(openTimeZoneDialog());
    expect(dialog).toMatchSnapshot();
  });

  test('click on cancel closes time zone dialog', () => {
    store.dispatch(openTimeZoneDialog());
    dialog.update();
    dialog.find('[data-cvent-id="CancelButton"]').hostNodes().simulate('click');
    expect(dialog).toMatchSnapshot();
  });
});

describe('Time Zone Dialog user interaction tests', () => {
  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('Can switch between time zone and internal state is updated', async () => {
    store.dispatch(openTimeZoneDialog());
    dialog.update();
    dialog
      .find('[id="TimeZoneList_0"]')
      .hostNodes()
      .simulate('change', { target: { checked: true } });

    expect(dialog.find('[id="TimeZoneList_1"]').props().checked).toBeFalsy();

    // choose the second time zone
    dialog.find('[id="TimeZoneList_1"]').simulate('change', { target: { checked: true } });
    await wait(0);

    /*
     * asserting on selecting the radio button , internal state getting updated and the
     * other time zone get deselected
     */
    expect(dialog.find('[id="TimeZoneList_0"]').props().checked).toBeFalsy();
  });

  test('Clicking adjust button calls the set selectedTimeZone to save in redux state', async () => {
    store.dispatch(openTimeZoneDialog());
    dialog.update();
    dialog.find('[id="TimeZoneList_1"]').simulate('change', { target: { checked: true } });
    dialog.update();

    dialog.find('[data-cvent-id="AdjustButton"]').hostNodes().simulate('click');
    await wait(0);
    const expectedSelectedValue = {
      utcOffset: -new Date().getTimezoneOffset(),
      value: 1001,
      name: 'Event_GuestSide_DeviceTimeZone_desc_resx',
      nameResourceKey: 'Event_GuestSide_DeviceTimeZone__resx'
    };

    // asserting that the reducer is being called with selected Value
    expect(setSelectedTimeZone).toHaveBeenCalledWith(expectedSelectedValue);
    expect(updateTimeZonePreference).toHaveBeenCalledWith(expectedSelectedValue);
  });
});
