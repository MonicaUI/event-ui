/* eslint-env jest */
import noopAction from '../../../../testUtils/noopAction';

export const updateRegCartWithGuests = jest.fn(regCart => regCart);

export const updateGuestsInRegCart = jest.fn(noopAction);

export const setCurrentGuestEventRegistration = jest.fn(noopAction);

export const removeGuestByEventRegistrationId = jest.fn(regCart => regCart);

export const updateGuestDetails = jest.fn(noopAction);

export const clearTemporaryGuestInformation = jest.fn(noopAction);
