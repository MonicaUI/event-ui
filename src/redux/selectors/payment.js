import { defaultMemoize, createSelectorCreator, createSelector } from 'reselect';
import { find, map, isEqual, mapValues, keyBy, isEmpty, sortBy } from 'lodash';
import { getAdmissionItems, getGroupFlights, getPaidRooms } from '../reducer';
import { isFeesEnabled } from './event';
import { isGroupRegistration } from './currentRegistrant';
import { getRegCart } from './shared';
import { flatten } from 'lodash';
import { getIn } from 'icepick';
import { getGuestsOfRegistrant, getEventRegistration, getPrimaryRegistrationId }
  from '../registrationForm/regCart/selectors';
import {
  getAllSortedQuantityItemsForWidget,
  getAllSortedDonationItemsForWidget,
  getAllSortedSessionsForPayments
} from './productSelectors';
import { GROUP_FLIGHT_PRODUCT_NAME } from 'event-widgets/lib/GroupFlight/util/Constants';
import { ProductType } from 'event-widgets/utils/ProductType';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
import { CREDIT_CARD_FOR_LATER_PROCESSING_WEBPAYMENTS_FORM_VARIANT } from '@cvent/event-ui-experiments';
import { allSessionBundlesVar as sessionBundles}  from 'event-widgets/lib/Sessions/useVisibleSessionBundles';

const getGroupFlightName = (product, airports) => {
  if (!product.useDefaultDisplayName) {
    return product.name;
  }
  const { city: arrivalCity, code: arrivalAirportCode } = airports[product.arrivalAirportId];
  const { city: departureCity, code: departureAirportCode } = airports[product.departingAirportId];

  return `${departureCity} (${departureAirportCode}) to ${arrivalCity} (${arrivalAirportCode})`;
};

const getProductName = (product, type, translate, airports) => {
  switch (type) {
    case ProductType.ADMISSION_ITEM:
    case ProductType.SESSION:
    case ProductType.QUANTITY_ITEM:
    case ProductType.DONATION_ITEM:
      return product.name;
    case ProductType.SESSION_BUNDLE:
      return sessionBundles()[product.productId]?.name;
    case ProductType.HOTEL_ITEM:
      return translate('EventWidgets_HotelRequest_RoomTypeFollowedByHotelName__resx',
        { hotelName: translate(product.hotelName), roomType: translate(product.roomTypeName) });
    case GROUP_FLIGHT_PRODUCT_NAME:
      return getGroupFlightName(product, airports);
    default:
      return 'Unknown';
  }
};


export const getHotelItemAddionalInfo = (pricingCharge, isPlanner, translate) => {
  let resx = '';

  if (isPlanner) {
    resx = pricingCharge.quantity === 1 ? 'EventWidgets_OrderSummary_RoomRequired_PlannerSide__resx' :
      'EventWidgets_OrderSummary_RoomsRequired_PlannerSide__resx';
    return translate(resx, { numberOfRooms: pricingCharge.quantity });
  }

  if (pricingCharge.roomSharingOpted) {
    resx = (pricingCharge.numberOfNights === 1) ? 'EventWidgets_HotelRequest_SharedRoomSingleNight__resx' :
      'EventWidgets_HotelRequest_SharedRoomMultipleNights__resx';
    return translate(resx, { numberOfNights: pricingCharge.numberOfNights });
  }

  if (pricingCharge.quantity === 1 && pricingCharge.numberOfNights === 1) {
    resx = 'EventWidgets_HotelRequest_SingleRoomSingleNight__resx';
  } else if (pricingCharge.quantity > 1 && pricingCharge.numberOfNights === 1) {
    resx = 'EventWidgets_HotelRequest_MultipleRoomsSingleNight__resx';
  } else if (pricingCharge.quantity === 1 && pricingCharge.numberOfNights > 1) {
    resx = 'EventWidgets_HotelRequest_SingleRoomMultipleNight__resx';
  } else {
    resx = 'EventWidgets_HotelRequest_MultipleRoomsMultipleNight__resx';
  }
  return translate(resx,
    { numberOfRooms: pricingCharge.quantity, numberOfNights: pricingCharge.numberOfNights });
};

const getProductAdditionalInfo = (product, pricingCharge, isPlanner, translate) => {
  if (product.productType === ProductType.HOTEL_ITEM) {
    return getHotelItemAddionalInfo(pricingCharge, isPlanner, translate);
  }
  return;
};

const isProductIncluded = (productId, eventRegistrationAttendeeInfo) => {
  const session = eventRegistrationAttendeeInfo.sessionRegistrations[productId];
  return session && session.registrationSourceType === ProductType.ADMISSION_ITEM;
};

