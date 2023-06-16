import {
  FEATURE_RELEASE_DEVELOPMENT_VARIANT,
  AIR_OPT_OUT_RELEASE_VARIANT,
  AIR_OPT_OUT_FEATURE_RELEASE_DATE,
  GUEST_MINIMUM_RELEASE_VARIANT
} from '@cvent/event-ui-experiments';
import { useSelector } from 'react-redux';
import { RootState } from './redux/reducer';

export const shouldUseAirOptOutFeature = (state: RootState): boolean =>
  state?.experiments?.featureRelease >= AIR_OPT_OUT_RELEASE_VARIANT &&
  new Date(state?.event?.createdDate) > AIR_OPT_OUT_FEATURE_RELEASE_DATE;

export const shouldUseHotelOptOutFeature = (state: RootState): boolean =>
  state?.experiments?.featureRelease >= FEATURE_RELEASE_DEVELOPMENT_VARIANT;

export const isGraphQLForEventCapacitiesVariantON = (state: RootState): boolean =>
  state.experiments?.graphQLForEventCapacitiesVariant >= 1;

export const isGuestMinimumEnabled = (state: RootState): boolean =>
  state?.experiments?.featureRelease >= GUEST_MINIMUM_RELEASE_VARIANT;

export const isFlexBearerAuthRemovalOn = (state: RootState): boolean => state?.experiments?.flexBearerAuthRemoval;

export const isHidingAdmissionItemsVariantON = (state: RootState): boolean =>
  state.experiments?.hidingAdmissionItems >= 1;

// Add new releases at the end, directly before Development
export enum GraphQLSiteEditorDataReleases {
  Off,
  RelatedContactsDialog,
  GuestProductSelectionDialog,
  TravelQuestionUtils,
  RegistrationCancellationConcur,
  SessionsWidgetValidation,
  QuantityItemsWidgetValidation,
  RegistrationTypeWidgetValidation,
  CustomContactFieldDateTimeWidget,
  IdentityConfirmationWidgetValidation,
  SiteEditorPageData,
  ExcludeSiteEditorDataFromAPICall,
  Development = 1000000
}
/** Checks if the specified release variant for the useGraphQLSiteEditorData experiment
 * is live in the current environment. Uses the useSelector React hook.
 */
export const useGraphQLSiteEditorData = (
  release: GraphQLSiteEditorDataReleases = GraphQLSiteEditorDataReleases.Development
): boolean => {
  return useSelector((state: RootState) => state.experiments?.useGraphQLSiteEditorData >= release);
};
/** Checks if skipping pages should be applied (based on feature_release experiment)
 * is live in the current environment. Uses the useSelector React hook.
 */
export const useGraphQLForSkippingPages = (): boolean => {
  return useSelector((state: RootState) => state.experiments?.skipEmptyRegistrationPages >= 1);
};
/** Checks if the specified release variant for the useGraphQLSiteEditorData experiment
 * is live in the current environment. Checks the state object directly.
 */
export const getUseGraphQLSiteEditorData = (
  state: RootState,
  release: GraphQLSiteEditorDataReleases = GraphQLSiteEditorDataReleases.Development
): boolean => {
  return state.experiments?.useGraphQLSiteEditorData >= release;
};

/**
 * Experiment to control if we should show the name based on locale on UI.
 */
export const isNameFormatUpdateEnabled = (state: RootState): boolean => {
  return state.experiments?.flexNameFormatUpdateEnabled;
};

export const isOrderSummaryHiddenEnabled = (state: RootState): boolean =>
  state?.experiments?.featureRelease >= FEATURE_RELEASE_DEVELOPMENT_VARIANT;
