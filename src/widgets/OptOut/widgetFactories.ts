export default [
  {
    // Guestsite only widget: opt out and opt in button
    metadata: {
      type: 'OptOutButton',
      name: 'EventWidgets_OptOutButton_WidgetName__resx',
      minCellSize: 1
    },
    creator: (): $TSFixMe =>
      import(/* webpackChunkName: "optOut" */ './content').then((m): $TSFixMe => m.OptOutButtonWidget)
  },
  {
    // Guestsite only widget: opt out and opt in button
    metadata: {
      type: 'ConfirmButton',
      name: 'GuestProductSelection_DialogConfirmButtonText__resx',
      minCellSize: 1
    },
    creator: (): $TSFixMe =>
      import(/* webpackChunkName: "optOut" */ './content').then((m): $TSFixMe => m.ConfirmButtonWidget)
  },
  {
    // Guestsite only widget: opt out/in text
    metadata: {
      type: 'OptOutText',
      name: 'EventWidgets_OptOutText_WidgetName__resx',
      minCellSize: 1
    },
    creator: (): $TSFixMe =>
      import(/* webpackChunkName: "optOut" */ './content').then((m): $TSFixMe => m.OptOutTextWidget)
  },
  {
    // Guestsite only widget: opt out/in text
    metadata: {
      type: 'ContactText',
      name: 'EventWidgets_OptOutText_WidgetName__resx',
      minCellSize: 1
    },
    creator: (): $TSFixMe =>
      import(/* webpackChunkName: "optOut" */ './content').then((m): $TSFixMe => m.ContactTextWidget)
  },
  {
    // Guestsite only widget: opt out/in & (un)subscribe contact information table
    metadata: {
      type: 'OptOutContactInfo',
      name: 'EventWidgets_ContactInfo_WidgetName__resx',
      minCellSize: 1
    },
    creator: (): $TSFixMe =>
      import(/* webpackChunkName: "optOut" */ './content').then((m): $TSFixMe => m.OptOutContactInfoWidget)
  },
  {
    // Guestsite only widget: opt out text for invalid invitees (invitees deleted from the event and contact book).
    metadata: {
      type: 'InvalidOptOutText',
      name: 'EventWidgets_OptOutText_WidgetName__resx',
      minCellSize: 1
    },
    creator: (): $TSFixMe =>
      import(/* webpackChunkName: "optOut" */ './invalidInviteeContent').then(
        (m): $TSFixMe => m.InvalidInviteeOptOutWidget
      )
  }
];
