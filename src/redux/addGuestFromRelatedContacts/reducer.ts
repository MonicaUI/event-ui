const TOGGLE_RELATED_CONTACTS_VIEW = 'event-guestside-site/addGuestFromRelatedContacts/LIST_RELATED_CONTACTS';
const LOAD_RELATED_CONTACTS_FOR_INVITEE =
  'event-guestside-site/addGuestFromRelatedContacts/LOAD_RELATED_CONTACTS_FOR_INVITEE';
const LOAD_RELATED_CONTACTS_SEARCH_RESULTS =
  'event-guestside-site/addGuestFromRelatedContacts/LOAD_RELATED_CONTACTS_SEARCH_RESULTS';

export function setRelatedContacts(contactId: $TSFixMe, relatedContacts: $TSFixMe): $TSFixMe {
  return { type: LOAD_RELATED_CONTACTS_FOR_INVITEE, payload: { contactId, relatedContacts } };
}

export function toggleRelatedContacts(): $TSFixMe {
  return { type: TOGGLE_RELATED_CONTACTS_VIEW };
}

export function setRelatedContactsSearch(
  contactId: $TSFixMe,
  searchCriteria: $TSFixMe,
  searchResults: $TSFixMe
): $TSFixMe {
  return { type: LOAD_RELATED_CONTACTS_SEARCH_RESULTS, payload: { contactId, searchCriteria, searchResults } };
}

export default function addGuestFromRelatedContactsReducer(state = {}, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case LOAD_RELATED_CONTACTS_FOR_INVITEE: {
      return {
        ...state,
        [action.payload.contactId]: {
          ...state[action.payload.contactId],
          relatedContacts: action.payload.relatedContacts
        }
      };
    }
    case TOGGLE_RELATED_CONTACTS_VIEW: {
      return {
        ...state,
        showRelatedContactsView: !(state as $TSFixMe).showRelatedContactsView
      };
    }
    case LOAD_RELATED_CONTACTS_SEARCH_RESULTS: {
      return {
        ...state,
        [action.payload.contactId]: {
          ...state[action.payload.contactId],
          relatedContactsSearchCriteria: action.payload.searchCriteria,
          relatedContactsSearchResults: action.payload.searchResults
        }
      };
    }
    default: {
      return state;
    }
  }
}
