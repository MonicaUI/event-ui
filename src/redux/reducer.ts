import regCartStatusReducer from './regCartStatus';
import textReducer from 'event-widgets/redux/modules/text';
import websiteReducer from './website';
import speakerDocuments from './speakerDocument';
import pathInfoReducer from './pathInfo';
import capacity from './capacity';
import registrationForm from './registrationForm/reducer';
import postRegistrationPaymentReducer from './postRegistrationPayment/reducer';
import partialPaymentReducer from './partialPayments/reducer';
import regCartPricing from './regCartPricing';
import countries from 'event-widgets/redux/modules/country';
import registrantLoginReducer from './registrantLogin';
import contactForm from './contactForm';
import stateReducer from 'event-widgets/redux/modules/state';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import contactPlanner from './contactPlanner';
import timezonesReducer from './timezones';
import airportsReducer from './airports';
import userSessionReducer from './userSession';
import selectedTimeZoneReducer from './timeZoneSelection';
import sessionFiltersReducer from './sessionFilters';
import { optOutReducer } from '../widgets/OptOut/redux';
import { unsubscribeReducer } from '../widgets/Unsubscribe/redux';
import eventTravelReducer from 'event-widgets/redux/modules/eventTravel';
import { getGroupFlightsSnapshotData } from 'event-widgets/redux/selectors/eventTravel';
import travelCartReducer from './travelCart';
import { personaReducer } from './persona';
import appDataReducer from './appData';
import fetchTextResolverDatatags from './datatags';
import visibleProductsReducer from './visibleProducts';
import customFontsReducer from 'nucleus-widgets/redux/modules/customFonts';
import { eventSnapshotReducer, accountSnapshotReducer, EVENT_ACTION_PAYLOAD_KEY } from './snapshot';
import currenciesReducer from './currencies';
import sessionsInWaitlistReducer from './sessionsInWaitlist';
import waitlistSelectionForGuestsReducer from './waitlistSelectionForGuests';
import eventFeeReducer from 'event-widgets/redux/modules/eventFee';
import appointmentsReducer from 'event-widgets/redux/modules/appointments';
import attendeeListReducer from './attendeeList';
import registrationSubstitutionReducer from './registrationSubstitution/reducer';
import invitationForwardingReducer from './invitationForwarding';
import multiLanguageLocaleReducer from './multiLanguage/reducer';
import { ordersReducer } from './orders';
import transparentWrapperReducer from './transparentWrapper';
import spinnerSelectionReducer from './spinnerSelection';
import privacyReducer from './privacy/reducer';
import attendeeExperienceReducer from './attendeeExperience';
import localizedUserTextReducer from 'nucleus-guestside-site/src/redux/modules/localizedUserText';
import limitsReducer from './limits/reducer';
import addGuestFromRelatedContactsReducer from './addGuestFromRelatedContacts/reducer';
import imageLookup from 'nucleus-widgets/redux/modules/imageLookup';
import addToCalendarReducer from './addToCalendar/reducer';
import { virtualDetailsReducer } from '../widgets/VirtualDetails/redux';
import defaultUserSessionReducer from './defaultUserSession';
import multiLanguageReducer from 'event-widgets/redux/modules/multiLanguage';
import externalAuthenticationReducer from './externalAuthentication';
import cookieConsentReducer from './cookieConsent/reducer';
import { getIn } from 'icepick';
import type { ProductsSnapshot, SiteEditorRegistrationPath } from '@cvent/flex-event-shared';
import productVisibilityClient from '../clients/ProductVisibilityClient';
import EventSnapshotClient from '../clients/EventSnapshotClient';
import EventGuestClient from '../clients/EventGuestClient';
import type { ThunkDispatch, ThunkAction } from 'redux-thunk';
import type { Action } from 'redux';
import type { ApolloClient } from '@apollo/client';
import { State as BaseState } from 'event-widgets/interfaces/store';
import { RegCart, ValidationMessage } from './types';