const hasPricing = (regCartPricing) => {
  return regCartPricing && regCartPricing.eventRegistrationPricings;
};
/**
 * Gets the products the attendee has selected during checkout.
 * It is understood that an event registration directly correlates to a single attendee.
 */
export const getEventRegPricing = (regCartPricing, eventRegistrationId) => {
  if (hasPricing(regCartPricing)) {
    return find(regCartPricing.eventRegistrationPricings, (eventRegistationPricing) => {
      return eventRegistrationId === eventRegistationPricing.eventRegistrationId;
    });
  }
  return undefined;
};

/**
 * Badly named selector. Returns a list of product pricing breakdown objects, which each
 * contain a list of charges. Not the list of charges themselves.
 * @param eventRegPricing
 */
export const getProductCharges = (eventRegPricing) => {
  const filteredPricingCharges = eventRegPricing && eventRegPricing.productPricings &&
    eventRegPricing.productPricings.map((product) => {
      return {
        ...product,
        pricingCharges: product.pricingCharges && product.pricingCharges.filter(charge => charge.feeId)
      };
    });

  return filteredPricingCharges && filteredPricingCharges.filter(product =>
    (product.pricingCharge && product.pricingCharge.feeId) ||
    (product.pricingCharges && product.pricingCharges.length > 0));
};

const getProductRefunds = (eventRegPricing) => {
  return eventRegPricing && eventRegPricing.productPricings
    && eventRegPricing.productPricings
      .filter(product => product.pricingRefunds && product.pricingRefunds.length > 0);
};

export const getEventRegistrationAttendeeInfos = createSelectorCreator(defaultMemoize, isEqual)(
  createSelector(
    state => state.registrationForm.regCart.eventRegistrations,
    eventRegistrations => map(eventRegistrations, eventRegistration => {
      const {
        eventRegistrationId, attendee: { personalInformation: { firstName, lastName }, availablePaymentCredits,
          pendingPaymentCredits }, sessionRegistrations, attendeeType, displaySequence, registrationStatus = undefined
      } = eventRegistration;
      return {
        eventRegistrationId, firstName, lastName, attendeeType, sessionRegistrations,
        displaySequence, registrationStatus, availablePaymentCredits, pendingPaymentCredits
      };
    })),
  eventRegistrationAttendeeInfos => eventRegistrationAttendeeInfos
);

/*
 * If a discount has been applied, return product's productPriceTierBaseFeeAmountPerItem, else
 * return product's productFeeAmountCharge
 */
export const getInitialOverrideProductFees = createSelector(
  getEventRegistrationAttendeeInfos,
  (state) => state.regCartPricing,
  (eventRegistrationAttendeeInfos, regCartPricing) => {
    return mapValues(keyBy(eventRegistrationAttendeeInfos, 'eventRegistrationId'), eventRegistrationAttendeeInfo => {
      const attendeeProducts = getEventRegPricing(regCartPricing, eventRegistrationAttendeeInfo.eventRegistrationId)
        .productPricings
        .filter(product => (product.pricingCharge || (product.pricingCharges && product.pricingCharges.length > 0)));
      const editedPrices = attendeeProducts.flatMap((productPricing) => {
        const product = productPricing;
        if (product.pricingCharge) {
          product.pricingCharges = [product.pricingCharge];
        }
        return product.pricingCharges && product.pricingCharges.map(charge =>
          charge.productPriceTierBaseFeeAmountPerItem !== product.productFeeAmountCharge);
      });
      const feesAfterEdit = mapValues(mapValues(keyBy(attendeeProducts, 'productId'),
        'pricingCharge.productPriceTierBaseFeeAmountPerItem'), fee => fee && fee.toString());
      const feesWithoutEdit = mapValues(mapValues(keyBy(attendeeProducts, 'productId'), 'productFeeAmountCharge'),
        fee => fee.toString());
      return editedPrices.includes(true) ? feesAfterEdit : feesWithoutEdit;
    });
  }
);

/*
 * If refunding a quantity item, return product's productPriceTierBaseFeeAmountPerItem, else
 * return product's productFeeAmountRefund
 */
