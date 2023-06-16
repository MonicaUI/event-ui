import { gql, useQuery } from '@apollo/client';
import { useSelector, useStore } from 'react-redux';
import { values } from 'lodash';
import { getRegistrationPathIdForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { buildAdmissionItemsFilter } from './admissionItemsUtils';
import {
  getHasCurrentRegistrationAtLeastOneInPersonAttendee,
  getHasCurrentRegistrationAtLeastOneVirtualAttendee
} from '../../redux/selectors/hybridEventSelectors';

export const GET_ADMISSION_ITEMS = gql`
  query getEvents(
    $eventId: ID!
    $eventSnapshotVersion: String!
    $regPathId: ID!
    $environment: String!
    $regCartId: String
    $filter: Filter
    $includeInPersonCapacity: Boolean!
    $includeVirtualCapacity: Boolean!
  ) {
    eventId @client @export(as: "eventId")
    environment @client @export(as: "environment")
    eventSnapshotVersion @client @export(as: "eventSnapshotVersion")
    getEvent(
      input: {
        eventId: $eventId
        eventSnapshotVersion: $eventSnapshotVersion
        regPathId: $regPathId
        environment: $environment
        regCartId: $regCartId
        filter: $filter
      }
    ) {
      admissionItems {
        id
        name
        visible
        description
        code
        applicableContactTypes
        defaultFeeId
        displayOrder
        capacity {
          inPerson @include(if: $includeInPersonCapacity) {
            available
            total
          }
          virtual @include(if: $includeVirtualCapacity) {
            available
            total
          }
        }
      }
    }
  }
`;

export function useAdmissionItems(widgetId: $TSFixMe, registrationTypeIds: $TSFixMe): $TSFixMe {
  const store = useStore();
  const state = store.getState();
  const regCartId = useSelector(s => (s as $TSFixMe).userSession.regCartId);
  const regPathId = getRegistrationPathIdForWidget(state, widgetId);

  const filter = buildAdmissionItemsFilter(registrationTypeIds || []);

  const includeInPersonCapacity = useSelector(getHasCurrentRegistrationAtLeastOneInPersonAttendee);
  const includeVirtualCapacity = useSelector(getHasCurrentRegistrationAtLeastOneVirtualAttendee);

  const query = useQuery(GET_ADMISSION_ITEMS, {
    variables: {
      regPathId,
      regCartId,
      filter,
      includeInPersonCapacity,
      includeVirtualCapacity
    }
  });

  return query.data?.getEvent?.admissionItems && values(query.data.getEvent.admissionItems);
}
