import { ApolloClient } from '@apollo/client';
import {
  isWidgetReviewed,
  sessionsAppearOnPageBeforeAdmissionItems,
  sessionsAppearOnPageBeforeRegistrationType,
  sessionsAppearOnSamePageAsPaymentOrRegSummary,
  quantityItemsAppearOnPageBeforeAdmissionItems,
  quantityItemsAppearOnPageBeforeRegistrationType,
  quantityItemAppearOnPageBeforeEventIdentityConfirmation,
  quantityItemAppearOnSamePageAsPaymentOrRegSummary
} from '../pageContentsWithGraphQL';
import { createPageVarietyPathManualQuery } from '../../../apollo/siteEditor/pageVarietyPathQueryHooks';
import {
  sessionsAppearOnPageBeforeAdmissionItems as sessionsAppearOnPageBeforeAdmissionItemsRedux,
  sessionsAppearOnPageBeforeRegistrationType as sessionsAppearOnPageBeforeRegistrationTypeRedux,
  sessionsAppearOnSamePageAsPaymentOrRegSummary as sessionsAppearOnSamePageAsPaymentOrRegSummaryRedux,
  quantityItemsAppearOnPageBeforeAdmissionItems as quantityItemsAppearOnPageBeforeAdmissionItemsRedux,
  quantityItemsAppearOnPageBeforeRegistrationType as quantityItemsAppearOnPageBeforeRegistrationTypeRedux,
  quantityItemAppearOnPageBeforeEventIdentityConfirmation as quantityItemAppearOnPageBeforeIdentityConfirmationRedux,
  quantityItemAppearOnSamePageAsPaymentOrRegSummary as quantityItemAppearOnSamePageAsPaymentOrRegSummaryRedux,
  isWidgetReviewed as isWidgetReviewedRedux
} from '../pageContents';
import { GraphQLSiteEditorDataReleases } from '../../../ExperimentHelper';

jest.mock('../pageContents');
// @ts-expect-error ts-migrate(2352) FIXME: Conversion of type 'OutputSelector<any, boolean, (... Remove this comment to see the full error message
(sessionsAppearOnPageBeforeAdmissionItemsRedux as jest.Mock<unknown>).mockReturnValue(true);
// @ts-expect-error ts-migrate(2352) FIXME: Conversion of type 'OutputSelector<any, boolean, (... Remove this comment to see the full error message
(sessionsAppearOnPageBeforeRegistrationTypeRedux as jest.Mock<unknown>).mockReturnValue(true);
// @ts-expect-error ts-migrate(2352) FIXME: Conversion of type 'OutputSelector<any, boolean, (... Remove this comment to see the full error message
(sessionsAppearOnSamePageAsPaymentOrRegSummaryRedux as jest.Mock<unknown>).mockReturnValue(true);
// @ts-expect-error ts-migrate(2352) FIXME: Conversion of type 'OutputSelector<any, boolean, (... Remove this comment to see the full error message
(quantityItemsAppearOnPageBeforeAdmissionItemsRedux as jest.Mock<unknown>).mockReturnValue(true);
// @ts-expect-error ts-migrate(2352) FIXME: Conversion of type 'OutputSelector<any, boolean, (... Remove this comment to see the full error message
(quantityItemsAppearOnPageBeforeRegistrationTypeRedux as jest.Mock<unknown>).mockReturnValue(true);
// @ts-expect-error ts-migrate(2352) FIXME: Conversion of type 'OutputSelector<any, boolean, (... Remove this comment to see the full error message
(quantityItemAppearOnPageBeforeIdentityConfirmationRedux as jest.Mock<unknown>).mockReturnValue(true);
// @ts-expect-error ts-migrate(2352) FIXME: Conversion of type 'OutputSelector<any, boolean, (... Remove this comment to see the full error message
(quantityItemAppearOnSamePageAsPaymentOrRegSummaryRedux as jest.Mock<unknown>).mockReturnValue(true);
(isWidgetReviewedRedux as jest.Mock<unknown>).mockReturnValue(true);

jest.mock('../../../apollo/siteEditor/pageVarietyPathQueryHooks');
(createPageVarietyPathManualQuery as jest.Mock<unknown>).mockReturnValue({
  data: {
    event: {
      registrationPath: {
        registration: {
          sessions: {
            validation: {
              reviewed: true,
              onCurrentPage: true,
              onPageBeforeAdmissionItems: true,
              onPageBeforeRegistrationType: true,
              onPageWithPaymentOrRegistrationSummary: true
            }
          }
        },
        quantityItems: {
          validation: {
            reviewed: true,
            onCurrentPage: true,
            onPageBeforeAdmissionItems: true,
            onPageBeforeRegistrationType: true,
            onPageBeforeIdentityConfirmation: true,
            onPageWithPaymentOrRegistrationSummary: true
          }
        }
      }
    }
  }
});

