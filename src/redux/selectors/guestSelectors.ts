import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';
import { getConfirmedGuests } from './currentRegistrant';

/**
 * gets no. of confirmed guests that the invitee has added in their registration with the required attending Format
 * @param state the redux state
 * @param attendingFormat: attending Format for which no. of guests will be calculated
 * @returns {*}
 */
export function getNoOfConfirmedGuestsWithGivenAttendingFormat(
  state: $TSFixMe,
  attendingFormat = AttendingFormat.INPERSON
): $TSFixMe {
  const noOfConfirmedGuests = getConfirmedGuests(state);
  return (noOfConfirmedGuests || []).filter(
    eventReg => (eventReg?.attendingFormatId ?? AttendingFormat.INPERSON) === attendingFormat
  ).length;
}