export const getInitialOverrideProductRefunds = createSelector(
  getEventRegistrationAttendeeInfos,
  (state) => state.regCartPricing,
  (eventRegistrationAttendeeInfos, regCartPricing) => {
    return mapValues(keyBy(eventRegistrationAttendeeInfos, 'eventRegistrationId'), eventRegistrationAttendeeInfo => {
      const attendeeProductsRemoved = getEventRegPricing(regCartPricing,
        eventRegistrationAttendeeInfo.eventRegistrationId)
        .productPricings
        .filter(product => product.pricingRefunds.length > 0 && product.productType !== ProductType.HOTEL_ITEM);
      const pricingRefunds = {};
      attendeeProductsRemoved.forEach(attendeeProductRemoved => {
        attendeeProductRemoved.pricingRefunds.forEach(refund => {
          pricingRefunds[refund.chargeOrderDetailId] = refund.productPriceTierBaseFeeAmountPerItem &&
            refund.productPriceTierBaseFeeAmountPerItem.toString();
        });
      });
      return pricingRefunds;
    });
  }
);

const getRegCartPricingFromProps = (_, pricing) => pricing;

const hasRefund = createSelector(
  getEventRegistrationAttendeeInfos,
  getRegCartPricingFromProps,
  isFeesEnabled,
  (eventRegistrationAttendeeInfos, regCartPricing, feesEnabled) => {
    if (!feesEnabled || !hasPricing(regCartPricing)) {
      return false;
    }
    return eventRegistrationAttendeeInfos.some(
      eventRegistrationAttendeeInfo => {
        const eventRegPricing = getEventRegPricing(regCartPricing, eventRegistrationAttendeeInfo.eventRegistrationId);
        const productRefunds = getProductRefunds(eventRegPricing);
        return productRefunds && productRefunds.length > 0;
      });
  }
);

/**
 * Filters who is shown on payment widget based on their attendeeType
 * 1) If they have products to be shown, return true
 * 2) If AttendeeType is ATTENDEE or GROUP_LEADER, return true if
 *   a) They have guests who are to be shown
 *   b) They have products that need to be shown on order / refund summary
 */
const filterAttendeesBasedOnAttendeeType = (attendee, regCart, regCartPricing, isRefund = false) => {
  if (!attendee) {
    return false;
  }

  if (!isEmpty(attendee.products)) {
    return true;
  }

  if (attendee.attendeeType === 'GUEST') {
    return false;
  }
  let hasGuestThatNeedsToBeShown = false;
  const registeredGuests = getGuestsOfRegistrant(regCart, attendee.id);
  const unregisteredGuests = getGuestsOfRegistrant(regCart, attendee.id, 'UNREGISTER');
  ((registeredGuests || []).concat(unregisteredGuests)).forEach((guestAttendee) => {
    const eventRegPricing = getEventRegPricing(regCartPricing,
      guestAttendee.eventRegistrationId);
    const productChargesOrRefunds = !isRefund ? getProductCharges(eventRegPricing)
      : getProductRefunds(eventRegPricing);
    if (!isEmpty(productChargesOrRefunds)) {
      hasGuestThatNeedsToBeShown = true;
    }
  });
  return hasGuestThatNeedsToBeShown;
};

/**
 * A selector to get the necessary payment information required for
 * display.
 */