export type RootState = BaseState & {
  appData?: {
    registrationSettings: {
      registrationPaths: {
        [k: string]: SiteEditorRegistrationPath;
      };
    };
  };
  event?: {
    createdDate: Date;
  };
  experiments?: {
    featureRelease?: number;
    graphQLForEventCapacitiesVariant?: number;
    useGraphQLSiteEditorData?: number;
    hidingAdmissionItems?: number;
    flexNameFormatUpdateEnabled?: boolean;
    flexBearerAuthRemoval?: boolean;
    useProductVisibilityService?: boolean;
    flexProductVersion?: number;
    skipEmptyRegistrationPages?: number;
  };
  userSession?: {
    contactId?: string;
    regTypeId?: string;
  };
  imageLookup?: unknown;
  browserFeatures?: unknown;
  widgetFactory?: unknown;
  isPasswordModalOpen?: boolean;
  defaultUserSession: { eventId: string; isPlanner: boolean };
  plannerRegSettings: {
    exitUrl: string;
    modificationRequest?: {
      emailAddress?: string;
      confirmationNumber?: string;
    };
  };
  visibleProducts: ProductsSnapshot;
  clients: {
    productVisibilityClient: productVisibilityClient;
    eventSnapshotClient: EventSnapshotClient;
    eventGuestClient: EventGuestClient;
  };
  eventSnapshotVersion: string;
  registrationForm: {
    regCart: RegCart;
    validationMessages: ValidationMessage[];
  };
  environment: string;
  capacity;
};
export type AppDispatch = ThunkDispatch<RootState, { apolloClient: ApolloClient<unknown> }, Action<string>>;
export type AppThunk<R = void> = ThunkAction<R, RootState, { apolloClient: ApolloClient<unknown> }, Action<string>>;
export type AsyncAppThunk<R = void> = AppThunk<Promise<R>>;
export type GetState = () => RootState;

