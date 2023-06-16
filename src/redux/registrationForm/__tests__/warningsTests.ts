import { ApolloClient } from '@apollo/client';
import {
  getAttendeeQuestionIdsWithWarning,
  hasGuestQuestionRuleValidationWarning,
  hasAttendeeQuestionRuleValidationWarning,
  hasQuantityItemCapacityWarning,
  hasQuantityItemAdvancedRuleValidation
} from '../warnings';
import state from './fixtures/attendeeQuestionValidationState.json';

let mockUseGraphQLSiteEditorData = true;
jest.mock('../../../ExperimentHelper', () => ({
  ...jest.requireActual<$TSFixMe>('../../../ExperimentHelper'),
  getUseGraphQLSiteEditorData: () => mockUseGraphQLSiteEditorData
}));

let mockQuantityItemsAppearOnPageBeforeIdentityConfirm = true;
let mockIdentityConfirmationOnCurrentPage = true;
jest.mock('../../website/pageContents', () => ({
  ...jest.requireActual<$TSFixMe>('../../website/pageContents'),
  quantityItemAppearOnPageBeforeEventIdentityConfirmation: () => mockQuantityItemsAppearOnPageBeforeIdentityConfirm
}));
jest.mock('../../../apollo/siteEditor/pageVarietyPathQueryHooks', () => ({
  createPageVarietyPathManualQuery: () => ({
    data: {
      event: {
        registrationPath: {
          registration: {
            quantityItems: {
              validation: {
                onPageBeforeIdentityConfirmation: mockQuantityItemsAppearOnPageBeforeIdentityConfirm
              }
            },
            identityConfirmation: {
              validation: {
                onCurrentPage: mockIdentityConfirmationOnCurrentPage
              }
            }
          }
        }
      }
    }
  })
}));

describe.each([
  ['GraphQL', true],
  ['Redux', false]
])('Warnings using %s site editor data', (description, experimentStatus) => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseGraphQLSiteEditorData = experimentStatus;
  });
  describe('getAttendeeQuestionIdsWithWarning', () => {
    test('identifies missing question answers for registrant', () => {
      let warnings = getAttendeeQuestionIdsWithWarning(state, 'primaryReg');
      expect(warnings.length).toEqual(2);
      warnings = getAttendeeQuestionIdsWithWarning(state, 'guestReg');
      expect(warnings.length).toEqual(1);
      warnings = getAttendeeQuestionIdsWithWarning(state);
      expect(warnings.length).toEqual(0);
    });
  });

  describe('hasAttendeeQuestionRuleValidationWarning', () => {
    test('identifies missing question answers for registrant that are on the current page', async () => {
      const apolloClient = {} as ApolloClient<unknown>;
      let hasWarnings = await hasAttendeeQuestionRuleValidationWarning(state as $TSFixMe, apolloClient);
      expect(hasWarnings).toBeTruthy();

      // change state to have id confirm on another page
      const stateWithIdConfirmOnOtherPage = JSON.parse(JSON.stringify(state));
      stateWithIdConfirmOnOtherPage.website.layoutItems.widget1.layout.parentId = 'page2Container';
      mockIdentityConfirmationOnCurrentPage = false;
      hasWarnings = await hasAttendeeQuestionRuleValidationWarning(stateWithIdConfirmOnOtherPage, apolloClient);
      expect(hasWarnings).toBeFalsy();
    });
  });

  describe('hasGuestQuestionRuleValidationWarning', () => {
    test('identifies missing question answers for guest that are on the current page', () => {
      const hasWarnings = hasGuestQuestionRuleValidationWarning(state, 'guestReg');
      expect(hasWarnings).toBeTruthy();
    });
  });

  describe('hasQuantityItemCapacityWarning', () => {
    test('verifies if capacity unavailable message is present for quantity items', () => {
      let hasWarnings = hasQuantityItemCapacityWarning(state);
      expect(hasWarnings).toBeTruthy();

      const stateWithNoMessage = JSON.parse(JSON.stringify(state));
      stateWithNoMessage.registrationForm.validationMessages = [];
      hasWarnings = hasQuantityItemCapacityWarning(stateWithNoMessage);
      expect(hasWarnings).toBeFalsy();
    });
  });

  describe('hasQuantityItemAdvancedRuleValidation', () => {
    test('has advanced rule validation message and quantity items before identity confirm', async () => {
      mockQuantityItemsAppearOnPageBeforeIdentityConfirm = true;
      const hasWarnings = await hasQuantityItemAdvancedRuleValidation(state, {});
      expect(hasWarnings).toBeTruthy();
    });
    test('no advanced rule validation message', async () => {
      mockQuantityItemsAppearOnPageBeforeIdentityConfirm = true;
      const stateWithNoMessage = JSON.parse(JSON.stringify(state));
      stateWithNoMessage.registrationForm.validationMessages = [];
      const hasWarnings = await hasQuantityItemAdvancedRuleValidation(stateWithNoMessage, {});
      expect(hasWarnings).toBeFalsy();
    });
    test('quantity items not before identity confirm', async () => {
      mockQuantityItemsAppearOnPageBeforeIdentityConfirm = false;
      const hasWarnings = await hasQuantityItemAdvancedRuleValidation(state, {});
      expect(hasWarnings).toBeFalsy();
    });
  });
});