export const getPaymentInfo = createSelector(
  getEventRegistrationAttendeeInfos,
  getRegCartPricingFromProps,
  // Todo: As we get more product types add to this selector.
  createSelector(
    getAdmissionItems,
    state => getAllSortedSessionsForPayments(state),
    getPaidRooms,
    getGroupFlights,
    state => getAllSortedQuantityItemsForWidget(state),
    state => getAllSortedDonationItemsForWidget(state),
    (admissionItems, sessions, paidRooms, groupFlights, quantityItems, donationItems) =>
      ({ ...admissionItems, ...keyBy(sessions, 'id'), ...paidRooms, ...keyBy(groupFlights, 'id'),
        ...keyBy(quantityItems, 'id'), ...keyBy(donationItems, 'id') })),
  hasRefund,
  isGroupRegistration,
  getRegCart,
  state => state.defaultUserSession.isPlanner,
  state => state.text.translate,
  state => state.airports,
  (eventRegistrationAttendeeInfos, regCartPricing, allProducts, showRefund, isGroupReg, regCart, isPlanner,
    translate, airports) => {
    if (!hasPricing(regCartPricing)) {
      return {};
    }
    const eventRegistrations = regCart.eventRegistrations;
    return {
      order: {
        subTotal: regCartPricing.productSubTotalAmountCharge,
        // once the pop will be added , then netFeeAmountCharge will be shown here
        total: regCartPricing.netFeeAmountCharge,
        paymentCreditsForEventReg: regCartPricing.paymentCreditsForEventReg,
        attendees: map(eventRegistrationAttendeeInfos, eventRegistrationAttendeeInfo => {
          const eventRegPricing = getEventRegPricing(regCartPricing,
            eventRegistrationAttendeeInfo.eventRegistrationId);
          const productPricings = getProductCharges(eventRegPricing);
          if (!productPricings) {
            return {};
          }
          return {
            id: eventRegistrationAttendeeInfo.eventRegistrationId,
            firstName: eventRegistrationAttendeeInfo.firstName,
            lastName: eventRegistrationAttendeeInfo.lastName,
            attendeeType: eventRegistrationAttendeeInfo.attendeeType,
            displayOrder: eventRegistrationAttendeeInfo.displaySequence,
            registrationStatus: eventRegistrationAttendeeInfo.registrationStatus,
            subtotal: eventRegPricing.productSubTotalAmountCharge,
            primaryRegistrationId: eventRegistrations[
              eventRegistrationAttendeeInfo.eventRegistrationId].primaryRegistrationId,
            availablePaymentCredits: eventRegistrationAttendeeInfo.availablePaymentCredits,
            pendingPaymentCredits: eventRegistrationAttendeeInfo.pendingPaymentCredits,
            products: productPricings.map(product => {
              // Discounted line item always on top. Smallest price per item
              const charges = product.pricingCharges.sort((charge1, charge2) =>
                charge1.productFeeAmountPerItem - charge2.productFeeAmountPerItem);

              const primaryCharge = charges[0];
              const subtotalBeforeDiscount = charges
                .map(charge => charge.productFeeAmount)
                .reduce((x, y) => x + y, 0);
              const totalQuantity = charges
                .map(charge => charge.quantity)
                .reduce((x, y) => x + y, 0);

              const productLevelLineItemProps = {
                id: product.productId,
                type: product.productType
              };

              const chargeLineItemProps = charge => (charge && {
                ...productLevelLineItemProps,
                price: charge.productSubTotalAmount,
                pricePerItem: charge.productFeeAmountPerItem,
                originalPrice: charge.productFeeAmount,
                originalPricePerItem: charge.productPriceTierBaseFeeAmountPerItem,
                quantity: charge.quantity,
                quantityPrevious: charge.quantityPrevious
              }) || productLevelLineItemProps;

              return {
                ...chargeLineItemProps(primaryCharge),
                isIncluded: isProductIncluded(product.productId, eventRegistrationAttendeeInfo),
                name: getProductName(allProducts[product.productId] ? allProducts[product.productId] : product,
                   product.productType, translate, airports),
                overrideId: null,
                additionalInfo: getProductAdditionalInfo(product, primaryCharge, isPlanner, translate),
                travelType: product.productType === GROUP_FLIGHT_PRODUCT_NAME ?
                  allProducts[product.productId].travelType : undefined,
                additionalCharges: charges.slice(1).map(charge => chargeLineItemProps(charge)),
                subtotalBeforeDiscount,
                totalQuantity
              };
            })
          };
        })
          .filter((eventReg) => {
            return filterAttendeesBasedOnAttendeeType(eventReg, regCart, regCartPricing);
          })
          .sort((a1, a2) => {
            if (a1.attendeeType && a1.attendeeType === 'GROUP_LEADER') {
              return -1;
            }
            if (a2.attendeeType && a2.attendeeType === 'GROUP_LEADER') {
              return 1;
            }
            return a1.displayOrder - a2.displayOrder;
          })
      },
      refund: showRefund ? {
        // TODO, TECH-DEBT track down type and specify productSubTotalAmountRefund
        subTotal: regCartPricing.productSubTotalAmountRefund,
        // TODO, TECH-DEBT track down type and specify netFeeAmountRefund
        total: regCartPricing.netFeeAmountRefund,
        attendees: map(eventRegistrationAttendeeInfos, eventRegistrationAttendeeInfo => {
          const eventRegPricing = getEventRegPricing(regCartPricing, eventRegistrationAttendeeInfo.eventRegistrationId);
          const productRefunds = getProductRefunds(eventRegPricing);
          if (!productRefunds) {
            return {};
          }
          const products = [];
          productRefunds.forEach(product => {
            product.pricingRefunds.forEach(refund => {
              products.push({
                id: product.productId,
                type: product.productType,
                name: getProductName(allProducts[product.productId] ? allProducts[product.productId] : product,
                   product.productType, translate, airports),
                price: refund.productFeeAmount,
                maxValidation: refund.originalAmountCharged,
                originalPrice: refund.originalAmountCharged,
                originalPricePerItem: refund.productFeeAmountPerItem,
                overrideId: refund.chargeOrderDetailId,
                travelType: product.productType === GROUP_FLIGHT_PRODUCT_NAME ?
                  allProducts[product.productId].travelType : undefined,
                quantity: refund.quantity,
                quantityPrevious: refund.quantityPrevious
              });
            });
          });
          return {
            id: eventRegistrationAttendeeInfo.eventRegistrationId,
            firstName: eventRegistrationAttendeeInfo.firstName,
            lastName: eventRegistrationAttendeeInfo.lastName,
            attendeeType: eventRegistrationAttendeeInfo.attendeeType,
            displayOrder: eventRegistrationAttendeeInfo.displaySequence,
            registrationStatus: eventRegistrationAttendeeInfo.registrationStatus,
            subtotal: eventRegPricing.productSubTotalAmountRefund,
            primaryRegistrationId: eventRegistrations[
              eventRegistrationAttendeeInfo.eventRegistrationId].primaryRegistrationId,
            products
          };
        })
          .filter((eventReg) => {
            return filterAttendeesBasedOnAttendeeType(eventReg, regCart, regCartPricing, true);
          })
          .sort((a1, a2) => {
            if (a1.attendeeType && a1.attendeeType === 'GROUP_LEADER') {
              return -1;
            }
            if (a2.attendeeType && a2.attendeeType === 'GROUP_LEADER') {
              return 1;
            }
            return a1.displayOrder - a2.displayOrder;
          })
      } : null
    };
  }
);

