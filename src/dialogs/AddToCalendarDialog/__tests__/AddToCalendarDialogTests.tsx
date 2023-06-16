/* eslint-env jest */
import React from 'react';
import { mount } from 'enzyme';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { Provider } from 'react-redux';
import mockAddToCalendarResponse from '../../../../fixtures/addToCalendarResponse.json';

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../../__mocks__/documentElementMock';
getMockedMessageContainer();
const basicReducer = (x = {}) => x;

import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { dstInfo } from '../../../../fixtures/EasternTimeDstInfoFixture';
import { openAddToCalendarDialog } from '../index';
import * as addToCalendarUtils from '../../../utils/addToCalendarUtils';
import { CALENDAR_EVENT_ID } from '../../../utils/addToCalendarUtils';
import { AddToCalendarExperiment } from '../../../utils/addToCalendarUtils';

const lookupClient = {
  getCalendarProviders: jest.fn()
};

const calendarClient = {
  getEventCalendar: jest.fn().mockReturnValue({ calendarUrl: 'https://no-url.com' })
};

const addToEventCalendarVirtualEventState = {
  google: {
    [CALENDAR_EVENT_ID]:
      'http://www.google.com/calendar/event?action=TEMPLATE&text=Flex Virtual Event&dates=20210205T230000Z/20210206T030000Z&location=https://cvent.zoom.us/j/94720449889?pwd=Y2JIZjlmN1I4dU0yOE9NNndmTE1Cdz09&from=msft;&trp=false&details=Flex event description<br/><br/>Event URL: https://cvent.zoom.us/j/94720449889?pwd=Y2JIZjlmN1I4dU0yOE9NNndmTE1Cdz09&from=msft;"',
    'some-session-Id':
      'http://www.google.com/calendar/event?action=TEMPLATE&text=Flex Virtual Session&dates=20210205T230000Z/20210206T030000Z&location=https://cvent.zoom.us/j/94720449889?pwd=Y2JIZjlmN1I4dU0yOE9NNndmTE1Cdz09&from=msft;&trp=false&details=Flex session description<br/><br/>Session URL: https://cvent.zoom.us/j/94720449889?pwd=Y2JIZjlmN1I4dU0yOE9NNndmTE1Cdz09&from=msft;'
  },
  outlook: {
    [addToCalendarUtils.CALENDAR_EVENT_ID]:
      'https://outlook.live.com/owa/?path=/calendar/action/compose&rru=addevent&startdt=2021-02-26T23:00:00Z&enddt=2021-02-27T03:00:00Z&subject=Calendar-testing&body=Custom+Event+Description%21%21%21%3Cbr%2F%3E%3Cbr%2F%3EEvent+URL%3A+https%3A%2F%2Fattendee.com%3Cbr%2F%3EPassword%3A+attendeePassword&location=Delhi%2C+4%2F2834+C+Cannught-Place%2C+Delhi+110001+IN%2C+https%3A%2F%2Fattendee.com'
  }
};

const openAddToCalendarDialogParms = {
  modalStyles: {
    headerStyles: {
      styleMapping: 'header3'
    },
    instructionTextStyles: {
      styleMapping: 'body2'
    },
    cardStyles: {
      styleMapping: 'header3'
    },
    titleStyles: {
      styleMapping: 'label'
    },
    dateTimeStyles: {
      styleMapping: 'body2'
    },
    downloadLinkStyles: {
      styleMapping: 'link'
    },
    loginButtonStyles: {
      styleMapping: 'secondaryButton',
      customSettings: {
        text: {
          textAlign: 'center'
        }
      }
    },
    calendarTypeNameStyles: {
      styleMapping: 'body1'
    }
  }
};

