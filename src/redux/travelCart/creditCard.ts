import { transformCreditCardToTravelCardType } from 'event-widgets/utils/creditCardUtils';

export function getUpdatedTravelBookings(
  existingTravelBookings: $TSFixMe,
  eventRegistrationId: $TSFixMe,
  cardData: $TSFixMe
): $TSFixMe {
  // if there are no bookings in travel booking, then set the air bookings and return
  if (!existingTravelBookings.length) {
    return [
      {
        id: eventRegistrationId,
        creditCard: { ...addCreditCardField({}, cardData) }
      }
    ];
  }

  // if booking exist for current registration id
  const existingTravelBooking = existingTravelBookings.find(booking => booking.id === eventRegistrationId);
  if (existingTravelBooking) {
    return [
      ...existingTravelBookings.filter(booking => booking.id !== eventRegistrationId),
      {
        ...existingTravelBooking,
        creditCard: addCreditCardField(existingTravelBooking.creditCard, cardData)
      }
    ];
  }

  // if new booking for registration id
  return [
    ...existingTravelBookings,
    {
      id: eventRegistrationId,
      creditCard: addCreditCardField({}, cardData)
    }
  ];
}

function addCreditCardField(existingCreditCardDetail, cardData) {
  return {
    ...existingCreditCardDetail,
    ...cardData,
    creditCardDetails: {
      ...cardData.creditCardDetails
    }
  };
}

export function removeCreditCardFromState(existingTravelBookings: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe {
  const existingTravelBooking = existingTravelBookings.find(booking => booking.id === eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (existingTravelBooking && existingTravelBooking.creditCard) {
    if (existingTravelBooking.travelReservationId) {
      existingTravelBooking.creditCard = {};
    } else {
      delete existingTravelBooking.creditCard;
    }
    return [
      ...existingTravelBookings.filter(booking => booking.id !== eventRegistrationId),
      { ...existingTravelBooking }
    ];
  }
  return existingTravelBookings;
}

export function transformCreditCard(creditCard: $TSFixMe): $TSFixMe {
  if (!creditCard || !creditCard.creditCardDetails) return;

  return {
    ...creditCard,
    creditCardDetails: {
      ...creditCard.creditCardDetails,
      cardType: transformCreditCardToTravelCardType(creditCard.creditCardDetails.cardType)
    }
  };
}