export const getRegCartCharges = (state) => {
  const regCartPricing = state.regCartPricing;
  if (!hasPricing(regCartPricing)) {
    return {};
  }
  let regCartCharges = {};
  regCartPricing.eventRegistrationPricings.forEach((eventRegPricing) => {
    regCartCharges[eventRegPricing.eventRegistrationId] = {
      productCharges: getProductCharges(eventRegPricing),
      productRefunds: getProductRefunds(eventRegPricing)
    };
  });
  return regCartCharges;
};

// Are taxes enabled, and if yes, is there any tax item added to the order
const hasTaxes = (event, regCartPricing, taxPricingType) => {
  return (event && event.eventFeatureSetup && event.eventFeatureSetup.fees && event.eventFeatureSetup.fees.taxes) &&
    (regCartPricing && regCartPricing[taxPricingType] && !isEmpty(regCartPricing[taxPricingType]));
};

// Get the tax name and code info for the tax id passed to the function
const getTaxCodeInfo = (event, taxId) => {
  return find(event.products.taxes, (taxCodeInfo) => {
    return (taxId === taxCodeInfo.id) && taxCodeInfo;
  });
};


// Gets the tax items of products the attendee has selected for checkout.
export const getTaxesInfo = (regCartPricing, event, taxPricingType) => {
  if (hasTaxes(event, regCartPricing, taxPricingType)) {
    let taxInfo = sortBy(mapValues(keyBy(regCartPricing[taxPricingType], 'id'), taxPricingInfo => {
      const taxesInfo = getTaxCodeInfo(event, taxPricingInfo.id);
      return {
        taxes: {
          taxId: taxPricingInfo.id,
          totalTaxAmount: taxPricingInfo.totalTaxAmount,
          taxName: taxesInfo.name,
          taxCode: taxesInfo.code,
          taxSortOrder: taxesInfo.order
        }
      };
    }), tax => tax.taxes.taxSortOrder);
    let taxObject = {};
    taxInfo.forEach(entry => {
      taxObject[entry.taxes.taxId] = entry;
    });
    return taxObject;
  }
  return null;
};

const getInviteeServiceFeePricingType = (isRefund) => {
  return isRefund ? 'inviteeTypeServiceFeePricingRefunds' : 'inviteeTypeServiceFeePricingCharges';
};

const getPaymentServiceFeePricingType = (isRefund) => {
  return isRefund ? 'paymentTypeServiceFeePricingRefunds' : 'paymentTypeServiceFeePricingCharges';
};

// Are serviceFee enabled, and if yes, is there any tax item added to the order
const hasServiceFees = (event, regCartPricing, isRefund) => {
  const inviteeServiceFeePricingType = getInviteeServiceFeePricingType(isRefund);
  const paymentServiceFeePricingType = getPaymentServiceFeePricingType(isRefund);
  return (event && event.eventFeatureSetup && event.eventFeatureSetup.fees &&
    event.eventFeatureSetup.fees.serviceFees) &&
    (regCartPricing && ((regCartPricing[inviteeServiceFeePricingType] &&
      !isEmpty(regCartPricing[inviteeServiceFeePricingType]))
      || ((regCartPricing[paymentServiceFeePricingType] &&
        !isEmpty(regCartPricing[paymentServiceFeePricingType])))));
};

