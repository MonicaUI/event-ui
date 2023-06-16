import { connect } from 'react-redux';
import PostRegistrationPaymentWidget from 'event-widgets/lib/PostRegistrationPayment/PostRegistrationPaymentWidget';
import { getSelectedMerchantAccount } from 'event-widgets/redux/selectors';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import { setSelectedPaymentMethod } from '../redux/registrationForm/regCartPayment/actions';
import { getHotelItemAddionalInfo } from '../redux/selectors/payment';
import { finalizePostRegistrationPayment } from '../redux/postRegistrationPayment';
import {
  openPaymentProcessingErrorDialog,
  openPaymentSuccessfulDialog,
  openPaymentAmountServiceFeeConfirmationPostRegDialog
} from '../dialogs';
import { getConfirmationPageIdForInvitee } from '../utils/confirmationUtil';
import { routeToPage } from '../redux/pathInfo';
import { getTotals } from '../redux/postRegistrationPayment/reducer';
import { ProductType } from 'event-widgets/utils/ProductType';
import { CHECKOUT_FAILURE, FINALIZE_CHECKOUT_PAYMENT_FAILURE } from '../redux/registrationForm/regCart/actionTypes';

import {
  RESET_SUBMIT_WEB_PAYMENT,
  STORE_WEBPAYMENT_DATA,
  FINALIZE_POSTREG_CHECKOUT_PENDING,
  FINALIZE_POSTREG_CHECKOUT_COMPLETE
} from '../redux/postRegistrationPayment/actionTypes';

import { CLEAR_ORDERS } from '../redux/actionTypes';
import { getPartialPaymentSettings } from '../redux/selectors/currentRegistrationPath';
import {
  setPartialPaymentRadioButton,
  updatePaymentAmountValue
} from '../redux/registrationForm/regCartPayment/actions';
import { POST_REG_PARTIAL_PAYMENT_RELEASE_VARIANT } from '@cvent/event-ui-experiments';
import getRegCartPricingMergedState from './PaymentWidget/getRegCartPricingAction';
const getPaymentSettings = paymentSettings => {
  return { ...paymentSettings };
};

function getAttendeeTotal(orders, registrantId) {
  let subtotal = 0;
  orders.forEach(order => {
    if (order.orderType === 'OfflineCharge') {
      order.orderItems.forEach(item => {
        if (
          item.productType !== 'Tax' &&
          item.productType !== 'RegistrationTypeServiceFee' &&
          item.productType !== 'PaymentTypeServiceFee' &&
          registrantId === item.registrantId
        ) {
          subtotal += item.amountDue;
        }
      });
    }
  });
  return subtotal;
}

function addToAttendeeList(attendees, order, item, orders) {
  if (attendees.get(item.registrantId) && item.productType !== ProductType.HOTEL_ITEM) {
    attendees.get(item.registrantId).products.push({
      id: item.itemId,
      type: item.productType,
      name: item.itemName,
      price: item.amountDue,
      originalPrice: item.itemPrice,
      quantity: item.quantity,
      originalPricePerItem: item.productPriceTierAmount
    });
  } else {
    if (item.productType !== ProductType.HOTEL_ITEM) {
      attendees.set(item.registrantId, {
        firstName: item.firstName,
        lastName: item.lastName,
        attendeeType: convertAttendeeType(order.attendeeType),
        subtotal: getAttendeeTotal(orders, item.registrantId),
        products: [
          {
            id: item.itemId,
            type: item.productType,
            name: item.itemName,
            price: item.amountDue,
            originalPrice: item.itemPrice,
            quantity: item.quantity,
            originalPricePerItem: item.productPriceTierAmount
          }
        ]
      });
    } else if (!attendees.get(item.registrantId)) {
      attendees.set(item.registrantId, {
        firstName: item.firstName,
        lastName: item.lastName,
        attendeeType: convertAttendeeType(order.attendeeType),
        subtotal: getAttendeeTotal(orders, item.registrantId),
        products: []
      });
    }
  }
}

