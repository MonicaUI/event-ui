import { merge, values, set } from 'lodash';
import {
  createRegistrationType,
  createAdmissionItem,
  createProductAdmissionItem,
  createSession,
  createProductSession,
  createCustomFieldAnswers,
  createContactCustomFieldsMetadata,
  createInvalidChildCustomFieldAnswers,
  createSessionGroup,
  createConflictRegCartWithGuests,
  createQuantityItem,
  createProductQuantityItem,
  createQuantityItemAdvancedRules,
  createDonationItem,
  createProductDonationItem
} from '../../../testUtils';
import airSnapshot from './fixtures/airSnapshotWithRules.json';
import registrationPaths from './fixtures/registrationPaths.json';
import hotelSnapshot from './fixtures/hotelSnapshotWithRules.json';
import GroupFlightData from '../../../../../event-site-editor/src/widgets/__tests__/fixtures/GroupFlightData.json';
import { getIdConfirmationValidationsFromCartError } from '../validations';
import { EVENT_HOTEL_VISIBILITY_OPTION } from 'event-widgets/utils/travelConstants';
import { GraphQLSiteEditorDataReleases } from '../../../ExperimentHelper';

let mockIsWidgetReviewedResult = false;
let mockIsWidgetPresentResult = false;
let mockSessionsAppearOnPageBeforeAdmissionItemsResult = false;
let mockQuantityItemsAppearOnPageBeforeAdmissionItemsResult = false;
let mockQuantityItemsAppearOnPageBeforeRegistrationTypeResult = false;
jest.mock('../../../redux/website/pageContents', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../../redux/website/pageContents'),
    isWidgetPresentOnCurrentPage: () => mockIsWidgetPresentResult,
    isWidgetReviewed: () => mockIsWidgetReviewedResult,
    sessionsAppearOnPageBeforeRegistrationType: () => true,
    sessionsAppearOnPageBeforeAdmissionItems: () => mockSessionsAppearOnPageBeforeAdmissionItemsResult,
    quantityItemsAppearOnPageBeforeAdmissionItems: () => mockQuantityItemsAppearOnPageBeforeAdmissionItemsResult,
    quantityItemsAppearOnPageBeforeRegistrationType: () => mockQuantityItemsAppearOnPageBeforeRegistrationTypeResult
  };
});
jest.mock('../../../apollo/siteEditor/pageVarietyPathQueryHooks', () => ({
  createPageVarietyPathManualQuery: () => ({
    data: {
      event: {
        registrationPath: {
          registration: {
            sessions: {
              validation: {
                reviewed: mockIsWidgetReviewedResult,
                onCurrentPage: mockIsWidgetPresentResult,
                onPageBeforeAdmissionItems: mockSessionsAppearOnPageBeforeAdmissionItemsResult,
                onPageBeforeRegistrationType: false,
                onPageWithPaymentOrRegistrationSummary: false
              }
            },
            quantityItems: {
              validation: {
                reviewed: mockIsWidgetReviewedResult,
                onCurrentPage: mockIsWidgetPresentResult,
                onPageBeforeAdmissionItems: mockQuantityItemsAppearOnPageBeforeAdmissionItemsResult,
                onPageBeforeRegistrationType: mockQuantityItemsAppearOnPageBeforeRegistrationTypeResult,
                onPageWithPaymentOrRegistrationSummary: false
              }
            }
          }
        }
      }
    }
  })
}));

let mockUseGraphQLSiteEditorData = GraphQLSiteEditorDataReleases.Off;
jest.mock('../../../ExperimentHelper', () => ({
  ...jest.requireActual<$TSFixMe>('../../../ExperimentHelper'),
  getUseGraphQLSiteEditorData: () => mockUseGraphQLSiteEditorData,
  useGraphQLSiteEditorData: () => mockUseGraphQLSiteEditorData
}));

const appData = { registrationSettings: { registrationPaths } };
const registrationForm = {
  regCart: {
    eventRegistrations: {
      DUMMY_ID: {
        registrationTypeId: createRegistrationType().id,
        registrationPathId: 'regPathId'
      }
    }
  },
  currentEventRegistrationId: 'DUMMY_ID'
};
const regCartStatus = {
  lastSavedRegCart: registrationForm.regCart
};

const timezones = {};

const defaultUserSession = { isPlanner: false };

const regCartWithGuestReg = createConflictRegCartWithGuests();

