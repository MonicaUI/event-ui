export default [
  {
    // Guestsite only widget: virtual details join session button
    metadata: {
      type: 'VirtualDetailsJoinButton',
      name: 'EventGuestSideWidgets_VirtualDetailsJoinButton_WidgetName__resx',
      minCellSize: 1
    },
    creator: (): $TSFixMe =>
      import(/* webpackChunkName: "virtualDetails" */ './content').then((m): $TSFixMe => m.VirtualDetailsJoinButton)
  },
  {
    // Guestsite only widget: virtual details invitee details
    metadata: {
      type: 'VirtualDetailsInvitee',
      name: 'EventGuestSideWidgets_VirtualDetailsInvitee_WidgetName__resx',
      minCellSize: 1
    },
    creator: (): $TSFixMe =>
      import(/* webpackChunkName: "virtualDetails" */ './content').then(
        (m): $TSFixMe => m.VirtualDetailsInviteeWidgetWrapper
      )
  },
  {
    // Guestsite only widget: virtual details password details
    metadata: {
      type: 'VirtualDetailsPassword',
      name: 'EventGuestSideWidgets_VirtualDetailsPassword_WidgetName__resx',
      minCellSize: 1
    },
    creator: (): $TSFixMe =>
      import(/* webpackChunkName: "virtualDetails" */ './content').then((m): $TSFixMe => m.VirtualDetailsPasswordWidget)
  },
  {
    // Guestsite only widget: virtual details generic message
    metadata: {
      type: 'GenericMessage',
      name: 'EventGuestSideWidgets_GenericMessage_WidgetName__resx',
      minCellSize: 1
    },
    creator: (): $TSFixMe =>
      import(/* webpackChunkName: "virtualDetails" */ './content').then((m): $TSFixMe => m.GenericMessageWidget)
  },
  {
    // Guestsite only widget: virtual details session not available
    metadata: {
      type: 'SessionNotAvailableMessage',
      name: 'EventGuestSideWidgets_SessionNotAvailableMessage_WidgetName__resx',
      minCellSize: 1
    },
    creator: (): $TSFixMe =>
      import(/* webpackChunkName: "virtualDetails" */ './content').then(m => m.SessionNotAvailableMessageWidget)
  }
];