function addToHotelRooms(hotelRooms, item) {
  const hr = hotelRooms;
  const reservationId = item.hotelOrder.hotelReservationDetailId;
  if (hotelRooms.get(item.registrantId)) {
    if (hotelRooms.get(item.registrantId).reservationIds.get(reservationId)) {
      hr.get(item.registrantId).reservationIds.get(reservationId).quantity += item.quantity;
    } else {
      hotelRooms.get(item.registrantId).reservationIds.set(reservationId, { quantity: item.quantity });
    }
    hr.get(item.registrantId).price += item.amountDue;
    hr.get(item.registrantId).originalPrice += item.itemPrice;
  } else {
    const reservationIds = new Map();
    reservationIds.set(reservationId, { quantity: item.quantity });
    hotelRooms.set(item.registrantId, {
      attendeeId: item.registrantId,
      type: item.productType,
      name: item.itemName,
      price: item.amountDue,
      originalPrice: item.itemPrice,
      primaryReservationId: reservationId,
      reservationIds
    });
  }
}

function mapHotelRoomsToAttendee(hotelRooms, attendees, state) {
  hotelRooms.forEach(room => {
    const hotelPricing = {
      productType: ProductType.HOTEL_ITEM,
      numberOfNights: room.reservationIds.get(room.primaryReservationId).quantity,
      quantity: room.reservationIds.size,
      roomSharingOpted: false
    };
    attendees.get(room.attendeeId).products.push({
      type: room.type,
      name: room.name,
      price: room.price,
      originalPrice: room.originalPrice,
      additionalInfo: getHotelItemAddionalInfo(hotelPricing, state.defaultUserSession.isPlanner, state.text.translate)
    });
  });
}

function getAttendeesDetails(orders, state) {
  const attendees = new Map();
  const hotelRooms = new Map();
  if (orders) {
    orders.forEach(order => {
      if (order.orderType === 'OfflineCharge' || order.orderType === 'OnlineCharge') {
        order.orderItems.forEach(item => {
          if (!isAdditionalFees(item.productType) && item.amountDue > 0) {
            if (item.productType === ProductType.HOTEL_ITEM) {
              addToHotelRooms(hotelRooms, item);
            }
            addToAttendeeList(attendees, order, item, orders);
          }
        });
      }
    });
  }
  if (hotelRooms.size > 0) {
    mapHotelRoomsToAttendee(hotelRooms, attendees, state);
  }
  return Array.from(attendees.values());
}

function isAdditionalFees(productType) {
  return (
    productType === 'Tax' || productType === 'PaymentTypeServiceFee' || productType === 'RegistrationTypeServiceFee'
  );
}

function getTaxesAndServiceFees(orders) {
  const taxInfo = [];
  if (orders) {
    orders.forEach(order => {
      if (order.orderType === 'OfflineCharge' || order.orderType === 'OnlineCharge') {
        order.orderItems.forEach(item => {
          if (isAdditionalFees(item.productType) && item.amountDue > 0) {
            taxInfo.push({
              id: item.itemId,
              name: item.itemName,
              price: item.amountDue,
              originalPrice: item.itemPrice
            });
          }
        });
      }
    });
  }
  return taxInfo;
}

export function getOrderInfo(state: $TSFixMe): $TSFixMe {
  const orders = state.orders;
  const { subtotal, total } = getTotals(orders);
  return {
    order: {
      subTotal: subtotal,
      total,
      attendees: getAttendeesDetails(orders, state),
      additionalItems: getTaxesAndServiceFees(orders)
    }
  };
}

function setPaymentMethodInPostReg(method) {
  return async dispatch => {
    dispatch(setSelectedPaymentMethod(method));
  };
}

function convertAttendeeType(type) {
  switch (type) {
    case 'leader':
      return 'GROUP_LEADER';
    case 'member':
      return 'ATTENDEE';
    case 'guest':
      return 'GUEST';
    default:
      return 'ATTENDEE';
  }
}

