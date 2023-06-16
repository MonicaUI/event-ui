import { getIn } from 'icepick';

const initialState = {
  defaultRegPackId: '',
  eventBuildWizardExitUrl: '',
  eventId: '',
  freeTrialPurchaseCta: '',
  httpReferrer: '',
  isFreeTrial: false,
  isPlanner: false,
  isPreview: false,
  isTestMode: false,
  licenseTypeId: 1,
  showEventBuildWizardBanner: false
};

export const getRegistrationPackId = (state: $TSFixMe): $TSFixMe => {
  return getIn(state, ['defaultUserSession', 'defaultRegPackId']);
};

export function getUserType({ isPlanner, isPreview }: $TSFixMe = {}): $TSFixMe {
  if (isPlanner) {
    return 'planner';
  } else if (isPreview) {
    return 'preview';
  }
  return 'standard';
}

export function isPlannerRegistration(state: $TSFixMe): $TSFixMe {
  return !!state.defaultUserSession.isPlanner;
}

/**
 * The primary purpose of the defaultUserSession reducer is to hold user session properties
 * that are long-living and don't change throughout the life of the store, unlike
 * userSession where properties do change and are cleared upon logout.
 */
export default function reducer(state = initialState, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    default:
      return state;
  }
}
