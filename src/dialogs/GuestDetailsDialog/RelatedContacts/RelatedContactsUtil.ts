import { defaultMemoize } from 'reselect';
import { MIN_LENGTH_FOR_SEARCH } from '../../../redux/addGuestFromRelatedContacts/actions';

export const getSortedGroupsForRelatedContacts = defaultMemoize(relatedContacts => {
  const groupedByFirstChar = relatedContacts.reduce((accumulator, current) => {
    const id = current.firstName.charAt(0).toUpperCase();
    const group = accumulator[id];
    if (group) {
      group.push(current);
    } else {
      accumulator[id] = [current]; // eslint-disable-line no-param-reassign
    }
    return accumulator;
  }, {});
  return Object.keys(groupedByFirstChar)
    .map(key => ({
      groupName: key,
      relatedContacts: groupedByFirstChar[key]
        .sort((one, two) => one.lastName.localeCompare(two.lastName, 'en', { ignorePunctuation: true }))
        .sort((one, two) => one.firstName.localeCompare(two.firstName, 'en', { ignorePunctuation: true }))
    }))
    .sort((one, two) => one.groupName.localeCompare(two.groupName, 'en', { ignorePunctuation: true }));
});

/**
 * Checks if search text provided matches min length criteria
 * @returns {boolean}
 */
export const hasMinLengthForRelatedContactsSearch = (searchText: $TSFixMe): $TSFixMe => {
  // this is for the case when searchText is undefined/null/empty string
  if (!searchText) {
    return true;
  }
  return searchText.trim().length >= MIN_LENGTH_FOR_SEARCH;
};