const reducer = (state: $TSFixMe, action: $TSFixMe): $TSFixMe => {
  const timezones = timezonesReducer(state.timezones, action);
  const eventTimezone = state.event ? timezones[state.event.timezone] : undefined;
  return {
    accessToken: state.accessToken,
    account: accountSnapshotReducer(state.account, action, 'account'),
    defaultUserSession: defaultUserSessionReducer(state.defaultUserSession, action),
    userSession: userSessionReducer(state.userSession, action),
    sessionFilters: sessionFiltersReducer(state.sessionFilters, action),
    accountSnapshotVersion: accountSnapshotReducer(state.accountSnapshotVersion, action, 'version'),
    appData: appDataReducer(state.appData, action, state),
    capacity: capacity(state.capacity, action),
    clients: state.clients,
    contactForm: contactForm(state.contactForm, action),
    contactPlanner: contactPlanner(state.contactPlanner, action),
    countries: countries(state.countries, action),
    dialogContainer: dialogContainer(state.dialogContainer, action),
    event: eventSnapshotReducer(state.event, action, EVENT_ACTION_PAYLOAD_KEY),
    eventSnapshotVersion: eventSnapshotReducer(state.eventSnapshotVersion, action, 'version'),
    optOut: optOutReducer(state.optOut, action),
    unsubscribe: unsubscribeReducer(state.unsubscribe, action),
    pathInfo: pathInfoReducer(state.pathInfo, action),
    registrationForm: registrationForm(state.registrationForm, action),
    regCartPricing: regCartPricing(state.regCartPricing, action),
    regCartStatus: regCartStatusReducer(state.regCartStatus, action),
    registrantLogin: registrantLoginReducer(state.registrantLogin, action),
    orders: ordersReducer(state.orders, action),
    postRegistrationPaymentData: postRegistrationPaymentReducer(state.postRegistrationPaymentData, action),
    webPaymentsSettings: state.webPaymentsSettings,
    partialPaymentSettings: partialPaymentReducer(state.partialPaymentSettings, action),
    states: stateReducer(state.states, action),
    text: textReducer(state.text, action, eventTimezone),
    timezones,
    airports: airportsReducer(state.airports, action),
    website: websiteReducer(state.website, action),
    widgetFactory: state.widgetFactory,
    googleMap: state.googleMap,
    appleMap: state.appleMap,
    environment: state.environment,
    plannerRegSettings: state.plannerRegSettings,
    testSettings: state.testSettings,
    eventTravel: eventTravelReducer(state.eventTravel, action),
    travelCart: travelCartReducer(state.travelCart, action),
    persona: personaReducer(state.persona, action),
    fetchTextResolverDatatags,
    eventLaunchWizardSettings: state.eventLaunchWizardSettings,
    visibleProducts: visibleProductsReducer(state.visibleProducts, action),
    speakerDocuments: speakerDocuments(state.speakerDocuments, action),
    customFonts: customFontsReducer(state.customFonts, action),
    currencies: currenciesReducer(state.currencies, action),
    selectSessionsInWaitlist: sessionsInWaitlistReducer(state.selectSessionsInWaitlist, action),
    waitlistSelectionForGuests: waitlistSelectionForGuestsReducer(state.waitlistSelectionForGuests, action),
    appointments: appointmentsReducer(state.appointments, action),
    attendeeList: attendeeListReducer(state.attendeeList, action),
    eventFees: eventFeeReducer(state.eventFees, action),
    registrationSubstitution: registrationSubstitutionReducer(
      state.registrationSubstitution,
      action,
      getIn(state, ['account', 'settings', 'dupMatchKeyType'])
    ),
    invitationForwarding: invitationForwardingReducer(state.invitationForwarding, action),
    multiLanguageLocale: multiLanguageLocaleReducer(state.multiLanguageLocale, action),
    privacy: privacyReducer(state.privacy, action),
    transparentWrapper: transparentWrapperReducer(state.transparentWrapper, action),
    spinnerSelection: spinnerSelectionReducer(state.spinnerSelection, action),
    localizedUserText: localizedUserTextReducer(state.localizedUserText, action),
    multiLanguageTranslation: multiLanguageReducer(state.multiLanguageTranslation, action),
    limits: limitsReducer(state.limits, action),
    experiments: state.experiments,
    attendeeExperience: attendeeExperienceReducer(state.attendeeExperience, action),
    addGuestFromRelatedContacts: addGuestFromRelatedContactsReducer(state.addGuestFromRelatedContacts, action),
    selectedTimeZone: selectedTimeZoneReducer(state.selectedTimeZone, action),
    appointmentsUrl: state.appointmentsUrl,
    imageLookup: imageLookup(state.imageLookup, action),
    browserFeatures: state.browserFeatures,
    calendarProviders: addToCalendarReducer(state.calendarProviders, action),
    virtualDetails: virtualDetailsReducer(state.virtualDetails, action),
    externalAuthentication: externalAuthenticationReducer(state.externalAuthentication, action),
    deemUrl: state.deemUrl,
    cookieConsent: cookieConsentReducer(state.cookieConsent, action),
    isEmbeddedRegistration: state.isEmbeddedRegistration
  };
};

export default reducer;

/* put exported child selectors below this comment */
export function getAdmissionItems(state: $TSFixMe): $TSFixMe {
  return state.event.products.admissionItems;
}

export function getEventTimezone(state: $TSFixMe): $TSFixMe {
  return state.timezones[state.event.timezone];
}

/**
 * Return all rooms having fee enabled
 * @param {Object} state
 * @returns {Array}
 */
export function getPaidRooms(state: $TSFixMe): $TSFixMe {
  return state.eventTravel.hotelsData.hotels.reduce((accumulator, hotel) => {
    const newAccumulator = { ...accumulator };
    if (hotel.roomTypes) {
      hotel.roomTypes.forEach(roomType => {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (roomType.fee && roomType.fee.isActive) {
          newAccumulator[roomType.id] = {
            ...roomType,
            hotelName: hotel.name
          };
        }
      });
    }
    return newAccumulator;
  }, {});
}

/**
 * Returns group flights from snapshot based on group flight enabled flag.
 * @param state
 * @returns group flights array or {}
 */
export function getGroupFlights(state: $TSFixMe): $TSFixMe {
  const {
    groupFlightSetup: { groupFlights = [] }
  } = getGroupFlightsSnapshotData(state.eventTravel);
  return groupFlights;
}
