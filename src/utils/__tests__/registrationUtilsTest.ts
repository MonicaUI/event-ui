import {
  groupLeaderAndGroupMemberHaveCompatibleManualApprovalSettings,
  getGroupMemberRegTypes,
  canModifyRegistrationWithEventStatus,
  canModifyRegistration,
  isModifyOrCancelOpen,
  updateContactFieldsWithLocalizedText,
  shouldAbortRegistration
} from '../registrationUtils';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import { InviteeStatusId } from 'event-widgets/utils/InviteeStatus';
import { REGISTERING } from '../../redux/registrationIntents';

describe('groupLeaderAndGroupMemberHaveCompatibleManualApprovalSettings tests', () => {
  const commonState = {
    event: {
      registrationTypes: {
        regType1: {},
        regType2: {},
        regType3: {}
      },
      eventFeatureSetup: {
        registrationProcess: {
          registrationApproval: true
        }
      }
    },
    registrationForm: {
      regCart: {
        eventRegistrations: {
          reg1: {
            registrationStatus: 'REGISTERED',
            registrationPathId: 'regPath2'
          }
        }
      }
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPath1: {
            id: 'regPath1',
            isDefault: true,
            associatedRegistrationTypes: ['regType1', 'regType2'],
            groupRegistrationSettings: {
              registrationTypeSettings: {
                limitVisibility: true,
                categorizedRegistrationTypes: ['regType1', 'regType2']
              }
            }
          },
          regPath2: {
            id: 'regPath2',
            requireRegApproval: true,
            associatedRegistrationTypes: ['regType2', 'regType3'],
            groupRegistrationSettings: {
              registrationTypeSettings: {
                limitVisibility: true,
                categorizedRegistrationTypes: ['regType3']
              }
            }
          }
        }
      }
    },
    userSession: {},
    defaultUserSession: {}
  };
  test('Returns false when user is a registered attendee and group members require approval', () => {
    expect(groupLeaderAndGroupMemberHaveCompatibleManualApprovalSettings(commonState)).toBeFalsy();
  });
  test('Returns true when user is a planner', () => {
    const state = { ...commonState };
    (state.defaultUserSession as $TSFixMe).isPlanner = true;
    expect(groupLeaderAndGroupMemberHaveCompatibleManualApprovalSettings(state)).toBeTruthy();
  });
  test('Returns true when user is not a registered attendee', () => {
    const state = { ...commonState };
    // @ts-expect-error ts-migrate(2739) FIXME: Type '{}' is missing the following properties from... Remove this comment to see the full error message
    state.registrationForm.regCart.eventRegistrations.reg1 = {};
    expect(groupLeaderAndGroupMemberHaveCompatibleManualApprovalSettings(state)).toBeTruthy();
  });
  test('Returns true when approval is not enabled for event', () => {
    const state = { ...commonState };
    state.event.eventFeatureSetup.registrationProcess.registrationApproval = false;
    expect(groupLeaderAndGroupMemberHaveCompatibleManualApprovalSettings(state)).toBeTruthy();
  });
  test('Returns true when user is a registered attendee and group members dont require approval', () => {
    const state = { ...commonState };
    state.registrationForm.regCart.eventRegistrations.reg1.registrationPathId = 'regPath1';
    expect(groupLeaderAndGroupMemberHaveCompatibleManualApprovalSettings(state)).toBeTruthy();
  });
  test('Returns true when group member settings are not present', () => {
    const state = { ...commonState };
    // @ts-expect-error ts-migrate(2741) FIXME: Property 'registrationSettings' is missing in type... Remove this comment to see the full error message
    state.appData = {};
    expect(groupLeaderAndGroupMemberHaveCompatibleManualApprovalSettings(state)).toBeTruthy();
  });
});