const getInitialState = (calendarProviders, baseUrl, locale, pendingMode = false) => {
  return {
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx),
      translateDate: () => 'date',
      translateTime: () => 'time'
    },
    website: {
      theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
    },
    event: {
      ...EventSnapshot.eventSnapshot
    },
    timezones: {
      35: {
        id: 35,
        name: 'Eastern Time',
        nameResourceKey: 'Event_Timezone_Name_35__resx',
        plannerDisplayName: '(GMT-05:00) Eastern [US & Canada]',
        hasDst: true,
        utcOffset: -300,
        abbreviation: 'ET',
        abbreviationResourceKey: 'Event_Timezone_Abbr_35__resx',
        dstInfo
      }
    },
    registrationForm: {
      currentEventRegistrationId: 'dd48b4c4-672e-431c-be8d-5abfec299844',
      regCart: pendingMode
        ? undefined
        : {
            eventId: 'dd48b4c4-672e-431c-be8d-5abfec299844',
            eventRegistrations: {
              'dd48b4c4-672e-431c-be8d-5abfec299844': {
                eventRegistrationId: 'dd48b4c4-672e-431c-be8d-5abfec299844',
                attendee: {
                  attendeeId: '7129fc9a-5106-4c32-8eed-9c3ab7e16291'
                }
              }
            }
          }
    },
    appData: {
      timeZoneSetting: {
        displayTimeZone: true,
        selectedWidgets: ['addToCalendar']
      },
      calendarSettings: {
        calendarContentType: 'event'
      }
    },
    pathInfo: {
      baseUrl
    },
    clients: { lookupClient, calendarClient },
    eventSnapshotVersion: 'someEventSnapshotVersion',
    calendarProviders: {
      ...calendarProviders
    },
    environment: 'some-env',
    defaultUserSession: {
      isPreview: false,
      isTestMode: false
    },
    multiLanguageLocale: {
      locale
    },
    userSession: {
      inviteeId: '7129fc9a-5106-4c32-8eed-9c3ab7e16291'
    }
  };
};

const createAndGetStore = (
  addToCalendarExperiment = AddToCalendarExperiment.ICS_CALENDAR_VARIANT,
  calendarProviders = mockAddToCalendarResponse.calendarProviders,
  baseUrl = 'guestSideServiceBasePath',
  locale = 'en-US',
  pendingMode?
) => {
  return createStoreWithMiddleware(
    combineReducers({
      dialogContainer,
      text: basicReducer,
      website: basicReducer,
      event: basicReducer,
      registrationForm: basicReducer,
      appData: basicReducer,
      pathInfo: basicReducer,
      account: basicReducer,
      clients: basicReducer,
      eventSnapshotVersion: basicReducer,
      timezones: basicReducer,
      selectedTimeZone: basicReducer,
      calendarProviders: basicReducer,
      environment: basicReducer,
      experiments: basicReducer,
      userSession: basicReducer,
      defaultUserSession: basicReducer,
      multiLanguageLocale: basicReducer
    }),
    {
      ...getInitialState(calendarProviders, baseUrl, locale, pendingMode),
      selectedTimeZone: {
        utcOffset: -300,
        value: 40,
        abbreviation: 'EST',
        nameResourceKey: 'Eastern Standard Time'
      },
      experiments: {
        flexAddToGoogleCalendarExperimentVariant: addToCalendarExperiment
      }
    }
  );
};

