import { buildAdmissionItemsFilter, getPrimaryVisibleAdmissionItems } from '../admissionItemsUtils';
import { Visible } from '@cvent/event-ui-apollo-server/src/schema/types';

describe('buildAdmissionItemsFilter tests', () => {
  test('when registrationTypesIds length is > 0', () => {
    const registrationTypesIds = ['regTypeA', 'regTypeB'];
    const expectedResult =
      "applicableContactTypes is empty or applicableContactTypes contains 'regTypeA' or applicableContactTypes " +
      "contains 'regTypeB'";
    expect(buildAdmissionItemsFilter(registrationTypesIds)).toEqual(expectedResult);
  });

  test('when registrationTypesIds length is = 0', () => {
    expect(buildAdmissionItemsFilter([])).toEqual('applicableContactTypes is empty');
  });
});

describe('getPrimaryVisibleAdmissionItems tests', () => {
  const admissionItems = [
    {
      id: 'adm-1',
      name: 'adm-1',
      applicableContactTypes: ['regTypeA', 'regTypeB', 'regTypeC'],
      minimumNumberOfSessionsToSelect: 0,
      limitOptionalSessionsToSelect: false,
      includeWaitlistSessionsTowardsMaximumLimit: false,
      code: 'adm-1',
      description: '',
      defaultFeeId: '',
      displayOrder: 1,
      visible: Visible.Available,
      capacity: {
        inPerson: {
          available: 1,
          total: 1
        },
        virtual: {
          available: 1,
          total: 1
        }
      }
    },
    {
      id: 'adm-2',
      name: 'adm-2',
      applicableContactTypes: ['regTypeA', 'regTypeC'],
      minimumNumberOfSessionsToSelect: 0,
      limitOptionalSessionsToSelect: false,
      includeWaitlistSessionsTowardsMaximumLimit: false,
      code: 'adm-2',
      description: '',
      defaultFeeId: '',
      displayOrder: 2,
      visible: Visible.Available,
      capacity: {
        inPerson: {
          available: 1,
          total: 1
        },
        virtual: {
          available: 1,
          total: 1
        }
      }
    },
    {
      id: 'adm-3',
      name: 'adm-3',
      applicableContactTypes: ['regTypeB', 'regTypeC'],
      minimumNumberOfSessionsToSelect: 0,
      limitOptionalSessionsToSelect: false,
      includeWaitlistSessionsTowardsMaximumLimit: false,
      code: 'adm-3',
      description: '',
      defaultFeeId: '',
      displayOrder: 3,
      visible: Visible.Available,
      capacity: {
        inPerson: {
          available: 1,
          total: 1
        },
        virtual: {
          available: 1,
          total: 1
        }
      }
    }
  ];

  test('primary invitee has chosen regTypeB and 2 visible admissionItems', () => {
    const primaryVisibleAdmissionItems = getPrimaryVisibleAdmissionItems(admissionItems, 'regTypeB');
    expect(primaryVisibleAdmissionItems.length).toEqual(2);
    expect(
      primaryVisibleAdmissionItems.some(primaryVisibleAdmissionItem => primaryVisibleAdmissionItem.id === 'adm-2')
    ).toBeFalsy();
  });
  test('primary invitee has not chosen any registrationType, thus 0 visible admissionItems', () => {
    const primaryVisibleAdmissionItems = getPrimaryVisibleAdmissionItems(admissionItems, undefined);
    expect(primaryVisibleAdmissionItems.length).toEqual(0);
  });
});
