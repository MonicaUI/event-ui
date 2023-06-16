import { connect } from 'react-redux';
import HotelsListWidget from 'event-widgets/lib/HotelsList/HotelsListWidget';

/**
 * Data wrapper for hotel list widget
 */
export default connect((state: $TSFixMe) => {
  // check if hotel website is enabled in planner config
  const isHotelWebsiteEnabled =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    state.eventTravel && state.eventTravel.hotelsData && state.eventTravel.hotelsData.isHotelWebsiteEnabled;
  return {
    hotelsData: {
      ...state.eventTravel.hotelsData,
      hotels: state.eventTravel.hotelsData.hotels.filter(hotel => hotel.isActive),
      isHotelWebsiteEnabled
    }
  };
})(HotelsListWidget);
