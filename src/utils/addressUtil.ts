/**
 * Compares both city level address and returns true if there is any diff
 * @param {Object} cityLevelAddress
 * @param {Object} cityLevelAddressFromAttendee
 * @returns {boolean}
 */
export function hasAddressChangedInState(cityLevelAddress: $TSFixMe, cityLevelAddressFromAttendee: $TSFixMe): $TSFixMe {
  return (
    cityLevelAddress &&
    cityLevelAddressFromAttendee &&
    (cityLevelAddress.city !== cityLevelAddressFromAttendee.city ||
      cityLevelAddress.stateCode !== cityLevelAddressFromAttendee.stateCode ||
      cityLevelAddress.stateName !== cityLevelAddressFromAttendee.stateName ||
      cityLevelAddress.postalCode !== cityLevelAddressFromAttendee.postalCode ||
      cityLevelAddress.countryCode !== cityLevelAddressFromAttendee.countryCode ||
      cityLevelAddress.countryName !== cityLevelAddressFromAttendee.countryName)
  );
}

/**
 * Get address upto city from attendee address
 * @param {Object} attendeeAddress
 * @returns {Object}
 */
export function getCityLevelAddressFromAttendee(attendeeAddress: $TSFixMe): $TSFixMe {
  return {
    city: attendeeAddress.city,
    stateCode: attendeeAddress.stateCode,
    stateName: attendeeAddress.state,
    postalCode: attendeeAddress.postalCode,
    countryCode: attendeeAddress.countryCode,
    countryName: attendeeAddress.country
  };
}
