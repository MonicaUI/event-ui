/* eslint-env jest */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { unSelectAdmissionItem } from '../admissionItems';
import { updateIn } from 'icepick';
import { find } from 'lodash';
// eslint-disable-next-line jest/no-mocks-import
import {
  RegCartClient,
  ProductVisibilityClient,
  EventSnapshotClient,
  getState,
  response,
  primaryEventRegId as eventRegistrationId,
  unSelectedAdmissionId
} from '../__mocks__/admissionItems';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

RegCartClient.prototype.updateRegCart = jest.fn(() => ({ regCart: response.regCart }));
RegCartClient.prototype.calculateRegCartPricing = jest.fn(() => ({ regCartPricing: {} }));
RegCartClient.prototype.getCapacitySummaries = jest.fn(() => ({}));

const visibleProducts = {
  admissionItems: {
    '35cbeb81-65c2-433d-a73c-232ede363b56': {
      code: 'admission2',
      description: '',
      id: '35cbeb81-65c2-433d-a73c-232ede363b56',
      capacityId: '35cbeb81-65c2-433d-a73c-232ede363b56',
      name: 'admission2',
      status: 2,
      type: 'AdmissionItem',
      defaultFeeId: '00000000-0000-0000-0000-000000000000',
      fees: {},
      closedReasonType: 'NotClosed',
      isOpenForRegistration: true,
      limitOptionalItemsToSelect: false,
      includeWaitlistSessionsTowardsMaximumLimit: false,
      applicableContactTypes: ['7be4ba5f-52dd-4825-ae54-478571f8adec'],
      limitOptionalSessionsToSelect: false,
      associatedOptionalSessions: [],
      applicableOptionalItems: [],
      minimumNumberOfSessionsToSelect: 0,
      availableOptionalSessions: [],
      displayOrder: 1
    },
    'c65d8e2b-7801-4b85-9ffe-e7e542b70315': {
      code: 'admission1',
      description: '',
      id: 'c65d8e2b-7801-4b85-9ffe-e7e542b70315',
      capacityId: 'c65d8e2b-7801-4b85-9ffe-e7e542b70315',
      name: 'admission1',
      status: 2,
      type: 'AdmissionItem',
      defaultFeeId: '00000000-0000-0000-0000-000000000000',
      fees: {},
      closedReasonType: 'NotClosed',
      isOpenForRegistration: true,
      limitOptionalItemsToSelect: false,
      includeWaitlistSessionsTowardsMaximumLimit: false,
      applicableContactTypes: ['7be4ba5f-52dd-4825-ae54-478571f8adec'],
      limitOptionalSessionsToSelect: false,
      associatedOptionalSessions: [],
      applicableOptionalItems: [],
      minimumNumberOfSessionsToSelect: 0,
      availableOptionalSessions: [],
      displayOrder: 2
    }
  },
  sessionProducts: {},
  sessions: null,
  sessionGroups: null,
  sortKeys: {},
  quantityItems: {},
  donationItems: {},
  skipValidationItems: null
};

ProductVisibilityClient.prototype.getVisibleProducts = jest.fn(() => visibleProducts);
EventSnapshotClient.prototype.getRegCartVisibleProducts = jest.fn(() => visibleProducts);

let store;
let regCartClient;
let updatedRegCart;
beforeEach(() => {
  jest.clearAllMocks();
});

test('unselect an admission item loads visible products', async () => {
  store = mockStore(getState());
  regCartClient = store.getState().clients.regCartClient;
  updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
    return {
      ...eventReg,
      productRegistrations: []
    };
  });

  regCartClient.updateRegCart = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
  await store.dispatch(unSelectAdmissionItem(eventRegistrationId, unSelectedAdmissionId));
  expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
  const visibleProductsAction = find(store.getActions(), {
    type: 'event-guestside-site/LOAD_VISIBLE_SESSION_PRODUCTS'
  });
  expect(visibleProductsAction.payload.visibleProducts).toEqual(visibleProducts);
});

test('unselect an admission item loads visible products in reg mod', async () => {
  store = mockStore(getState(true));
  regCartClient = store.getState().clients.regCartClient;
  updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
    return {
      ...eventReg,
      productRegistrations: []
    };
  });

  regCartClient.updateRegCart = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
  await store.dispatch(unSelectAdmissionItem(eventRegistrationId, unSelectedAdmissionId));
  expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
  const visibleProductsAction = find(store.getActions(), {
    type: 'event-guestside-site/LOAD_REG_CART_VISIBLE_PRODUCTS'
  });
  expect(visibleProductsAction.payload).toEqual(visibleProducts);
});
