import { transformCreditCard, getUpdatedTravelBookings, removeCreditCardFromState } from '../creditCard';

describe('transformCreditCard method', () => {
  test('should transform credit card on travel cart request', () => {
    const creditCard = {
      creditCardDetails: {
        cardType: 'AmericanExpress',
        number: '123456',
        accountHolderName: 'dummy',
        expiryMonth: '10',
        expiryYear: '2018',
        last4Digits: '3456'
      }
    };
    const response = transformCreditCard(creditCard);
    expect(response).toEqual({
      creditCardDetails: {
        cardType: 'AMERICAN_EXPRESS',
        number: '123456',
        accountHolderName: 'dummy',
        expiryMonth: '10',
        expiryYear: '2018',
        last4Digits: '3456'
      }
    });
  });
});

describe('getUpdatedTravelBookings method', () => {
  test('should create new booking object if it does not exist', () => {
    const cardData = {
      creditCardDetails: {
        cardType: 'AmericanExpress',
        number: '123456',
        accountHolderName: 'dummy',
        expiryMonth: '10',
        expiryYear: '2018'
      }
    };
    const existingTravelBookings = [];
    const response = getUpdatedTravelBookings(existingTravelBookings, '1234', cardData);
    expect(response).toEqual([
      {
        id: '1234',
        creditCard: {
          creditCardDetails: {
            cardType: 'AmericanExpress',
            number: '123456',
            accountHolderName: 'dummy',
            expiryMonth: '10',
            expiryYear: '2018'
          }
        }
      }
    ]);
  });
  test('should update an existing booking with new credit card information', () => {
    const existingTravelBookings = [
      {
        id: '1234'
      }
    ];
    const cardData = {
      creditCardDetails: {
        cardType: 'AmericanExpress',
        number: '123456',
        accountHolderName: 'dummy',
        expiryMonth: '10',
        expiryYear: '2018'
      }
    };
    const response = getUpdatedTravelBookings(existingTravelBookings, '1234', cardData);
    expect(response).toEqual([
      {
        id: '1234',
        creditCard: {
          creditCardDetails: {
            cardType: 'AmericanExpress',
            number: '123456',
            accountHolderName: 'dummy',
            expiryMonth: '10',
            expiryYear: '2018'
          }
        }
      }
    ]);
  });

  test('should create new booking object if it does not exist 1', () => {
    const cardData = {
      creditCardDetails: {
        cardType: 'AmericanExpress',
        number: '123456',
        accountHolderName: 'dummy',
        expiryMonth: '10',
        expiryYear: '2018'
      }
    };
    const existingTravelBookings = [
      {
        id: '1234',
        creditCard: {
          creditCardDetails: {
            cardType: 'AmericanExpress',
            number: '123456',
            accountHolderName: 'dummy',
            expiryMonth: '10',
            expiryYear: '2018'
          }
        }
      }
    ];
    const response = getUpdatedTravelBookings(existingTravelBookings, '1235', cardData);
    expect(response).toEqual([
      {
        id: '1234',
        creditCard: {
          creditCardDetails: {
            cardType: 'AmericanExpress',
            number: '123456',
            accountHolderName: 'dummy',
            expiryMonth: '10',
            expiryYear: '2018'
          }
        }
      },
      {
        id: '1235',
        creditCard: {
          creditCardDetails: {
            cardType: 'AmericanExpress',
            number: '123456',
            accountHolderName: 'dummy',
            expiryMonth: '10',
            expiryYear: '2018'
          }
        }
      }
    ]);
  });
});

describe('removeCreditCardFromState', () => {
  test('should make the credit card empty if travel reservation exists', () => {
    const existingTravelBookings = [
      {
        id: '1234',
        creditCard: {
          creditCardDetails: {
            cardType: 'AmericanExpress',
            number: '123456',
            accountHolderName: 'dummy',
            expiryMonth: '10',
            expiryYear: '2018'
          }
        },
        travelReservationId: '1234'
      }
    ];
    const response = removeCreditCardFromState(existingTravelBookings, '1234');
    expect(response).toEqual([
      {
        id: '1234',
        creditCard: {},
        travelReservationId: '1234'
      }
    ]);
  });
  test('should delete the credit card if travel does not exist', () => {
    const existingTravelBookings = [
      {
        id: '1234',
        creditCard: {
          creditCardDetails: {
            cardType: 'AmericanExpress',
            number: '123456',
            accountHolderName: 'dummy',
            expiryMonth: '10',
            expiryYear: '2018'
          }
        }
      }
    ];
    const response = removeCreditCardFromState(existingTravelBookings, '1234');
    expect(response).toEqual([
      {
        id: '1234'
      }
    ]);
  });
  test('should return back the same object if no registration ids match', () => {
    const existingTravelBookings = [
      {
        id: '1235',
        creditCard: {
          creditCardDetails: {
            cardType: 'AmericanExpress',
            number: '123456',
            accountHolderName: 'dummy',
            expiryMonth: '10',
            expiryYear: '2018'
          }
        }
      }
    ];
    const response = removeCreditCardFromState(existingTravelBookings, '1234');
    expect(response).toEqual(existingTravelBookings);
  });
});