describe('getGroupMemberRegTypes tests', () => {
  const state = {};
  test('Returns empty array if group reg type settings are not present', () => {
    expect(getGroupMemberRegTypes(state)).toEqual([]);
    (state as $TSFixMe).appData = {};
    expect(getGroupMemberRegTypes(state)).toEqual([]);
    (state as $TSFixMe).appData.registrationSettings = {};
    expect(getGroupMemberRegTypes(state)).toEqual([]);
    (state as $TSFixMe).appData.registrationSettings.registrationPaths = {};
    expect(getGroupMemberRegTypes(state)).toEqual([]);
    (state as $TSFixMe).registrationForm = {};
    expect(getGroupMemberRegTypes(state)).toEqual([]);
    (state as $TSFixMe).registrationForm.regCart = {};
    expect(getGroupMemberRegTypes(state)).toEqual([]);
    (state as $TSFixMe).registrationForm.regCart.eventRegistrations = {};
    expect(getGroupMemberRegTypes(state)).toEqual([]);
    (state as $TSFixMe).registrationForm.regCart.eventRegistrations.reg1 = {};
    expect(getGroupMemberRegTypes(state)).toEqual([]);
    (state as $TSFixMe).registrationForm.regCart.eventRegistrations.reg1.registrationPathId = 'regPath1';
    expect(getGroupMemberRegTypes(state)).toEqual([]);
    (state as $TSFixMe).appData.registrationSettings.registrationPaths.regPath1 = {};
    const regPath1 = (state as $TSFixMe).appData.registrationSettings.registrationPaths.regPath1;
    expect(getGroupMemberRegTypes(state)).toEqual([]);
    regPath1.groupRegistrationSettings = {};
    expect(getGroupMemberRegTypes(state)).toEqual([]);
    regPath1.groupRegistrationSettings.registrationTypeSettings = {};
    expect(getGroupMemberRegTypes(state)).toEqual([]);
    regPath1.groupRegistrationSettings.registrationTypeSettings = {};
    expect(getGroupMemberRegTypes(state)).toEqual([]);
    regPath1.groupRegistrationSettings.registrationTypeSettings.limitVisibility = false;
    expect(getGroupMemberRegTypes(state)).toEqual([]);
    (state as $TSFixMe).event = {};
    expect(getGroupMemberRegTypes(state)).toEqual([]);
    (state as $TSFixMe).event.registrationTypes = {};
    expect(getGroupMemberRegTypes(state)).toEqual([]);
    regPath1.groupRegistrationSettings.registrationTypeSettings.limitVisibility = true;
    regPath1.groupRegistrationSettings.registrationTypeSettings.categorizedRegistrationTypes = [];
    expect(getGroupMemberRegTypes(state)).toEqual([]);
  });
  test('Returns non empty array if group reg type settings are present', () => {
    const regPath1 = (state as $TSFixMe).appData.registrationSettings.registrationPaths.regPath1;
    regPath1.groupRegistrationSettings.registrationTypeSettings.categorizedRegistrationTypes = ['regType1', 'regType2'];
    expect(getGroupMemberRegTypes(state)).toEqual(['regType1', 'regType2']);
    regPath1.groupRegistrationSettings.registrationTypeSettings.limitVisibility = false;
    (state as $TSFixMe).event.registrationTypes = {
      regType3: {}
    };
    expect(getGroupMemberRegTypes(state)).toEqual(['regType3']);
  });
});

describe('canModifyRegistrationWithEventStatus tests', () => {
  const event = { isInTestMode: false };
  test('Verify the conditions', () => {
    (event as $TSFixMe).status = eventStatus.PENDING;
    expect(canModifyRegistrationWithEventStatus(event)).toEqual(false);
    event.isInTestMode = true;
    expect(canModifyRegistrationWithEventStatus(event)).toEqual(true);

    event.isInTestMode = false;
    (event as $TSFixMe).status = eventStatus.ACTIVE;
    expect(canModifyRegistrationWithEventStatus(event)).toEqual(true);
    (event as $TSFixMe).status = eventStatus.CLOSED;
    expect(canModifyRegistrationWithEventStatus(event)).toEqual(true);
    (event as $TSFixMe).status = eventStatus.COMPLETED;
    expect(canModifyRegistrationWithEventStatus(event)).toEqual(false);
    (event as $TSFixMe).status = eventStatus.CANCELLED;
    expect(canModifyRegistrationWithEventStatus(event)).toEqual(false);
    (event as $TSFixMe).status = eventStatus.DELETED;
    expect(canModifyRegistrationWithEventStatus(event)).toEqual(false);
    (event as $TSFixMe).status = eventStatus.PROCESSING;
    expect(canModifyRegistrationWithEventStatus(event)).toEqual(false);
    (event as $TSFixMe).status = eventStatus.NO_REGISTRATION_REQUIRED;
    expect(canModifyRegistrationWithEventStatus(event)).toEqual(false);
  });
});

