import { ApolloClient, gql } from '@apollo/client';
import { createPageVarietyPathManualQuery } from '../../apollo/siteEditor/pageVarietyPathQueryHooks';
import { getUseGraphQLSiteEditorData, GraphQLSiteEditorDataReleases } from '../../ExperimentHelper';
import { RootState } from '../reducer';
import {
  sessionsAppearOnPageBeforeAdmissionItems as sessionsAppearOnPageBeforeAdmissionItemsRedux,
  sessionsAppearOnPageBeforeRegistrationType as sessionsAppearOnPageBeforeRegistrationTypeRedux,
  sessionsAppearOnSamePageAsPaymentOrRegSummary as sessionsAppearOnSamePageAsPaymentOrRegSummaryRedux,
  quantityItemsAppearOnPageBeforeAdmissionItems as quantityItemsAppearOnPageBeforeAdmissionItemsRedux,
  quantityItemsAppearOnPageBeforeRegistrationType as quantityItemsAppearOnPageBeforeRegistrationTypeRedux,
  quantityItemAppearOnPageBeforeEventIdentityConfirmation as quantityItemsAppearOnPageBeforeIdentityConfirmationRedux,
  quantityItemAppearOnSamePageAsPaymentOrRegSummary as quantityItemsAppearOnSamePageAsPaymentOrRegSummaryRedux,
  regTypeAppearOnPageBeforeEventIdentityConfirmation as regTypeAppearOnPageBeforeEventIdentityConfirmationRedux,
  isWidgetReviewed as isWidgetReviewedRedux,
  isWidgetPresentOnCurrentPage as isWidgetPresentOnCurrentPageRedux
} from './pageContents';

const SESSIONS_WIDGET_VALIDATION_FRAGMENT = gql`
  fragment SessionsWidgetValidation on PageVarietyPath {
    sessions {
      validation {
        reviewed
        onCurrentPage
        onPageBeforeAdmissionItems
        onPageBeforeRegistrationType
        onPageWithPaymentOrRegistrationSummary
      }
    }
  }
`;

const QUANTITY_ITEMS_WIDGET_VALIDATION_FRAGMENT = gql`
  fragment QuantityItemsWidgetValidation on PageVarietyPath {
    quantityItems {
      validation {
        reviewed
        onCurrentPage
        onPageBeforeAdmissionItems
        onPageBeforeRegistrationType
        onPageBeforeIdentityConfirmation
        onPageWithPaymentOrRegistrationSummary
      }
    }
  }
`;

const REGISTRATION_TYPE_WIDGET_VALIDATION_FRAGMENT = gql`
  fragment RegistrationTypeWidgetValidation on PageVarietyPath {
    registrationType {
      validation {
        reviewed
        onCurrentPage
        onPageBeforeIdentityConfirmation
      }
    }
  }
`;

const IDENTITY_CONFIRMATION_WIDGET_VALIDATION_FRAGMENT = gql`
  fragment IdentityConfirmationWidgetValidation on PageVarietyPath {
    identityConfirmation {
      validation {
        reviewed
        onCurrentPage
      }
    }
  }
`;

type WidgetInfo = {
  widgetType?: string;
  fieldId?: string;
};

/**
 * Uses an experiment to determine whether to use a Redux selector or GraphQL query to determine if a widget is present
 * on a previous page.
 *
 * Intended as a drop-in replacement for function of the same name in `./pageContents`.
 */
export const isWidgetReviewed = async (
  state: RootState,
  widgetInfo: WidgetInfo,
  apolloClient?: ApolloClient<unknown>
): Promise<boolean> => {
  const usingGraphQLWidgetDataForSessions = getUseGraphQLSiteEditorData(
    state,
    GraphQLSiteEditorDataReleases.SessionsWidgetValidation
  );
  const usingGraphQLWidgetDataForRegistrationType = getUseGraphQLSiteEditorData(
    state,
    GraphQLSiteEditorDataReleases.RegistrationTypeWidgetValidation
  );

  if (usingGraphQLWidgetDataForSessions && widgetInfo.widgetType === 'Sessions') {
    const fragment = SESSIONS_WIDGET_VALIDATION_FRAGMENT;
    const selector = result => result.data?.event?.registrationPath?.registration?.sessions?.validation?.reviewed;
    const query = await createPageVarietyPathManualQuery('registration', fragment, state, apolloClient);
    return !!selector(query);
  } else if (
    usingGraphQLWidgetDataForRegistrationType &&
    ['Sessions', 'RegistrationType'].includes(widgetInfo.widgetType)
  ) {
    let fragment;
    let selector;
    switch (widgetInfo.widgetType) {
      case 'Sessions':
        fragment = SESSIONS_WIDGET_VALIDATION_FRAGMENT;
        selector = result => result.data?.event?.registrationPath?.registration?.sessions?.validation?.reviewed;
        break;
      case 'RegistrationType':
        fragment = REGISTRATION_TYPE_WIDGET_VALIDATION_FRAGMENT;
        selector = result => result.data?.event?.registrationPath?.registration?.registrationType?.validation?.reviewed;
        break;
      default:
        return false;
    }
    const query = await createPageVarietyPathManualQuery('registration', fragment, state, apolloClient);
    return !!selector(query);
  }
  return Promise.resolve(isWidgetReviewedRedux(state, widgetInfo));
};

