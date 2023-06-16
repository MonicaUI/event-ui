import React from 'react';
import LocationMapWidget from '../LocationMapWidget';
import { shallow } from 'enzyme';

const subscribe = jest.fn();

function getState() {
  return {
    countries: {
      countries: {
        US: {
          code: 'US',
          sort: 1,
          name: 'USA',
          nameResourceKey: 'cvt_lu2_0229',
          isoCode: 840,
          requireZipCodeFlag: true,
          metroAreaGroupId: 0,
          id: 232,
          alphaThreeCode: 'USA'
        }
      }
    },
    text: {
      translate: text => text
    },
    event: {
      location: 'New York',
      address: {
        address1: '2900 Private Drive',
        city: 'Atlanta',
        stateCode: 'GA',
        postalCode: '22203',
        countryCode: 'US'
      }
    },
    googleMap: {
      apiKey: 'DummyKeyString'
    },
    appleMap: {
      token: 'DummyAppleMapToken'
    },
    account: {
      settings: {
        flexEventLocationMapType: 2
      }
    }
  };
}

async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState);
  }
}

const googleMapDefaultProps = {
  store: { dispatch, getState, subscribe },
  text: {
    translate: text => text
  },
  event: {
    location: 'New York',
    address: {
      address1: '2900 Private Drive',
      city: 'Atlanta',
      stateCode: 'GA',
      postalCode: '22203',
      countryCode: 'US'
    }
  },
  googleMap: {
    apiKey: 'DummyKeyString'
  },
  appleMap: {
    token: 'DummyAppleMapToken'
  },
  account: {
    settings: {
      flexEventLocationMapType: 1
    }
  }
};
const appleMapDefaultProps = {
  store: { dispatch, getState, subscribe },
  guestText: {
    translate: text => text
  },
  event: {
    location: 'New York',
    address: {
      address1: '2900 Private Drive',
      city: 'Atlanta',
      stateCode: 'GA',
      postalCode: '22203',
      countryCode: 'US'
    }
  },
  googleMap: {
    apiKey: 'DummyKeyString'
  },
  appleMap: {
    token: 'DummyAppleMapToken'
  },
  account: {
    settings: {
      flexEventLocationMapType: 1
    }
  }
};
describe('LocationMapWidget', () => {
  it('should render Google Map with address containing country name', () => {
    // @ts-expect-error ts-migrate(2559) FIXME: Type '{ store: { dispatch: (action: any) => Promis... Remove this comment to see the full error message
    const widget = shallow(<LocationMapWidget {...googleMapDefaultProps} />);
    expect(widget.props()).toMatchSnapshot();
  });

  it('should render Apple Map with address containing country name', () => {
    // @ts-expect-error ts-migrate(2559) FIXME: Type '{ store: { dispatch: (action: any) => Promis... Remove this comment to see the full error message
    const widget = shallow(<LocationMapWidget {...appleMapDefaultProps} />);
    expect(widget.props()).toMatchSnapshot();
  });
});
