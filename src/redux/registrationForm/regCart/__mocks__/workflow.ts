/* eslint-env jest */
import noopAction from '../../../../testUtils/noopAction';

export const startRegistration = jest.fn(noopAction);
export const startModification = jest.fn(noopAction);
export const finalizeRegistration = jest.fn(noopAction);
export const waitForRegCartCheckoutCompletionUi = jest.fn(noopAction);
export const startCancelRegistration = jest.fn(noopAction);
export const finalizeCancelRegistration = jest.fn(noopAction);
export const startDeclineRegistration = jest.fn(noopAction);
export const startWaitlistRegistration = jest.fn(noopAction);
export const finalizeWaitlistRegistration = jest.fn(noopAction);
export const finalizeDeclineRegistration = jest.fn(noopAction);
export const saveRegistration = jest.fn(noopAction);
export const updateRegCart = jest.fn(noopAction);
