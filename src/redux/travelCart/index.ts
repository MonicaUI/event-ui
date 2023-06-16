import { lazyLoadAction } from '../../utils/lazyLoad';
import { showAirTravelSummaryView, toggleAirActualSummaryView, toggleGroupFlightSummaryView } from './actions';
import {
  setSelectedAirRequestId,
  removeSelectedAirRequestIds,
  setSelectedAirActualId,
  removeSelectedAirActualIds,
  setSelectedGroupFlightId,
  removeSelectedGroupFlightIds
} from './external';

import reducer from './reducer';
export default reducer;

export const travelCartUpdated = lazyLoadAction(() =>
  import(/* webpackChunkName: "travelRegistration" */ './actions').then(m => m.travelCartUpdated)
);

export const updateUnsavedCreditCard = lazyLoadAction(() =>
  import(/* webpackChunkName: "travelRegistration" */ './actions').then(m => m.updateUnsavedCreditCard)
);

export const restoreTravelCartState = lazyLoadAction(() =>
  import(/* webpackChunkName: "travelRegistration" */ './actions').then(m => m.restoreTravelCartState)
);

export const travelCartNotFound = lazyLoadAction(() =>
  import(/* webpackChunkName: "travelRegistration" */ './actions').then(m => m.travelCartNotFound)
);

export const toggleOwnAccommodation = lazyLoadAction(() =>
  import(/* webpackChunkName: "travelRegistration" */ './actions').then(m => m.toggleOwnAccommodation)
);

export const showHotelRequestSummaryView = lazyLoadAction(() =>
  import(/* webpackChunkName: "travelRegistration" */ './actions').then(m => m.showHotelRequestSummaryView)
);

export const setAnotherHotelRequestFlag = lazyLoadAction(() =>
  import(/* webpackChunkName: "travelRegistration" */ './actions').then(m => m.setAnotherHotelRequestFlag)
);

export const updateExpandedHotels = lazyLoadAction(() =>
  import(/* webpackChunkName: "travelRegistration" */ './actions').then(m => m.updateExpandedHotels)
);

export const resetTravelWidgetsSummaryView = lazyLoadAction(() =>
  import(/* webpackChunkName: "travelRegistration" */ './actions').then(m => m.resetTravelWidgetsSummaryView)
);

export const toggleOwnAirTravelReservation = lazyLoadAction(() =>
  import(/* webpackChunkName: "travelRegistration" */ './actions').then(m => m.toggleOwnAirTravelReservation)
);

export const clearUserSessionData = lazyLoadAction(() =>
  import(/* webpackChunkName: "travelRegistration" */ './actions').then(m => m.clearUserSessionData)
);

export const saveHotelRoomRequests = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "travelRegistration" */ './workflow').then(m => m.saveHotelRoomRequests)
);

export const saveGroupFlightRequests = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "travelRegistration" */ './workflow').then(m => m.saveGroupFlightRequests)
);

export const saveAirRequests = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "travelRegistration" */ './workflow').then(m => m.saveAirRequests)
);

export const saveAirActuals = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "travelRegistration" */ './workflow').then(m => m.saveAirActuals)
);

export const openHotelRequestDeleteConfirmation = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "travelRegistration" */ './workflow').then(m => m.openHotelRequestDeleteConfirmation)
);

export const clearHotelRoomRequests = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "travelRegistration" */ './workflow').then(m => m.clearHotelRoomRequests)
);

export const clearAirRequests = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "travelRegistration" */ './workflow').then(m => m.clearAirRequests)
);

export const clearGroupFlights = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "travelRegistration" */ './workflow').then(m => m.clearGroupFlights)
);

export const onOwnAirTravelReservation = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "travelRegistration" */ './workflow').then(m => m.onOwnAirTravelReservation)
);

export const onClearAirRequests = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "travelRegistration" */ './workflow').then(m => m.onClearAirRequests)
);

export const onClearAirActuals = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "travelRegistration" */ './workflow').then(m => m.onClearAirActuals)
);

export const onClearGroupFlights = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "travelRegistration" */ './workflow').then(m => m.onClearGroupFlights)
);

export const handleRegistrantRemovalInTravelCart = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "travelRegistration" */ './workflow').then(m => m.handleRegistrantRemovalInTravelCart)
);

export const removeStaleBookings = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "travelRegistration" */ './workflow').then(m => m.removeStaleBookings)
);

export const restoreTravelCartIntoState = lazyLoadAction(() =>
  import(/* webpackChunkName: "travelRegistration" */ './external').then(m => m.restoreTravelCartIntoState)
);

export const updateRegTypeAndAdmissionItemIdsInTravelBookings = lazyLoadAction(() =>
  import(/* webpackChunkName: "travelRegistration" */ './external').then(
    m => m.updateRegTypeAndAdmissionItemIdsInTravelBookings
  )
);

export const restoreTransientTravelCartIntoState = lazyLoadAction(() =>
  import(/* webpackChunkName: "travelRegistration" */ './external').then(m => m.restoreTransientTravelCartIntoState)
);

export const saveTravelRegistration = lazyLoadAction(
  () => import(/* webpackChunkName: "travelRegistration" */ './external').then(m => m.saveTravelRegistration),
  true
);

export const restoreTravelRegistration = lazyLoadAction(() =>
  import(/* webpackChunkName: "travelRegistration" */ './external').then(m => m.restoreTravelRegistration)
);

export const startTravelCancellation = lazyLoadAction(() =>
  import(/* webpackChunkName: "travelRegistration" */ './external').then(m => m.startTravelCancellation)
);

export const loadRoommateData = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "travelRegistration" */ './workflow').then(m => m.loadRoommateData)
);

export const searchRoommates = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "travelRegistration" */ './workflow').then(m => m.searchRoommates)
);

export {
  setSelectedAirRequestId,
  setSelectedAirActualId,
  setSelectedGroupFlightId,
  removeSelectedAirActualIds,
  removeSelectedAirRequestIds,
  removeSelectedGroupFlightIds,
  showAirTravelSummaryView,
  toggleAirActualSummaryView,
  toggleGroupFlightSummaryView
};
