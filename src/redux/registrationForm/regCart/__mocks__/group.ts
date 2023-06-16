/* eslint-env jest */
import noopAction from '../../../../testUtils/noopAction';

export const removeEventRegistrationFromRegCart = jest.fn(noopAction);

export const removeGroupMembersFromRegCart = jest.fn(noopAction);

export const addGroupMemberInRegCart = jest.fn(noopAction);

export const navigateToGroupMemberRegistration = jest.fn(noopAction);
