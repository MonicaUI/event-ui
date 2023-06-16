import { connect } from 'react-redux';
import LocationWidget from 'nucleus-widgets/lib/Location/LocationWidget';
import { getCountryName } from 'event-widgets/redux/selectors/countryName';

/**
 * Data wrapper for the event location widget.
 */

export default connect((state: $TSFixMe) => {
  const {
    text: { translate }
  } = state;
  const countryName = getCountryName(state, translate);

  const addressWithCountryName = {
    ...state.event.address,
    countryName
  };

  return {
    location: translate(state.event.location),
    address: addressWithCountryName
  };
})(LocationWidget);