// Get the service Fee name and code info for the service fee id passed to the function
const getServiceFeeCodeInfo = (event, serviceFeeId) => {
  return find(event.products.serviceFees, (serviceFeeCodeInfo) => {
    return (serviceFeeId === serviceFeeCodeInfo.id) && serviceFeeCodeInfo;
  });
};

// filters the list to exclude the payment amount with percentage type fee, as it is displayed in a pop up
const getPaymentTypeServiceFeeList = (regCartPricing, event, serviceFeeType) => {
  const serviceFeeList = Object.values(event.products.serviceFees)
    .filter(value => {
      return ((value.adjustmentType === 2 && value.applyType === 0 && value.active)
        || (value.adjustmentType === 1 && value.active));
    })
    .map(serviceFee => serviceFee.id);
  const filteredServiceList = Object.keys(mapValues(keyBy(regCartPricing[serviceFeeType], 'id')))
    .filter(value => {
      return serviceFeeList.includes(value);
    });
  return Object.values(mapValues(keyBy(regCartPricing[serviceFeeType], 'id')))
    .filter(value => {
      return filteredServiceList.includes(value.id);
    });
};

// Get the invitee type service fee applied on the order
const getInviteeTypeServiceFeeInfo = (regCartPricing, event, serviceFeeType) => {
  const serviceFeeInfoList = mapValues(keyBy(regCartPricing[serviceFeeType], 'id'));
  return Object.values(serviceFeeInfoList)
    .map(serviceFeeInfo => {
      const serviceFeeCodeInfo = getServiceFeeCodeInfo(event, serviceFeeInfo.id);
      return {
        serviceFees: {
          serviceFeeId: serviceFeeInfo.id,
          serviceFeeName: serviceFeeCodeInfo.name,
          serviceFeeCode: serviceFeeCodeInfo.code,
          serviceFeeAmount: serviceFeeInfo.totalInviteeTypeServiceFeeAmount,
          serviceFeeDisplayOrder: serviceFeeCodeInfo.displayOrder
        }
      };
    });
};


// Get the payment type service fee applied on the order
const getPaymentTypeServiceFeeInfo = (regCartPricing, event, serviceFeeType, isRefund = false) => {
  // for charges, we filter the list but not for refunds
  const serviceFeeInfoList = isRefund ? mapValues(keyBy(regCartPricing[serviceFeeType], 'id')) :
    getPaymentTypeServiceFeeList(regCartPricing, event, serviceFeeType);
  return Object.values(serviceFeeInfoList)
    .map(serviceFeeInfo => {
      const serviceFeeCodeInfo = getServiceFeeCodeInfo(event, serviceFeeInfo.id);
      return {
        serviceFees: {
          serviceFeeId: serviceFeeInfo.id,
          serviceFeeName: serviceFeeCodeInfo.name,
          serviceFeeCode: serviceFeeCodeInfo.code,
          serviceFeeAmount: serviceFeeInfo.totalPaymentTypeServiceFeeAmount,
          serviceFeeDisplayOrder: serviceFeeCodeInfo.displayOrder
        }
      };
    });
};

// Get the serviceFee info.
export const getServiceFeeInfo = (regCartPricing, event, isRefund) => {
  if (hasServiceFees(event, regCartPricing, isRefund)) {
    const inviteeTypeServiceFeeInfo =
      getInviteeTypeServiceFeeInfo(regCartPricing, event, getInviteeServiceFeePricingType(isRefund));
    const paymentTypeServiceFeeInfo =
      getPaymentTypeServiceFeeInfo(regCartPricing, event, getPaymentServiceFeePricingType(isRefund), isRefund);
    let serviceFeeInfo = [...inviteeTypeServiceFeeInfo, ...paymentTypeServiceFeeInfo];
    serviceFeeInfo = sortBy(serviceFeeInfo, 'serviceFees.serviceFeeDisplayOrder');
    return serviceFeeInfo;
  }
  return null;
};

const getPaymentAmountServiceFeeList = (regCartPricing, event, serviceFeeType) => {
  const serviceFeeList = Object.values(event.products.serviceFees)
    .filter(value => {
      return (value.adjustmentType === 2 && value.applyType === 1 && value.active);
    })
    .map(serviceFee => serviceFee.id);
  const filteredServiceList = Object.keys(mapValues(keyBy(regCartPricing[serviceFeeType], 'id')))
    .filter(value => {
      return serviceFeeList.includes(value);
    });
  return Object.values(mapValues(keyBy(regCartPricing[serviceFeeType], 'id')))
    .filter(value => {
      return filteredServiceList.includes(value.id);
    });
};

