export default [
  {
    // Guestsite only widget: unsubscribe and subscribe button
    metadata: {
      type: 'UnsubscribeButton',
      name: 'EventWidgets_UnsubscribeButton_WidgetName__resx',
      minCellSize: 1
    },
    creator: (): $TSFixMe =>
      import(/* webpackChunkName: "unsubscribe" */ './content').then((m): $TSFixMe => m.UnsubscribeButtonWidget)
  },
  {
    // Guestsite only widget: unsubscribe and subscribe text
    metadata: {
      type: 'UnsubscribeText',
      name: 'EventWidgets_UnsubscribeText_WidgetName__resx',
      minCellSize: 1
    },
    creator: (): $TSFixMe =>
      import(/* webpackChunkName: "unsubscribe" */ './content').then((m): $TSFixMe => m.UnsubscribeTextWidget)
  },
  {
    // Guestsite only widget: opt out/in & (un)subscribe contact information table
    metadata: {
      type: 'UnsubscribeContactInfo',
      name: 'EventWidgets_ContactInfo_WidgetName__resx',
      minCellSize: 1
    },
    creator: (): $TSFixMe =>
      import(/* webpackChunkName: "unsubscribe" */ './content').then(m => m.UnsubscribeContactInfoWidget)
  },
  {
    // Guestsite only widget: link to opt out page
    metadata: {
      type: 'OptOutLinkWidget',
      name: 'EventWidgets_OptOutLink_WidgetName__resx',
      minCellSize: 1
    },
    creator: (): $TSFixMe =>
      import(/* webpackChunkName: "unsubscribe" */ './content').then((m): $TSFixMe => m.OptOutLinkWidget)
  },
  {
    // Guestsite only widget: unsubscribe text for invalid invitee
    metadata: {
      type: 'InvalidInviteeUnsubscribeText',
      name: 'EventWidgets_UnsubscribeText_WidgetName__resx',
      minCellSize: 1
    },
    creator: (): $TSFixMe =>
      import(/* webpackChunkName: "unsubscribe" */ './invalidInviteeContent').then(
        (m): $TSFixMe => m.InvalidInviteeUnsubscribeWidget
      )
  }
];
