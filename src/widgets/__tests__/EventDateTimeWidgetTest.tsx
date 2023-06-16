import React from 'react';
import EventDateTimeWidget from '../EventDateTimeWidget';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';

function translateDate(value, format) {
  return `${format}:${value.toISOString().slice(0, 10)}`;
}

function translateTime(value) {
  return value.toISOString().slice(11, 16);
}

function translate(res, opts) {
  return opts ? `${res}:${JSON.stringify(opts)}` : res;
}

const startDate = '2020-06-17T09:00:00.000Z';
const endDate = '2020-06-18T21:00:00.000Z';

const state = {
  appData: {},
  text: {
    translate,
    translateTime,
    translateDate,
    resolver: {}
  },
  event: {
    timezone: 40,
    startDate,
    endDate
  },
  timezones: {
    40: {
      id: 40,
      name: 'US Eastern Time',
      nameResourceKey: 'Event_Timezone_Name_40__resx',
      plannerDisplayName: '(GMT-05:00) Indiana [East]',
      hasDst: false,
      utcOffset: -300,
      abbreviation: 'EST',
      abbreviationResourceKey: 'EST translation',
      dstInfo: []
    }
  }
};

const props = {
  classes: {},
  style: {},
  translate,
  currency: (...args) => `currency:${JSON.stringify(args)}`,
  translateTime,
  translateDate,
  config: {
    displayDateOption: 'dateTimeTimezone'
  }
};

describe('EventDateTimeWidget', () => {
  test('renders', async () => {
    const store = {
      getState() {
        return state;
      },
      subscribe() {},
      dispatch() {}
    };
    const wrapper = renderer
      .create(
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <Provider store={store}>
          {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ store: { getState(): { appData: {}; text: ... Remove this comment to see the full error message */}
          <EventDateTimeWidget {...props} store={store} />
        </Provider>
      )
      .toJSON();
    expect(wrapper).toMatchSnapshot();
  });
});

describe('EventDateTimeWidget selected timezone tests', () => {
  test('selecting device timezone changes the time and does not append abbreviation', async () => {
    const store = {
      getState() {
        return {
          ...state,
          appData: {
            ...state.appData,
            timeZoneSetting: {
              displayTimeZone: true,
              selectedWidgets: ['eventDateTime']
            }
          },
          selectedTimeZone: {
            utcOffset: 330,
            value: 1001,
            abbreviation: 'IST',
            nameResourceKey: 'your device time zone'
          }
        };
      },
      subscribe() {},
      dispatch() {}
    };
    const getTimezoneOffset = Date.prototype.getTimezoneOffset;
    // eslint-disable-next-line no-extend-native
    Date.prototype.getTimezoneOffset = () => {
      return -330;
    };
    const wrapper = renderer
      .create(
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <Provider store={store}>
          {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ store: { getState(): { appData: { timeZone... Remove this comment to see the full error message */}
          <EventDateTimeWidget {...props} store={store} />
        </Provider>
      )
      .toJSON();
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.children[0].children[1].children[0]).toBe(
      'Widget_DateTimeWidget_TimeRangeText__resx:{"startTime":"19:30","endTime":"07:30"}'
    );
    expect(wrapper.children[0].children[1].children[1].children[0]).toBe('');
    expect(wrapper.children[1].props['data-cvent-id']).toBe('timeZoneWidgetContainer');
    expect(wrapper.children[1].children[0].children[1]).toBe(
      'Event_GuestSide_TimeZone_ViewText__resx:{"timeZone":"your device time zone"}'
    );
    // eslint-disable-next-line no-extend-native
    Date.prototype.getTimezoneOffset = getTimezoneOffset;
  });

  test('selecting event timezone does not change the time and appends abbreviation', async () => {
    const store = {
      getState() {
        return {
          ...state,
          appData: {
            ...state.appData,
            timeZoneSetting: {
              displayTimeZone: true,
              selectedWidgets: ['eventDateTime']
            }
          },
          selectedTimeZone: {
            utcOffset: -300,
            value: 40,
            abbreviation: 'EST',
            abbreviationResourceKey: 'EST translation',
            nameResourceKey: 'Eastern Standard Time'
          }
        };
      },
      subscribe() {},
      dispatch() {}
    };
    const wrapper = renderer
      .create(
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <Provider store={store}>
          {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ store: { getState(): { appData: { timeZone... Remove this comment to see the full error message */}
          <EventDateTimeWidget {...props} store={store} />
        </Provider>
      )
      .toJSON();
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.children[0].children[1].children[0]).toBe(
      'Widget_DateTimeWidget_TimeRangeText__resx:{"startTime":"09:00","endTime":"21:00"}'
    );
    expect(wrapper.children[0].children[1].children[1].children[0]).toBe('EST translation');
    expect(wrapper.children[1].props['data-cvent-id']).toBe('timeZoneWidgetContainer');
    expect(wrapper.children[1].children[0].children[1]).toBe(
      'Event_GuestSide_TimeZone_ViewText__resx:{"timeZone":"Eastern Standard Time"}'
    );
  });

  test('disabling option from site editor hides timezone switch widget', async () => {
    const store = {
      getState() {
        return {
          ...state,
          appData: {
            ...state.appData,
            timeZoneSetting: {
              displayTimeZone: true,
              selectedWidgets: ['agenda']
            }
          },
          selectedTimeZone: {
            utcOffset: -300,
            value: 40,
            abbreviation: 'EST',
            abbreviationResourceKey: 'EST translation',
            nameResourceKey: 'Eastern Standard Time'
          }
        };
      },
      subscribe() {},
      dispatch() {}
    };
    const wrapper = renderer
      .create(
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <Provider store={store}>
          {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ store: { getState(): { appData: { timeZone... Remove this comment to see the full error message */}
          <EventDateTimeWidget {...props} store={store} />
        </Provider>
      )
      .toJSON();
    expect(wrapper).toMatchSnapshot();
  });
});
