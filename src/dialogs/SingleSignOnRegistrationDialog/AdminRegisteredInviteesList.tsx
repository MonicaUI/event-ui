import React, { useEffect } from 'react';
import { resolve } from '@cvent/nucleus-dynamic-css';
import { resolveTestId } from '@cvent/nucleus-test-automation';
import { useLazyList } from '@cvent/lazy-rendering-list';
import { RegisteredInvitee } from './RegisteredInvitee';

export default function AdminRegisteredInviteesList({
  translate,
  registeredInvitees,
  classes,
  style,
  dispatchToConfirmationPage,
  ...rest
}: $TSFixMe): $TSFixMe {
  const [maxRegisteredInviteesToDisplay, Sentinel, resetMaxRegisteredInviteesToDisplay] = useLazyList(
    registeredInvitees.length
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(resetMaxRegisteredInviteesToDisplay, [null, registeredInvitees.length]);

  let registeredInviteeIndex = 0;

  function generateRegisteredInvitee(registeredInvitee) {
    const index = registeredInviteeIndex++;
    if (index === maxRegisteredInviteesToDisplay) {
      return <Sentinel key="sentinel" />;
    }
    if (index > maxRegisteredInviteesToDisplay) {
      return null;
    }
    return (
      <div {...resolve(rest, 'invitee')} {...resolveTestId(rest, '-invitee')}>
        <RegisteredInvitee
          registeredInvitee={registeredInvitee}
          classes={classes}
          style={style}
          translate={translate}
          dispatchToConfirmationPage={dispatchToConfirmationPage}
        />
      </div>
    );
  }

  function generateRegisteredInvitees(registeredInviteeList) {
    return (
      <div {...resolve(rest, 'registeredInviteesContainer')} {...resolveTestId(rest, '-registeredInviteesContainer')}>
        {registeredInviteeList.map(generateRegisteredInvitee)}
      </div>
    );
  }
  return generateRegisteredInvitees(registeredInvitees);
}