/**
 * Uses an experiment to determine whether to use a Redux selector or GraphQL query to determine if a widget is present
 * on a specified page.
 *
 * Intended as a drop-in replacement for function of the same name in `./pageContents`.
 */
export const isWidgetPresentOnCurrentPage = async (
  state: RootState,
  widgetType?: string,
  currentPageId?: string,
  apolloClient?: ApolloClient<unknown>
): Promise<boolean> => {
  const usingGraphQLWidgetDataForIdentityConfirmation = getUseGraphQLSiteEditorData(
    state,
    GraphQLSiteEditorDataReleases.IdentityConfirmationWidgetValidation
  );

  if (usingGraphQLWidgetDataForIdentityConfirmation && widgetType === 'EventIdentityConfirmation') {
    const fragment = IDENTITY_CONFIRMATION_WIDGET_VALIDATION_FRAGMENT;
    const selector = result =>
      result.data?.event?.registrationPath?.registration?.identityConfirmation?.validation?.onCurrentPage;
    const query = await createPageVarietyPathManualQuery('registration', fragment, state, apolloClient);
    return !!selector(query);
  }
  return Promise.resolve(isWidgetPresentOnCurrentPageRedux(state.website, widgetType, currentPageId));
};

/**
 * Uses an experiment to determine whether to use a Redux selector or GraphQL query to determine if the
 * Quantity Items widget appears on a page before the Admission Items widget.
 *
 * Intended as a drop-in replacement for function of the same name in `./pageContents`.
 */
export const quantityItemsAppearOnPageBeforeAdmissionItems = async (
  state: RootState,
  apolloClient: ApolloClient<unknown>
): Promise<boolean> => {
  const usingGraphQLWidgetData = getUseGraphQLSiteEditorData(state);
  if (usingGraphQLWidgetData) {
    const query = await createPageVarietyPathManualQuery(
      'registration',
      QUANTITY_ITEMS_WIDGET_VALIDATION_FRAGMENT,
      state,
      apolloClient
    );
    return !!query.data?.event?.registrationPath?.registration?.quantityItems?.validation?.onPageBeforeAdmissionItems;
  }
  return quantityItemsAppearOnPageBeforeAdmissionItemsRedux(state);
};

/**
 * Uses an experiment to determine whether to use a Redux selector or GraphQL query to determine if the
 * Quantity Items widget appears on a page before the Registration Type widget.
 *
 * Intended as a drop-in replacement for function of the same name in `./pageContents`.
 */
export const quantityItemsAppearOnPageBeforeRegistrationType = async (
  state: RootState,
  apolloClient: ApolloClient<unknown>
): Promise<boolean> => {
  const usingGraphQLWidgetData = getUseGraphQLSiteEditorData(state);
  if (usingGraphQLWidgetData) {
    const query = await createPageVarietyPathManualQuery(
      'registration',
      QUANTITY_ITEMS_WIDGET_VALIDATION_FRAGMENT,
      state,
      apolloClient
    );
    return !!query.data?.event?.registrationPath?.registration?.quantityItems?.validation?.onPageBeforeRegistrationType;
  }
  return quantityItemsAppearOnPageBeforeRegistrationTypeRedux(state);
};

/**
 * Uses an experiment to determine whether to use a Redux selector or GraphQL query to determine if the
 * Quantity Items widget appears on a page before the Event Identity Confirmation widget.
 *
 * Intended as a drop-in replacement for function of the same name in `./pageContents`.
 */
export const quantityItemAppearOnPageBeforeEventIdentityConfirmation = async (
  state: RootState,
  apolloClient: ApolloClient<unknown>
): Promise<boolean> => {
  const usingGraphQLWidgetData = getUseGraphQLSiteEditorData(state);
  if (usingGraphQLWidgetData) {
    const query = await createPageVarietyPathManualQuery(
      'registration',
      QUANTITY_ITEMS_WIDGET_VALIDATION_FRAGMENT,
      state,
      apolloClient
    );
    return !!query.data?.event?.registrationPath?.registration?.quantityItems?.validation
      ?.onPageBeforeIdentityConfirmation;
  }
  return quantityItemsAppearOnPageBeforeIdentityConfirmationRedux(state);
};

/**
 * Uses an experiment to determine whether to use a Redux selector or GraphQL query to determine if the
 * Quantity Items widget appears on the same page as the Payment or Registration Summary widgets.
 *
 * Intended as a drop-in replacement for function of the same name in `./pageContents`.
 */