const runTests = useGraphQLSiteEditorData => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  const state = {
    experiments: {
      useGraphQLSiteEditorData
    }
  };
  const usingGraphQLData = useGraphQLSiteEditorData > GraphQLSiteEditorDataReleases.Off;
  const apolloClient = {} as ApolloClient<unknown>;
  test('isWidgetReviewed', () => {
    const widgetInfo = { widgetType: 'Sessions' };
    const validationResult = isWidgetReviewed(state as $TSFixMe, widgetInfo, apolloClient);
    expect(validationResult).toBeTruthy();
    expect(isWidgetReviewedRedux).toBeCalledTimes(usingGraphQLData ? 0 : 1);
    expect(createPageVarietyPathManualQuery).toBeCalledTimes(usingGraphQLData ? 1 : 0);
  });

  test('quantityItemsAppearOnPageBeforeAdmissionItems', () => {
    const validationResult = quantityItemsAppearOnPageBeforeAdmissionItems(state as $TSFixMe, apolloClient);
    expect(validationResult).toBeTruthy();
    expect(quantityItemsAppearOnPageBeforeAdmissionItemsRedux).toBeCalledTimes(useGraphQLSiteEditorData ? 0 : 1);
    expect(createPageVarietyPathManualQuery).toBeCalledTimes(useGraphQLSiteEditorData ? 1 : 0);
  });

  test('quantityItemsAppearOnPageBeforeRegistrationType', () => {
    const validationResult = quantityItemsAppearOnPageBeforeRegistrationType(state as $TSFixMe, apolloClient);
    expect(validationResult).toBeTruthy();
    expect(quantityItemsAppearOnPageBeforeRegistrationTypeRedux).toBeCalledTimes(useGraphQLSiteEditorData ? 0 : 1);
    expect(createPageVarietyPathManualQuery).toBeCalledTimes(useGraphQLSiteEditorData ? 1 : 0);
  });

  test('quantityItemsAppearOnPageBeforeIdentityConfirmation', () => {
    const validationResult = quantityItemAppearOnPageBeforeEventIdentityConfirmation(state as $TSFixMe, apolloClient);
    expect(validationResult).toBeTruthy();
    expect(quantityItemAppearOnPageBeforeIdentityConfirmationRedux).toBeCalledTimes(useGraphQLSiteEditorData ? 0 : 1);
    expect(createPageVarietyPathManualQuery).toBeCalledTimes(useGraphQLSiteEditorData ? 1 : 0);
  });

  test('quantityItemsAppearOnSamePageAsPaymentOrRegSummary', () => {
    const validationResult = quantityItemAppearOnSamePageAsPaymentOrRegSummary(state as $TSFixMe, apolloClient);
    expect(validationResult).toBeTruthy();
    expect(quantityItemAppearOnSamePageAsPaymentOrRegSummaryRedux).toBeCalledTimes(useGraphQLSiteEditorData ? 0 : 1);
    expect(createPageVarietyPathManualQuery).toBeCalledTimes(useGraphQLSiteEditorData ? 1 : 0);
  });

  test('sessionsAppearOnPageBeforeAdmissionItems', () => {
    const validationResult = sessionsAppearOnPageBeforeAdmissionItems(state as $TSFixMe, apolloClient);
    expect(validationResult).toBeTruthy();
    expect(sessionsAppearOnPageBeforeAdmissionItemsRedux).toBeCalledTimes(usingGraphQLData ? 0 : 1);
    expect(createPageVarietyPathManualQuery).toBeCalledTimes(usingGraphQLData ? 1 : 0);
  });

  test('sessionsAppearOnPageBeforeRegistrationType', () => {
    const validationResult = sessionsAppearOnPageBeforeRegistrationType(state as $TSFixMe, apolloClient);
    expect(validationResult).toBeTruthy();
    expect(sessionsAppearOnPageBeforeRegistrationTypeRedux).toBeCalledTimes(usingGraphQLData ? 0 : 1);
    expect(createPageVarietyPathManualQuery).toBeCalledTimes(usingGraphQLData ? 1 : 0);
  });

  test('sessionsAppearOnSamePageAsPaymentOrRegSummary', () => {
    const validationResult = sessionsAppearOnSamePageAsPaymentOrRegSummary(state as $TSFixMe, apolloClient);
    expect(validationResult).toBeTruthy();
    expect(sessionsAppearOnSamePageAsPaymentOrRegSummaryRedux).toBeCalledTimes(usingGraphQLData ? 0 : 1);
    expect(createPageVarietyPathManualQuery).toBeCalledTimes(usingGraphQLData ? 1 : 0);
  });
};

describe('pageContentWithGraphQL', () => {
  describe('Using GraphQL data', () => {
    runTests(GraphQLSiteEditorDataReleases.Development);
  });
  describe('Using Redux data', () => {
    runTests(GraphQLSiteEditorDataReleases.Off);
  });
});