describe('canModifyRegistration tests', () => {
  const event = {
    status: eventStatus.ACTIVE,
    isInTestMode: false
  };
  let deadline = new Date('1900-01-01T00:00:00Z');
  test('Verify the conditions', () => {
    expect(canModifyRegistration(event, deadline)).toEqual(false);
    deadline = new Date('2500-01-01T00:00:00Z');
    expect(canModifyRegistration(event, deadline)).toEqual(true);
  });
});

describe('isModifyOrCancelOpen tests', () => {
  const pendingEventReg = {
    attendee: {
      inviteeStatus: InviteeStatusId.PendingApproval
    }
  };
  const eventReg = {
    attendee: {
      inviteeStatus: InviteeStatusId.Accepted
    }
  };
  const deadline = new Date('1900-01-01T00:00:00Z');
  test('Verify conditions for accepted invitee when pending enabled missing', () => {
    // should depends on deadline and enabled.
    expect(isModifyOrCancelOpen(eventReg, null, undefined, true)).toEqual(true);
    expect(isModifyOrCancelOpen(eventReg, null, undefined, false)).toEqual(false);
    expect(isModifyOrCancelOpen(eventReg, deadline, undefined, true)).toEqual(false);
    expect(isModifyOrCancelOpen(eventReg, deadline, undefined, false)).toEqual(false);
  });

  test('Verify conditions for pending approval invitee when pending enabled missing', () => {
    // should depends on deadline and enabled.
    expect(isModifyOrCancelOpen(pendingEventReg, null, undefined, true)).toEqual(true);
    expect(isModifyOrCancelOpen(pendingEventReg, null, undefined, false)).toEqual(false);
    expect(isModifyOrCancelOpen(pendingEventReg, deadline, undefined, true)).toEqual(false);
    expect(isModifyOrCancelOpen(pendingEventReg, deadline, undefined, false)).toEqual(false);
  });

  test('Verify conditions for pending approval invitee when pending enabled exists', () => {
    // should depends on deadline and pendingEnabled.
    expect(isModifyOrCancelOpen(pendingEventReg, null, true, false)).toEqual(true);
    expect(isModifyOrCancelOpen(pendingEventReg, null, false, true)).toEqual(false);
    expect(isModifyOrCancelOpen(pendingEventReg, deadline, true, true)).toEqual(false);
    expect(isModifyOrCancelOpen(pendingEventReg, deadline, false, true)).toEqual(false);
  });
});

describe('updateContactFieldsWithLocalizedText tests', () => {
  const eventLocales = [{ localeId: 1033 }, { localeId: 1034 }];
  const contactFieldsOrganizedByPath = {
    regPath1: {
      1: [
        {
          id: 'widget:1234567890',
          config: {
            displayName: 'Base Text'
          }
        }
      ]
    }
  };
  test('does not fail when localization data is not present', () => {
    const localizedUserText = {
      currentLocale: 'en-US',
      localizations: {}
    };
    const modifiedContactFields = updateContactFieldsWithLocalizedText(
      contactFieldsOrganizedByPath,
      localizedUserText,
      eventLocales
    );
    expect(modifiedContactFields.regPath1[1][0].config.displayName).toEqual('Base Text');
  });
  test('Updates displayText', () => {
    const localizedUserText = {
      currentLocale: 'fr-CA',
      localizations: {
        'fr-CA': {
          'website.layoutItems.widget:1234567890.config.displayName': 'Translated Text'
        }
      }
    };
    const modifiedContactFields = updateContactFieldsWithLocalizedText(
      contactFieldsOrganizedByPath,
      localizedUserText,
      eventLocales
    );
    expect(modifiedContactFields.regPath1[1][0].config.displayName).toEqual('Translated Text');
  });
});

describe('shouldAbortRegistration tests', () => {
  test('Verify the conditions', () => {
    expect(shouldAbortRegistration()).toEqual(false);
    expect(shouldAbortRegistration(0)).toEqual(false);
    expect(shouldAbortRegistration(0, 'INPROGRESS')).toEqual(false);
    expect(shouldAbortRegistration(0, 'INPROGRESS', REGISTERING)).toEqual(false);
    expect(shouldAbortRegistration(0, 'INPROGRESS', REGISTERING, 2)).toEqual(true);
  });
});
