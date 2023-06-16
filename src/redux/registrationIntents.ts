/*
 * Declare both the type and value of each constant to be the same string literal so that flow doesn't infer the type of
 * each constant to be 'string' which is too general. We want it to be limited to a more specific type that can contain
 * only one specific string.
 */
export const NOT_REGISTERING = 'NOT_REGISTERING';
export const STARTING_REGISTRATION = 'STARTING_REGISTRATION';
export const REGISTERING = 'REGISTERING';
export const SAVING_REGISTRATION = 'SAVING_REGISTRATION';
export const CHECKING_OUT = 'CHECKING_OUT';
export const CHECKED_OUT = 'CHECKED_OUT';
export const CHECKED_OUT_PARTIALLY = 'CHECKED_OUT_PARTIALLY';
export const CANCELLING = 'CANCELLING';
export const FINALIZED_CANCEL_REGISTRATION = 'FINALIZED_CANCEL_REGISTRATION';
export const DECLINED_REGISTRATION = 'DECLINED_REGISTRATION';

export const RegistrationIntent =
  // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
  typeof NOT_REGISTERING |
  // @ts-expect-error ts-migrate(2363) FIXME: The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  typeof STARTING_REGISTRATION |
  // @ts-expect-error ts-migrate(2363) FIXME: The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  typeof REGISTERING |
  // @ts-expect-error ts-migrate(2363) FIXME: The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  typeof SAVING_REGISTRATION |
  // @ts-expect-error ts-migrate(2363) FIXME: The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  typeof CHECKING_OUT |
  // @ts-expect-error ts-migrate(2363) FIXME: The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  typeof CHECKED_OUT |
  // @ts-expect-error ts-migrate(2363) FIXME: The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  typeof CHECKED_OUT_PARTIALLY |
  // @ts-expect-error ts-migrate(2363) FIXME: The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  typeof CANCELLING |
  // @ts-expect-error ts-migrate(2363) FIXME: The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  typeof FINALIZED_CANCEL_REGISTRATION |
  // @ts-expect-error ts-migrate(2363) FIXME: The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  typeof DECLINED_REGISTRATION;
