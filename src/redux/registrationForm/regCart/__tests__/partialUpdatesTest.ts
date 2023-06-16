import { getAttendeeFieldValues } from '../partialUpdates';
import { NOT_REQUIRED, REQUIRED } from 'cvent-question-widgets/lib/DisplayType';
import Fields from '@cvent/event-fields/RegistrationOptionFields.json';
import { FEATURE_RELEASE_DEVELOPMENT_VARIANT } from '@cvent/event-ui-experiments';
import { TRAVEL_OPT_OUT_CHOICE } from 'event-widgets/utils/travelConstants';

describe('getAttendeeFieldValues', () => {
  const regPathId1 = 'registrationPathId1';
  const regPathId2 = 'registrationPathId2';
  const regPathId3 = 'registrationPathId3';
  const customFieldId1 = 'customFieldId1';
  const customFieldId2 = 'customFieldId2';
  const state = {
    appData: {
      registrationSettings: {
        registrationPaths: {
          [regPathId1]: {
            allowAttendeeListOptIn: 'AUTOMATIC',
            registrationPageFields: {
              1: {
                registrationFields: {
                  '56aeaca6-a0ad-4548-8afc-94d8d4361ba1': {
                    fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
                    fieldName: 'StandardContactField_FirstName__resx',
                    displayName: 'StandardContactField_FirstName__resx',
                    display: 2,
                    isCustomField: false
                  },
                  [Fields.firstName.id]: { display: REQUIRED },
                  [Fields.lastName.id]: { display: REQUIRED },
                  [Fields.company.id]: { display: NOT_REQUIRED },
                  [customFieldId1]: { display: NOT_REQUIRED },
                  [customFieldId2]: { display: NOT_REQUIRED }
                }
              }
            }
          },
          [regPathId2]: {
            allowAttendeeListOptIn: 'OPT_IN',
            registrationPageFields: {
              1: {
                registrationFields: {
                  '56aeaca6-a0ad-4548-8afc-94d8d4361ba1': {
                    fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
                    fieldName: 'StandardContactField_FirstName__resx',
                    displayName: 'StandardContactField_FirstName__resx',
                    display: 2,
                    isCustomField: false
                  }
                }
              }
            }
          },
          [regPathId3]: {
            registrationPageFields: {
              1: {
                registrationFields: {
                  '56aeaca6-a0ad-4548-8afc-94d8d4361ba1': {
                    fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
                    fieldName: 'StandardContactField_FirstName__resx',
                    displayName: 'StandardContactField_FirstName__resx',
                    display: 2,
                    isCustomField: false
                  },
                  [Fields.firstName.id]: { display: REQUIRED },
                  [Fields.lastName.id]: { display: REQUIRED },
                  [Fields.company.id]: { display: NOT_REQUIRED },
                  [customFieldId1]: { display: NOT_REQUIRED },
                  [customFieldId2]: { display: NOT_REQUIRED }
                }
              }
            }
          }
        }
      }
    }
  };

  test('Attendee do not have display flag and both old and new regID is for regpath1', async () => {
    let attendee = { personalInformation: {} };
    attendee = getAttendeeFieldValues(state, attendee, regPathId1, regPathId1);
    expect((attendee as $TSFixMe).displayOnAttendeeList).toBeTruthy();
  });
  test('Attendee do not have display flag and old and new regID are different', async () => {
    let attendee = { personalInformation: {} };
    attendee = getAttendeeFieldValues(state, attendee, regPathId1, regPathId2);
    expect((attendee as $TSFixMe).displayOnAttendeeList).toBeTruthy();
  });
  test('Attendee have display flag and old and new regID are different', async () => {
    let attendee = { personalInformation: {}, displayOnAttendeeList: true };
    attendee = getAttendeeFieldValues(state, attendee, regPathId2, regPathId1);
    expect(attendee.displayOnAttendeeList).toBe(undefined);
  });
  test('Attendee have display flag and old and new regID are same', async () => {
    let attendee = { personalInformation: {}, displayOnAttendeeList: true };
    attendee = getAttendeeFieldValues(state, attendee, regPathId2, regPathId2);
    expect(attendee.displayOnAttendeeList).toBeTruthy();
  });
  test('Attendee have display flag and old and new regID are same and display attendeelist flag is false', async () => {
    let attendee = { personalInformation: {}, displayOnAttendeeList: false };
    attendee = getAttendeeFieldValues(state, attendee, regPathId2, regPathId2);
    expect(attendee.displayOnAttendeeList).toBeFalsy();
  });
  test('Attendee have display flag and old and new regID are same and display attendeelist flag is not boolean', async () => {
    let attendee = { personalInformation: {}, displayOnAttendeeList: 'whatever' };
    attendee = getAttendeeFieldValues(state, attendee, regPathId2, regPathId2);
    expect(attendee.displayOnAttendeeList).toBe(undefined);
  });
  test('Attendee has OPT_IN opt in on old reg path and new reg path does not have allowAttendeeListOptIn', async () => {
    let attendee = { personalInformation: {}, displayOnAttendeeList: 'whatever' };
    attendee = getAttendeeFieldValues(state, attendee, regPathId2, regPathId3);
    expect(attendee.displayOnAttendeeList).toBe(undefined);
  });

  describe('apply pi field updates when reg path/type partially updates', () => {
    const unsavedAttendee = {
      attendeeId: 'attendee1',
      inviteeStatus: 4,
      eventAnswers: [],
      personalInformation: {
        firstName: 'unsaved first name',
        lastName: 'unsaved last name',
        customFields: {
          [customFieldId1]: { questionId: customFieldId1, answers: [{ answerType: 'Text', text: 'unsaved value 1' }] },
          [customFieldId2]: { questionId: customFieldId2, answers: [{ answerType: 'Text', text: 'unsaved value 2' }] }
        }
      },
      airOptOutChoice: null
    };
    const updatedAttendee = {
      ...unsavedAttendee,
      personalInformation: {
        ...unsavedAttendee.personalInformation,
        firstName: 'new first name',
        lastName: 'new first name',
        customFields: {
          [customFieldId1]: { questionId: customFieldId1, answers: [{ answerType: 'Text', text: 'new value 1' }] },
          [customFieldId2]: { questionId: customFieldId2, answers: [{ answerType: 'Text', text: 'new value 2' }] }
        }
      }
    };

    test('no updated attendee when reg path did not change', async () => {
      const result = getAttendeeFieldValues(state, unsavedAttendee, regPathId1);
      expect(result.personalInformation).toEqual(unsavedAttendee.personalInformation);
    });

    test('updated attendee when reg path changed but no new field added in cart', async () => {
      const result = getAttendeeFieldValues(state, unsavedAttendee, regPathId1, regPathId2, updatedAttendee);

      // no new fields in updated attendee, so result should be same as unsaved
      expect(result.personalInformation).toEqual(unsavedAttendee.personalInformation);
    });

    test('updated attendee when reg path changed and new field added in cart', async () => {
      const testUpdatedAttendee = {
        ...updatedAttendee,
        personalInformation: {
          ...updatedAttendee.personalInformation,
          company: 'cvent'
        }
      };
      const result = getAttendeeFieldValues(state, unsavedAttendee, regPathId1, regPathId2, testUpdatedAttendee);

      // there's a new field (company) in updated attendee, so result will have that extra
      expect(result.personalInformation).toEqual({ ...unsavedAttendee.personalInformation, company: 'cvent' });
    });

    test('updated attendee when reg path changed, attendeeId has been saved in reg Cart', async () => {
      const result = getAttendeeFieldValues(state, unsavedAttendee, regPathId1, regPathId2, updatedAttendee);
      // attendeeId has been updated, so result should have the attendeeId
      expect(result.attendeeId).toEqual(unsavedAttendee.attendeeId);
    });

    test("set attendee's airOptOutChoice to null when not behind experiment and reg path changed", async () => {
      const result = getAttendeeFieldValues(state, unsavedAttendee, regPathId1, regPathId2, updatedAttendee);
      expect(result.airOptOutChoice).toBeNull();
    });

    test("set attendee's airOptOutChoice to pre-existing value when behind experiment and reg path changed", async () => {
      const localState = {
        ...state,
        experiments: {
          featureRelease: FEATURE_RELEASE_DEVELOPMENT_VARIANT
        },
        event: {
          createdDate: new Date('2021-08-27T18:29:00Z')
        }
      };
      const localUnsavedAttendee = {
        ...unsavedAttendee,
        airOptOutChoice: TRAVEL_OPT_OUT_CHOICE.BOOKED
      };
      const result = getAttendeeFieldValues(localState, localUnsavedAttendee, regPathId1, regPathId2, updatedAttendee);
      expect(result.airOptOutChoice).toEqual(TRAVEL_OPT_OUT_CHOICE.BOOKED);
    });
  });
});
