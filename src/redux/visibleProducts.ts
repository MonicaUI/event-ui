import {
  LOAD_VISIBLE_PRODUCTS,
  LOAD_REG_CART_VISIBLE_PRODUCTS,
  REPLACE_VISIBLE_SESSION_PRODUCTS,
  LOAD_VISIBLE_SESSION_PRODUCTS,
  LOAD_VISIBLE_PRODUCTS_BY_REG_TYPE
} from './actionTypes';
import { UPDATE_REG_CART_SUCCESS } from './registrationForm/regCart/actionTypes';
import {
  getRegistrationTypeId as getCurrentRegistrationTypeId,
  getSelectedAdmissionItem as getCurrentSelectedAdmissionItem,
  getMultipleSelectedAdmissionItems as getAllEventRegSelectedAdmissionItem,
  getEventRegistration as getCurrentEventRegistration,
  getRegistrationTypeIdForAgenda
} from './selectors/currentRegistrant';
import { getRegistrationPathIdOrNull as getCurrentRegistrationPathId } from './selectors/currentRegistrationPath';
import {
  getEventRegistration,
  getPrimaryRegistrationId,
  getRegistrationTypeId,
  getRegistrationPathId,
  getSelectedAdmissionItem
} from './registrationForm/regCart/selectors';
import { getRegCart } from './selectors/shared';
import { keys, map, get, merge } from 'lodash';
import { refPreserving } from '@cvent/ref-preserving-function';
import { isFlexBearerAuthRemovalOn } from '../ExperimentHelper';
import { handleUserSessionTimeoutErrors } from '../errorHandling/userSessionTimeoutErrors';
import { AnyAction } from 'redux';
import { AppThunk, AsyncAppThunk, RootState } from './reducer';
import { ProductRegistration } from '@cvent/flex-event-shared';
import { redirectToPage } from './pathInfo';
import { logoutRegistrant } from './registrantLogin/actions';

const initialState = {};

export const getEventRegVisibleProducts = (
  widgetType: string,
  widgetId: string,
  selectedAdmissionItems: Array<ProductRegistration>
): AppThunk<Promise<unknown>> => {
  return async (dispatch, getState) => {
    const {
      accessToken,
      defaultUserSession: { eventId },
      eventSnapshotVersion,
      clients: { productVisibilityClient },
      experiments
    } = getState();
    const eventRegVisibleProducts = {};
    try {
      await Promise.all(
        selectedAdmissionItems.map(async selectedAdmissionItem => {
          const admissionId = selectedAdmissionItem ? selectedAdmissionItem.productId : null;
          const visibleProducts = await productVisibilityClient.getVisibleProducts(accessToken, eventId, {
            version: eventSnapshotVersion,
            widgetType,
            widgetId,
            admissionId
          });
          if (visibleProducts) {
            Object.keys(visibleProducts).forEach(productEntry => {
              eventRegVisibleProducts[productEntry] = merge(
                eventRegVisibleProducts[productEntry],
                visibleProducts[productEntry]
              );
            });
          }
        })
      );
    } catch (error) {
      if (error.responseStatus === 401) {
        if (isFlexBearerAuthRemovalOn(getState()) && !experiments.useProductVisibilityService) {
          return dispatch(handleUserSessionTimeoutErrors(error.responseHeaders));
        }
        logoutRegistrant();
        dispatch(redirectToPage(''));
      }
      throw error;
    }
    return eventRegVisibleProducts;
  };
};

type EventRegistration = {
  eventRegistrationId: string;
};
type EventRegistrationAndVisibleProducts = {
  eventRegistration: EventRegistration;
  visibleProducts: Array<Record<string, unknown>>;
};
const getVisibleProducts = async (
  state: RootState,
  eventRegistrationId?: string,
  widgetType?: string
): Promise<EventRegistrationAndVisibleProducts> => {
  const {
    accessToken,
    defaultUserSession: { eventId },
    eventSnapshotVersion,
    clients: { productVisibilityClient }
  } = state;

  const regCart = getRegCart(state);
  const eventRegistration = eventRegistrationId
    ? getEventRegistration(regCart, eventRegistrationId)
    : getCurrentEventRegistration(state);
  const registrationTypeId = eventRegistrationId
    ? getRegistrationTypeId(regCart, eventRegistrationId)
    : getCurrentRegistrationTypeId(state);
  const registrationPathId = eventRegistrationId
    ? getRegistrationPathId(regCart, eventRegistrationId)
    : getCurrentRegistrationPathId(state);
  const selectedAdmissionItem = eventRegistrationId
    ? getSelectedAdmissionItem(regCart, eventRegistrationId)
    : getCurrentSelectedAdmissionItem(state);
  const admissionId = selectedAdmissionItem ? selectedAdmissionItem.productId : null;
  const attendeeType = eventRegistration.attendeeType;
  const primaryEventRegistrationId =
    attendeeType === 'GUEST' ? eventRegistration.primaryRegistrationId : getPrimaryRegistrationId(regCart);
  const primaryEventRegistration = getEventRegistration(regCart, primaryEventRegistrationId);
  const primaryRegistrationTypeId = primaryEventRegistration.registrationTypeId;

  const options = {
    version: eventSnapshotVersion,
    registrationTypeId,
    registrationPathId,
    primaryRegistrationTypeId,
    admissionId,
    attendeeType,
    widgetType
  };
  const visibleProducts = await productVisibilityClient.getVisibleProducts(accessToken, eventId, options);
  return { eventRegistration, visibleProducts };
};