// Gets the payment amount service fee info
export const getPaymentAmountServiceFeeInfo = (regCartPricing, event) => {
  if (hasServiceFees(event, regCartPricing)) {
    const serviceFeeInfoList = getPaymentAmountServiceFeeList(regCartPricing, event, 'paymentTypeServiceFeePricingCharges');
    let paymentAmountServiceFeeInfo = Object.values(serviceFeeInfoList)
      .map(serviceFeeInfo => {
        const serviceFeeCodeInfo = getServiceFeeCodeInfo(event, serviceFeeInfo.id);
        return {
          serviceFees: {
            serviceFeeId: serviceFeeInfo.id,
            serviceFeeName: serviceFeeCodeInfo.name,
            serviceFeeAmount: serviceFeeInfo.totalPaymentTypeServiceFeeAmount,
            serviceFeeDisplayOrder: serviceFeeCodeInfo.displayOrder
          }
        };
      });
    paymentAmountServiceFeeInfo = sortBy(paymentAmountServiceFeeInfo, 'serviceFees.serviceFeeDisplayOrder');
    return paymentAmountServiceFeeInfo;
  }
  return null;
};

const getAllPaymentAmountServiceFeeListInEvent = (event) => {
  if (!event.products.serviceFees) {
    return [];
  }
  const paymentTypeServiceFeeInfoList = Object.values(event.products.serviceFees).filter(value => {
    return (value.serviceFeeType === 51 && value.active);
  });
  return paymentTypeServiceFeeInfoList;
};

// eslint-disable-next-line complexity
const getPaymentMethodType = (key, paymentMethods) => {
  switch (key) {
    case 'Visa':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeVisa__resx';
    case 'MasterCard':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeMasterCard__resx';
    case 'AmericanExpress':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeAmericanExpress__resx';
    case 'Discover':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeDiscover__resx';
    case 'DinersClub':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeDinersClub__resx';
    case 'Cash':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeCash__resx';
    case 'Check':
      return getIn(paymentMethods, ['check', 'label']);
    case 'Credit Card':
      return 'EventWidgets_Payment_CreditCard_DefaultText__resx';
    case 'Credit':
      return 'EventWidgets_Payment_Credit_DefaultText__resx';
    case 'MoneyOrder':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeMoneyOrder__resx';
    case 'PurchaseOrder':
      return getIn(paymentMethods, ['purchaseOrder', 'label']);
    case 'Invoice':
      return 'EventWidgets_Payment_Invoicer_DefaultText__resx';
    case 'BankTransfer':
      return 'EventWidgets_Payment_BankTransfer_DefaultText__resx';
    case 'Other':
      return getIn(paymentMethods, ['offline', 'optionOne', 'label']);
    case 'Other2':
      return getIn(paymentMethods, ['offline', 'optionTwo', 'label']);
    case 'Other3':
      return getIn(paymentMethods, ['offline', 'optionThree', 'label']);
    case 'PayPal':
      return getIn(paymentMethods, ['payPal', 'label']);
    case 'TouchNet':
      return getIn(paymentMethods, ['touchNet', 'label']);
    case 'PayGov':
      return 'EventWidgets_Payment_PayGov_DefaultText__resx';
    case 'AuthorizeDotNet':
      return getIn(paymentMethods, ['authorizeDotNet', 'label']);
    case 'AuthorizeNetSIM':
      return 'EventWidgets_Payment_AuthorizeNetSIM_DefaultText__resx';
    case 'VisaDebit':
      return 'EventWidgets_Payment_VisaDebit_DefaultText__resx';
    case 'VisaElectron':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeVisaElectron__resx';
    case 'Maestro':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeMaestro__resx';
    case 'Solo':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeSolo__resx';
    case 'EurocardMasterCard':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeEurocardMasterCard__resx';
    case 'MasterCardDebit':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeEurocardMasterCardDebit__resx';
    case 'CyberSourceHostedOrderPage':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeCyberSourceHostedOrderPage__resx';
    case 'PaymentCredits':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypePaymentCredits__resx';
    case 'JCB':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeJCB__resx';
    case 'UnionPay':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeUnionPay__resx';
    case 'AIRPLUS':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeAIRPLUS__resx';
    case 'Aurora':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeAurora__resx';
    case 'Aurore':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeAurore__resx';
    case 'BCMC':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeBCMC__resx';
    case 'Billy':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeBilly__resx';
    case 'CB':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeCB__resx';
    case 'Cofinoga':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeCofinoga__resx';
    case 'Dankort':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeDankort__resx';
    case 'Laser':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeLaser__resx';
    case 'MaestroUK':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeMaestroUK__resx';
    case 'NetReserve':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeNetReserve__resx';
    case 'PRIVILEGE':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypePRIVILEGE__resx';
    case 'UATP':
      return 'EventWidgets_PaymentWidget_PaymentMethodTypeUATP__resx';
    case 'CyberSourceSecureAcceptance':
      return getIn(paymentMethods, ['cyberSourceSecureAcceptance', 'label']);
    default:
      return '';
  }
};

