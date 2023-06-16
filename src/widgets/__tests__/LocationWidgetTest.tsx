import React from 'react';
import renderer from 'react-test-renderer';
import LocationWidget from '../LocationWidget';
import { createStore } from 'redux';

// const translate = jest.fn(() => 'USA');
const initialState = {
  event: {
    location: 'Some Location',
    address: {
      address1: '113500 Piedmont Rd',
      address2: 'Ste 6100',
      city: 'Atlanta',
      stateCode: 'GA',
      postalCode: '30305',
      countryCode: 'US'
    }
  },
  text: {
    translate: x => (x === 'cvt_lu2_0229' ? 'USA' : x)
  },
  guestText: {
    translate: x => (x === 'cvt_lu2_0229' ? 'USA_guest' : x)
  },
  countries: {
    countries: {
      AE: {
        alphaThreeCode: 'ARE',
        code: 'AE',
        id: 2,
        isoCode: 784,
        metroAreaGroupId: 11,
        name: 'United Arab Emirates',
        nameResourceKey: 'cvt_lu2_0002',
        requireZipCodeFlag: false,
        sort: 999
      },
      AF: {
        alphaThreeCode: 'AFG',
        code: 'AF',
        id: 3,
        isoCode: 4,
        metroAreaGroupId: 11,
        name: 'Afghanistan',
        nameResourceKey: 'cvt_lu2_0003',
        requireZipCodeFlag: false,
        sort: 999
      },
      US: {
        alphaThreeCode: 'USA',
        code: 'US',
        id: 232,
        isoCode: 840,
        metroAreaGroupId: 7,
        name: 'USA',
        nameResourceKey: 'cvt_lu2_0229',
        requireZipCodeFlag: false,
        sort: 999
      }
    }
  }
};

describe('LocationWidget', () => {
  test('should render', () => {
    const config = {};
    const widget = renderer.create(
      <LocationWidget
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ classes: {}; store: Store<unknown, Action<... Remove this comment to see the full error message
        classes={{}}
        store={createStore((state = initialState) => {
          return state;
        })}
        config={config}
        style={{}}
      />
    );
    expect(widget).toMatchSnapshot();
  });
  test('only location should be displayed', () => {
    const config = {
      displayAddressOption: 'location'
    };
    const widget = renderer.create(
      <LocationWidget
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ classes: {}; store: Store<unknown, Action<... Remove this comment to see the full error message
        classes={{}}
        store={createStore((state = initialState) => {
          return state;
        })}
        config={config}
        style={{}}
      />
    );
    expect(widget).toMatchSnapshot();
  });
  test('address should be also displayed', () => {
    const config = {
      displayAddressOption: 'locationAddress'
    };
    const widget = renderer.create(
      <LocationWidget
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ classes: {}; store: Store<unknown, Action<... Remove this comment to see the full error message
        classes={{}}
        store={createStore((state = initialState) => {
          return state;
        })}
        config={config}
        style={{}}
      />
    );
    expect(widget).toMatchSnapshot();
  });
  test('countryName should be also displayed, using text translation', () => {
    const config = {
      displayAddressOption: 'locationAddressCountry'
    };
    const widget = renderer.create(
      <LocationWidget
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ classes: {}; store: Store<unknown, Action<... Remove this comment to see the full error message
        classes={{}}
        store={createStore((state = initialState) => {
          return state;
        })}
        config={config}
        style={{}}
      />
    );
    expect(widget).toMatchSnapshot();
  });
});