export function populateVisibleProducts(eventRegistrationId?: string, widgetType = 'Sessions'): AsyncAppThunk {
  return async (dispatch, getState) => {
    try {
      const { eventRegistration, visibleProducts } = await getVisibleProducts(
        getState(),
        eventRegistrationId,
        widgetType
      );
      dispatch({
        type: LOAD_VISIBLE_SESSION_PRODUCTS,
        payload: {
          eventRegistrationId: eventRegistration.eventRegistrationId,
          visibleProducts
        }
      });
    } catch (error) {
      if (error.responseStatus === 401) {
        if (isFlexBearerAuthRemovalOn(getState()) && !getState().experiments.useProductVisibilityService) {
          return dispatch(handleUserSessionTimeoutErrors(error.responseHeaders));
        }
        logoutRegistrant();
        dispatch(redirectToPage(''));
      }
      throw error;
    }
  };
}

/**
 * This is both a reset and populate action in one, it overwrites the visible products rather than merge changes
 * This was introduced to avoid ui glitches caused by clearing and repopulating the visible products
 */
export function replaceVisibleProducts(eventRegistrationId?: string, widgetType = 'Sessions'): AsyncAppThunk {
  return async (dispatch, getState) => {
    try {
      const { eventRegistration, visibleProducts } = await getVisibleProducts(
        getState(),
        eventRegistrationId,
        widgetType
      );
      dispatch({
        type: REPLACE_VISIBLE_SESSION_PRODUCTS,
        payload: {
          eventRegistrationId: eventRegistration.eventRegistrationId,
          visibleProducts
        }
      });
    } catch (error) {
      if (error.responseStatus === 401) {
        if (isFlexBearerAuthRemovalOn(getState()) && !getState().experiments.useProductVisibilityService) {
          return dispatch(handleUserSessionTimeoutErrors(error.responseHeaders));
        }
        logoutRegistrant();
        dispatch(redirectToPage(''));
      }
      throw error;
    }
  };
}

export function populateAllProductsByRegistrationType(widgetType: string, widgetId = null): AsyncAppThunk {
  return async (dispatch, getState) => {
    const {
      accessToken,
      defaultUserSession: { eventId },
      eventSnapshotVersion,
      clients: { productVisibilityClient },
      visibleProducts: existingVisibleProducts,
      experiments
    } = getState();
    const widget = widgetId != null ? `${widgetType}:${widgetId}` : widgetType;
    const calculatedRegistrationTypeId = getRegistrationTypeIdForAgenda(getState());
    if (get(existingVisibleProducts, [widget, calculatedRegistrationTypeId, 'visibleProducts'])) {
      return;
    }
    try {
      const visibleProducts = await productVisibilityClient.getVisibleProducts(accessToken, eventId, {
        version: eventSnapshotVersion,
        registrationTypeId: calculatedRegistrationTypeId,
        widgetType,
        widgetId
      });
      dispatch({
        type: LOAD_VISIBLE_PRODUCTS_BY_REG_TYPE,
        payload: {
          widget,
          calculatedRegistrationTypeId,
          visibleProducts
        }
      });
    } catch (error) {
      if (error.responseStatus === 401) {
        if (isFlexBearerAuthRemovalOn(getState()) && !experiments.useProductVisibilityService) {
          return dispatch(handleUserSessionTimeoutErrors(error.responseHeaders));
        }
        logoutRegistrant();
        dispatch(redirectToPage(''));
      }
      throw error;
    }
  };
}

