import React from 'react';
import FeesWidget from '../FeesWidget';
import { shallow } from 'enzyme';

const subscribe = jest.fn();

function getState() {
  return {
    eventFees: [
      {
        feeId: '879f7d86-f456-4830-82ed-a5cfccd7e3ce',
        feeName: 'Fee 3',
        amount: 30,
        productId: '27f603b3-64eb-4dd0-be0e-a4c0ff255bc2',
        productType: 'AdmissionItem',
        chargePolicies: [
          {
            id: '6a8abf59-c576-4b5a-be03-bb43226e434c',
            isActive: true,
            effectiveUntil: 32503593600000,
            amount: 30,
            maximumRefundAmount: 30
          }
        ],
        refundPolicies: []
      }
    ],
    text: {
      translate: text => text,
      resolver: {
        currency: c => c
      }
    },
    event: {
      timezone: 35,
      eventCurrencySnapshot: {
        currencyId: 1,
        isoNumericCode: 840,
        isoAlphabeticCode: 'USD',
        symbol: '$'
      }
    },
    timezones: {
      35: {
        id: 35,
        name: 'Eastern Time',
        nameResourceKey: 'Event_Timezone_Name_35__resx',
        plannerDisplayName: '(GMT-05:00) Eastern [US & Canada]',
        hasDst: true,
        utcOffset: -300,
        abbreviation: 'ET',
        abbreviationResourceKey: 'Event_Timezone_Abbr_35__resx',
        dstInfo: []
      }
    }
  };
}

async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState);
  }
}

const defaultProps = {
  store: { dispatch, getState, subscribe },
  style: {},
  config: {},
  translateCurrency: c => c,
  eventFees: [
    {
      feeId: '879f7d86-f456-4830-82ed-a5cfccd7e3ce',
      feeName: 'Fee 3',
      amount: 30,
      productId: '27f603b3-64eb-4dd0-be0e-a4c0ff255bc2',
      productType: 'AdmissionItem',
      chargePolicies: [
        {
          id: '6a8abf59-c576-4b5a-be03-bb43226e434c',
          isActive: true,
          effectiveUntil: 32503593600000,
          amount: 30,
          maximumRefundAmount: 30
        }
      ],
      refundPolicies: []
    }
  ],
  translate: text => text,
  eventCurrencyCode: 'USD'
};

describe('FeesWidget produces props from state', () => {
  test('should match', () => {
    const widget = shallow(<FeesWidget {...defaultProps} />);
    expect(widget.props()).toMatchSnapshot();
  });
});