describe('Add to Calendar dialog', () => {
  test('when Add to Calendar pop up is rendered.', async () => {
    const store = createAndGetStore(AddToCalendarExperiment.OUTLOOK_ICS_ICAL_CALENDAR_VARIANT);
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(openAddToCalendarDialog(openAddToCalendarDialogParms));
    dialog.update();
    expect(dialog.find('[data-cvent-id="add-to-calendar-dialog-container"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="add-to-calendar-dialog-ics-download"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="add-to-calendar-dialog-ical-download"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="add-to-calendar-dialog-google-calendar-open"]').hostNodes().length).toBe(1);
    expect(dialog.find('[data-cvent-id="add-to-calendar-dialog-outlook-calendar-open"]').hostNodes().length).toBe(1);
    expect(dialog).toMatchSnapshot();
  });

  test('when ics file download is clicked', async () => {
    const store = createAndGetStore();
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    const downloadEventIcsFileSpy = jest.spyOn(addToCalendarUtils, 'downloadEventIcsFile');
    await store.dispatch(openAddToCalendarDialog(openAddToCalendarDialogParms));
    dialog.update();
    dialog.find('[data-cvent-id="add-to-calendar-dialog-ics-download"]').hostNodes().simulate('click');
    expect(downloadEventIcsFileSpy).toHaveBeenCalled();
  });

  test('when ics file download is clicked for variant 0, 1 or 2 and verify attendee id is passed', async () => {
    const store = createAndGetStore(AddToCalendarExperiment.GOOGLE_CALENDAR_FOR_VIRTUAL_VARIANT);
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    const downloadEventIcsFileSpy = jest.spyOn(addToCalendarUtils, 'downloadEventIcsFile');
    await store.dispatch(openAddToCalendarDialog(openAddToCalendarDialogParms));
    dialog.update();
    dialog.find('[data-cvent-id="add-to-calendar-dialog-ics-download"]').hostNodes().simulate('click');
    expect(downloadEventIcsFileSpy).toHaveBeenCalled();
    expect(downloadEventIcsFileSpy).toHaveBeenCalledWith(
      'guestSideServiceBasePath',
      'some-env',
      null,
      null,
      undefined,
      false,
      'ics',
      '7129fc9a-5106-4c32-8eed-9c3ab7e16291',
      'en-US'
    );
  });

  test('when ics file download is clicked for variant 3 and verify attendee id is passed', async () => {
    const mockStore = createAndGetStore(
      AddToCalendarExperiment.OUTLOOK_ICS_ICAL_CALENDAR_VARIANT,
      mockAddToCalendarResponse.calendarProviders,
      'calendarServiceBasePath'
    );
    const dialog = mount(
      <Provider store={mockStore}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    const downloadEventIcsFileSpy = jest.spyOn(addToCalendarUtils, 'downloadEventIcsFile');
    await mockStore.dispatch(openAddToCalendarDialog(openAddToCalendarDialogParms));
    dialog.update();
    dialog.find('[data-cvent-id="add-to-calendar-dialog-ics-download"]').hostNodes().simulate('click');
    expect(downloadEventIcsFileSpy).toHaveBeenCalled();
    expect(downloadEventIcsFileSpy).toHaveBeenCalledWith(
      'calendarServiceBasePath',
      'some-env',
      null,
      null,
      undefined,
      true,
      'ics',
      '7129fc9a-5106-4c32-8eed-9c3ab7e16291',
      'en-US'
    );
  });

  test('when ics file download is clicked for variant 3 and verify attendee id is passed in pending mode', async () => {
    const mockStore = createAndGetStore(
      AddToCalendarExperiment.OUTLOOK_ICS_ICAL_CALENDAR_VARIANT,
      mockAddToCalendarResponse.calendarProviders,
      'calendarServiceBasePath',
      undefined,
      true
    );
    const dialog = mount(
      <Provider store={mockStore}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    const downloadEventIcsFileSpy = jest.spyOn(addToCalendarUtils, 'downloadEventIcsFile');
    await mockStore.dispatch(openAddToCalendarDialog(openAddToCalendarDialogParms));
    dialog.update();
    dialog.find('[data-cvent-id="add-to-calendar-dialog-ics-download"]').hostNodes().simulate('click');
    expect(downloadEventIcsFileSpy).toHaveBeenCalled();
    expect(downloadEventIcsFileSpy).toHaveBeenCalledWith(
      'calendarServiceBasePath',
      'some-env',
      null,
      null,
      undefined,
      true,
      'ics',
      '7129fc9a-5106-4c32-8eed-9c3ab7e16291',
      'en-US'
    );
  });

  describe('calendar downloads with locale', () => {
    test('when calendar download is clicked for no specified locale (default)', async () => {
      const mockStore = createAndGetStore(
        AddToCalendarExperiment.OUTLOOK_ICS_ICAL_CALENDAR_VARIANT,
        mockAddToCalendarResponse.calendarProviders,
        'calendarServiceBasePath',
        null
      );
      const dialog = mount(
        <Provider store={mockStore}>
          <DialogContainer spinnerMessage="spinnerMessage" message="message" />
        </Provider>
      );
      const downloadEventIcsFileSpy = jest.spyOn(addToCalendarUtils, 'downloadEventIcsFile');
      await mockStore.dispatch(openAddToCalendarDialog(openAddToCalendarDialogParms));
      dialog.update();
      dialog.find('[data-cvent-id="add-to-calendar-dialog-ics-download"]').hostNodes().simulate('click');
      expect(downloadEventIcsFileSpy).toHaveBeenCalled();
      expect(downloadEventIcsFileSpy).toHaveBeenCalledWith(
        'calendarServiceBasePath',
        'some-env',
        null,
        null,
        undefined,
        true,
        'ics',
        '7129fc9a-5106-4c32-8eed-9c3ab7e16291',
        null
      );
    });
    test('when calendar download is clicked for non-default language', async () => {
      const mockStore = createAndGetStore(
        AddToCalendarExperiment.OUTLOOK_ICS_ICAL_CALENDAR_VARIANT,
        mockAddToCalendarResponse.calendarProviders,
        'calendarServiceBasePath',
        'es-ES'
      );
      const dialog = mount(
        <Provider store={mockStore}>
          <DialogContainer spinnerMessage="spinnerMessage" message="message" />
        </Provider>
      );
      const downloadEventIcsFileSpy = jest.spyOn(addToCalendarUtils, 'downloadEventIcsFile');
      await mockStore.dispatch(openAddToCalendarDialog(openAddToCalendarDialogParms));
      dialog.update();
      dialog.find('[data-cvent-id="add-to-calendar-dialog-ics-download"]').hostNodes().simulate('click');
      expect(downloadEventIcsFileSpy).toHaveBeenCalled();
      expect(downloadEventIcsFileSpy).toHaveBeenCalledWith(
        'calendarServiceBasePath',
        'some-env',
        null,
        null,
        undefined,
        true,
        'ics',
        '7129fc9a-5106-4c32-8eed-9c3ab7e16291',
        'es-ES'
      );
    });
  });

  test('when ics file download is clicked for ical and verify attendee id is passed', async () => {
    const store = createAndGetStore(
      AddToCalendarExperiment.OUTLOOK_ICS_ICAL_CALENDAR_VARIANT,
      mockAddToCalendarResponse.calendarProviders,
      'calendarServiceBasePath'
    );
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    const downloadEventIcsFileSpy = jest.spyOn(addToCalendarUtils, 'downloadEventIcsFile');
    await store.dispatch(openAddToCalendarDialog(openAddToCalendarDialogParms));
    dialog.update();
    dialog.find('[data-cvent-id="add-to-calendar-dialog-ical-download"]').hostNodes().simulate('click');
    expect(downloadEventIcsFileSpy).toHaveBeenCalled();
    expect(downloadEventIcsFileSpy).toHaveBeenCalledWith(
      'calendarServiceBasePath',
      'some-env',
      null,
      null,
      undefined,
      true,
      'ical',
      '7129fc9a-5106-4c32-8eed-9c3ab7e16291',
      'en-US'
    );
  });

  test('when ics file download is clicked for ical and verify attendee id is passed in pendingMode', async () => {
    const store = createAndGetStore(
      AddToCalendarExperiment.OUTLOOK_ICS_ICAL_CALENDAR_VARIANT,
      mockAddToCalendarResponse.calendarProviders,
      'calendarServiceBasePath',
      undefined,
      true
    );
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    const downloadEventIcsFileSpy = jest.spyOn(addToCalendarUtils, 'downloadEventIcsFile');
    await store.dispatch(openAddToCalendarDialog(openAddToCalendarDialogParms));
    dialog.update();
    dialog.find('[data-cvent-id="add-to-calendar-dialog-ical-download"]').hostNodes().simulate('click');
    expect(downloadEventIcsFileSpy).toHaveBeenCalled();
    expect(downloadEventIcsFileSpy).toHaveBeenCalledWith(
      'calendarServiceBasePath',
      'some-env',
      null,
      null,
      undefined,
      true,
      'ical',
      '7129fc9a-5106-4c32-8eed-9c3ab7e16291',
      'en-US'
    );
  });

  test('when google calendar is clicked', async () => {
    const store = createAndGetStore(AddToCalendarExperiment.GOOGLE_CALENDAR_FOR_INPERSON_VARIANT);
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    const getCalendarUrlSpy = jest.spyOn(addToCalendarUtils, 'getCalendarUrl');
    await store.dispatch(openAddToCalendarDialog(openAddToCalendarDialogParms));
    dialog.update();
    window.open = jest.fn();
    dialog.find('[data-cvent-id="add-to-calendar-dialog-google-calendar-open"]').hostNodes().simulate('click');
    expect(getCalendarUrlSpy).toHaveBeenCalledWith(
      mockAddToCalendarResponse.calendarProviders.Google.calendarProviderURL,
      {
        closeDate: null,
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et hendrerit dolor, eu laoreet libero. Proin vitae neque id dui consectetur consequat. Quisque at porttitor arcu. Maecenas rhoncus nec arcu non viverra. Quisque maximus euismod quam non rutrum. Donec cursus interdum lectus, rutrum placerat sapien pulvinar at.',
        endDate: '2020-06-18T21:00:00.000Z',
        location: 'Museum of Science and Industry',
        startDate: '2020-06-16T11:00:00.000Z',
        title: 'Annual Space Technology And Engineering Meeting'
      },
      true,
      { customDescription: undefined, descriptionSource: undefined }
    );
  });

  test('when google calendar is clicked in pending mode when attendeeId from Regcart isnt available', async () => {
    const store = createAndGetStore(
      AddToCalendarExperiment.GOOGLE_CALENDAR_FOR_INPERSON_VARIANT,
      undefined,
      undefined,
      undefined,
      true
    );
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    const getCalendarUrlSpy = jest.spyOn(addToCalendarUtils, 'getCalendarUrl');
    await store.dispatch(openAddToCalendarDialog(openAddToCalendarDialogParms));
    dialog.update();
    window.open = jest.fn();
    dialog.find('[data-cvent-id="add-to-calendar-dialog-google-calendar-open"]').hostNodes().simulate('click');
    expect(getCalendarUrlSpy).toHaveBeenCalledWith(
      mockAddToCalendarResponse.calendarProviders.Google.calendarProviderURL,
      {
        closeDate: null,
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et hendrerit dolor, eu laoreet libero. Proin vitae neque id dui consectetur consequat. Quisque at porttitor arcu. Maecenas rhoncus nec arcu non viverra. Quisque maximus euismod quam non rutrum. Donec cursus interdum lectus, rutrum placerat sapien pulvinar at.',
        endDate: '2020-06-18T21:00:00.000Z',
        location: 'Museum of Science and Industry',
        startDate: '2020-06-16T11:00:00.000Z',
        title: 'Annual Space Technology And Engineering Meeting'
      },
      true,
      { customDescription: undefined, descriptionSource: undefined }
    );
  });

  test('when google calendar is clicked for virtual event', async () => {
    const mockStore = createAndGetStore(
      AddToCalendarExperiment.GOOGLE_CALENDAR_FOR_VIRTUAL_VARIANT,
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ google: { "00000000-0000-0000-... Remove this comment to see the full error message
      addToEventCalendarVirtualEventState
    );
    const dialog = mount(
      <Provider store={mockStore}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    const getCalendarUrlSpy = jest.spyOn(addToCalendarUtils, 'getGoogleCalendar');
    await mockStore.dispatch(openAddToCalendarDialog(openAddToCalendarDialogParms));
    dialog.update();
    window.open = jest.fn();
    dialog.find('[data-cvent-id="add-to-calendar-dialog-google-calendar-open"]').hostNodes().simulate('click');
    expect(getCalendarUrlSpy).toHaveBeenCalledWith(addToEventCalendarVirtualEventState);
  });

  test('when outlook calendar is clicked', async () => {
    const mockStore = createAndGetStore(
      AddToCalendarExperiment.OUTLOOK_ICS_ICAL_CALENDAR_VARIANT,
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ google: { "00000000-0000-0000-... Remove this comment to see the full error message
      addToEventCalendarVirtualEventState
    );
    const dialog = mount(
      <Provider store={mockStore}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    const getCalendarUrlSpy = jest.spyOn(addToCalendarUtils, 'getOutlookCalendar');
    await mockStore.dispatch(openAddToCalendarDialog(openAddToCalendarDialogParms));
    dialog.update();
    window.open = jest.fn();
    dialog.find('[data-cvent-id="add-to-calendar-dialog-outlook-calendar-open"]').hostNodes().simulate('click');
    expect(getCalendarUrlSpy).toHaveBeenCalledWith(addToEventCalendarVirtualEventState);
  });
});