export function populateAllProducts(widgetType: string, widgetId = null): AsyncAppThunk {
  return async (dispatch, getState) => {
    const {
      accessToken,
      defaultUserSession: { eventId },
      eventSnapshotVersion,
      clients: { productVisibilityClient },
      visibleProducts: existingVisibleProducts,
      experiments
    } = getState();
    const widget = widgetId != null ? `${widgetType}:${widgetId}` : widgetType;
    if (get(existingVisibleProducts, [widget, 'visibleProducts'])) {
      return;
    }
    let visibleProducts;
    const selectedAdmissionItems = getAllEventRegSelectedAdmissionItem(getState());
    try {
      if (selectedAdmissionItems && selectedAdmissionItems.length > 0) {
        visibleProducts = await dispatch(getEventRegVisibleProducts(widgetType, widgetId, selectedAdmissionItems));
      } else {
        visibleProducts = await productVisibilityClient.getVisibleProducts(accessToken, eventId, {
          version: eventSnapshotVersion,
          widgetType,
          widgetId,
          admissionId: null
        });
      }
      dispatch({
        type: LOAD_VISIBLE_PRODUCTS,
        payload: {
          widget,
          visibleProducts
        }
      });
    } catch (error) {
      if (error.responseStatus === 401) {
        if (isFlexBearerAuthRemovalOn(getState()) && !experiments.useProductVisibilityService) {
          return dispatch(handleUserSessionTimeoutErrors(error.responseHeaders));
        }
        logoutRegistrant();
        dispatch(redirectToPage(''));
      }
      throw error;
    }
  };
}

export function populateRegCartVisibleProducts(): AsyncAppThunk {
  return async (dispatch, getState) => {
    const {
      accessToken,
      defaultUserSession: { eventId },
      eventSnapshotVersion,
      clients: { eventSnapshotClient },
      experiments
    } = getState();

    const regCart = getRegCart(getState());
    try {
      const visibleProducts = await eventSnapshotClient.getRegCartVisibleProducts(accessToken, eventId, {
        version: eventSnapshotVersion,
        regCartId: regCart.regCartId
      });
      dispatch({
        type: LOAD_REG_CART_VISIBLE_PRODUCTS,
        payload: visibleProducts
      });
    } catch (error) {
      if (error.responseStatus === 401) {
        if (isFlexBearerAuthRemovalOn(getState()) && !experiments.useProductVisibilityService) {
          return dispatch(handleUserSessionTimeoutErrors(error.responseHeaders));
        }
      }
      if (
        error?.responseBody &&
        error.responseStatus === 422 &&
        error.responseBody.message === 'error retrieving reg cart'
      ) {
        // the rest was already set in motion to handle this - redirecting to summary page. we do nothing in this event.
        return;
      }
      throw error;
    }
  };
}

/**
 * Reducer to keep track of visible products per registrant
 */
function visibleProductsReducer(state = initialState, action: AnyAction) {
  switch (action.type) {
    case LOAD_VISIBLE_SESSION_PRODUCTS:
      return {
        ...state,
        Sessions: {
          ...(state as $TSFixMe).Sessions,
          [action.payload.eventRegistrationId]: {
            ...action.payload.visibleProducts
          }
        }
      };
    case LOAD_VISIBLE_PRODUCTS_BY_REG_TYPE:
      return {
        ...state,
        [action.payload.widget]: {
          ...state[action.payload.widget],
          [action.payload.calculatedRegistrationTypeId]: {
            ...action.payload.visibleProducts
          }
        }
      };
    case LOAD_VISIBLE_PRODUCTS:
      return {
        ...state,
        [action.payload.widget]: {
          ...action.payload.visibleProducts
        }
      };
    case LOAD_REG_CART_VISIBLE_PRODUCTS:
      return {
        ...state,
        Sessions: {
          ...action.payload
        }
      };
    case UPDATE_REG_CART_SUCCESS: {
      // check if any event reg has been removed and remove visible products for that event reg
      const eventRegistrationIdsToRemove = [];
      // get the regCart with unsaved changes for group member to prevent page flashing products.
      const savedRegCart = action.payload.regCart;
      const widgetType = 'Sessions';
      keys(state[widgetType]).forEach((eventRegistrationId: string) => {
        if (
          !keys(savedRegCart.eventRegistrations).find(
            (regCartEventRegistrationId: string) => regCartEventRegistrationId === eventRegistrationId
          )
        ) {
          eventRegistrationIdsToRemove.push(eventRegistrationId);
        }
      });
      const remainedVisibleProducts = { ...state[widgetType] };
      map(
        eventRegistrationIdsToRemove,
        (eventRegistreationIdToRemove: string) => delete remainedVisibleProducts[eventRegistreationIdToRemove]
      );
      return {
        ...state,
        [widgetType]: { ...remainedVisibleProducts }
      };
    }
    case REPLACE_VISIBLE_SESSION_PRODUCTS:
      return {
        ...initialState,
        Sessions: {
          [action.payload.eventRegistrationId]: {
            ...action.payload.visibleProducts
          }
        }
      };
    default:
      return state;
  }
}
export default refPreserving(visibleProductsReducer);
