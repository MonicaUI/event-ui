import React from 'react';
import PlainTextWidget from 'event-widgets/lib/PlainText/PlainTextWidget';
import { formatAttendeeNameFromResource } from 'event-widgets/utils/formatAttendeeName';
import { useInvitee } from '../inviteeInfo';

/**
 * Data wrapper for virtual details invitee widget
 */
export default function VirtualDetailsInviteeWidgetWrapper(props: $TSFixMe): $TSFixMe {
  const query = useInvitee();
  const { data } = query;
  const {
    translate,
    style,
    config: { text }
  } = props;
  const firstName = data?.invitee?.inviteeFirstName;
  const lastName = data?.invitee?.inviteeLastName;
  const fullName = formatAttendeeNameFromResource({ firstName, lastName }, translate);
  const inviteeDetails = translate(text, { fullName });
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return fullName && fullName.trim() ? (
    <PlainTextWidget text={inviteeDetails} translate={translate} style={style} />
  ) : null;
}
