/**
 * File for util functions used by selectors such as custom IsEqual overrides for memoization
 */
import { createSelectorCreator, defaultMemoize, createSelector } from 'reselect';
import { getTemporaryGuestEventRegistrationId, isGuestEditMode, guests } from '../../redux/selectors/currentRegistrant';
import { pick, isEqual, sortBy, map } from 'lodash';
import { EventRegistration } from '@cvent/flex-event-shared/target/guestside';

const firstNamePath = ['attendee', 'personalInformation', 'firstName'] as const;
const lastNamePath = ['attendee', 'personalInformation', 'lastName'] as const;
const middleNamePath = ['attendee', 'personalInformation', 'middleName'] as const;
const emailAddressPath = ['attendee', 'personalInformation', 'emailAddress'] as const;

/**
 * Gets the properties that determine if guest widget needs to re-rendered.
 * Do not use outside of this file to avoid messing up other memoizations.
 */
function getGuestPropertiesForGuestWidget(guestReg: EventRegistration) {
  return pick(guestReg, [
    firstNamePath,
    lastNamePath,
    emailAddressPath,
    middleNamePath,
    'registrationTypeId',
    'eventRegistrationId'
  ] as $TSFixMe);
}

const createDeepEqualGuestWidgetSelector = createSelectorCreator(defaultMemoize, (guestList, otherGuestList) => {
  if (guestList && otherGuestList && (guestList as $TSFixMe).length !== (otherGuestList as $TSFixMe).length) {
    return false;
  }
  const sortedGuestPropertiesList = sortBy(map(guestList as $TSFixMe, getGuestPropertiesForGuestWidget), [
    'eventRegistrationId'
  ]);
  const sortedOtherGuestPropertiesList = sortBy(map(otherGuestList as $TSFixMe, getGuestPropertiesForGuestWidget), [
    'eventRegistrationId'
  ]);
  return isEqual(sortedGuestPropertiesList, sortedOtherGuestPropertiesList);
});

const getGuestsForGuestWidget = createDeepEqualGuestWidgetSelector(guests, guestRegistrations => guestRegistrations);

/**
 * gets you all the guests that the invitee has added in their registration
 * memoized on information that is present in the guestWidget only to minimize re-renders
 * @param state
 * @returns {*}
 */
export const getConfirmedGuestsForGuestWidget = createSelector(
  getTemporaryGuestEventRegistrationId,
  getGuestsForGuestWidget,
  isGuestEditMode,
  (unconfirmedGuestEventRegId, allGuests, isGuestInEditMode) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'filter' does not exist on type 'unknown'... Remove this comment to see the full error message
    return allGuests.filter(
      eventReg => eventReg.eventRegistrationId !== unconfirmedGuestEventRegId || isGuestInEditMode
    );
  }
);
