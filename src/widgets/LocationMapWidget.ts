import { connect } from 'react-redux';
import LocationMapWidget from 'event-widgets/lib/LocationMap/LocationMapWidget';
import { getAddressWithCountryName } from 'event-widgets/redux/selectors/countryName';
import { getEventLocationMapType } from 'event-widgets/redux/selectors/account';
import { migrateMapTypeIsNeeded } from 'event-widgets/lib/LocationMap/LocationMapUtils';

export default connect((state: $TSFixMe) => {
  const {
    text: { translate }
  } = state;

  const addressWithCountryName = getAddressWithCountryName(state, translate);

  const locationMapType = getEventLocationMapType(state);

  return {
    location: translate(state.event.location),
    address: addressWithCountryName,
    googleApiKey: state.googleMap.apiKey,
    flexEventLocationMapType: migrateMapTypeIsNeeded(locationMapType),
    appleMapToken: state.appleMap.token
  };
})(LocationMapWidget);
