import { closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { getLastSavedRegCart } from '../../../redux/registrationForm/regCart/internal';
import { getAttendee, isGroupRegistration } from '../../../redux/selectors/currentRegistrant';
import { getGuestsOfRegistrant } from '../../../redux/registrationForm/regCart/selectors';
import { getIn } from 'icepick';
import { openGuestProductSelectionDialog } from '../../index';

const applyGroupFlightSelection =
  (applyGuestGroupFlightSelection, flightType) => (groupFlightId, currentPrimaryRegId, selectedEventRegIds) => {
    return dispatch => {
      dispatch(closeDialogContainer());
      applyGuestGroupFlightSelection(groupFlightId, selectedEventRegIds, flightType);
    };
  };

export function openGroupFlightAttendeeSelectionDialog(
  eventRegistrationId: $TSFixMe,
  groupFlightId: $TSFixMe,
  applyGuestGroupFlightSelection: $TSFixMe,
  passengerDialogData: $TSFixMe,
  flightType: $TSFixMe,
  capacity?: $TSFixMe,
  isForPlanner?: $TSFixMe
) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const lastSavedRegCart = getLastSavedRegCart(getState);
    const isGroupReg = isGroupRegistration(state);
    const guestEventRegs = getGuestsOfRegistrant(lastSavedRegCart, eventRegistrationId);
    const currentEventReg = getIn(lastSavedRegCart, ['eventRegistrations', eventRegistrationId]);
    const currentAttendee = getAttendee(state);
    let eventRegistrations = guestEventRegs;
    const productCapacity = capacity;
    const overrideCapacity = isForPlanner;
    eventRegistrations.unshift({
      ...currentEventReg,
      attendee: {
        ...currentAttendee
      }
    });
    const applicableEventRegistrationIds = Object.keys(passengerDialogData);
    eventRegistrations = eventRegistrations.filter(reg =>
      applicableEventRegistrationIds.includes(reg.eventRegistrationId)
    );
    const eventRegSelections = {};
    applicableEventRegistrationIds.forEach(eventRegId => {
      const { isSelected, isDisabled, registeredForProductInGroup } = passengerDialogData[eventRegId];
      eventRegSelections[eventRegId] = {
        isSelected,
        isDisabled,
        registeredForProductInGroup
      };
    });
    const groupFlightInstructionText = 'EventWidgets_GroupFlights_InstructionalText__resx';
    await dispatch(
      openGuestProductSelectionDialog(
        'EventWidgets_GroupFlights_SelectPassengers__resx',
        groupFlightId,
        null,
        productCapacity,
        overrideCapacity,
        eventRegSelections,
        eventRegistrations,
        eventRegistrationId,
        isGroupReg,
        applyGroupFlightSelection(applyGuestGroupFlightSelection, flightType),
        null,
        null,
        null,
        null,
        groupFlightInstructionText
      )
    );
  };
}
