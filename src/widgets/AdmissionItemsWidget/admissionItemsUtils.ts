import { AdmissionItem } from '@cvent/event-ui-apollo-server/src/schema/types';

/**
 * builds a filter for admissionItems based on selected registration typeIds to query graphQL
 * if invitee has selected regTypeId1 and regTypeId2 for his guest, then the filter will look like
 * applicableContactTypes is empty or applicableContactTypes contains 'regTypeA' or applicableContactTypes contains 'regTypeB'
 */
export const buildAdmissionItemsFilter = (registrationTypeIds: Array<string>): string => {
  return (
    'applicableContactTypes is empty' +
    (registrationTypeIds.length > 0
      ? ' or ' + registrationTypeIds.map(id => `applicableContactTypes contains '${id}'`).join(' or ')
      : '')
  );
};

/**
 * get all admissionItems which are visible to primary invitee
 */
export const getPrimaryVisibleAdmissionItems = (
  admissionItems: Array<AdmissionItem>,
  primaryRegistrationTypeId: string
): Array<AdmissionItem> => {
  return (admissionItems || []).filter(admissionItem =>
    admissionItem.applicableContactTypes.includes(primaryRegistrationTypeId)
  );
};
