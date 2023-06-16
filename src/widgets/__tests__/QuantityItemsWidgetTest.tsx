import React from 'react';
import renderer from 'react-test-renderer';
import QuantityItemsWidget from '../QuantityItemsWidget';
import { mount } from 'enzyme';
import { wait } from '../../testUtils';
import { updateQuantity, updateLocalQuantity } from '../../redux/registrationForm/regCart/quantityItems';

jest.mock('../../redux/registrationForm/regCart/quantityItems', () => {
  return {
    updateQuantity: jest.fn(),
    updateLocalQuantity: jest.fn()
  };
});

function getState() {
  return {
    event: {
      timezone: 35,
      products: {
        quantityItems: {
          quantityItem1: {
            id: 'quantityItem1',
            capacityId: 'quantityItem1'
          },
          quantityItemNoFee: {
            id: 'quantityItemNoFee',
            capacityId: 'quantityItemNoFee'
          },
          quantityItem2WithCap1: {
            id: 'quantityItem2WithCap1',
            capacityId: 'quantityItem2WithCap1'
          }
        }
      }
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
          eventRegistrationId: 'eventRegistrationId'
        }
      }
    },
    capacity: {
      quantityItem1: {
        active: true,
        availableCapacity: 123
      },
      quantityItem2WithMaxPerInvitee: {
        active: true,
        availableCapacity: 1
      }
    },
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
          quantityItems: {
            quantityItem1: {
              id: 'quantityItem1',
              capacityId: 'quantityItem1',
              name: 'Quantity Item Name',
              code: 'Quantity Item Code',
              description: 'Quantity Item Description',
              defaultFeeId: 'fee1',
              fees: {
                fee1: {
                  amount: 100,
                  name: 'Fee 1',
                  registrationTypes: [],
                  chargePolicies: [
                    {
                      amount: 100,
                      effectiveUntil: '2999-12-31T00:00:00.000Z',
                      isActive: true
                    },
                    {
                      amount: 50,
                      effectiveUntil: new Date(new Date().valueOf() + 1000 * 3600 * 24 * 30).toISOString(),
                      isActive: true
                    }
                  ]
                }
              },
              displayOrder: 1,
              isOpenForRegistration: true,
              associatedRegistrationTypes: [],
              status: 2
            },
            quantityItemNoFee: {
              id: 'quantityItemNoFee',
              capacityId: 'quantityItem1',
              name: 'Quantity Item No Fee',
              code: 'quantity Item Code 2',
              description: 'Quantity Item Description',
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              fees: {},
              displayOrder: 2,
              isOpenForRegistration: true,
              status: 2,
              associatedRegistrationTypes: []
            },
            quantityItem2WithMaxPerInvitee: {
              id: 'quantityItem2WithMaxPerInvitee',
              capacityId: 'quantityItem2WithMaxPerInvitee',
              name: 'Quantity Item 2 With Cap 1',
              code: 'Quantity Item 2 Code',
              description: 'Quantity Item 2 Description',
              defaultFeeId: 'fee1',
              fees: {
                fee1: {
                  amount: 100,
                  name: 'Fee 1',
                  registrationTypes: [],
                  chargePolicies: [
                    {
                      amount: 100,
                      effectiveUntil: '2999-12-31T00:00:00.000Z',
                      isActive: true
                    },
                    {
                      amount: 50,
                      effectiveUntil: new Date(new Date().valueOf() + 1000 * 3600 * 24 * 30).toISOString(),
                      isActive: true
                    }
                  ]
                }
              },
              status: 2,
              displayOrder: 3,
              isOpenForRegistration: true,
              associatedRegistrationTypes: [],
              quantity: 2
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
      capacity: true,
      description: true,
      fees: true,
      itemCode: true
    }
  },
  isRegistrationPage: true,
  'data-cvent-id': 'widget-QuantityItems-widget:quantityItems',
  store: { dispatch, getState, subscribe }
};

describe('QuantityItemsTest', () => {
  test('should render', () => {
    const component = renderer.create(<QuantityItemsWidget {...defaultProps} />);
    expect(component).toMatchSnapshot();
  });

  test('should select', async () => {
    const wrapper = mount(<QuantityItemsWidget {...defaultProps} />);
    wrapper
      .find('[data-cvent-id="quantityItems-item-quantityItem1"]')
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '2' } });
    await wait(0);
    expect(updateQuantity).toHaveBeenCalled();
  });

  test('should add to local state', async () => {
    const wrapper = mount(<QuantityItemsWidget {...defaultProps} />);
    wrapper
      .find('[data-cvent-id="quantityItems-item-quantityItem1"]')
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '10' } });
    await wait(0);
    expect(updateQuantity).toHaveBeenCalled();

    wrapper
      .find('[data-cvent-id="quantityItems-item-quantityItem1"]')
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '15' } });
    await wait(0);
    expect(updateLocalQuantity).toHaveBeenCalled();

    wrapper
      .find('[data-cvent-id="quantityItems-item-quantityItem1"]')
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '3' } });
    await wait(0);
    expect(updateLocalQuantity).toHaveBeenCalled();

    wrapper
      .find('[data-cvent-id="quantityItems-item-quantityItem1"]')
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '15' } });
    await wait(0);
    expect(updateLocalQuantity).toHaveBeenCalled();

    wrapper
      .find('[data-cvent-id="quantityItems-item-quantityItem1"]')
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('blur');
    await wait(0);
    expect(updateQuantity).toHaveBeenCalled();
  });
});