describe.each([
  ['GraphQL', GraphQLSiteEditorDataReleases.Development],
  ['Redux', GraphQLSiteEditorDataReleases.Off]
])('validations using %s site editor data', (description, experimentStatus) => {
  let validations;
  let selectors;
  let reducers;
  let guestSelectors;
  let travelSelectors;
  let travelBookingGetter;
  let regCartSelectors;
  beforeEach(() => {
    jest.resetModules();
    validations = require('../validations');
    selectors = {
      ...require('../../../redux/selectors/shared'),
      event: require('../../../redux/selectors/event'),
      currentRegistrant: require('../../../redux/selectors/currentRegistrant'),
      currentRegistrationPath: require('../../../redux/selectors/currentRegistrationPath'),
      productSelectors: require('../../../redux/selectors/productSelectors')
    };
    regCartSelectors = require('../../../redux/registrationForm/regCart/selectors');
    reducers = require('../../../redux/reducer');
    travelSelectors = require('event-widgets/redux/selectors/eventTravel');
    guestSelectors = require('../../../redux/registrationForm/regCart/selectors');
    travelBookingGetter = require('../../../redux/travelCart/selectors');
    mockTravelSelectors(travelSelectors);
    mockReducers(reducers, {
      currentPageId: null
    });
    mockGuestSelectors(guestSelectors, {
      guestRegistrants: null
    });
    mockIsWidgetReviewedResult = false;
    mockIsWidgetPresentResult = false;
    mockSessionsAppearOnPageBeforeAdmissionItemsResult = false;
    mockQuantityItemsAppearOnPageBeforeAdmissionItemsResult = false;
    mockQuantityItemsAppearOnPageBeforeRegistrationTypeResult = false;
    mockUseGraphQLSiteEditorData = experimentStatus;
  });

  describe('Registration type change validations', () => {
    test('No admission item is selected', async () => {
      mockSelectors(selectors, {
        admissionItem: undefined
      });
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(state, createRegistrationType().id);
      expect(results).toMatchSnapshot();
    });

    test('Admission item is valid for registration type', async () => {
      const admissionItem = createAdmissionItem();
      const selectedAdmissionItem = createProductAdmissionItem(admissionItem);
      mockSelectors(selectors, {
        admissionItem,
        admissionItemDefinitions: {
          [admissionItem.id]: admissionItem
        }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedAdmissionItem
      });
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Air Booking is not valid for registration type', async () => {
      travelBookingGetter.getTravelBookingsForCurrentRegistrantAndGuests = jest.fn(() => [
        {
          id: 'DUMMY_ID',
          airBookings: [
            {
              departureDate: '2019-08-09T00:00:00.000Z',
              returnDate: '2019-08-14T00:00:00.000Z'
            },
            {
              departureDate: '2019-08-09T00:00:00.000Z'
            }
          ]
        }
      ]);
      const admissionItem = createAdmissionItem();
      const selectedAdmissionItem = createProductAdmissionItem(admissionItem);
      mockSelectors(selectors, {
        admissionItem,
        admissionItemDefinitions: {
          [admissionItem.id]: admissionItem
        },
        shared: {
          getRegCart: state => state.registrationForm.regCart
        }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedAdmissionItem
      });
      const state = { appData, registrationForm, timezones: {}, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Air Booking is valid for registration type, even if guest has different reg type', async () => {
      travelBookingGetter.getTravelBookingsForCurrentRegistrantAndGuests = jest.fn(() => [
        {
          id: 'DUMMY_ID',
          airBookings: [
            {
              departureDate: '2019-08-09T00:00:00.000Z',
              returnDate: '2019-08-14T00:00:00.000Z'
            },
            {
              departureDate: '2019-08-09T00:00:00.000Z'
            }
          ]
        }
      ]);
      const admissionItem = createAdmissionItem();
      const selectedAdmissionItem = createProductAdmissionItem(admissionItem);
      mockSelectors(selectors, {
        admissionItem,
        admissionItemDefinitions: {
          [admissionItem.id]: admissionItem
        }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedAdmissionItem
      });
      const state = {
        appData,
        registrationForm: { regCart: regCartWithGuestReg },
        timezones: {},
        regCartStatus,
        defaultUserSession
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'guestEventRegId'
      );
      // the bookings made for primary never conflict as guest's reg type selection cannot change reg path for primary
      expect(results.airRequestValidationResults.isValid).toBeTruthy();
    });

    test('Admission item is not valid for registration type', async () => {
      const admissionItem = { ...createAdmissionItem(), applicableContactTypes: ['otherRegistrationTypeId'] };
      const selectedAdmissionItem = createProductAdmissionItem(admissionItem);
      mockSelectors(selectors, {
        admissionItem,
        admissionItemDefinitions: {
          [admissionItem.id]: admissionItem
        }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedAdmissionItem
      });
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Admission item is not valid for registration type but was selected during initial registration', async () => {
      const admissionItem = { ...createAdmissionItem(), applicableContactTypes: ['otherRegistrationTypeId'] };
      const selectedAdmissionItem = createProductAdmissionItem(admissionItem);
      const modificationStartRegCart = createConflictRegCartWithGuests({ admissionItem });
      mockSelectors(selectors, {
        admissionItem,
        admissionItemDefinitions: {
          [admissionItem.id]: admissionItem
        },
        modificationStartRegCart
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedAdmissionItem
      });
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('No sessions are selected', async () => {
      mockSelectors(selectors, {
        sessions: {}
      });
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Selected sessions are valid for registration type', async () => {
      const session = createSession();
      const selectedSession = createProductSession(session);
      mockSelectors(selectors, {
        sessions: { [session.id]: session }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Selected sessions are not valid for registration type', async () => {
      const session = { ...createSession(), associatedRegistrationTypes: ['otherRegistrationTypeId'] };
      const selectedSession = createProductSession(session);
      mockSelectors(selectors, {
        sessions: { [session.id]: session }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Selected sessions are not valid for registration type but registered through session bundle', async () => {
      const session = {
        ...createSession('sessionWithSessionBundleId'),
        associatedRegistrationTypes: ['otherRegistrationTypeId']
      };
      const selectedSession = { ...createProductSession(session), registrationSourceType: 'Track' };
      mockSelectors(selectors, {
        sessions: { [session.id]: session }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results.sessionsValidationResults.isValid).toBeTruthy();
    });

    test('Selected sessions are not valid for registration type but selected during original registration', async () => {
      const session = { ...createSession(), associatedRegistrationTypes: ['otherRegistrationTypeId'] };
      const selectedSession = createProductSession(session);
      const modificationStartRegCart = createConflictRegCartWithGuests({ session });
      mockSelectors(selectors, {
        sessions: { [session.id]: session },
        modificationStartRegCart
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Selected sessions within required session group are valid for registration type', async () => {
      let sessionGroup = createSessionGroup();
      const session = createSession();
      const selectedSession = createProductSession(session);
      sessionGroup = {
        ...sessionGroup,
        sessions: { [session.id]: session }
      };
      mockSelectors(selectors, {
        sessionGroups: { [sessionGroup.id]: sessionGroup },
        sessions: { [session.id]: session }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Missing sessions within required session group for registration type', async () => {
      let sessionGroup = createSessionGroup();
      const session = { ...createSession() };
      const selectedSession = createProductSession(session);
      sessionGroup = {
        ...sessionGroup,
        sessions: { [session.id]: session }
      };
      mockSelectors(selectors, {
        sessionGroups: { [sessionGroup.id]: sessionGroup }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Missing sessions within unreviewed required session group for registration type', async () => {
      let sessionGroup = createSessionGroup();
      const session = { ...createSession() };
      const selectedSession = createProductSession(session);
      sessionGroup = {
        ...sessionGroup,
        sessions: { [session.id]: session }
      };
      mockSelectors(selectors, {
        sessionGroups: { [sessionGroup.id]: sessionGroup }
      });
      mockIsWidgetReviewedResult = false;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Selected session groups are not valid for registration type but selected during original registration', async () => {
      let sessionGroup = createSessionGroup();
      const session = { ...createSession(), associatedRegistrationTypes: ['otherRegistrationTypeId'] };
      const selectedSession = createProductSession(session);
      sessionGroup = {
        ...sessionGroup,
        sessions: { [session.id]: session }
      };
      const modificationStartRegCart = createConflictRegCartWithGuests({ session });
      mockSelectors(selectors, {
        sessionGroups: { [sessionGroup.id]: sessionGroup },
        sessions: { [session.id]: session },
        modificationStartRegCart
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Single page selected sessions within required session group are valid for reg type', async () => {
      let sessionGroup = createSessionGroup();
      const session = createSession();
      const selectedSession = createProductSession(session);
      sessionGroup = {
        ...sessionGroup,
        sessions: { [session.id]: session }
      };
      mockSelectors(selectors, {
        sessionGroups: { [sessionGroup.id]: sessionGroup },
        sessions: { [session.id]: session }
      });
      mockReducers(reducers, {
        currentPageId: 'regPage1'
      });
      mockIsWidgetReviewedResult = false;
      mockIsWidgetPresentResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Single page missing sessions within required session group for reg type', async () => {
      let sessionGroup = createSessionGroup();
      const session = { ...createSession() };
      const selectedSession = createProductSession(session);
      sessionGroup = {
        ...sessionGroup,
        sessions: { [session.id]: session }
      };
      mockSelectors(selectors, {
        sessionGroups: { [sessionGroup.id]: sessionGroup }
      });
      mockReducers(reducers, {
        currentPageId: 'regPage1'
      });
      mockIsWidgetReviewedResult = false;
      mockIsWidgetPresentResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(state, createRegistrationType().id);
      expect(results).toMatchSnapshot();
    });

    test('Guest registrations are not allowed for reg path associated with new reg type', async () => {
      const newAssociatedRegPath = {
        id: 'regPathId2',
        isDefault: true,
        allowsSessionSelection: true,
        associatedRegistrationTypes: ['registrationTypeAId'],
        guestRegistrationSettings: {
          isGuestRegistrationEnabled: false
        }
      };
      set(appData, ['registrationSettings', 'registrationPaths', 'regPathId2'], newAssociatedRegPath);
      mockSelectors(selectors, {});
      const guestRegistrants = [
        {
          eventRegistrationId: 'guest1',
          primaryRegistrationId: 'primary',
          productRegistrations: [
            {
              productId: '1',
              requestedAction: 'REGISTER'
            }
          ],
          requestedAction: 'REGISTER'
        }
      ];
      mockGuestSelectors(guestSelectors, { guestRegistrants });
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
    });
  });

  describe('Registration type change validations for guest', () => {
    test('No admission item is selected for guest', async () => {
      mockSelectors(selectors, {
        admissionItem: undefined
      });
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'guestEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Admission item for guest is valid for registration type', async () => {
      const admissionItem = createAdmissionItem();
      const selectedAdmissionItem = createProductAdmissionItem(admissionItem);
      mockSelectors(selectors, {
        admissionItem: createAdmissionItem()
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedAdmissionItem
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'guestEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Admission item selected by guest is not valid for registration type', async () => {
      const admissionItem = { ...createAdmissionItem(), applicableContactTypes: ['otherRegistrationTypeId'] };
      const selectedAdmissionItem = createProductAdmissionItem(admissionItem);
      mockSelectors(selectors, {
        admissionItem,
        admissionItemDefinitions: { [admissionItem.id]: admissionItem }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedAdmissionItem
      });
      const state = { appData, registrationForm: { regCart: regCartWithGuestReg }, timezones, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'guestEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Admission item selected by guest is not valid for reg type but was selected during initial registration', async () => {
      const admissionItem = { ...createAdmissionItem(), applicableContactTypes: ['otherRegistrationTypeId'] };
      const selectedAdmissionItem = createProductAdmissionItem(admissionItem);
      mockSelectors(selectors, {
        admissionItem,
        modificationStartRegCart: regCartWithGuestReg
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedAdmissionItem
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'guestEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('No sessions are selected for guest', async () => {
      mockSelectors(selectors, {
        sessions: {}
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSessions: {}
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'guestEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Selected sessions for guest are valid for registration type', async () => {
      const session = createSession();
      const selectedSession = createProductSession(session);
      mockSelectors(selectors, {
        sessions: { [session.id]: session }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'guestEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Selected sessions for guest are not valid for registration type', async () => {
      const session = { ...createSession(), associatedRegistrationTypes: ['otherRegistrationTypeId'] };
      const selectedSession = createProductSession(session);
      mockSelectors(selectors, {
        sessions: { [session.id]: session }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'guestEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Selected sessions for guest are not valid for regType but selected during original registration', async () => {
      const session = { ...createSession(), associatedRegistrationTypes: ['otherRegistrationTypeId'] };
      const registeredSession = createProductSession(session);
      mockSelectors(selectors, {
        sessions: { [session.id]: session },
        registeredSessions: { [registeredSession.productId]: registeredSession },
        getModificationStartRegCart: regCartWithGuestReg
      });
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'guestEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Selected sessions for guest within required session group are valid for registration type', async () => {
      let sessionGroup = createSessionGroup();
      const session = createSession();
      const selectedSession = createProductSession(session);
      sessionGroup = {
        ...sessionGroup,
        sessions: { [session.id]: session }
      };
      mockSelectors(selectors, {
        sessionGroups: { [sessionGroup.id]: sessionGroup },
        sessions: { [session.id]: session }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'guestEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Missing sessions for guest within required session group for registration type', async () => {
      let sessionGroup = createSessionGroup();
      const session = { ...createSession() };
      const selectedSession = createProductSession(session);
      sessionGroup = {
        ...sessionGroup,
        sessions: { [session.id]: session }
      };
      mockSelectors(selectors, {
        sessionGroups: { [sessionGroup.id]: sessionGroup }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'guestEventRegId'
      );
      expect(results).toMatchSnapshot();
    });

    test('Selected session groups for guest are not valid for regType but selected during original registration', async () => {
      let sessionGroup = createSessionGroup();
      const session = { ...createSession(), associatedRegistrationTypes: ['otherRegistrationTypeId'] };
      const selectedSession = createProductSession(session);
      sessionGroup = {
        ...sessionGroup,
        sessions: { [session.id]: session }
      };
      const registeredSession = createProductSession(session);
      mockSelectors(selectors, {
        sessionGroups: { [sessionGroup.id]: sessionGroup },
        sessions: { [session.id]: session },
        registeredSessions: { [registeredSession.productId]: registeredSession }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'guestEventRegId'
      );
      expect(results).toMatchSnapshot();
    });
  });

  describe('Admission Item change validations', () => {
    test('Admission item does not limit sessions', async () => {
      const session = createSession();
      mockSelectors(selectors, {
        registrationType: createRegistrationType(),
        sessions: { [session.id]: session }
      });
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const results = await validations.validateAdmissionItemChange(
        state,
        createAdmissionItem(),
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });

    test('Admission item does limit sessions and sessions valid', async () => {
      const session = createSession();
      mockSelectors(selectors, {
        registrationType: createRegistrationType(),
        sessions: { [session.id]: session }
      });
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalSessionsToSelect: true,
        availableOptionalSessions: [session.id]
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });

    test('Admission item with included session cannot have it waitlisted in planner reg', async () => {
      const session = createSession();
      const registrationType = createRegistrationType();
      const selectedSession = { [session.id]: createProductSession(session) };
      mockSelectors(selectors, {
        registrationType,
        sessions: { [session.id]: session }
      });
      mockRegCartSelectors(regCartSelectors, {
        registrationTypeId: registrationType.id,
        selectedSession
      });
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession: { isPlanner: true } };
      const admissionItem = {
        ...createAdmissionItem(),
        associatedOptionalSessions: [session.id]
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );

      expect(results.isValid).toBeFalsy();
      expect(results.includedSessionWaitlistValidationResults).not.toBeNull();
      expect(results.includedSessionWaitlistValidationResults.isValid).toBeFalsy();
      expect(results.includedSessionWaitlistValidationResults.invalidWaitlistedSession.length).toBe(1);
    });

    test('Admission item does limit sessions and sessions is not valid', async () => {
      const session = createSession();
      mockSelectors(selectors, {
        registrationType: createRegistrationType(),
        sessions: { [session.id]: session }
      });
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalSessionsToSelect: true,
        availableOptionalSessions: []
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });

    test('Admission item does limit sessions and sessions is not valid but registered through session bundle', async () => {
      const session = { ...createSession('sessionWithSessionBundleId'), registrationSourceType: 'Track' };
      mockSelectors(selectors, {
        registrationType: createRegistrationType(),
        sessions: { [session.id]: session }
      });
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalSessionsToSelect: true,
        availableOptionalSessions: ['limitedSessionId']
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        'eventRegistrationId',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results.sessionsValidationResults.isValid).toBeTruthy();
    });

    test('Air Bookings not valid for admission item', async () => {
      travelBookingGetter.getTravelBookingsForCurrentRegistrantAndGuests = jest.fn(() => [
        {
          airBookings: [
            {
              departureDate: '2019-08-09T00:00:00.000Z',
              returnDate: '2019-08-14T00:00:00.000Z'
            },
            {
              departureDate: '2019-08-09T00:00:00.000Z'
            }
          ]
        }
      ]);
      const session = createSession();
      mockSelectors(selectors, {
        registrationType: createRegistrationType(),
        sessions: { [session.id]: session }
      });
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const results = await validations.validateAdmissionItemChange(
        state,
        createAdmissionItem(),
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });

    test('Selected sessions within required session group are valid for admission item', async () => {
      let sessionGroup = createSessionGroup();
      const session = createSession();
      sessionGroup = {
        ...sessionGroup,
        sessions: { [session.id]: session }
      };
      mockSelectors(selectors, {
        sessionGroups: { [sessionGroup.id]: sessionGroup },
        sessions: { [session.id]: session },
        registrationType: { id: 'regTypeId' }
      });
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalSessionsToSelect: true,
        availableOptionalSessions: [session.id]
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });

    test('Missing sessions within required session group for admission item', async () => {
      let sessionGroup = createSessionGroup();
      const session = { ...createSession() };
      sessionGroup = {
        ...sessionGroup,
        sessions: { [session.id]: session }
      };
      mockSelectors(selectors, {
        sessionGroups: { [sessionGroup.id]: sessionGroup },
        registrationType: { id: 'regTypeId' }
      });
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, timezones, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalSessionsToSelect: true,
        availableOptionalSessions: [session.id]
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });

    test('Missing sessions within unreviewed required session group for admission item', async () => {
      let sessionGroup = createSessionGroup();
      const session = { ...createSession() };
      sessionGroup = {
        ...sessionGroup,
        sessions: { [session.id]: session }
      };
      mockSelectors(selectors, {
        sessionGroups: { [sessionGroup.id]: sessionGroup },
        registrationType: { id: 'regTypeId' }
      });
      mockIsWidgetReviewedResult = false;
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalSessionsToSelect: true,
        availableOptionalSessions: [session.id]
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });

    test('Selected session groups are not valid for admission item but selected during original registration', async () => {
      let sessionGroup = createSessionGroup();
      const session = { ...createSession(), associatedRegistrationTypes: ['otherRegistrationTypeId'] };
      sessionGroup = {
        ...sessionGroup,
        sessions: { [session.id]: session }
      };
      const registeredSession = createProductSession(session);
      mockSelectors(selectors, {
        sessionGroups: { [sessionGroup.id]: sessionGroup },
        sessions: { [session.id]: session },
        registeredSessions: { [registeredSession.productId]: registeredSession },
        registrationType: { id: 'regTypeId' }
      });
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalSessionsToSelect: true,
        availableOptionalSessions: [session.id]
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });

    test('Sessions meet minimum required session count.', async () => {
      const session = createSession();
      mockSelectors(selectors, {
        registrationType: createRegistrationType(),
        sessions: { [session.id]: session }
      });
      mockSessionsAppearOnPageBeforeAdmissionItemsResult = true;
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, timezones, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        minimumNumberOfSessionsToSelect: 1
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });

    test('Sessions do not meet minimum required session count.', async () => {
      const session = createSession();
      mockSelectors(selectors, {
        registrationType: createRegistrationType(),
        sessions: { [session.id]: session }
      });
      mockSessionsAppearOnPageBeforeAdmissionItemsResult = true;
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        minimumNumberOfSessionsToSelect: 2
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });

    test('Sessions meet maximum required session count.', async () => {
      const session = createSession();
      mockSelectors(selectors, {
        registrationType: createRegistrationType(),
        sessions: { [session.id]: session }
      });
      mockSessionsAppearOnPageBeforeAdmissionItemsResult = true;
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, timezones, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        maximumNumberOfSessionsToSelect: 1
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });

    test('Sessions do not meet maximum required session count.', async () => {
      const session = createSession();
      mockSelectors(selectors, {
        registrationType: createRegistrationType(),
        sessions: { [session.id]: session }
      });
      mockSessionsAppearOnPageBeforeAdmissionItemsResult = true;
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        maximumNumberOfSessionsToSelect: 0
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });

    test('Waitlisted session should be invalid if unavailable in selected admission item', async () => {
      const session = createSession();
      const registrationType = createRegistrationType();
      const selectedSession = { [session.id]: createProductSession(session) };
      mockSelectors(selectors, {
        registrationType,
        sessions: { [session.id]: session }
      });
      mockRegCartSelectors(regCartSelectors, {
        registrationTypeId: registrationType.id,
        selectedSession
      });
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession: { isPlanner: true } };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalSessionsToSelect: true,
        availableOptionalSessions: ['DUMMY_ID']
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );

      expect(results).toMatchObject({
        isValid: false,
        sessionWaitlistValidationResults: {
          isValid: false,
          invalidWaitlistedSession: [{ id: 'sessionItemAId' }]
        }
      });
    });
  });

  describe('Admission Item change validations for guest', () => {
    test('Admission item does not limit sessions for guest', async () => {
      const session = createSession();
      const registrationType = createRegistrationType();
      const selectedSession = { [session.id]: createProductSession(session) };
      mockSelectors(selectors, {
        registrationType,
        sessions: { [session.id]: session }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        registrationTypeId: registrationType.id,
        selectedSession
      });
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const results = await validations.validateAdmissionItemChange(
        state,
        createAdmissionItem(),
        'guestEventRegId',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });

    test('Admission item does limit sessions and sessions valid for guest', async () => {
      const session = createSession();
      const registrationType = createRegistrationType();
      const selectedSession = { [session.id]: createProductSession(session) };
      mockSelectors(selectors, {
        registrationType,
        sessions: { [session.id]: session }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        registrationTypeId: registrationType.id,
        selectedSession
      });
      const state = { appData, registrationForm, timezones, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalSessionsToSelect: true,
        availableOptionalSessions: [session.id]
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        'guestEventRegId',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });

    test('Admission item does limit sessions and sessions is not valid for guest', async () => {
      const session = createSession();
      const registrationType = createRegistrationType();
      const selectedSession = { [session.id]: createProductSession(session) };
      mockSelectors(selectors, {
        registrationType,
        sessions: { [session.id]: session }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        registrationTypeId: registrationType.id,
        selectedSession
      });
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalSessionsToSelect: true,
        availableOptionalSessions: []
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        'guestEventRegId',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });

    test('Selected sessions by guest within required session group are valid for admission item', async () => {
      let sessionGroup = createSessionGroup();
      const session = createSession();
      const selectedSession = { [session.id]: createProductSession(session) };
      sessionGroup = {
        ...sessionGroup,
        sessions: { [session.id]: session }
      };
      mockSelectors(selectors, {
        sessionGroups: { [sessionGroup.id]: sessionGroup },
        sessions: { [session.id]: session }
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalSessionsToSelect: true,
        availableOptionalSessions: [session.id]
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        'guestEventRegId',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });

    test('Selected session groups by guest are not valid for admission item but selected during original registration', async () => {
      let sessionGroup = createSessionGroup();
      const session = { ...createSession(), associatedRegistrationTypes: ['otherRegistrationTypeId'] };
      const selectedSession = { [session.id]: createProductSession(session) };
      sessionGroup = {
        ...sessionGroup,
        sessions: { [session.id]: session }
      };
      const registeredSession = createProductSession(session);
      mockSelectors(selectors, {
        sessionGroups: { [sessionGroup.id]: sessionGroup },
        sessions: { [session.id]: session },
        registeredSessions: { [registeredSession.productId]: registeredSession },
        registrationType: { id: 'regTypeId' },
        modificationStartRegCart: regCartWithGuestReg
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedSession
      });
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalSessionsToSelect: true,
        availableOptionalSessions: [session.id]
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results).toMatchSnapshot();
    });
  });

  describe('Quantity item validations', () => {
    const quantityItem = createQuantityItem();
    const conflictedQuantityItemCart = {
      regCartId: 'd996d434-d088-44fb-8339-2831a2d0f93c',
      status: 'INPROGRESS',
      groupRegistration: false,
      eventRegistrations: {
        primaryEventRegId: {
          eventRegistrationId: 'primaryEventRegId',
          attendee: {
            isGroupMember: false
          },
          attendeeType: 'ATTENDEE',
          displaySequence: 1,
          productRegistrations: [createProductAdmissionItem(createAdmissionItem())],
          quantityItemRegistrations: {
            [quantityItem.productId]: createProductQuantityItem(quantityItem)
          },
          requestedAction: 'REGISTER',
          primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
          sessionRegistrations: {},
          registrationTypeId: '8ddb813c-4fa1-4188-ac24-e54759b206bc',
          registrationPathId: 'regPathId'
        }
      }
    };

    test('Selected quantity item are not valid for admission item', async () => {
      const conflictQuantityItem = createQuantityItem('quantityItemBId');
      mockSelectors(selectors, {
        selectedQuantityItemDefinitions: [conflictQuantityItem, quantityItem],
        selectedQuantityItems: {
          [conflictQuantityItem.id]: createProductQuantityItem(conflictQuantityItem),
          [quantityItem.id]: createProductQuantityItem(quantityItem)
        }
      });
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalItemsToSelect: true,
        applicableOptionalItems: [quantityItem.id]
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );

      expect(results).toMatchSnapshot();
      expect(results.quantityItemValidationResults.isValid).toBeFalsy();
    });

    test('Selected quantity item are not valid for admission item but selected during original registration', async () => {
      const conflictQuantityItem = createQuantityItem('quantityItemBId');
      mockSelectors(selectors, {
        registeredQuantityItems: {
          [conflictQuantityItem.id]: createProductQuantityItem(conflictQuantityItem)
        },
        selectedQuantityItemDefinitions: [conflictQuantityItem, quantityItem],
        selectedQuantityItems: {
          [conflictQuantityItem.id]: createProductQuantityItem(conflictQuantityItem),
          [quantityItem.id]: createProductQuantityItem(quantityItem)
        },
        modificationStartRegCart: conflictedQuantityItemCart
      });
      mockIsWidgetReviewedResult = true;
      const currentRegistration = {
        regCart: {
          regMod: true
        }
      };
      const state = {
        appData,
        registrationForm: { ...currentRegistration },
        timezones,
        regCartStatus,
        defaultUserSession
      };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalItemsToSelect: true,
        applicableOptionalItems: [quantityItem.id]
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );

      expect(results).toMatchSnapshot();
      expect(results.quantityItemValidationResults.isValid).toBeTruthy();
    });

    test('Selected quantity item are not valid for admission item but selected during original registrationand tried to increase quantity causes validation', async () => {
      const conflictQuantityItem = createQuantityItem('quantityItemBId');
      mockSelectors(selectors, {
        registeredQuantityItems: {
          [conflictQuantityItem.id]: createProductQuantityItem(conflictQuantityItem)
        },
        visibleQuantityItems: [conflictQuantityItem, quantityItem],
        selectedQuantityItemDefinitions: [conflictQuantityItem, quantityItem],
        selectedQuantityItems: {
          [conflictQuantityItem.id]: {
            productId: quantityItem.id,
            quantity: 5
          },
          [quantityItem.id]: createProductQuantityItem(quantityItem)
        },
        modificationStartRegCart: conflictedQuantityItemCart
      });
      mockIsWidgetReviewedResult = true;
      const currentRegistration = {
        regCart: {
          regMod: true
        }
      };
      const state = {
        appData,
        registrationForm: { ...currentRegistration },
        timezones,
        regCartStatus,
        defaultUserSession
      };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalItemsToSelect: true,
        applicableOptionalItems: [quantityItem.id]
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );

      expect(results).toMatchSnapshot();
      expect(results.quantityItemValidationResults.isValid).toBeFalsy();
      expect(results.quantityItemValidationResults.invalidQuantityItemCounts[conflictQuantityItem.id]).toEqual(2);
      expect(results.quantityItemValidationResults.invalidQuantityItems.length).toEqual(1);
    });

    test('Selected quantityItems are not valid for registration type', async () => {
      const testQuantityItem = { ...createQuantityItem(), associatedRegistrationTypes: ['otherRegistrationTypeId'] };
      mockSelectors(selectors, {
        quantityItem: { [testQuantityItem.id]: testQuantityItem },
        visibleQuantityItems: [testQuantityItem]
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedQuantityItem: { [testQuantityItem.id]: createProductQuantityItem(testQuantityItem) }
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
      expect(results.quantityItemValidationResults.isValid).toBeFalsy();
    });

    test('Quantity Items not allowed on new reg path on regtype change', async () => {
      mockSelectors(selectors, {
        quantityItem: { [quantityItem.id]: quantityItem },
        visibleQuantityItems: [quantityItem]
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedQuantityItem: { [quantityItem.id]: createProductQuantityItem(quantityItem) }
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      // registrationTypeBId is tied to regPathId3 which doesn't allowQuantity Item selection
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        'registrationTypeBId',
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
      expect(results.quantityItemValidationResults.isValid).toBeFalsy();
    });

    test('Quantity Items are allowed on new reg path on regtype change', async () => {
      mockSelectors(selectors, {
        quantityItem: { [quantityItem.id]: quantityItem },
        visibleQuantityItems: [quantityItem]
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedQuantityItem: { [quantityItem.id]: createProductQuantityItem(quantityItem) }
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      // registrationTypeBId is tied to regPathId3 which doesn't allowQuantity Item selection
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        'registrationTypeCId',
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
      expect(results.quantityItemValidationResults.isValid).toBeTruthy();
    });

    describe('Advanced rules validations', () => {
      const admissionItem = createAdmissionItem();
      const selectedAdmissionItem = createProductAdmissionItem(admissionItem);
      const registrationType = createRegistrationType();
      beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mockTravelValidations = require('../travelValidations');
        mockTravelValidations.validateHotelBookingAdvancedRules = jest.fn(() => ({ isValid: true }));
        mockTravelValidations.validateHotelBookings = jest.fn(() => ({ isValid: true }));
        mockRegCartSelectors(regCartSelectors, {
          selectedAdmissionItem
        });
      });
      test('Advanced rule is violated by user changing reg type, but no validation as quantity item widget is on/after reg type selection page', async () => {
        const quantityItemAdvancedRules = [
          {
            ...createQuantityItemAdvancedRules(),
            admissionItem: [admissionItem.id],
            contactType: [registrationType.id],
            quantityItem: [quantityItem.id]
          }
        ];
        mockSelectors(selectors, {
          admissionItem,
          admissionItemDefinitions: {
            [admissionItem.id]: admissionItem
          },
          quantityItemAdvancedRules,
          selectedQuantityItems: {
            [quantityItem.id]: {
              id: quantityItem.id,
              quantity: 4
            }
          }
        });
        mockQuantityItemsAppearOnPageBeforeRegistrationTypeResult = false;

        const state = { appData, registrationForm, regCartStatus, defaultUserSession };
        const results = await validations.validateUserRegistrationTypeSelection(
          state,
          registrationType.id,
          'primaryEventRegId'
        );
        expect(results).toMatchSnapshot();
      });

      test('Advanced rule is violated by user changing reg type', async () => {
        const quantityItemAdvancedRules = [
          {
            ...createQuantityItemAdvancedRules(),
            admissionItem: [admissionItem.id],
            contactType: [registrationType.id],
            quantityItem: [quantityItem.id]
          }
        ];
        mockSelectors(selectors, {
          admissionItem,
          admissionItemDefinitions: {
            [admissionItem.id]: admissionItem
          },
          quantityItemAdvancedRules,
          selectedQuantityItems: {
            [quantityItem.id]: {
              id: quantityItem.id,
              quantity: 4
            }
          }
        });
        mockQuantityItemsAppearOnPageBeforeRegistrationTypeResult = true;

        const state = { appData, registrationForm, regCartStatus, defaultUserSession };
        const results = await validations.validateUserRegistrationTypeSelection(
          state,
          registrationType.id,
          'primaryEventRegId'
        );
        expect(results).toMatchSnapshot();
      });

      test('Advanced rule is violated by user changing admission item but but no validation as quantity item widget is on/after admission item selection page', async () => {
        const quantityItemAdvancedRules = [
          {
            ...createQuantityItemAdvancedRules(),
            admissionItem: [admissionItem.id],
            contactType: [registrationType.id],
            quantityItem: [quantityItem.id]
          }
        ];
        mockSelectors(selectors, {
          admissionItem,
          admissionItemDefinitions: {
            [admissionItem.id]: admissionItem
          },
          quantityItemAdvancedRules,
          selectedQuantityItems: {
            [quantityItem.id]: {
              id: quantityItem.id,
              quantity: 4
            }
          }
        });
        mockQuantityItemsAppearOnPageBeforeAdmissionItemsResult = false;

        const state = { appData, registrationForm, regCartStatus, defaultUserSession };
        const results = await validations.validateAdmissionItemChange(
          state,
          admissionItem,
          '',
          mockSessionsAppearOnPageBeforeAdmissionItemsResult
        );
        expect(results).toMatchSnapshot();
      });

      test('Advanced rule is violated by user changing admission item', async () => {
        const quantityItemAdvancedRules = [
          {
            ...createQuantityItemAdvancedRules(),
            admissionItem: [admissionItem.id],
            contactType: [registrationType.id],
            quantityItem: [quantityItem.id]
          }
        ];
        mockSelectors(selectors, {
          admissionItem,
          admissionItemDefinitions: {
            [admissionItem.id]: admissionItem
          },
          quantityItemAdvancedRules,
          selectedQuantityItems: {
            [quantityItem.id]: {
              id: quantityItem.id,
              quantity: 4
            }
          }
        });
        mockQuantityItemsAppearOnPageBeforeAdmissionItemsResult = true;

        const state = { appData, registrationForm, regCartStatus, defaultUserSession };
        const results = await validations.validateAdmissionItemChange(
          state,
          admissionItem,
          '',
          mockSessionsAppearOnPageBeforeAdmissionItemsResult
        );
        expect(results).toMatchSnapshot();
      });

      test('Advanced rule does not apply on guest registrations', async () => {
        const quantityItemAdvancedRules = [
          {
            ...createQuantityItemAdvancedRules(),
            admissionItem: [admissionItem.id],
            contactType: [registrationType.id],
            quantityItem: [quantityItem.id]
          }
        ];
        mockSelectors(selectors, {
          admissionItem,
          admissionItemDefinitions: {
            [admissionItem.id]: admissionItem
          },
          quantityItemAdvancedRules,
          selectedQuantityItems: {
            [quantityItem.id]: {
              id: quantityItem.id,
              quantity: 4
            }
          }
        });
        mockQuantityItemsAppearOnPageBeforeAdmissionItemsResult = true;

        const state = {
          appData,
          registrationForm: { regCart: regCartWithGuestReg },
          regCartStatus,
          defaultUserSession
        };
        const results = await validations.validateAdmissionItemChange(
          state,
          admissionItem,
          'guestEventRegId',
          mockSessionsAppearOnPageBeforeAdmissionItemsResult
        );
        expect(results).toMatchSnapshot();
      });
    });
  });

  describe('Hotel booking validations', () => {
    const eventTravel = {
      hotelsData: {
        eventHotelVisibilityOption: EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_PATH,
        hotels: [
          {
            roomTypes: [
              {
                id: 'room-1',
                isOpenForRegistration: true,
                associatedRegPathSettings: {
                  regPathId: {}
                },
                associatedEntitySettings: {
                  'regType-1': {}
                }
              }
            ]
          },
          {
            roomTypes: [
              {
                id: 'room-2',
                isOpenForRegistration: true,
                associatedRegPathSettings: {
                  'regPath-2': {}
                },
                associatedEntitySettings: {
                  'regType-1': {}
                }
              }
            ]
          }
        ]
      }
    };
    const hotelsWithAdmItemAssociation = [
      {
        roomTypes: [
          {
            id: 'room-1',
            isOpenForRegistration: true,
            associatedEntitySettings: {
              admissionItemAId: {}
            }
          }
        ]
      },
      {
        roomTypes: [
          {
            id: 'room-2',
            isOpenForRegistration: true,
            associatedEntitySettings: {
              admissionItemAId: {}
            }
          }
        ]
      }
    ];
    const primaryRegId = 'event-registration-id-primary';
    const guestRegId = 'event-registration-id-guest';
    const travelCart = {
      cart: {
        bookings: [
          {
            id: primaryRegId,
            hotelRoomBookings: [
              {
                id: 'primary-room-booking-id',
                roomTypeId: 'room-1',
                requestedAction: 'BOOK'
              }
            ]
          },
          {
            id: guestRegId,
            hotelRoomBookings: [
              {
                id: 'guest-room-booking-id',
                roomTypeId: 'room-2',
                requestedAction: 'BOOK'
              }
            ]
          }
        ]
      }
    };
    const state = { appData, registrationForm, regCartStatus, timezones, defaultUserSession, eventTravel, travelCart };

    test('reg type selected is valid for current rooms, visibilityOption = regPath', async () => {
      mockSelectors(selectors, {
        shared: {
          getAssociatedRegistrationPathId: () => 'regPathId'
        }
      });
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType('regType-1').id,
        primaryRegId
      );
      expect(results.hotelBookingValidationResults.isValid).toEqual(true);
    });

    test('reg type selected is in conflict with current rooms, visibilityOption = regPath', async () => {
      mockSelectors(selectors, {
        shared: {
          getAssociatedRegistrationPathId: () => 'regPath-2'
        }
      });
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType('regType-2').id,
        guestRegId
      );
      expect(results.hotelBookingValidationResults.isValid).toEqual(false);
    });

    test('reg type selected by primary invitee, is valid for current rooms, visibilityOption = regType', async () => {
      mockSelectors(selectors, {
        shared: {
          getAssociatedRegistrationPathId: () => 'regPath-1'
        }
      });
      const stateWithRegTypeVisibilityOption = {
        ...state,
        eventTravel: {
          ...state.eventTravel,
          hotelsData: {
            ...state.eventTravel.hotelsData,
            eventHotelVisibilityOption: EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_TYPE
          }
        }
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        stateWithRegTypeVisibilityOption,
        createRegistrationType('regType-1').id,
        primaryRegId
      );
      expect(results.hotelBookingValidationResults.isValid).toEqual(true);
    });

    test('reg type selected by primary invitee, is in conflict with current rooms, visibilityOption = regType', async () => {
      mockSelectors(selectors, {
        shared: {
          getAssociatedRegistrationPathId: () => 'regPath-1'
        }
      });
      const stateWithRegTypeVisibilityOption = {
        ...state,
        eventTravel: {
          ...state.eventTravel,
          hotelsData: {
            ...state.eventTravel.hotelsData,
            eventHotelVisibilityOption: EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_TYPE
          }
        }
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        stateWithRegTypeVisibilityOption,
        createRegistrationType('regType-2').id,
        primaryRegId
      );
      expect(results.hotelBookingValidationResults.isValid).toEqual(false);
    });

    test('reg type selected by guest, is valid for current rooms, visibilityOption = regType', async () => {
      mockSelectors(selectors, {
        shared: {
          getAssociatedRegistrationPathId: () => 'regPath-1'
        }
      });
      const stateWithRegTypeVisibilityOption = {
        ...state,
        eventTravel: {
          ...state.eventTravel,
          hotelsData: {
            ...state.eventTravel.hotelsData,
            eventHotelVisibilityOption: EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_TYPE
          }
        }
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        stateWithRegTypeVisibilityOption,
        createRegistrationType('regType-1').id,
        guestRegId
      );
      expect(results.hotelBookingValidationResults.isValid).toEqual(true);
    });

    test('reg type selected by guest, is in conflict with current rooms, visibilityOption = regType', async () => {
      mockSelectors(selectors, {
        shared: {
          getAssociatedRegistrationPathId: () => 'regPath-1'
        }
      });
      const stateWithRegTypeVisibilityOption = {
        ...state,
        eventTravel: {
          ...state.eventTravel,
          hotelsData: {
            ...state.eventTravel.hotelsData,
            eventHotelVisibilityOption: EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_TYPE
          }
        }
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        stateWithRegTypeVisibilityOption,
        createRegistrationType('regType-2').id,
        guestRegId
      );
      expect(results.hotelBookingValidationResults.isValid).toEqual(false);
    });
    test('adm item not selected by primary invitee, visibilityOption = adm item', async () => {
      const admissionItem = createAdmissionItem();
      mockSelectors(selectors, {
        admissionItem,
        admissionItemDefinitions: { [admissionItem.id]: admissionItem },
        shared: {
          getAssociatedRegistrationPathId: () => 'regPath-1'
        }
      });
      const stateWithAdmItemVisibilityOption = {
        ...state,
        eventTravel: {
          ...state.eventTravel,
          hotelsData: {
            ...state.eventTravel.hotelsData,
            eventHotelVisibilityOption: EVENT_HOTEL_VISIBILITY_OPTION.ADMISSION_ITEM,
            hotels: hotelsWithAdmItemAssociation
          }
        }
      };
      const results = await validations.validateAdmissionItemChange(
        stateWithAdmItemVisibilityOption,
        undefined,
        primaryRegId,
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results.hotelBookingValidationResults.isValid).toEqual(false);
    });
    test('adm item selected by primary invitee, is valid for current rooms, visibilityOption = adm item', async () => {
      const admissionItem = createAdmissionItem();
      const selectedAdmissionItem = createProductAdmissionItem(admissionItem);
      mockSelectors(selectors, {
        admissionItem,
        admissionItemDefinitions: { [admissionItem.id]: admissionItem },
        shared: {
          getAssociatedRegistrationPathId: () => 'regPath-1'
        }
      });
      mockRegCartSelectors(regCartSelectors, {
        selectedAdmissionItem
      });
      const stateWithAdmItemVisibilityOption = {
        ...state,
        eventTravel: {
          ...state.eventTravel,
          hotelsData: {
            ...state.eventTravel.hotelsData,
            eventHotelVisibilityOption: EVENT_HOTEL_VISIBILITY_OPTION.ADMISSION_ITEM,
            hotels: hotelsWithAdmItemAssociation
          }
        }
      };
      const results = await validations.validateAdmissionItemChange(
        stateWithAdmItemVisibilityOption,
        admissionItem,
        primaryRegId,
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results.hotelBookingValidationResults.isValid).toEqual(true);
    });

    test('adm item selected by primary invitee, is in conflict with current rooms, visibilityOption = admItem', async () => {
      const admissionItem = createAdmissionItem('admissionItemBId');
      const selectedAdmissionItem = createProductAdmissionItem(admissionItem);
      mockSelectors(selectors, {
        admissionItem,
        admissionItemDefinitions: { [admissionItem.id]: admissionItem },
        shared: {
          getAssociatedRegistrationPathId: () => 'regPath-1'
        }
      });
      mockRegCartSelectors(regCartSelectors, {
        selectedAdmissionItem
      });
      const stateWithAdmItemVisibilityOption = {
        ...state,
        eventTravel: {
          ...state.eventTravel,
          hotelsData: {
            ...state.eventTravel.hotelsData,
            eventHotelVisibilityOption: EVENT_HOTEL_VISIBILITY_OPTION.ADMISSION_ITEM,
            hotels: hotelsWithAdmItemAssociation
          }
        }
      };
      const results = await validations.validateAdmissionItemChange(
        stateWithAdmItemVisibilityOption,
        admissionItem,
        primaryRegId,
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results.hotelBookingValidationResults.isValid).toEqual(false);
    });

    test('adm item selected by guest, is valid for current rooms, visibilityOption = adm item', async () => {
      const admissionItem = createAdmissionItem();
      const selectedAdmissionItem = createProductAdmissionItem(admissionItem);
      mockSelectors(selectors, {
        admissionItem,
        admissionItemDefinitions: { [admissionItem.id]: admissionItem },
        shared: {
          getAssociatedRegistrationPathId: () => 'regPath-1'
        }
      });
      mockRegCartSelectors(regCartSelectors, {
        selectedAdmissionItem
      });
      const stateWithAdmItemVisibilityOption = {
        ...state,
        eventTravel: {
          ...state.eventTravel,
          hotelsData: {
            ...state.eventTravel.hotelsData,
            eventHotelVisibilityOption: EVENT_HOTEL_VISIBILITY_OPTION.ADMISSION_ITEM,
            hotels: hotelsWithAdmItemAssociation
          }
        }
      };
      const results = await validations.validateAdmissionItemChange(
        stateWithAdmItemVisibilityOption,
        admissionItem,
        guestRegId,
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results.hotelBookingValidationResults.isValid).toEqual(true);
    });

    test('adm item selected by guest, is in conflict with current rooms, visibilityOption = admItem', async () => {
      const admissionItem = createAdmissionItem('admissionItemBId');
      const selectedAdmissionItem = createProductAdmissionItem(admissionItem);
      mockSelectors(selectors, {
        admissionItem,
        admissionItemDefinitions: { [admissionItem.id]: admissionItem },
        shared: {
          getAssociatedRegistrationPathId: () => 'regPath-1'
        }
      });
      mockRegCartSelectors(regCartSelectors, {
        selectedAdmissionItem
      });
      const stateWithAdmItemVisibilityOption = {
        ...state,
        eventTravel: {
          ...state.eventTravel,
          hotelsData: {
            ...state.eventTravel.hotelsData,
            eventHotelVisibilityOption: EVENT_HOTEL_VISIBILITY_OPTION.ADMISSION_ITEM,
            hotels: hotelsWithAdmItemAssociation
          }
        }
      };
      const results = await validations.validateAdmissionItemChange(
        stateWithAdmItemVisibilityOption,
        admissionItem,
        guestRegId,
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );
      expect(results.hotelBookingValidationResults.isValid).toEqual(false);
    });

    test('idConfirmationConflictDialog, errors can be extracted from travel cart validations', () => {
      const donationItem = createDonationItem();
      const travelCartErrors = {
        responseBody: {
          validationResult: {
            validationMessages: [
              {
                severity: 'Error',
                localizationKey: 'TRAVEL_API.ROOM_TYPE_NOT_AVAILABLE',
                parametersMap: {
                  bookingType: 'Room',
                  childBookingId: 'primary-room-booking-id'
                },
                subValidationMessageList: []
              }
            ]
          }
        }
      };
      const visibleProducts = {
        Sessions: {
          DUMMY_ID: {
            donationItems: {
              [donationItem.id]: donationItem
            }
          }
        }
      };
      const updatedState = {
        ...state,
        visibleProducts
      };
      const results = getIdConfirmationValidationsFromCartError(updatedState, travelCartErrors);
      expect(results.isValid).toBeFalsy();
      expect(results.hotelBookingValidationResults.isValid).toBeFalsy();
      expect(results.hotelBookingValidationResults.invalidHotelRoomBookings.length).toBe(1);
      // hotel room booking of primary invitee should be flagged as invalid
      expect(results.hotelBookingValidationResults.invalidHotelRoomBookings[0].id).toBe('primary-room-booking-id');
    });

    test('idConfirmationConflictDialog, errors can be extracted from sessionBundle validations', () => {
      const updateRegCartErrors = {
        responseBody: {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.PRODUCT_REGTYPE_CONFLICT',
              parametersMap: {
                eventRegistrationId: 'evtRegId',
                productId: 'sessionBundleId',
                productType: 'Track',
                registrationTypeId: 'attendee'
              }
            }
          ]
        }
      };
      const visibleProducts = {
        Sessions: {}
      };
      const updatedState = {
        ...state,
        visibleProducts
      };
      const results = getIdConfirmationValidationsFromCartError(updatedState, updateRegCartErrors);
      expect(results).toBeDefined();
      expect(results.isValid).toBeFalsy();
      expect(results.sessionBundleValidationResults.isValid).toBeFalsy();
      expect(results.sessionBundleValidationResults.invalidSessionBundles.length).toBe(1);
      expect(results.sessionBundleValidationResults.invalidSessionBundles[0]).toBe('sessionBundleId');
    });
  });

  describe('Donation item validations', () => {
    const donationItem = createDonationItem();
    test('Selected donation item is valid for admission item', async () => {
      mockSelectors(selectors, {
        selectedDonationItemDefinitions: [donationItem]
      });
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalItemsToSelect: true,
        applicableOptionalItems: [donationItem.id]
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );

      expect(results).toMatchSnapshot();
      expect(results.donationItemValidationResults.isValid).toBeTruthy();
    });

    test('Selected donation item is not valid for admission item', async () => {
      const conflictDonationItem = createDonationItem('donationItemBId');
      mockSelectors(selectors, {
        selectedDonationItemDefinitions: [conflictDonationItem, donationItem]
      });
      mockIsWidgetReviewedResult = true;
      const state = { appData, registrationForm, timezones, regCartStatus, defaultUserSession };
      const admissionItem = {
        ...createAdmissionItem(),
        limitOptionalItemsToSelect: true,
        applicableOptionalItems: [donationItem.id]
      };
      const results = await validations.validateAdmissionItemChange(
        state,
        admissionItem,
        '',
        mockSessionsAppearOnPageBeforeAdmissionItemsResult
      );

      expect(results).toMatchSnapshot();
      expect(results.donationItemValidationResults.isValid).toBeFalsy();
    });

    test('Selected donation item is valid for registration type', async () => {
      mockSelectors(selectors, {
        donationItem: { [donationItem.id]: donationItem },
        visibleDonationItems: [donationItem]
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedDonationItem: { [donationItem.id]: createProductDonationItem(donationItem) }
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
      expect(results.donationItemValidationResults.isValid).toBeTruthy();
    });

    test('Selected donation item is not valid for registration type', async () => {
      const conflictDonationItem = { ...donationItem, associatedRegistrationTypes: ['otherRegistrationTypeId'] };
      mockSelectors(selectors, {
        donationItem: { [conflictDonationItem.id]: conflictDonationItem },
        visibleDonationItems: [conflictDonationItem]
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedDonationItem: { [conflictDonationItem.id]: createProductDonationItem(conflictDonationItem) }
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
      expect(results.donationItemValidationResults.isValid).toBeFalsy();
    });

    test('Donation Items not allowed on new reg path on regtype change', async () => {
      mockSelectors(selectors, {
        donationItem: { [donationItem.id]: donationItem },
        visibleDonationItems: [donationItem]
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedDonationItem: { [donationItem.id]: createProductDonationItem(donationItem) }
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      // registrationTypeBId is tied to regPathId3 which doesn't allow Donation Item selection
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        'registrationTypeBId',
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
      expect(results.donationItemValidationResults.isValid).toBeFalsy();
    });

    test('Donation Items are allowed on new reg path on regtype change', async () => {
      mockSelectors(selectors, {
        donationItem: { [donationItem.id]: donationItem },
        visibleDonationItems: [donationItem]
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        selectedDonationItem: { [donationItem.id]: createProductDonationItem(donationItem) }
      });
      const state = { appData, registrationForm, regCartStatus, defaultUserSession };
      // registrationTypeCId is tied to regPathId4 which does allow Donation Item selection
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        'registrationTypeCId',
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
      expect(results.donationItemValidationResults.isValid).toBeTruthy();
    });

    test('Donation Item id confirmation validations can be extracted from reg cart error', () => {
      const regCartError = {
        responseBody: {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.PRODUCT_NOT_AVAILABLE',
              parametersMap: {
                productId: donationItem.id,
                productType: 'DonationItem'
              },
              subValidationMessageList: []
            }
          ]
        }
      };
      const visibleProducts = {
        Sessions: {
          DUMMY_ID: {
            donationItems: {
              [donationItem.id]: donationItem
            }
          }
        }
      };
      const state = { registrationForm, visibleProducts };
      const results = getIdConfirmationValidationsFromCartError(state, regCartError);
      expect(results.isValid).toBeFalsy();
      expect(results.donationItemValidationResults.isValid).toBeFalsy();
      expect(results.donationItemValidationResults.invalidDonationItems.length).toBe(1);
    });
  });

  describe('Custom field advance logic validations', () => {
    test('No child custom fields exist with advance logic for custom field', () => {
      const customFieldId = 'customFieldId';
      const customFieldAnswer = createCustomFieldAnswers('customFieldId');
      const state = {
        account: createContactCustomFieldsMetadata(),
        appData
      };
      const results = validations.validateContactCustomFieldChoiceChange(state, customFieldId, customFieldAnswer);
      expect(results).toMatchSnapshot();
    });

    test('Parent custom field change in choices does make choices invalid for child custom fields.', () => {
      const customFieldId = 'parentCustomFieldId';
      const childCustomFieldId = 'childCustomFieldId';
      const customFieldAnswer = createCustomFieldAnswers(customFieldId);
      mockSelectors(selectors, {
        selectedValues: createInvalidChildCustomFieldAnswers(childCustomFieldId, [
          {
            answerType: 'Choice',
            choice: `choice1-${childCustomFieldId}`
          },
          {
            answerType: 'Choice',
            choice: `choice3-${childCustomFieldId}`
          }
        ])
      });
      const state = {
        account: createContactCustomFieldsMetadata(customFieldId, childCustomFieldId),
        appData
      };
      const results = validations.validateContactCustomFieldChoiceChange(state, customFieldId, customFieldAnswer);
      expect(results).toMatchSnapshot();
    });

    test('Parent custom field change in choices does not make choices invalid for child custom fields.', () => {
      const customFieldId = 'parentCustomFieldId';
      const childCustomFieldId = 'childCustomFieldId';
      const customFieldAnswer = createCustomFieldAnswers(customFieldId);
      mockSelectors(selectors, {
        selectedValues: createInvalidChildCustomFieldAnswers(childCustomFieldId, [
          {
            answerType: 'Choice',
            choice: `choice1-${childCustomFieldId}`
          }
        ])
      });
      const state = {
        account: createContactCustomFieldsMetadata(customFieldId, childCustomFieldId)
      };
      const results = validations.validateContactCustomFieldChoiceChange(state, customFieldId, customFieldAnswer);
      expect(results).toMatchSnapshot();
    });
  });

  describe('Validations for air request based on site editor configs', () => {
    test('all air bookings will be invalid so far if any, when new reg path has no air request widget dropped', async () => {
      travelBookingGetter.getTravelBookingsForCurrentRegistrantAndGuests = jest.fn(() => [
        {
          id: 'GROUP_LEADER_ID',
          airBookings: [
            {
              id: 'primaryInviteeAirBookingId',
              isForOther: false
            },
            {
              id: 'othersAirBookingId',
              isForOther: true
            }
          ]
        },
        {
          id: 'GUEST_ID',
          primaryInviteeId: 'primaryInviteeAttendeeId',
          airBookings: [
            {
              id: 'guestAirBookingId',
              isForOther: false
            }
          ]
        }
      ]);

      mockSelectors(selectors, {
        admissionItem: createAdmissionItem()
      });
      mockIsWidgetReviewedResult = true;
      const currentRegistration = {
        regCart: {
          eventRegistrations: {
            GROUP_LEADER_ID: {
              registrationTypeId: createRegistrationType('registrationTypeBId').id,
              registrationPathId: 'regPathId3',
              attendeeType: 'GROUP_LEADER'
            },
            GUEST_ID: {
              registrationTypeId: createRegistrationType('registrationTypeBId').id,
              registrationPathId: 'regPathId3',
              attendeeType: 'GUEST'
            }
          }
        },
        currentEventRegistrationId: 'GROUP_LEADER_ID'
      };
      const state = {
        appData,
        registrationForm: { ...currentRegistration },
        timezones: {},
        regCartStatus: { lastSavedRegCart: currentRegistration.regCart },
        defaultUserSession
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType('registrationTypeBId').id
      );
      expect(results.airRequestValidationResults.isValid).toEqual(false);
      expect(results.airRequestValidationResults.invalidAirBookings).toEqual([
        {
          id: 'primaryInviteeAirBookingId',
          isForOther: false
        },
        {
          id: 'othersAirBookingId',
          isForOther: true
        },
        {
          id: 'guestAirBookingId',
          isForOther: false
        }
      ]);
    });

    test('all air bookings made so far should be invalid, when maximum number of air request on switched reg path is less', async () => {
      travelBookingGetter.getTravelBookingsForCurrentRegistrantAndGuests = jest.fn(() => [
        {
          id: 'GROUP_LEADER_ID',
          airBookings: [
            {
              id: 'primaryInviteeAirBookingId',
              isForOther: false
            },
            {
              id: 'othersAirBookingId',
              isForOther: true
            }
          ]
        }
      ]);

      mockSelectors(selectors, {
        admissionItem: createAdmissionItem()
      });
      mockIsWidgetReviewedResult = true;
      const currentRegistration = {
        regCart: {
          eventRegistrations: {
            GROUP_LEADER_ID: {
              registrationTypeId: createRegistrationType('registrationTypeBId').id,
              registrationPathId: 'regPathId4',
              attendeeType: 'GROUP_LEADER'
            }
          }
        },
        currentEventRegistrationId: 'GROUP_LEADER_ID'
      };
      const state = {
        appData,
        registrationForm: { ...currentRegistration },
        timezones: {},
        regCartStatus: { lastSavedRegCart: currentRegistration.regCart },
        defaultUserSession
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType('registrationTypeDId').id
      );
      expect(results.airRequestValidationResults.isValid).toEqual(false);
      expect(results.airRequestValidationResults.invalidAirBookings).toEqual([
        {
          id: 'primaryInviteeAirBookingId',
          isForOther: false
        },
        {
          id: 'othersAirBookingId',
          isForOther: true
        }
      ]);
    });

    test('surpass new request until and max number of air request limit settings in case of planner reg..', async () => {
      travelBookingGetter.getTravelBookingsForCurrentRegistrantAndGuests = jest.fn(() => [
        {
          id: 'GROUP_LEADER_ID',
          airBookings: [
            {
              id: 'primaryInviteeAirBookingId',
              isForOther: false
            },
            {
              id: 'othersAirBookingId',
              isForOther: true
            }
          ]
        }
      ]);

      mockSelectors(selectors, {
        admissionItem: createAdmissionItem()
      });
      mockIsWidgetReviewedResult = true;
      const currentRegistration = {
        regCart: {
          eventRegistrations: {
            GROUP_LEADER_ID: {
              registrationTypeId: createRegistrationType('registrationTypeCId').id,
              registrationPathId: 'regPathId4',
              attendeeType: 'GROUP_LEADER'
            }
          }
        },
        currentEventRegistrationId: 'GROUP_LEADER_ID'
      };
      const state = {
        appData,
        registrationForm: { ...currentRegistration },
        timezones: {},
        defaultUserSession: { isPlanner: true },
        regCartStatus: { lastSavedRegCart: currentRegistration.regCart }
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType('registrationTypeFId').id
      );
      expect(results.airRequestValidationResults.isValid).toEqual(true);
      expect(results.airRequestValidationResults.invalidAirBookings).toEqual([]);
    });

    test('all air bookings made so far should be invalid, when new request until setting on switched reg path is before current date', async () => {
      travelBookingGetter.getTravelBookingsForCurrentRegistrantAndGuests = jest.fn(() => [
        {
          id: 'GROUP_LEADER_ID',
          airBookings: [
            {
              id: 'primaryInviteeAirBookingId',
              isForOther: false
            },
            {
              id: 'othersAirBookingId',
              isForOther: true
            }
          ]
        }
      ]);

      mockSelectors(selectors, {
        admissionItem: createAdmissionItem()
      });
      mockIsWidgetReviewedResult = true;
      const currentRegistration = {
        regCart: {
          eventRegistrations: {
            GROUP_LEADER_ID: {
              registrationTypeId: createRegistrationType('registrationTypeBId').id,
              registrationPathId: 'regPathId4',
              attendeeType: 'GROUP_LEADER'
            }
          }
        },
        currentEventRegistrationId: 'GROUP_LEADER_ID'
      };
      const state = {
        appData,
        registrationForm: { ...currentRegistration },
        timezones: {},
        regCartStatus: { lastSavedRegCart: currentRegistration.regCart },
        defaultUserSession
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType('registrationTypeDId').id
      );
      expect(results.airRequestValidationResults.isValid).toEqual(false);
      expect(results.airRequestValidationResults.invalidAirBookings).toEqual([
        {
          id: 'primaryInviteeAirBookingId',
          isForOther: false
        },
        {
          id: 'othersAirBookingId',
          isForOther: true
        }
      ]);
    });

    test('air bookings for guest and others made so far should be invalid if any, when new reg path has no air request widget dropped', async () => {
      travelBookingGetter.getTravelBookingsForCurrentRegistrantAndGuests = jest.fn(() => [
        {
          id: 'GROUP_LEADER_ID',
          airBookings: [
            {
              id: 'primaryInviteeAirBookingId',
              isForOther: false
            },
            {
              id: 'othersAirBookingId',
              isForOther: true
            }
          ]
        },
        {
          id: 'GUEST_ID',
          primaryInviteeId: 'primaryInviteeAttendeeId',
          airBookings: [
            {
              id: 'guestAirBookingId',
              isForOther: false
            }
          ]
        }
      ]);

      mockSelectors(selectors, {
        admissionItem: createAdmissionItem()
      });
      mockIsWidgetReviewedResult = true;
      const currentRegistration = {
        regCart: {
          eventRegistrations: {
            GROUP_LEADER_ID: {
              registrationTypeId: createRegistrationType('registrationTypeCId').id,
              registrationPathId: 'regPathId4',
              attendeeType: 'GROUP_LEADER'
            },
            GUEST_ID: {
              registrationTypeId: createRegistrationType('registrationTypeCId').id,
              registrationPathId: 'regPathId4',
              attendeeType: 'GUEST'
            }
          }
        },
        currentEventRegistrationId: 'GROUP_LEADER_ID'
      };
      const state = {
        appData,
        registrationForm: { ...currentRegistration },
        timezones: {},
        regCartStatus: { lastSavedRegCart: currentRegistration.regCart },
        defaultUserSession
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType('registrationTypeCId').id
      );
      expect(results.airRequestValidationResults.isValid).toEqual(false);
      expect(results.airRequestValidationResults.invalidAirBookings).toEqual([
        {
          id: 'othersAirBookingId',
          isForOther: true
        },
        {
          id: 'guestAirBookingId',
          isForOther: false
        }
      ]);
    });
  });

  describe('group reg validations', () => {
    test('group reg is valid when there are no group members', async () => {
      const currentRegistration = {
        regCart: {
          eventRegistrations: {
            GROUP_LEADER_ID: {
              registrationTypeId: createRegistrationType('registrationTypeCId').id,
              registrationPathId: 'regPathId4',
              attendeeType: 'GROUP_LEADER_ID'
            }
          }
        },
        currentEventRegistrationId: 'GROUP_LEADER_ID'
      };
      mockSelectors(selectors, {
        isGroupLeader: true
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        numberOfGroupMembers: 0
      });
      const state = {
        appData,
        registrationForm: { ...currentRegistration },
        regCartStatus: { lastSavedRegCart: currentRegistration.regCart },
        defaultUserSession
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'GROUP_LEADER_ID'
      );
      expect(results).toMatchSnapshot();
    });

    test('group reg is invalid when there reg path does not have group members', async () => {
      const currentRegistration = {
        regCart: {
          eventRegistrations: {
            GROUP_LEADER_ID: {
              registrationTypeId: createRegistrationType('registrationTypeCId').id,
              registrationPathId: 'regPathId4',
              attendeeType: 'GROUP_LEADER_ID'
            },
            ATENDEE_ID: {
              registrationTypeId: createRegistrationType('registrationTypeCId').id,
              registrationPathId: 'regPathId4',
              attendeeType: 'ATENDEE_ID'
            }
          }
        },
        currentEventRegistrationId: 'GROUP_LEADER_ID'
      };
      mockSelectors(selectors, {
        isGroupLeader: true,
        groupRegEnabled: false
      });
      mockIsWidgetReviewedResult = true;
      mockRegCartSelectors(regCartSelectors, {
        numberOfGroupMembers: 1
      });
      const state = {
        appData,
        registrationForm: { ...currentRegistration },
        regCartStatus: { lastSavedRegCart: currentRegistration.regCart },
        defaultUserSession
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType().id,
        'GROUP_LEADER_ID'
      );
      expect(results).toMatchSnapshot();
    });
  });

  describe('Group Flight Requests validations', () => {
    const eventTravel = {
      airData: {
        isGroupFlightEnabled: true,
        groupFlightSetup: {
          ...GroupFlightData.groupFlightSetup,
          groupFlights: [
            {
              ...GroupFlightData.groupFlightSetup.groupFlights[0],
              regPathSettings: {
                ...GroupFlightData.groupFlightSetup.groupFlights[0].regPathSettings,
                regPathId3: {
                  regPathId: 'regPathId3',
                  allowCharge: false,
                  allowRefund: false
                }
              }
            },
            {
              id: '07222102-8472-4454-a1c6-ae5af3dcaa49',
              name: 'CDG-MUM',
              travelType: 1,
              price: 0.0,
              showPrice: true,
              departingAirportId: 1855,
              arrivalAirportId: 500,
              departingCode: 'MUM',
              arrivalCode: 'CDG',
              departDate: '2020-08-27',
              departTime: '03:00:00 PM',
              arriveDate: '2020-08-28',
              arriveTime: '11:30:00 PM',
              groupFlightLegs: [
                {
                  id: '3475e9de-a793-4783-a0cb-e77fb2f714c5',
                  airline: 'Air India',
                  flightNumber: 'AI-420',
                  operatedBy: 'Air India',
                  ticketType: 1,
                  departureAirportId: 1855,
                  arrivalAirportId: 500,
                  departDate: '2020-08-27',
                  departTime: '03:00:00 PM',
                  arriveDate: '2020-08-28',
                  arriveTime: '11:30:00 PM',
                  groupFlightLegOrder: 1
                }
              ],
              regPathSettings: {
                regPathId3: {
                  regPathId: 'regPathId3',
                  allowCharge: false,
                  allowRefund: false
                }
              },
              useDefaultDisplayName: true,
              isChargeable: false,
              isOpenForRegistration: true
            }
          ]
        }
      }
    };
    const currentRegistration = {
      regCart: {
        eventRegistrations: {
          primaryEventRegId: {
            registrationTypeId: createRegistrationType('registrationTypeCId').id,
            registrationPathId: 'regPathId4',
            attendeeType: 'GROUP_LEADER'
          }
        }
      },
      currentEventRegistrationId: 'primaryEventRegId'
    };
    test('Invalid - Outbound group flight id not present on new reg path id', async () => {
      travelBookingGetter.getTravelBookingsForCurrentRegistrantAndGuests = jest.fn(() => [
        {
          id: 'primaryEventRegId',
          groupFlightBookings: [
            {
              id: 'BOOKING_ID_1',
              outboundGroupFlightId: 'GF_OB_1'
            }
          ]
        }
      ]);
      mockSelectors(selectors, {
        admissionItem: createAdmissionItem()
      });
      mockIsWidgetReviewedResult = true;
      const state = {
        appData,
        registrationForm: { ...currentRegistration },
        timezones: {},
        regCartStatus: { lastSavedRegCart: currentRegistration.regCart },
        eventTravel,
        defaultUserSession
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType('registrationTypeBId').id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
      expect(results.isValid).toBeFalsy();
      expect(results.groupFlightBookingValidationResults).not.toBeNull();
      expect(results.groupFlightBookingValidationResults.isValid).toBeFalsy();
      expect(results.groupFlightBookingValidationResults.invalidGroupFlightBookings.length).toBe(1);
      expect(results.groupFlightBookingValidationResults.invalidGroupFlightBookings[0].outboundGroupFlightId).toBe(
        'GF_OB_1'
      );
    });
    test('Invalid - Outbound group flight id present but return group flight not present on new reg path id', async () => {
      travelBookingGetter.getTravelBookingsForCurrentRegistrantAndGuests = jest.fn(() => [
        {
          id: 'primaryEventRegId',
          groupFlightBookings: [
            {
              id: 'BOOKING_ID_1',
              outboundGroupFlightId: 'f0738f6c-b93f-44da-9783-6368bb423a49',
              returnGroupFlightId: 'GF_R_1'
            }
          ]
        }
      ]);
      mockSelectors(selectors, {
        admissionItem: createAdmissionItem()
      });
      mockIsWidgetReviewedResult = true;
      const state = {
        appData,
        registrationForm: { ...currentRegistration },
        timezones: {},
        regCartStatus: { lastSavedRegCart: currentRegistration.regCart },
        eventTravel,
        defaultUserSession
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType('registrationTypeBId').id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
      expect(results.isValid).toBeFalsy();
      expect(results.groupFlightBookingValidationResults).not.toBeNull();
      expect(results.groupFlightBookingValidationResults.isValid).toBeFalsy();
      expect(results.groupFlightBookingValidationResults.invalidGroupFlightBookings.length).toBe(1);
      expect(results.groupFlightBookingValidationResults.invalidGroupFlightBookings[0].returnGroupFlightId).toBe(
        'GF_R_1'
      );
      expect(results.groupFlightBookingValidationResults.invalidGroupFlightBookings[0].outboundGroupFlightId).toBe(
        'f0738f6c-b93f-44da-9783-6368bb423a49'
      );
    });
    test('Invalid - Outbound and Return group flight id not present on new reg path id', async () => {
      travelBookingGetter.getTravelBookingsForCurrentRegistrantAndGuests = jest.fn(() => [
        {
          id: 'primaryEventRegId',
          groupFlightBookings: [
            {
              id: 'BOOKING_ID_1',
              outboundGroupFlightId: 'GF_OB_1',
              returnGroupFlightId: 'GF_R_1'
            }
          ]
        }
      ]);
      mockSelectors(selectors, {
        admissionItem: createAdmissionItem()
      });
      mockIsWidgetReviewedResult = true;
      const state = {
        appData,
        registrationForm: { ...currentRegistration },
        timezones: {},
        regCartStatus: { lastSavedRegCart: currentRegistration.regCart },
        eventTravel,
        defaultUserSession
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType('registrationTypeBId').id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
      expect(results.isValid).toBeFalsy();
      expect(results.groupFlightBookingValidationResults).not.toBeNull();
      expect(results.groupFlightBookingValidationResults.isValid).toBeFalsy();
      expect(results.groupFlightBookingValidationResults.invalidGroupFlightBookings.length).toBe(1);
      expect(results.groupFlightBookingValidationResults.invalidGroupFlightBookings[0].outboundGroupFlightId).toBe(
        'GF_OB_1'
      );
      expect(results.groupFlightBookingValidationResults.invalidGroupFlightBookings[0].returnGroupFlightId).toBe(
        'GF_R_1'
      );
    });
    test('Both group flights valid for primary invitee but not for guest', async () => {
      travelBookingGetter.getTravelBookingsForCurrentRegistrantAndGuests = jest.fn(() => [
        {
          id: 'primaryEventRegId',
          groupFlightBookings: [
            {
              id: 'BOOKING_ID_1',
              outboundGroupFlightId: 'f0738f6c-b93f-44da-9783-6368bb423a49',
              returnGroupFlightId: '07222102-8472-4454-a1c6-ae5af3dcaa49'
            }
          ]
        },
        {
          id: 'guestEventRegId',
          groupFlightBookings: [
            {
              id: 'BOOKING_ID_2',
              outboundGroupFlightId: 'GF_OB_1',
              returnGroupFlightId: 'GF_R_1'
            }
          ]
        }
      ]);
      const updatedCurrentRegistration = {
        ...currentRegistration,
        ...currentRegistration.regCart,
        ...currentRegistration.regCart.eventRegistrations,
        guestEventRegId: {
          registrationTypeId: createRegistrationType('registrationTypeCId').id,
          registrationPathId: 'regPathId4',
          attendeeType: 'GUEST'
        }
      };
      mockSelectors(selectors, {
        admissionItem: createAdmissionItem()
      });
      mockIsWidgetReviewedResult = true;
      const state = {
        appData,
        registrationForm: { ...updatedCurrentRegistration },
        timezones: {},
        regCartStatus: { lastSavedRegCart: updatedCurrentRegistration.regCart },
        eventTravel,
        defaultUserSession
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType('registrationTypeBId').id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
      expect(results.isValid).toBeTruthy();
      expect(results.groupFlightBookingValidationResults).not.toBeNull();
      expect(results.groupFlightBookingValidationResults.isValid).toBeTruthy();
      expect(results.groupFlightBookingValidationResults.invalidGroupFlightBookings.length).toBe(0);

      const resultsGuest = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType('registrationTypeBId').id,
        'guestEventRegId'
      );
      expect(resultsGuest).toMatchSnapshot();
      expect(resultsGuest.isValid).toBeFalsy();
      expect(resultsGuest.groupFlightBookingValidationResults).not.toBeNull();
      expect(resultsGuest.groupFlightBookingValidationResults.isValid).toBeFalsy();
      expect(resultsGuest.groupFlightBookingValidationResults.invalidGroupFlightBookings.length).toBe(1);
      expect(resultsGuest.groupFlightBookingValidationResults.invalidGroupFlightBookings[0].outboundGroupFlightId).toBe(
        'GF_OB_1'
      );
      expect(resultsGuest.groupFlightBookingValidationResults.invalidGroupFlightBookings[0].returnGroupFlightId).toBe(
        'GF_R_1'
      );
    });
    test('Both group flights invalid for primary invitee and guest', async () => {
      travelBookingGetter.getTravelBookingsForCurrentRegistrantAndGuests = jest.fn(() => [
        {
          id: 'primaryEventRegId',
          groupFlightBookings: [
            {
              id: 'BOOKING_ID_1',
              outboundGroupFlightId: 'GF_OB_1',
              returnGroupFlightId: 'GF_R_1'
            }
          ]
        },
        {
          id: 'guestEventRegId',
          groupFlightBookings: [
            {
              id: 'BOOKING_ID_2',
              outboundGroupFlightId: 'GF_OB_2',
              returnGroupFlightId: 'GF_R_2'
            }
          ]
        }
      ]);
      const updatedCurrentRegistration = {
        ...currentRegistration,
        ...currentRegistration.regCart,
        ...currentRegistration.regCart.eventRegistrations,
        guestEventRegId: {
          registrationTypeId: createRegistrationType('registrationTypeCId').id,
          registrationPathId: 'regPathId4',
          attendeeType: 'GUEST'
        }
      };
      mockSelectors(selectors, {
        admissionItem: createAdmissionItem()
      });
      mockIsWidgetReviewedResult = true;
      const state = {
        appData,
        registrationForm: { ...updatedCurrentRegistration },
        timezones: {},
        regCartStatus: { lastSavedRegCart: updatedCurrentRegistration.regCart },
        eventTravel,
        defaultUserSession
      };
      const results = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType('registrationTypeBId').id,
        'primaryEventRegId'
      );
      expect(results).toMatchSnapshot();
      expect(results.isValid).toBeFalsy();
      expect(results.groupFlightBookingValidationResults).not.toBeNull();
      expect(results.groupFlightBookingValidationResults.isValid).toBeFalsy();
      expect(results.groupFlightBookingValidationResults.invalidGroupFlightBookings.length).toBe(1);
      expect(results.groupFlightBookingValidationResults.invalidGroupFlightBookings[0].outboundGroupFlightId).toBe(
        'GF_OB_1'
      );
      expect(results.groupFlightBookingValidationResults.invalidGroupFlightBookings[0].returnGroupFlightId).toBe(
        'GF_R_1'
      );

      const resultsGuest = await validations.validateUserRegistrationTypeSelection(
        state,
        createRegistrationType('registrationTypeBId').id,
        'guestEventRegId'
      );
      expect(resultsGuest).toMatchSnapshot();
      expect(resultsGuest.isValid).toBeFalsy();
      expect(resultsGuest.groupFlightBookingValidationResults).not.toBeNull();
      expect(resultsGuest.groupFlightBookingValidationResults.isValid).toBeFalsy();
      expect(resultsGuest.groupFlightBookingValidationResults.invalidGroupFlightBookings.length).toBe(1);
      expect(resultsGuest.groupFlightBookingValidationResults.invalidGroupFlightBookings[0].outboundGroupFlightId).toBe(
        'GF_OB_2'
      );
      expect(resultsGuest.groupFlightBookingValidationResults.invalidGroupFlightBookings[0].returnGroupFlightId).toBe(
        'GF_R_2'
      );
    });
  });
});

// TODO: add couple tests here

function mockSelectors(unMockedSelectors, item) {
  return merge(unMockedSelectors, {
    currentRegistrant: {
      getSelectedAdmissionItemDefinition: jest.fn(() => item.admissionItem),
      getSelectedSessionDefinitions: jest.fn(() => values(item.sessions) || []),
      getAttendeeCustomFieldAnswer: jest.fn(() => item.selectedValues),
      modificationStart: {
        getRegisteredAdmissionItem: jest.fn(() => item.registeredAdmissionItem),
        getRegisteredSessions: jest.fn(() => item.registeredSessions || {}),
        getAttendeeCustomFieldAnswer: jest.fn(() => item.previouslySelectedValues),
        getRegisteredQuantityItems: jest.fn(() => item.registeredQuantityItems || {})
      },
      getModificationStartRegCart: jest.fn(() => item.modificationStartRegCart),
      isGuest: jest.fn((state, eventRegId) => {
        // @ts-expect-error ts-migrate(2367) FIXME: This condition will always return 'false' since th... Remove this comment to see the full error message
        return state && !eventRegId === 'primaryEventRegId';
      }),
      isGroupLeader: jest.fn(() => {
        return item.isGroupLeader;
      }),
      getSelectedQuantityItems: jest.fn(() => item.selectedQuantityItems || [])
    },
    currentRegistrationPath: {
      getRegistrationPathId: jest.fn(() => 'regPathId')
    },
    event: {
      getAdmissionItems: jest.fn(() => item.admissionItemDefinitions || {}),
      isGroupRegistrationEnabled: jest.fn(() => {
        return item.groupRegEnabled;
      }),
      getAdvancedQuantityItemRules: jest.fn(() => item.quantityItemAdvancedRules || {})
    },
    shared: {
      getRegCart: jest.fn(() => {})
    },
    productSelectors: {
      getSelectedSessionDefinitions: jest.fn(() => values(item.sessions) || []),
      getPrimaryAndGuestSortedVisibleSessions: jest.fn(() => values(item.sessions) || []),
      getSessionGroups: jest.fn(() => item.sessionGroups),
      getPrimarySortedVisibleQuantityItems: jest.fn(() => item.visibleQuantityItems || []),
      getPrimarySortedVisibleDonationItems: jest.fn(() => item.visibleDonationItems || []),
      getSelectedQuantityItemDefinitions: jest.fn(() => item.selectedQuantityItemDefinitions || []),
      getSelectedDonationItemDefinitions: jest.fn(() => item.selectedDonationItemDefinitions || [])
    }
  });
}

function mockRegCartSelectors(unMockedRegCartSelectors, item) {
  return merge(unMockedRegCartSelectors, {
    getRegistrationTypeId: jest.fn(() => item.selectedRegistrationTypeId),
    getSelectedAdmissionItem: jest.fn(() => item.selectedAdmissionItem),
    getSelectedSessions: jest.fn(() => {
      if (!item.selectedSession) {
        return {};
      }
      return {
        [item.selectedSession.productId]: item.selectedSession
      };
    }),
    getRegisteredSessionsSourceTypeNotWithSessionBundle: jest.fn(() => {
      if (!item.selectedSession || item.selectedSession.registrationSourceType === 'Track') {
        return {};
      }
      return {
        [item.selectedSession.productId]: item.selectedSession
      };
    }),
    getSessions: jest.fn(() => {
      if (!item.selectedSession) {
        return {};
      }
      return {
        [item.selectedSession.productId]: item.selectedSession
      };
    }),
    getQuantityItems: jest.fn(() => {
      if (!item.selectedQuantityItem) {
        return {};
      }
      return item.selectedQuantityItem;
    }),
    getDonationItems: jest.fn(() => {
      if (!item.selectedDonationItem) {
        return {};
      }
      return item.selectedDonationItem;
    }),
    getNumberOfGroupMembers: jest.fn(() => {
      return item.numberOfGroupMembers;
    }),
    getSelectedWaitlistedSessions: jest.fn(() => {
      if (!item.selectedSession) {
        return {};
      }
      return item.selectedSession;
    })
  });
}

function mockGuestSelectors(unmockedGuestsSelectors, item) {
  const guestRegIds = [];
  (item.guestRegistrants || []).forEach(g => guestRegIds.push(g.eventRegistrationId));
  return merge(unmockedGuestsSelectors, {
    getGuestsOfRegistrant: jest.fn(() => item.guestRegistrants || []),
    getGuestsRegistrationIdsOfRegistrant: jest.fn(() => guestRegIds)
  });
}

function mockTravelSelectors(unmockedTravelSelectors) {
  return merge(unmockedTravelSelectors, {
    getAirRequestSnapshot: jest.fn(() => airSnapshot.airSetup.airRequestSetup),
    getHotelRegRules: jest.fn(() => hotelSnapshot.hotelRequestRules)
  });
}

function mockReducers(unMockedReducer, item) {
  return merge(unMockedReducer, {
    getCurrentPageId: jest.fn(() => item.currentPageId)
  });
}
