import { getIn } from 'icepick';
import { some } from 'lodash';
import { getRegistrationPathIdOrDefault } from '../selectors/currentRegistrationPath';
import { getRegistrationPathIdForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { getPagePath, getCurrentPageId } from '../pathInfo';
import * as fieldPageTypes from 'event-widgets/utils/registrationFieldPageType';
import { createSelector } from 'reselect';
import { RootState } from '../reducer';

const EMPTY_ARRAY = Object.freeze([]);

const pageIds = createSelector(
  state => (state as RootState).website?.pluginData?.registrationProcessNavigation?.registrationPaths,
  (_state, registrationPathId, _pageKey) => registrationPathId,
  (_state, _registrationPathId, pageKey) => pageKey,
  (registrationPaths, registrationPathId, pageKey) => {
    return (registrationPathId && getIn(registrationPaths, [registrationPathId, pageKey])) || EMPTY_ARRAY;
  }
);

class RegistrationProcessPath {
  process: $TSFixMe;
  registrationPathSelector: $TSFixMe;
  constructor(process, registrationPathSelector) {
    this.process = process;
    this.registrationPathSelector = registrationPathSelector;
  }
  pageIds(state) {
    const registrationPathId = this.registrationPathSelector(state);
    return pageIds(state, registrationPathId, this.process.pageKey);
  }
  startPageId(state) {
    const ids = this.pageIds(state);
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    return ids && ids[0];
  }
  startPagePath(state) {
    const id = this.startPageId(state);
    return id && getPagePath(state, id);
  }
}

class RegistrationProcess {
  name: $TSFixMe;
  pageKey: $TSFixMe;
  registrationFieldPageType: $TSFixMe;
  constructor(name, pageKey, registrationFieldPageType) {
    this.name = name;
    this.pageKey = pageKey;
    this.registrationFieldPageType = registrationFieldPageType;
  }
  forRegistrationPath(registrationPathId) {
    return new RegistrationProcessPath(this, () => registrationPathId);
  }
  forPathContainingWidget(widgetId) {
    return new RegistrationProcessPath(this, state => getRegistrationPathIdForWidget(state, widgetId));
  }
  forCurrentRegistrant() {
    return new RegistrationProcessPath(this, getRegistrationPathIdOrDefault);
  }
  isTypeOfPage(state, pageId) {
    const regPathIds = Object.keys(state.appData.registrationSettings.registrationPaths);
    return some(regPathIds, regPathId => {
      const ids = pageIds(state, regPathId, this.pageKey);
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      return ids && ids.includes(pageId);
    });
  }
  isTypeOfCurrentPage(state) {
    return this.isTypeOfPage(state, getCurrentPageId(state));
  }
}

export const REGISTRATION = new RegistrationProcess('REGISTRATION', 'pageIds', fieldPageTypes.Registration);
export const POST_REGISTRATION = new RegistrationProcess('POST_REGISTRATION', 'postRegPageIds', null);
export const DECLINE = new RegistrationProcess(
  'DECLINE',
  'registrationDeclinePageIds',
  fieldPageTypes.DeclineRegistration
);
export const POST_REGISTRATION_PAYMENT = new RegistrationProcess(
  'POST_REGISTRATION_PAYMENT',
  'postRegistrationPaymentPageIds',
  fieldPageTypes.PostRegistrationPayment
);
export const CANCELLATION = new RegistrationProcess(
  'CANCELLATION',
  'registrationCancellationPageIds',
  fieldPageTypes.CancelRegistration
);
export const WAITLIST = new RegistrationProcess('WAITLIST', 'eventWaitlistPageIds', fieldPageTypes.EventWaitlist);
export const PENDING_APPROVAL = new RegistrationProcess(
  'PENDING_APPROVAL',
  'registrationPendingApprovalPageIds',
  fieldPageTypes.RegistrationPendingApproval
);
export const APPROVAL_DENIED = new RegistrationProcess(
  'APPROVAL_DENIED',
  'registrationApprovalDeniedPageIds',
  fieldPageTypes.RegistrationApprovalDenied
);
export const GUEST_REGISTRATION = new RegistrationProcess(
  'GUEST_REGISTRATION',
  'guestRegistrationPageIds',
  fieldPageTypes.GuestRegistration
);

const allTypes = [
  REGISTRATION,
  POST_REGISTRATION,
  DECLINE,
  CANCELLATION,
  WAITLIST,
  PENDING_APPROVAL,
  APPROVAL_DENIED,
  GUEST_REGISTRATION,
  POST_REGISTRATION_PAYMENT
];

export function typeOfPage(state: $TSFixMe, pageId: $TSFixMe): $TSFixMe {
  return allTypes.find(type => type.isTypeOfPage(state, pageId));
}

export function isRegistrationPage(state: $TSFixMe, pageId: $TSFixMe): $TSFixMe {
  return REGISTRATION.isTypeOfPage(state, pageId) || GUEST_REGISTRATION.isTypeOfPage(state, pageId);
}

export function isPostRegistrationPage(state: $TSFixMe, pageId: $TSFixMe): $TSFixMe {
  return (
    POST_REGISTRATION.isTypeOfPage(state, pageId) ||
    PENDING_APPROVAL.isTypeOfPage(state, pageId) ||
    APPROVAL_DENIED.isTypeOfPage(state, pageId) ||
    POST_REGISTRATION_PAYMENT.isTypeOfPage(state, pageId)
  );
}

export function parseRegistrationProcessType(name: $TSFixMe): $TSFixMe {
  return allTypes.find(type => type.name === name);
}

export function getGuestDetailsPage(state: $TSFixMe, regPathId: $TSFixMe): $TSFixMe {
  const guestRegistrationPageId = GUEST_REGISTRATION.forRegistrationPath(regPathId).startPageId(state);
  return state.website.pages[guestRegistrationPageId];
}
