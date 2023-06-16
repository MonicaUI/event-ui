import { getRegistrationPathId } from '../redux/selectors/currentRegistrationPath';

export default [
  {
    metadata: {
      type: 'HotelsList',
      name: 'EventWidgets_HotelWebsite_WidgetName__resx',
      minCellSize: 4
    },
    creator: (): $TSFixMe => import('../widgets/EventHotelsList').then((m): $TSFixMe => m.default)
  },
  {
    metadata: {
      type: 'PasskeyHotelRequest',
      name: 'EventWidgets_PasskeyHotelRequest_WidgetName__resx',
      minCellSize: 4
    },
    creator: (): $TSFixMe => import('../widgets/EventPasskeyHotelRequest').then((m): $TSFixMe => m.default)
  },
  {
    metadata: {
      type: 'HotelRequest',
      name: 'EventWidgets_HotelRequest_WidgetName__resx',
      minCellSize: 4
    },
    creator: (): $TSFixMe => import('../widgets/EventHotelRequest').then((m): $TSFixMe => m.default)
  },
  {
    metadata: {
      type: 'AirRequest',
      name: 'EventWidgets_AirRequest_WidgetName__resx',
      minCellSize: 4,
      appDataFieldPaths: {
        airRequestSettings: (state: $TSFixMe): $TSFixMe => {
          const regPathId = getRegistrationPathId(state);
          return `registrationSettings.registrationPaths.${regPathId}.travelSettings.airRequestSettings`;
        }
      }
    },
    creator: (): $TSFixMe => import('../widgets/EventAirRequest').then((m): $TSFixMe => m.default)
  },
  {
    metadata: {
      type: 'AirActual',
      name: 'EventWidgets_WidgetTitleAirActual__resx',
      minCellSize: 4,
      appDataFieldPaths: {
        airActualSettings: (state: $TSFixMe): $TSFixMe => {
          const regPathId = getRegistrationPathId(state);
          return `registrationSettings.registrationPaths.${regPathId}.travelSettings.airActualSettings`;
        }
      }
    },
    creator: (): $TSFixMe => import('../widgets/EventAirActual').then((m): $TSFixMe => m.default)
  },
  {
    metadata: {
      type: 'AirActualSummary',
      name: 'EventWidgets_FlightSummary_WidgetName__resx',
      minCellSize: 4
    },
    creator: (): $TSFixMe => import('../widgets/AirActualSummary').then((m): $TSFixMe => m.default)
  },
  {
    metadata: {
      type: 'FlightItinerarySummary',
      name: 'EventWidgets_FlightSummary_WidgetName__resx',
      minCellSize: 4
    },
    creator: (): $TSFixMe => import('../widgets/FlightItinerarySummary').then((m): $TSFixMe => m.default)
  },
  {
    metadata: {
      type: 'Concur',
      name: 'EventWidgets_Concur_WidgetTitle__resx',
      minCellSize: 4
    },
    creator: (): $TSFixMe => import('../widgets/Concur').then((m): $TSFixMe => m.default)
  },
  {
    metadata: {
      type: 'GroupFlight',
      name: 'Group Flight Booking',
      minCellSize: 4
    },
    creator: (): $TSFixMe => import('../widgets/GroupFlight').then((m): $TSFixMe => m.default)
  },
  {
    metadata: {
      type: 'RegistrationCancellationConcur',
      name: 'EventWidgets_Concur_WidgetTitle__resx',
      isDeletable: false,
      minCellSize: 4
    },
    creator: (): $TSFixMe => import('../widgets/RegistrationCancellationConcur').then((m): $TSFixMe => m.default)
  },
  {
    metadata: {
      type: 'TravelCreditCard',
      name: 'EventWidgets_TravelCreditCard_WidgetName__resx',
      minCellSize: 4,
      appDataFieldPaths: {
        travelCreditCardSettings: (state: $TSFixMe): $TSFixMe => {
          const regPathId = getRegistrationPathId(state);
          return `registrationSettings.registrationPaths.${regPathId}.travelSettings.travelCreditCardSettings`;
        }
      }
    },
    creator: (): $TSFixMe => import('../widgets/TravelCreditCardWidget').then((m): $TSFixMe => m.default)
  },
  {
    metadata: {
      type: 'DeemFlightRequest',
      name: 'EventSiteEditor_DeemFlightRequest_WidgetName__resx',
      minCellSize: 4
    },
    creator: (): $TSFixMe =>
      import('../widgets/DeemFlightRequestWidget/DeemFlightRequestWidget').then((m): $TSFixMe => m.default)
  }
];
