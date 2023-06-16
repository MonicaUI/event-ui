import { getIn, assoc, dissoc } from 'icepick';
import { pickBy, isEmpty } from 'lodash';
import Logger from '@cvent/nucleus-logging';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import { getDefaultAdmissionItemIdSelectionForRegType } from '../../selectors/event';
import { getPrimaryRegistrationId, getEventRegistration, isPlaceholderRegCart } from './selectors';
import querystring from 'querystring';
import { getQueryParam } from '../../../utils/queryUtils';
import { getPrimaryAndGuestSortedVisibleSessions } from '../../selectors/productSelectors';
import { getRegCart } from '../../selectors/shared';
import { SnapshotVersions } from '../../../clients/RegCartClient';

const LOG = new Logger('redux/registrationForm/regCart/internal');
export const firstEventRegId = '00000000-0000-0000-0000-000000000001';

/**
 * Updates the product registrations for the newly selected admission item. If any sessions were
 * associated to a prior admission item they will be removed. If no admission item is provided it
 * will remove the current admission item if one is present.
 */
export function updateAdmissionItemRegistration(
  lastSavedRegCart: $TSFixMe,
  eventRegistrationId: $TSFixMe,
  admissionItemId?: $TSFixMe,
  requestedAction = 'REGISTER'
): $TSFixMe {
  const currentEventReg = getIn(lastSavedRegCart, ['eventRegistrations', eventRegistrationId]);
  const otherProducts = currentEventReg.productRegistrations.filter(
    productReg => productReg.productType !== 'AdmissionItem'
  );

  const selectedOptionalSessions = pickBy(currentEventReg.sessionRegistrations, session => {
    const sessionAssociatedToAdmissionItem = session.registrationSourceType === 'AdmissionItem';
    return !sessionAssociatedToAdmissionItem;
  });
  if (admissionItemId) {
    const admissionItemReg = {
      productId: admissionItemId,
      productType: 'AdmissionItem',
      quantity: 1,
      requestedAction
    };
    if (requestedAction === 'UNREGISTER') {
      const otherAdmissionItems = currentEventReg.productRegistrations.filter(
        productReg => productReg.productId !== admissionItemId
      );
      return {
        productRegistrations: [...otherProducts, ...otherAdmissionItems, admissionItemReg],
        sessionRegistrations: selectedOptionalSessions
      };
    }
    return {
      productRegistrations: [...otherProducts, admissionItemReg],
      sessionRegistrations: selectedOptionalSessions
    };
  }
  return {
    productRegistrations: [...otherProducts],
    sessionRegistrations: selectedOptionalSessions
  };
}

export function updateSessionRegistration(
  sessionRegistrations: $TSFixMe,
  sessionId: $TSFixMe,
  action: $TSFixMe
): $TSFixMe {
  const sessionItem = {
    productId: sessionId,
    requestedAction: action,
    registrationSourceType: 'Selected'
  };
  const updatedSessionRegistrations = pickBy(sessionRegistrations, (value, key) => key !== sessionId);
  updatedSessionRegistrations[sessionId] = sessionItem;
  return { sessionRegistrations: updatedSessionRegistrations };
}

export function canSessionBeWailisted(sessionWaitlists: $TSFixMe, sessionId: $TSFixMe, state: $TSFixMe): $TSFixMe {
  const session = fetchSessionBasedOnId(sessionId, state);
  const { waitlistStatus } = sessionWaitlists[sessionId] || {};
  const isAttendeeEnableToRegisterForSession = waitlistStatus === 'PENDING';
  return session.isWaitlistEnabled || isAttendeeEnableToRegisterForSession;
}

