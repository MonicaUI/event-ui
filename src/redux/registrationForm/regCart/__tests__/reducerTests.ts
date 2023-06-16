import reducer from '../reducer';
import { LOG_OUT_REGISTRANT_SUCCESS } from '../../../registrantLogin/actionTypes';
import {
  CREATE_REG_CART_SUCCESS,
  UPDATE_REG_CART_SUCCESS,
  FINALIZE_CHECKOUT_SUCCESS,
  CLEAR_REG_CART_INFERRED_FIELDS,
  UPDATE_REG_CART_SESSION_BUNDLE_SUCCESS
} from '../actionTypes';
import { updateIn } from 'icepick';
import EventSnapshot from '../../../../../fixtures/EventSnapshot.json';

const eventId = EventSnapshot.eventSnapshot.id;

const emptyRegCart = reducer(undefined, {});

// Note that this is a shorted regCart for brevity.
const regCart = {
  regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
  status: 'COMPLETED',
  eventRegistrations: {
    '00000000-0000-0000-0000-000000000001': {
      eventRegistrationId: '00000000-0000-0000-0000-000000000001',
      eventId,
      attendee: {
        personalInformation: {
          contactId: 'd10d9eab-743f-4b3e-80ee-adb520920281',
          firstName: 'Luke',
          lastName: 'Roling',
          emailAddress: 'lroling-384934@j.mail',
          primaryAddressType: 'WORK'
        },
        attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
      },
      attendeeType: 'ATTENDEE',
      productRegistrations: [
        {
          productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
          productType: 'AdmissionItem',
          quantity: 1,
          requestedAction: 'REGISTER'
        }
      ],
      registrationTypeId: '00000000-0000-0000-0000-000000000000'
    }
  },
  pendingProductSelection: ''
};

const logoutAction = { type: LOG_OUT_REGISTRANT_SUCCESS };

test('Verifying initial state.', () => {
  expect(reducer(undefined, {})).toMatchSnapshot();
});

test('LOG_OUT_REGISTRANT_SUCCESS does not change default cart', () => {
  expect(reducer(emptyRegCart, logoutAction)).toMatchSnapshot();
});

test('LOG_OUT_REGISTRANT_SUCCESS sets present cart to default.', () => {
  expect(reducer(regCart, logoutAction)).toMatchSnapshot();
});

test('CREATE_REG_CART_SUCCESS sets empty cart to new reg cart', () => {
  expect(reducer(emptyRegCart, { type: CREATE_REG_CART_SUCCESS, payload: { regCart } })).toMatchSnapshot();
});

test('UPDATE_REG_CART_SUCCESS updates the present cart', () => {
  const eventRegistrationId = Object.keys(regCart.eventRegistrations)[0];
  const updatedRegCart = updateIn(
    regCart,
    ['eventRegistrations', eventRegistrationId],
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'EventRegistration'.
    (eventReg: EventRegistration) => {
      return {
        ...eventReg,
        attendee: {
          ...eventReg.attendee,
          personalInformation: {
            ...eventReg.attendee.personalInformation,
            firstName: 'test',
            lastName: 'test'
          }
        }
      };
    }
  );
  expect(reducer(regCart, { type: UPDATE_REG_CART_SUCCESS, payload: { regCart: updatedRegCart } })).toMatchSnapshot();
});

test('UPDATE_REG_CART_SUCCESS sets the present cart with saved information', () => {
  const eventRegistrationId = Object.keys(regCart.eventRegistrations)[0];
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'EventRegistration'.
  const savedRegCart = updateIn(regCart, ['eventRegistrations', eventRegistrationId], (eventReg: EventRegistration) => {
    return {
      ...eventReg,
      attendee: {
        ...eventReg.attendee,
        personalInformation: {
          ...eventReg.attendee.personalInformation,
          firstName: 'test',
          lastName: 'test'
        }
      }
    };
  });
  expect(reducer(regCart, { type: UPDATE_REG_CART_SUCCESS, payload: { savedRegCart, regCart } })).toMatchSnapshot();
});

test('FINALIZE_CHECKOUT_SUCCESS updates the present cart', () => {
  expect(reducer(emptyRegCart, { type: FINALIZE_CHECKOUT_SUCCESS, payload: { regCart } })).toMatchSnapshot();
});

test('CLEAR_REG_CART_INFERRED_FIELDS clears inferred fields in regcart', async () => {
  const regCartWithInferredInfomation = JSON.parse(JSON.stringify(regCart));
  regCartWithInferredInfomation.eventRegistrations['00000000-0000-0000-0000-000000000001'].registrationTypeId =
    'aDummyId';
  delete regCartWithInferredInfomation.eventRegistrations['00000000-0000-0000-0000-000000000001'].attendee
    .personalInformation.contactId;
  const clearedCart = reducer(regCart, {
    type: CLEAR_REG_CART_INFERRED_FIELDS,
    payload: { regCart: regCartWithInferredInfomation }
  });
  expect(clearedCart).toMatchSnapshot();
  expect(clearedCart).toEqual(regCartWithInferredInfomation);
});

test('UPDATE_REG_CART_SESSION_BUNDLE_SUCCESS updates the present cart', () => {
  const eventRegistrationId = Object.keys(regCart.eventRegistrations)[0];
  const updatedRegCart = updateIn(
    regCart,
    ['eventRegistrations', eventRegistrationId],
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'EventRegistration'.
    (eventReg: EventRegistration) => {
      return {
        ...eventReg,
        attendee: {
          ...eventReg.attendee,
          personalInformation: {
            ...eventReg.attendee.personalInformation,
            firstName: 'test',
            lastName: 'test'
          }
        }
      };
    }
  );
  const newRegCart = reducer(regCart, {
    type: UPDATE_REG_CART_SESSION_BUNDLE_SUCCESS,
    payload: { regCart: updatedRegCart }
  });
  expect(newRegCart).toBeDefined();
  const firstName =
    newRegCart.eventRegistrations['00000000-0000-0000-0000-000000000001'].attendee.personalInformation.firstName;
  expect(firstName).toBe('test');
});