export const quantityItemAppearOnSamePageAsPaymentOrRegSummary = async (
  state: RootState,
  apolloClient: ApolloClient<unknown>
): Promise<boolean> => {
  const usingGraphQLWidgetData = getUseGraphQLSiteEditorData(state);
  if (usingGraphQLWidgetData) {
    const query = await createPageVarietyPathManualQuery(
      'registration',
      QUANTITY_ITEMS_WIDGET_VALIDATION_FRAGMENT,
      state,
      apolloClient
    );
    return !!query.data?.event?.registrationPath?.registration?.quantityItems?.validation
      ?.onPageWithPaymentOrRegistrationSummary;
  }
  return quantityItemsAppearOnSamePageAsPaymentOrRegSummaryRedux(state);
};

/**
 * Uses an experiment to determine whether to use a Redux selector or GraphQL query to determine if the
 * Registration Type widget appears on a page before the Event Identity Confirmation widget.
 *
 * Intended as a drop-in replacement for function of the same name in `./pageContents`.
 */
export const regTypeAppearOnPageBeforeEventIdentityConfirmation = async (
  state: RootState,
  apolloClient: ApolloClient<unknown>
): Promise<boolean> => {
  const usingGraphQLWidgetData = getUseGraphQLSiteEditorData(state);
  if (usingGraphQLWidgetData) {
    const query = await createPageVarietyPathManualQuery(
      'registration',
      REGISTRATION_TYPE_WIDGET_VALIDATION_FRAGMENT,
      state,
      apolloClient
    );
    return !!query.data?.event?.registrationPath?.registration?.registrationType?.validation
      ?.onPageBeforeIdentityConfirmation;
  }
  return regTypeAppearOnPageBeforeEventIdentityConfirmationRedux(state);
};

/**
 * Uses an experiment to determine whether to use a Redux selector or GraphQL query to determine if the Sessions widget
 * appears on a page before the Admission Items widget.
 *
 * Intended as a drop-in replacement for function of the same name in `./pageContents`.
 */
export const sessionsAppearOnPageBeforeAdmissionItems = async (
  state: RootState,
  apolloClient: ApolloClient<unknown>
): Promise<boolean> => {
  const usingGraphQLWidgetData = getUseGraphQLSiteEditorData(
    state,
    GraphQLSiteEditorDataReleases.SessionsWidgetValidation
  );
  if (usingGraphQLWidgetData) {
    const query = await createPageVarietyPathManualQuery(
      'registration',
      SESSIONS_WIDGET_VALIDATION_FRAGMENT,
      state,
      apolloClient
    );
    return !!query.data?.event?.registrationPath?.registration?.sessions?.validation?.onPageBeforeAdmissionItems;
  }
  return sessionsAppearOnPageBeforeAdmissionItemsRedux(state);
};

/**
 * Uses an experiment to determine whether to use a Redux selector or GraphQL query to determine if the Sessions widget
 * appears on a page before the Registration Type widget.
 *
 * Intended as a drop-in replacement for function of the same name in `./pageContents`.
 */
export const sessionsAppearOnPageBeforeRegistrationType = async (
  state: RootState,
  apolloClient: ApolloClient<unknown>
): Promise<boolean> => {
  const usingGraphQLWidgetData = getUseGraphQLSiteEditorData(
    state,
    GraphQLSiteEditorDataReleases.SessionsWidgetValidation
  );
  if (usingGraphQLWidgetData) {
    const query = await createPageVarietyPathManualQuery(
      'registration',
      SESSIONS_WIDGET_VALIDATION_FRAGMENT,
      state,
      apolloClient
    );
    return !!query.data?.event?.registrationPath?.registration?.sessions?.validation?.onPageBeforeRegistrationType;
  }
  return sessionsAppearOnPageBeforeRegistrationTypeRedux(state);
};

/**
 * Uses an experiment to determine whether to use a Redux selector or GraphQL query to determine if the Sessions widget
 * appears on the same page as the Payment or Registration Summary widgets.
 *
 * Intended as a drop-in replacement for function of the same name in `./pageContents`.
 */
export const sessionsAppearOnSamePageAsPaymentOrRegSummary = async (
  state: RootState,
  apolloClient: ApolloClient<unknown>
): Promise<boolean> => {
  const usingGraphQLWidgetData = getUseGraphQLSiteEditorData(
    state,
    GraphQLSiteEditorDataReleases.SessionsWidgetValidation
  );
  if (usingGraphQLWidgetData) {
    const query = await createPageVarietyPathManualQuery(
      'registration',
      SESSIONS_WIDGET_VALIDATION_FRAGMENT,
      state,
      apolloClient
    );
    return !!query.data?.event?.registrationPath?.registration?.sessions?.validation
      ?.onPageWithPaymentOrRegistrationSummary;
  }
  return sessionsAppearOnSamePageAsPaymentOrRegSummaryRedux(state);
};