export function updateSessionWaitlist(
  sessionWaitlists: $TSFixMe,
  sessionId: $TSFixMe,
  action: $TSFixMe,
  state = null
): $TSFixMe {
  if (state && !canSessionBeWailisted(sessionWaitlists, sessionId, state)) {
    return { sessionWaitlists };
  }
  const sessionItem = {
    productId: sessionId,
    requestedAction: action
  };
  const updatedSessionWaitlists = pickBy(sessionWaitlists, (value, key) => key !== sessionId);
  updatedSessionWaitlists[sessionId] = sessionItem;
  return { sessionWaitlists: updatedSessionWaitlists };
}

// Grab the session from list of all sessions and session groups
export function fetchSessionBasedOnId(sessionId: $TSFixMe, state = {}): $TSFixMe {
  // 'allSessions' will contain the list of all sessions and session groups
  const allSessions = getPrimaryAndGuestSortedVisibleSessions(state) || {};
  // Check the sessions, if any, matches the session id (except for checking inside session groups)
  let session = allSessions.find(s => s.id === sessionId);
  let selectedSessionInGroup;
  // Checking the session inside the session group if matches with the session id
  Object.values(allSessions).forEach(sessionGroup => {
    // Fetching all the session groups
    if ((sessionGroup as $TSFixMe).sessions) {
      if (isEmpty(selectedSessionInGroup)) {
        selectedSessionInGroup = Object.values((sessionGroup as $TSFixMe).sessions).filter(
          s => (s as $TSFixMe).id === sessionId
        );
        if (!session) {
          session = Object.values((sessionGroup as $TSFixMe).sessions).find(s => (s as $TSFixMe).id === sessionId);
        }
      }
    }
  });
  return session;
}

export function getInitialProductRegistrations(
  state: $TSFixMe,
  registrationTypeId = defaultRegistrationTypeId
): $TSFixMe {
  const defaultAdmissionItemId = getDefaultAdmissionItemIdSelectionForRegType(state, registrationTypeId);
  if (!defaultAdmissionItemId) {
    /*
     * If there is a single admission item it should be selected by default. However, if the users initial registration
     * type cannot pick that admission item we will defer admission item selection to later in registration.
     */
    return [];
  }

  return [
    {
      productId: defaultAdmissionItemId,
      productType: 'AdmissionItem',
      quantity: 1,
      requestedAction: 'REGISTER'
    }
  ];
}

export function getInviteeData(registrationForm: $TSFixMe, registrationId?: $TSFixMe): $TSFixMe {
  const eventRegistration = getEventRegistration(
    registrationForm.regCart,
    registrationId || getPrimaryRegistrationId(registrationForm.regCart)
  );
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const inviteeId = eventRegistration && eventRegistration.attendee.attendeeId;
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const confirmationNumber = eventRegistration && eventRegistration.confirmationNumber;
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const emailAddress = eventRegistration && eventRegistration.attendee.personalInformation.emailAddress;
  return { inviteeId, confirmationNumber, emailAddress };
}

