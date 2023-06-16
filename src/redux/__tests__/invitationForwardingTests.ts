/* global */
import reducer from '../invitationForwarding';
import {
  resetInvitationForwarding,
  turnOnAutoFocus,
  forwardingInvitationError,
  forwardingInvitationSuccess
} from '../invitationForwarding';

test('Verifying initial state.', () => {
  expect(reducer(undefined, {})).toMatchSnapshot();
});

test('Verifing turnOnAutoFocus', () => {
  expect(reducer(undefined, turnOnAutoFocus())).toMatchSnapshot();
});

test('verifying resetInvitationForwarding', () => {
  expect(reducer(undefined, resetInvitationForwarding())).toMatchSnapshot();
});

test('verifying forwardingInvitationError', () => {
  expect(reducer(undefined, forwardingInvitationError())).toMatchSnapshot();
});

test('verifying forwardingInvitationSuccess', () => {
  expect(reducer(undefined, forwardingInvitationSuccess())).toMatchSnapshot();
});
