import Logger from '@cvent/nucleus-logging';
import { getIn } from 'icepick';
import { setRelatedContacts, setRelatedContactsSearch, toggleRelatedContacts } from './reducer';
import { getRegCart } from '../selectors/shared';
import { setCurrentGuestEventRegistration } from '../registrationForm/regCart';
import { getEventRegistration } from '../selectors/currentRegistrant';
import { getEventRegistration as getEventRegistrationRegCart } from '../registrationForm/regCart/selectors';
import { getTemporaryGuestEventRegistrationId } from '../selectors/currentRegistrant';

const LIMIT_TO_GET_RELATED_CONTACTS = 100;
export const MIN_LENGTH_FOR_SEARCH = 3;
const LOG = new Logger('addGuestFromRelatedContacts');

const getRelatedContacts = (state, contactId, searchCriteria = '') => {
  const {
    defaultUserSession: { eventId },
    accessToken,
    clients: { eventGuestClient }
  } = state;

  return eventGuestClient.getRelatedContacts(
    accessToken,
    eventId,
    getRegCart(state).regCartId,
    contactId,
    LIMIT_TO_GET_RELATED_CONTACTS,
    searchCriteria
  );
};

const getTrimmedFieldInLowerCase = field => {
  return field?.toLowerCase().trim() ?? '';
};

const searchRelatedContactsFromState = (relatedContacts, searchCriteria = '') => {
  return relatedContacts.filter(row => {
    const firstName = getTrimmedFieldInLowerCase(row.firstName);
    const lastName = getTrimmedFieldInLowerCase(row.lastName);
    const emailAddress = getTrimmedFieldInLowerCase(row.emailAddress);
    const relatedContactsSearchKey = `${firstName} ${lastName} ${emailAddress}`;
    if (relatedContactsSearchKey.includes(searchCriteria.toLowerCase().trim())) {
      return row;
    }
  });
};

/**
 * Calls the event guest client to get related contacts for an invitee and dispatches action to set state
 */
export const loadRelatedContactsForInvitee =
  (contactId: $TSFixMe): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    try {
      const relatedContacts = await getRelatedContacts(getState(), contactId);
      if (relatedContacts && relatedContacts.length > 0) {
        await dispatch(setRelatedContacts(contactId, relatedContacts));
      }
    } catch (error) {
      LOG.error(`Error getting related contacts for contactId:${contactId}`, error);
    }
  };

/**
 * Searches the state/calls service (when related contacts > LIMIT_TO_GET_RELATED_CONTACTS) and dispatches action
 */
export const searchRelatedContactsForInvitee =
  (contactId: $TSFixMe, searchCriteria: $TSFixMe): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    if (!searchCriteria || searchCriteria.length >= MIN_LENGTH_FOR_SEARCH) {
      const state = getState();
      const relatedContacts = getIn(state, ['addGuestFromRelatedContacts', contactId, 'relatedContacts']);
      let searchResults = null;

      /*
       * It means that searchCriteria is empty/undefined, so search among state only
       * It means that total related contacts for this contact < LIMIT, so search among state only
       */
      if (!searchCriteria || (relatedContacts && relatedContacts.length < LIMIT_TO_GET_RELATED_CONTACTS)) {
        searchResults = searchRelatedContactsFromState(relatedContacts, searchCriteria);
      } else {
        // else do related contacts service call to get the data based upon search criteria
        try {
          searchResults = await getRelatedContacts(state, contactId, searchCriteria);
        } catch (error) {
          LOG.error(`Error getting relatedContacts for contactId:${contactId} searchCriteria:${searchCriteria}`, error);
        }
      }

      await dispatch(setRelatedContactsSearch(contactId, searchCriteria, searchResults));
    }
  };

export const toggleRelatedContactsView = () => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const primaryEventRegistration = getEventRegistration(getState()) || {};
    const contactId = getIn(primaryEventRegistration, ['attendee', 'personalInformation', 'contactId']);
    if (contactId && !getIn(getState(), ['addGuestFromRelatedContacts', contactId, 'relatedContacts'])) {
      await dispatch(loadRelatedContactsForInvitee(contactId));
    }
    await dispatch(toggleRelatedContacts());
  };
};

export const clearRelatedContactsSearchData = () => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const primaryEventRegistration = getEventRegistration(getState()) || {};
    const contactId = getIn(primaryEventRegistration, ['attendee', 'personalInformation', 'contactId']);
    dispatch(setRelatedContactsSearch(contactId, undefined, undefined));
  };
};

export const setCurrentGuestRegistrationForSelectedRelatedContact =
  (relatedContactDetails: $TSFixMe) =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const regCart = getRegCart(state);
    const {
      accessToken,
      clients: { regCartClient }
    } = state;
    const guestRegistrationId = getTemporaryGuestEventRegistrationId(state);

    try {
      /*
       * Send the firstName, lastName, emailAddress and relatedContactId in the update regCart call
       */
      const regCartToPostForRelatedContact = {
        ...regCart,
        eventRegistrations: {
          ...regCart.eventRegistrations,
          [guestRegistrationId]: {
            ...regCart.eventRegistrations[guestRegistrationId],
            addGuestFromRelatedContacts: true,
            attendee: {
              ...regCart.eventRegistrations[guestRegistrationId].attendee,
              personalInformation: {
                firstName: relatedContactDetails.firstName,
                lastName: relatedContactDetails.lastName,
                emailAddress: relatedContactDetails.emailAddress,
                contactId: relatedContactDetails.relatedContactStub
              }
            }
          }
        }
      };

      // Call the client to update regCart
      const regCartUpdateResponse = await regCartClient.updateRegCart(accessToken, regCartToPostForRelatedContact);
      const guestToBePrepopulated = getEventRegistrationRegCart(regCartUpdateResponse.regCart, guestRegistrationId);

      // Set the current guest information to be on Guest pop-up
      await dispatch(setCurrentGuestEventRegistration(guestToBePrepopulated, true));

      // Clear the search criteria so that second guest added has the default view loaded for related contacts
      await dispatch(clearRelatedContactsSearchData());

      // Dispatch the action to toggle view to show guest pop-up with pre-populated related contact info
      await dispatch(toggleRelatedContacts());
    } catch (error) {
      LOG.error(
        `Error updating regCart with regCartId: ${regCart.regCartId} to populate guest information for
      relatedContactId: ${relatedContactDetails.relatedContactStub}`,
        error
      );
    }
  };