// get all the service fee applied to primary registrant
const getServiceFeesAppliedToPrimaryRegistrant = (regCart, event) => {
  const primaryRegistrant = getEventRegistration(regCart, getPrimaryRegistrationId(regCart));
  const primaryRegistrantRegistrationType = primaryRegistrant && primaryRegistrant.registrationTypeId;
  const serviceFeelist = Object.values(event.products.serviceFees)
    .filter(value => {
      return (value.applicableContactTypes && (value.applicableContactTypes.includes(primaryRegistrantRegistrationType)
      || value.applicableContactTypes.length === 0));
    })
    .map(serviceFee => serviceFee.id);

  return serviceFeelist;
};


// Gets all the payment type service fees info
export const getAllPaymentAmountServiceFeeInfo = (regCart, regCartPricing, event, paymentMethods) => {
  const paymentTypeServiceFeeInfoList = getAllPaymentAmountServiceFeeListInEvent(event);
  const primaryRegistrantServiceFeeList = getServiceFeesAppliedToPrimaryRegistrant(regCart, event);
  const filteredServiceFeesForPrimaryRegistrant = paymentTypeServiceFeeInfoList
    .filter(serviceFee => primaryRegistrantServiceFeeList.includes(serviceFee.id));

  let paymentAmountServiceFeeInfo = filteredServiceFeesForPrimaryRegistrant.map(serviceFeeInfo => {
    return {
      serviceFees: {
        serviceFeeId: serviceFeeInfo.id,
        serviceFeeName: serviceFeeInfo.name,
        serviceFeeCode: serviceFeeInfo.code,
        serviceFeeAmount: serviceFeeInfo.amount,
        serviceFeeApplicableMethods: serviceFeeInfo.applicablePaymentMethods,
        serviceFeeAdjustmentType: serviceFeeInfo.adjustmentType
      }
    };
  });
  let serviceFeeMap = new Map();
  paymentAmountServiceFeeInfo.map(serviceFees => {
    if (serviceFees.serviceFees.serviceFeeApplicableMethods.length > 0) {
      serviceFees.serviceFees.serviceFeeApplicableMethods.map(applicableMethod => {
        let serviceFeeList = serviceFeeMap.get(applicableMethod);
        if (!serviceFeeList) {
          serviceFeeMap.set(applicableMethod, new Array(serviceFees.serviceFees));
        } else {
          serviceFeeList.push(serviceFees.serviceFees);
          serviceFeeMap.set(applicableMethod, serviceFeeList);
        }
      });
    }
  });

  const paymentTypeServiceFeeList = [];
  for (const [k, v] of serviceFeeMap.entries()) {
    const values = v;
    let count = 0;
    const filteredServiceFee = values.map((value) => {
      if (count === 0) {
        count++;
        return {
          applicableMethod: getPaymentMethodType(k, paymentMethods),
          serviceFeeAdjustmentType: value.serviceFeeAdjustmentType,
          serviceFeeAmount: value.serviceFeeAmount
        };
      }
      count++;
      return {
        applicableMethod: '',
        serviceFeeAdjustmentType: value.serviceFeeAdjustmentType,
        serviceFeeAmount: value.serviceFeeAmount
      };
    });
    paymentTypeServiceFeeList.push(filteredServiceFee);
  }
  return flatten(paymentTypeServiceFeeList);
};

export const isPaymentTypeServiceFeeEnabled = (regCart, regCartPricing, event) => {
  const paymentTypeServiceFeeInfoList = getAllPaymentAmountServiceFeeInfo(regCart, regCartPricing, event);
  return paymentTypeServiceFeeInfoList && paymentTypeServiceFeeInfoList.length > 0;
};

export const shouldUseWebpaymentsForm = (state, regCartPricing = {}) => {
  if (!state.experiments?.isFlexRegWebPaymentEnabled) return false;
  const { pricingInfo } = state.registrationForm?.regCartPayment;
  return regCartPricing?.netFeeAmountCharge !== 0 &&
    (pricingInfo.creditCard?.paymentType === PAYMENT_TYPE.ONLINE ||
      state.experiments?.featureRelease >= CREDIT_CARD_FOR_LATER_PROCESSING_WEBPAYMENTS_FORM_VARIANT);
};