export function onComplete(webPaymentData: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe, { apolloClient }: $TSFixMe = {}): Promise<$TSFixMe> => {
    // This prevents double-click scenarios so payment is not submitted twice
    if (getState().postRegistrationPaymentData.isCheckingOut) {
      return;
    }

    dispatch({ type: FINALIZE_POSTREG_CHECKOUT_PENDING });
    try {
      const regStatus = await dispatch(finalizePostRegistrationPayment(webPaymentData));
      if (
        regStatus.statusCode !== 'THIRD_PARTY_REDIRECT' &&
        regStatus.statusCode !== 'THIRD_PARTY_REDIRECT_STARTED' &&
        regStatus.statusCode !== 'SERVICE_FEES_CONFIRMATION_PENDING'
      ) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        const confirmationPageId = await dispatch(getConfirmationPageIdForInvitee(getState()));
        dispatch({ type: CLEAR_ORDERS });
        dispatch(routeToPage(confirmationPageId));
        await dispatch(openPaymentSuccessfulDialog());
      }
      /**
       * If regCart status is SERVICE_FEES_CONFIRMATION_PENDING and regCart pricing has
       * service fees calculated, then service fee confirmation dialog for post reg should be dispatched
       */
      const state = await getRegCartPricingMergedState(getState(), apolloClient);

      const regCartPricing = state.regCartPricing;
      if (
        regStatus.statusCode === 'SERVICE_FEES_CONFIRMATION_PENDING' &&
        regCartPricing &&
        regCartPricing.netFeeAmountChargeWithPaymentAmountServiceFee > regCartPricing.netFeeAmountCharge
      ) {
        dispatch({ type: STORE_WEBPAYMENT_DATA, payload: { webPaymentData } });
        await dispatch(openPaymentAmountServiceFeeConfirmationPostRegDialog());
      }
    } catch (error) {
      dispatch({ type: FINALIZE_CHECKOUT_PAYMENT_FAILURE });
      const dialog = await dispatch(openPaymentProcessingErrorDialog());
      if (dialog !== null) {
        dispatch({ type: CHECKOUT_FAILURE });
        return dialog;
      }
      throw error;
    } finally {
      dispatch({ type: FINALIZE_POSTREG_CHECKOUT_COMPLETE });
    }
  };
}

export function resetSubmit() {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    dispatch({ type: RESET_SUBMIT_WEB_PAYMENT });
  };
}

export default withMappedWidgetConfig(
  connect(
    (state: $TSFixMe, props: $TSFixMe) => {
      const {
        accessToken,
        partialPaymentSettings: { paymentAmountOption, paymentAmount }
      } = state;
      const order = getOrderInfo(state);
      return {
        merchantAccount: getSelectedMerchantAccount(state),
        paymentSettings: getPaymentSettings(props.config.appData.paymentSettings),
        partialPaymentSettings: { ...getPartialPaymentSettings(state), paymentAmountOption, paymentAmount },
        translateCurrency: state.text.resolver.currency,
        orderInfo: order,
        attendeeSubtotal: getTotals(state.orders).subtotal,
        isPlanner: state.defaultUserSession.isPlanner,
        accessToken,
        submit: state.registrationForm ? state.postRegistrationPaymentData.submitWebPayment : false,
        webPaymentUrl: state.webPaymentsSettings?.webPaymentsEndpoint,
        applicationId: state.webPaymentsSettings?.webPaymentsDefaultApplicationId,
        cardTypes: state.event.selectedPaymentTypesSnapshot.paymentMethodTypes,
        locale: state.text.locale,
        hasValidExperiment: state?.experiments?.flexProductVersion >= POST_REG_PARTIAL_PAYMENT_RELEASE_VARIANT
      };
    },
    {
      setSelectedPaymentMethod: setPaymentMethodInPostReg,
      onComplete,
      resetSubmit,
      setPartialPaymentRadioButton,
      updatePartialPaymentAmount: updatePaymentAmountValue
    }
  )(PostRegistrationPaymentWidget)
);
