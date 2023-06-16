import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { wait } from '../../testUtils';
import DonationItemsWidget from '../DonationItemsWidget';
import { updateDonationAmount } from '../../redux/registrationForm/regCart/donationItems';

jest.mock('../../redux/registrationForm/regCart/donationItems', () => {
  return {
    updateDonationAmount: jest.fn()
  };
});

function getState() {
  return {
    event: {
      timezone: 35
    },
    website: {
      pluginData: {
        registrationProcessNavigation: {
          registrationPaths: {
            regPathId: {
              pageIds: ['regProcessStep1', 'regProcessStep2']
            }
          }
        }
      }
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId: {}
        }
      }
    },
    pathInfo: {
      currentPageId: 'regProcessStep2'
    },
    registrationForm: {
      currentEventRegistrationId: 'eventRegistrationId',
      regCart: {
        regCartId: 'regCartId',
        eventRegistrations: {
          eventRegistrationId: {
            eventRegistrationId: 'eventRegistrationId',
            donationItemRegistrations: {
              donationItem2: {
                productId: 'donationItem2',
                amount: '7'
              }
            }
          }
        }
      }
    },
    capacity: {},
    text: {
      resolver: {
        date: () => 'some date ',
        currency: x => x
      },
      translate: x => x
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
    },
    defaultUserSession: {
      isPlanner: false
    },
    visibleProducts: {
      Sessions: {
        eventRegistrationId: {
          donationItems: {
            donationItem1: {
              id: 'donationItem1',
              name: 'donationItem1',
              code: 'donationItem1',
              minDonation: 2,
              maxDonation: 5,
              isOpenForRegistration: true,
              status: 2
            },
            donationItem2: {
              id: 'donationItem2',
              name: 'donationItem2',
              code: 'donationItem2',
              minDonation: 3,
              maxDonation: 10,
              isOpenForRegistration: true,
              status: 2
            }
          }
        }
      }
    }
  };
}

async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState);
  }
}

const subscribe = () => {};

const defaultProps = {
  classes: {},
  style: {},
  translate: (res, opts) => (opts ? `${res}:${JSON.stringify(opts)}` : res),
  config: {
    headerText: 'Header',
    instructionalText: 'Instructional text',
    display: {
      itemCode: true,
      description: true
    }
  },
  'data-cvent-id': 'widget-DonationItems-widget:donationItems',
  store: { dispatch, getState, subscribe }
};

describe('DonationItemsTest', () => {
  test('should render', () => {
    const component = renderer.create(<DonationItemsWidget {...defaultProps} />);
    expect(component).toMatchSnapshot();
  });

  test.skip('should call update handler for cart update', async () => {
    const wrapper = mount(<DonationItemsWidget {...defaultProps} />);
    const input = wrapper.find('[data-cvent-id="donationItems-item-donationItem1-input"]').find('input');
    input.simulate('change', { target: { value: '3' } });
    await wait(100); // debounced 300ms
    expect(updateDonationAmount).not.toHaveBeenCalled();
    input.simulate('change', { target: { value: '5' } });
    await wait(301); // debounced 300ms
    expect(updateDonationAmount).toHaveBeenCalled();
  });
});