export async function createInitialRegCart(
  regCartClient: $TSFixMe,
  accessToken: $TSFixMe,
  state: $TSFixMe,
  inviteeId: $TSFixMe,
  contactId: $TSFixMe,
  eventId: $TSFixMe,
  isTestMode: $TSFixMe,
  referenceId: $TSFixMe,
  regTypeId: $TSFixMe,
  regPathId: $TSFixMe,
  registrationPackId: $TSFixMe,
  httpReferrer: $TSFixMe,
  adminContactId: $TSFixMe,
  localeId: $TSFixMe,
  isEmbeddedRegistration: $TSFixMe,
  snapshotVersions: SnapshotVersions
): Promise<$TSFixMe> {
  const queryParams = querystring.parse(window.location.search.slice(1));
  const sms = queryParams.sms || '';
  const cn = queryParams.cn || '';
  const refid = getQueryParam(queryParams, 'refid') || '';
  const isContactWebsite = queryParams.contactWebsite || '';
  const externalContactId = getQueryParam(queryParams, 'MarketoID') || getQueryParam(queryParams, 'EloquaID') || '';
  const socialMediaSourceDetails = {};
  const createdBy = getQueryParam(queryParams, 'cb');
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string | string[]' is not assign... Remove this comment to see the full error message
  if (sms && !isNaN(sms)) {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string | string[]' is not assign... Remove this comment to see the full error message
    (socialMediaSourceDetails as $TSFixMe).socialMediaSource = parseInt(sms, 10);
  }
  if (cn) {
    (socialMediaSourceDetails as $TSFixMe).invitedByContactStub = cn;
  }
  if (refid) {
    (socialMediaSourceDetails as $TSFixMe).referenceId = refid;
  }
  const contactStub = isContactWebsite ? queryParams.c : contactId;
  /*
   * we were sending an empty cart if the inviteeId is present and it wasn't a planner cart
   * but that was breaking the case when an invitee coming through email had a non default reg type
   * and a non default admission item was not available to him, creating a product not available error
   * (PROD-80322) Now, we are always sending the eventReg in the regCart,
   * So that the pre-assigned reg type is given to invitee and not the default one, when he comes through email
   * and the eventReg object gets overriden on the service level with the known invitee
   */
  let initialRegCart = {
    regPackId: registrationPackId,
    localeId,
    eventRegistrations: {
      [firstEventRegId]: {
        eventId,
        eventRegistrationId: firstEventRegId,
        attendee: {
          personalInformation: {},
          eventAnswers: {},
          referenceId
        },
        productRegistrations: [],
        registrationTypeId: regTypeId,
        registrationPathId: regPathId,
        externalRegistrationContactId: externalContactId
      }
    },
    ...(!isEmptyObject(socialMediaSourceDetails) ? { socialMediaSourceDetails } : {}),
    httpReferrer: httpReferrer ? httpReferrer.replace(/(^\w+:|^)\/\//, '') : httpReferrer
  };
  if (isEmbeddedRegistration) {
    return getInitialEmbeddedRegCart(initialRegCart);
  }
  const localRegCart = getRegCart(state);
  const isPlaceholderCart = isPlaceholderRegCart(localRegCart);
  if (isPlaceholderCart) {
    // use the prefilled placeholder cart when creating the couchbase cart
    initialRegCart = dissoc(localRegCart, 'regCartId' as const) as $TSFixMe;
  }
  LOG.debug('createRegCart ', initialRegCart);
  return await regCartClient.createRegCart(
    accessToken,
    initialRegCart,
    contactStub,
    inviteeId,
    adminContactId,
    isContactWebsite,
    createdBy,
    eventId,
    isPlaceholderCart ? snapshotVersions : undefined
  );
}

/**
 * Returns the intial reg cart with a flag indicating its for embedded registration
 * This cart is not saved / persisted to reg api / couchbase until a significant (cart creation) user action occurs
 */
function getInitialEmbeddedRegCart(regCart) {
  return {
    regCart: {
      ...regCart,
      regCartId: '',
      embeddedRegistration: true
    }
  };
}

/**
 * Checks if the object passed is empty or not
 * @param {*} object
 */
function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

/*
 * This function is used for:
 * 1) Removing admin info from recart before partial put for product selection
 * 2) Adding back unsaved admin info to saved regcart after production selection call
 */
export function setAdminRegOnProductionSelection(lastSavedRegCart: $TSFixMe, unSavedCart: $TSFixMe): $TSFixMe {
  const adminReg = getIn(lastSavedRegCart, ['admin']);
  let newUnSavedCart;
  if (adminReg) {
    newUnSavedCart = assoc(unSavedCart, 'admin', adminReg);
  } else {
    newUnSavedCart = dissoc(unSavedCart, 'admin');
  }
  return newUnSavedCart;
}

export function getLastSavedRegCart(getState: $TSFixMe): $TSFixMe {
  const {
    regCartStatus: { lastSavedRegCart }
  } = getState();
  return lastSavedRegCart;
}
