import textReducer from 'event-widgets/redux/modules/text';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import timezonesReducer from '../redux/timezones';
import { eventSnapshotReducer, accountSnapshotReducer } from '../redux/snapshot';
import appDataReducer from '../redux/appData';
import pathInfoReducer from '../redux/pathInfo';
import userSessionReducer from '../redux/userSession';
import defaultUserSessionReducer from '../redux/defaultUserSession';
import websiteContentReducer from './websiteContentReducer';
import contactForm from '../redux/contactForm';
import contactPlanner from '../redux/contactPlanner';
import multiLanguageLocaleReducer from '../redux/multiLanguage/reducer';
import localizedUserTextReducer from 'nucleus-guestside-site/src/redux/modules/localizedUserText';
import countries from 'event-widgets/redux/modules/country';
import { resolveDataTagsForArchiveEvents } from '../redux/datatags';

const reducer = (state: $TSFixMe, action: $TSFixMe): $TSFixMe => {
  const timezones = timezonesReducer(state.timezones, action);
  const eventTimezone = state.event ? timezones[state.event.timezone] : undefined;
  return {
    environment: state.environment,
    account: accountSnapshotReducer(state.account, action, 'account'),
    userSession: userSessionReducer(state.userSession, action),
    defaultUserSession: defaultUserSessionReducer(state.defaultUserSession, action),
    accountSnapshotVersion: accountSnapshotReducer(state.accountSnapshotVersion, action, 'version'),
    appData: appDataReducer(state.appData, action),
    dialogContainer: dialogContainer(state.dialogContainer, action),
    event: eventSnapshotReducer(state.event, action, 'event'),
    eventSnapshotVersion: eventSnapshotReducer(state.eventSnapshotVersion, action, 'version'),
    pathInfo: pathInfoReducer(state.pathInfo, action),
    text: textReducer(state.text, action, eventTimezone),
    multiLanguageLocale: multiLanguageLocaleReducer(state.multiLanguageLocale, action),
    localizedUserText: localizedUserTextReducer(state.localizedUserText, action),
    countries: countries(state.countries, action),
    timezones,
    website: websiteContentReducer(state.website, action),
    widgetFactory: state.widgetFactory,
    testSettings: state.testSettings,
    clients: state.clients,
    contactForm: contactForm(state.contactForm, action),
    contactPlanner: contactPlanner(state.contactPlanner, action),
    experiments: state.experiments,
    fetchTextResolverDatatags: resolveDataTagsForArchiveEvents
  };
};

export default reducer;

export function getEventTimezone(state: $TSFixMe): $TSFixMe {
  return state.timezones[state.event.timezone];
}
