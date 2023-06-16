import { gql, useQuery } from '@apollo/client';
import { useSelector, useStore } from 'react-redux';
import { getRegistrationPathIdForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { getAttendeeType } from './regTypeUtils';
import { values } from 'lodash';

export const GET_REG_TYPES = gql`
  query GetEvents(
    $regCartId: String
    $regPathId: ID!
    $attendeeType: AttendeeType
    $eventId: ID!
    $environment: String!
    $eventSnapshotVersion: String!
  ) {
    eventId @client @export(as: "eventId")
    environment @client @export(as: "environment")
    eventSnapshotVersion @client @export(as: "eventSnapshotVersion")
    getEvent(
      input: {
        eventId: $eventId
        environment: $environment
        eventSnapshotVersion: $eventSnapshotVersion
        regCartId: $regCartId
        regPathId: $regPathId
        attendeeType: $attendeeType
      }
    ) {
      visible
      registrationTypes {
        id
        name
        visible
      }
    }
  }
`;

export function useRegTypes(props: $TSFixMe): $TSFixMe {
  const store = useStore();
  const state = store.getState();
  const regCartId = useSelector(s => (s as $TSFixMe).registrationForm.regCart.regCartId);
  const regPathId = getRegistrationPathIdForWidget(state, props.id);
  const attendeeType = getAttendeeType(state, props);
  const { data } = useQuery(GET_REG_TYPES, {
    variables: {
      regPathId,
      regCartId,
      attendeeType
    }
  });

  const registrationTypes = data?.getEvent?.registrationTypes;

  return values(registrationTypes);
}
