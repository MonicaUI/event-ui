import { mount } from 'enzyme';
import { openFeeRefundPolicyDialog } from '../FeeRefundPolicyDialog';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { Provider } from 'react-redux';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../__mocks__/documentElementMock';
import React from 'react';

jest.mock('../../redux/pathInfo', () => ({
  routeToPage: jest.fn(() => () => {})
}));
const noOp = c => c;
getMockedMessageContainer();

const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    website: (x = {}) => x,
    text: (x = {}) => x
  }),
  {
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    }
  }
);

const feeModel = {
  translateCurrency: noOp,
  translate: noOp,
  eventCurrencyCode: 'USD',
  eventTimeZone: {
    id: 35,
    name: 'Eastern Time',
    nameResourceKey: 'Event_Timezone_Name_35__resx',
    plannerDisplayName: '(GMT-05:00) Eastern [US & Canada]',
    hasDst: true,
    utcOffset: -300,
    abbreviation: 'ET',
    abbreviationResourceKey: 'Event_Timezone_Abbr_35__resx',
    dstInfo: []
  },
  fee: {
    feeId: 'd950c1c7-06e3-4485-b7bd-35cc961238cb',
    feeName: 'Standard Rate',
    amount: 350.0,
    productId: '1945bc48-962a-480a-b6f0-f2877f90871d',
    productType: 'AdmissionItem',
    chargePolicies: [
      {
        id: 'cbee5cc7-2b1c-4856-9bec-cbbde0ff6726',
        isActive: true,
        effectiveUntil: 1571805860,
        amount: 200.0,
        maximumRefundAmount: 900.0
      },
      {
        id: 'dcee5cc7-2b1c-4856-9bec-cbbde0ff6726',
        isActive: true,
        effectiveUntil: 32503593600000,
        amount: 300.0,
        maximumRefundAmount: 800.0
      }
    ],
    refundPolicies: [
      {
        id: '58ca4381-3ce7-4836-9cb3-fe65c3f9f95a',
        isActive: true,
        refundType: 1,
        effectiveUntil: 1571805860,
        amount: 150.0,
        isBeforeCurrentDate: false
      },
      {
        id: '58ca4381-3ce7-4836-9cb3-fe65c3f9f95b',
        isActive: true,
        refundType: 1,
        effectiveUntil: 1574743460,
        amount: 100.0,
        isBeforeCurrentDate: false
      }
    ]
  }
};

describe('Fee refund policy dialog', () => {
  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('matches snapshot when opened', () => {
    store.dispatch(openFeeRefundPolicyDialog(feeModel));
    expect(dialog).toMatchSnapshot();
  });
});
