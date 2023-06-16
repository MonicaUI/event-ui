import React from 'react';
import renderer from 'react-test-renderer';
import AdmissionItemsWidget from '../AdmissionItemsWidget/AdmissionItemsWidget';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { selectAdmissionItem } from '../../redux/registrationForm/regCart/admissionItems';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { useAdmissionItems } from '../AdmissionItemsWidget/useAdmissionItems';
import { getPrimaryVisibleAdmissionItems } from '../AdmissionItemsWidget/admissionItemsUtils';

jest.mock('../../dialogs/selectionConflictDialogs', () => {
  return {
    validateAdmissionItemChange: jest.fn(),
    openAdmissionItemSelectionConflictDialog: jest.fn()
  };
});
jest.mock('../../redux/travelCart', () => {
  return {
    updateExpandedHotels: jest.fn()
  };
});
import {
  validateAdmissionItemChange,
  openAdmissionItemSelectionConflictDialog
} from '../../dialogs/selectionConflictDialogs';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';
import { updateExpandedHotels } from '../../redux/travelCart';
jest.mock('../../redux/registrationForm/regCart/admissionItems');

jest.mock('../AdmissionItemsWidget/useAdmissionItems', () => ({
  useAdmissionItems: jest.fn()
}));

jest.mock('../AdmissionItemsWidget/admissionItemsUtils', () => ({
  getPrimaryVisibleAdmissionItems: jest.fn()
}));

let mockValidationMessages = [];
function getState() {
  return {
    experiments: {
      hidingAdmissionItems: 1
    },
    event: {
      timezone: 35,
      products: {
        admissionItems: {
          admissionItem1: {
            id: 'admissionItem1',
            capacityId: 'admissionItem1',
            name: 'Admission Item Name',
            code: 'Admission Item Code',
            description: 'Admission Item Description',
            defaultFeeId: 'fee1',
            associatedOptionalSessions: [],
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
            applicableContactTypes: []
          },
          admissionItemNoFee: {
            id: 'admissionItemNoFee',
            capacityId: 'admissionItem1',
            name: 'Admission Item No Fee',
            code: 'Admission Item Code 2',
            description: 'Admission Item Description',
            associatedOptionalSessions: [],
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {},
            displayOrder: 2,
            isOpenForRegistration: true,
            applicableContactTypes: []
          },
          associatedAdmItem: {
            id: 'associatedAdmItem',
            capacityId: 'associatedAdmItem',
            name: 'Associated Admission Item Name',
            code: 'Admission Item Code',
            description: 'Admission Item Description',
            defaultFeeId: 'fee1',
            associatedOptionalSessions: ['associatedSession'],
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
                  }
                ]
              }
            },
            displayOrder: 3,
            isOpenForRegistration: true,
            applicableContactTypes: []
          },
          associatedAdmItemFull: {
            id: 'associatedAdmItemFull',
            capacityId: 'associatedAdmItemFull',
            name: 'Associated Admission Item Name with full session',
            code: 'Admission Item Code',
            description: 'Admission Item Description',
            defaultFeeId: 'fee1',
            associatedOptionalSessions: ['fullAssociatedSession'],
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
                  }
                ]
              }
            },
            displayOrder: 4,
            isOpenForRegistration: true,
            applicableContactTypes: []
          },
          admissionItem2WithCap1: {
            id: 'admissionItem2WithCap1',
            capacityId: 'admissionItem2WithCap1',
            name: 'Admission Item 2 With Cap 1',
            code: 'Admission Item 2 Code',
            description: 'Admission Item 2 Description',
            defaultFeeId: 'fee1',
            associatedOptionalSessions: [],
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
            displayOrder: 5,
            isOpenForRegistration: true,
            applicableContactTypes: []
          }
        },
        sessionContainer: {
          optionalSessions: {
            associatedSession: {
              capacityId: 'associatedSessionCapacityId'
            },
            fullAssociatedSession: {
              capacityId: 'fullAssociatedSessionCapacityId'
            }
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
      },
      validationMessages: mockValidationMessages
    },
    capacity: {
      admissionItem1: {
        active: true,
        availableCapacity: 123
      },
      associatedAdmItem: {
        active: true,
        availableCapacity: 10
      },
      associatedAdmItemFull: {
        active: true,
        availableCapacity: 0
      },
      associatedSessionCapacityId: {
        active: true,
        availableCapacity: 123
      },
      fullAssociatedSessionCapacityId: {
        active: true,
        availableCapacity: 0
      },
      admissionItem2WithCap1: {
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
    userSession: {},
    defaultUserSession: {
      isPlanner: false
    },
    visibleProducts: {
      Sessions: {
        eventRegistrationId: {
          admissionItems: {
            admissionItem1: {
              id: 'admissionItem1',
              capacityId: 'admissionItem1',
              name: 'Admission Item Name',
              code: 'Admission Item Code',
              description: 'Admission Item Description',
              defaultFeeId: 'fee1',
              associatedOptionalSessions: [],
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
              applicableContactTypes: []
            },
            admissionItemNoFee: {
              id: 'admissionItemNoFee',
              capacityId: 'admissionItem1',
              name: 'Admission Item No Fee',
              code: 'Admission Item Code 2',
              description: 'Admission Item Description',
              associatedOptionalSessions: [],
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              fees: {},
              displayOrder: 2,
              isOpenForRegistration: true,
              applicableContactTypes: []
            },
            associatedAdmItem: {
              id: 'associatedAdmItem',
              capacityId: 'associatedAdmItem',
              name: 'Associated Admission Item Name',
              code: 'Admission Item Code',
              description: 'Admission Item Description',
              defaultFeeId: 'fee1',
              associatedOptionalSessions: ['associatedSession'],
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
                    }
                  ]
                }
              },
              displayOrder: 3,
              isOpenForRegistration: true,
              applicableContactTypes: []
            },
            associatedAdmItemFull: {
              id: 'associatedAdmItemFull',
              capacityId: 'associatedAdmItemFull',
              name: 'Associated Admission Item Name with full session',
              code: 'Admission Item Code',
              description: 'Admission Item Description',
              defaultFeeId: 'fee1',
              associatedOptionalSessions: ['fullAssociatedSession'],
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
                    }
                  ]
                }
              },
              displayOrder: 4,
              isOpenForRegistration: true,
              applicableContactTypes: []
            },
            admissionItem2WithCap1: {
              id: 'admissionItem2WithCap1',
              capacityId: 'admissionItem2WithCap1',
              name: 'Admission Item 2 With Cap 1',
              code: 'Admission Item 2 Code',
              description: 'Admission Item 2 Description',
              defaultFeeId: 'fee1',
              associatedOptionalSessions: [],
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
              displayOrder: 5,
              isOpenForRegistration: true,
              applicableContactTypes: []
            }
          },
          sessionProducts: {
            associatedSession: {
              capacityId: 'associatedSessionCapacityId'
            },
            fullAssociatedSession: {
              capacityId: 'fullAssociatedSessionCapacityId'
            }
          }
        }
      },
      'AdmissionItems:admissionItemWidgetId': {
        registrationTypeId: {
          admissionItems: {
            admissionItem1: {
              id: 'admissionItem1',
              capacityId: 'admissionItem1',
              name: 'Admission Item Name',
              code: 'Admission Item Code',
              description: 'Admission Item Description',
              defaultFeeId: 'fee1',
              associatedOptionalSessions: [],
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
              applicableContactTypes: []
            },
            admissionItemNoFee: {
              id: 'admissionItemNoFee',
              capacityId: 'admissionItem1',
              name: 'Admission Item No Fee',
              code: 'Admission Item Code 2',
              description: 'Admission Item Description',
              associatedOptionalSessions: [],
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              fees: {},
              displayOrder: 2,
              isOpenForRegistration: true,
              applicableContactTypes: []
            },
            associatedAdmItem: {
              id: 'associatedAdmItem',
              capacityId: 'associatedAdmItem',
              name: 'Associated Admission Item Name',
              code: 'Admission Item Code',
              description: 'Admission Item Description',
              defaultFeeId: 'fee1',
              associatedOptionalSessions: ['associatedSession'],
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
                    }
                  ]
                }
              },
              displayOrder: 3,
              isOpenForRegistration: true,
              applicableContactTypes: []
            },
            associatedAdmItemFull: {
              id: 'associatedAdmItemFull',
              capacityId: 'associatedAdmItemFull',
              name: 'Associated Admission Item Name with full session',
              code: 'Admission Item Code',
              description: 'Admission Item Description',
              defaultFeeId: 'fee1',
              associatedOptionalSessions: ['fullAssociatedSession'],
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
                    }
                  ]
                }
              },
              displayOrder: 4,
              isOpenForRegistration: true,
              applicableContactTypes: []
            },
            admissionItem2WithCap1: {
              id: 'admissionItem2WithCap1',
              capacityId: 'admissionItem2WithCap1',
              name: 'Admission Item 2 With Cap 1',
              code: 'Admission Item 2 Code',
              description: 'Admission Item 2 Description',
              defaultFeeId: 'fee1',
              associatedOptionalSessions: [],
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
              displayOrder: 5,
              isOpenForRegistration: true,
              applicableContactTypes: []
            }
          },
          sessionProducts: {
            associatedSession: {
              capacityId: 'associatedSessionCapacityId'
            },
            fullAssociatedSession: {
              capacityId: 'fullAssociatedSessionCapacityId'
            }
          }
        }
      }
    }
  };
}

function getStateSingleAvailableProduct(includeFee, isPlanner = false) {
  const state = getState();
  // @ts-expect-error ts-migrate(2739) FIXME: Type '{ admissionItemNoFee: { id: string; capacity... Remove this comment to see the full error message
  state.visibleProducts.Sessions.eventRegistrationId.admissionItems = {
    admissionItemNoFee: {
      id: 'admissionItem',
      capacityId: 'admissionItem1',
      name: 'Admission Item',
      code: 'Admission Item Code X',
      description: 'Admission Item Description',
      defaultFeeId: 'fee1',
      associatedOptionalSessions: [],
      fees: {
        fee1: {
          isActive: true,
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
      displayOrder: 2,
      isOpenForRegistration: true,
      applicableContactTypes: []
    }
  };
  if (!includeFee) {
    state.visibleProducts.Sessions.eventRegistrationId.admissionItems.admissionItemNoFee.defaultFeeId =
      '00000000-0000-0000-0000-000000000000';
    state.visibleProducts.Sessions.eventRegistrationId.admissionItems.admissionItemNoFee.fees = {};
  }
  if (isPlanner) {
    state.defaultUserSession.isPlanner = true;
  }
  return state;
}

const apolloClient = {};
async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState, { apolloClient });
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
  id: 'widget:admissionItems',
  'data-cvent-id': 'widget-AdmissionItems-widget:admissionItems',
  store: { dispatch, getState, subscribe },
  layout: {
    cellSize: 4
  }
};

const reducer = state => state;

const createMockStore = state => {
  return createStore(reducer, state, applyMiddleware(thunk));
};

const createWidget = (state, props) => {
  return renderer.create(
    <Provider store={createMockStore(state)}>
      <AdmissionItemsWidget {...props} />
    </Provider>
  );
};

const mountWidget = (state, props) => {
  return mount(
    <Provider store={createMockStore(state)}>
      <AdmissionItemsWidget {...props} />
    </Provider>
  );
};

describe('AdmissionItemsTest', () => {
  test('should render', () => {
    const component = createWidget(getState(), defaultProps);
    expect(component).toMatchSnapshot();
  });

  test('should be able to select admission item', async () => {
    (validateAdmissionItemChange as $TSFixMe).mockImplementation(() => {
      return { isValid: true };
    });
    const widget = mountWidget(getState(), defaultProps);
    expect(widget).toMatchSnapshot();
    widget
      .find(
        '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-select-button"]'
      )
      .hostNodes()
      .simulate('click');
    await wait(0);
    expect(selectAdmissionItem).toHaveBeenCalled();
  });
  test('should be able to select free admission item', async () => {
    (selectAdmissionItem as $TSFixMe).mockClear();
    (validateAdmissionItemChange as $TSFixMe).mockImplementation(() => {
      return { isValid: true };
    });
    const widget = mountWidget(getState(), defaultProps);
    widget
      .find(
        '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItemNoFee-select-button"]'
      )
      .hostNodes()
      .simulate('click');
    await wait(0);
    expect(selectAdmissionItem).toHaveBeenCalled();
    expect(widget).toMatchSnapshot();
  });
  test('should not be able to select full admission item', () => {
    (validateAdmissionItemChange as $TSFixMe).mockImplementation(() => {
      return { isValid: true };
    });
    const widget = mountWidget(getState(), defaultProps);
    const selectButton = widget
      .find(
        '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-associatedAdmItemFull-select-button"]'
      )
      .exists();
    expect(selectButton).toBe(false);
    expect(widget).toMatchSnapshot();
  });
  test('For hybrid events, select button will be visible in case of full admission item', () => {
    (validateAdmissionItemChange as $TSFixMe).mockImplementation(() => {
      return { isValid: true };
    });
    const getStateWithEventFormatHybrid = () => {
      const state = getState();
      state.event = {
        ...state.event,
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ attendingFormat: number; timezone: number;... Remove this comment to see the full error message
        attendingFormat: AttendingFormat.HYBRID
      };
      return state;
    };
    const customProps = {
      ...defaultProps,
      store: { dispatch, getState: getStateWithEventFormatHybrid, subscribe }
    };
    const widget = mountWidget(getStateWithEventFormatHybrid(), customProps);
    const selectButton = widget
      .find(
        '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-associatedAdmItemFull-select-button"]'
      )
      .exists();
    expect(selectButton).toBe(true);
  });

  test('should trigger conflict modal', async () => {
    (selectAdmissionItem as $TSFixMe).mockClear();
    (validateAdmissionItemChange as $TSFixMe).mockImplementation(() => {
      return { isValid: false };
    });
    const widget = mountWidget(getState(), defaultProps);
    expect(widget).toMatchSnapshot();
    widget
      .find(
        '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-select-button"]'
      )
      .hostNodes()
      .simulate('click');

    await wait(0);
    expect(updateExpandedHotels).toHaveBeenCalled();
    expect(openAdmissionItemSelectionConflictDialog).toHaveBeenCalled();
  });

  test('should trigger conflict modal on session overlap', () => {
    mockValidationMessages = [
      {
        localizationKey: 'REGAPI.SESSIONS_OVERLAP'
      }
    ];
    (selectAdmissionItem as $TSFixMe).mockClear();
    (validateAdmissionItemChange as $TSFixMe).mockImplementation(() => {
      return { isValid: false };
    });
    const widget = mountWidget(getState(), defaultProps);
    expect(widget).toMatchSnapshot();
    widget
      .find(
        '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-select-button"]'
      )
      .hostNodes()
      .simulate('click');

    expect(openAdmissionItemSelectionConflictDialog).toHaveBeenCalledWith(expect.any(Object));
    mockValidationMessages = [];
  });

  test('should render on non-registration pages', () => {
    const props = {
      ...defaultProps,
      isRegistrationPage: false
    };
    const component = createWidget(getState(), props);
    expect(component).toMatchSnapshot();
  });

  // DO NOT REMOVE // Verifies FLEX-71362.2
  test('should NOT render without visible products defined', () => {
    const getStateNoProducts = () => {
      const state = getState();
      // @ts-expect-error ts-migrate(2741) FIXME: Property ''AdmissionItems:admissionItemWidgetId'' ... Remove this comment to see the full error message
      state.visibleProducts = {
        Sessions: undefined
      };
      return state;
    };
    const props = {
      ...defaultProps,
      store: { dispatch, getState: getStateNoProducts, subscribe }
    };
    const component = createWidget(getStateNoProducts(), props);
    expect(component.toJSON()).toBeNull();
  });

  // DO NOT REMOVE // Verifies FLEX-71362.16
  test('should render without visible products defined WITHOUT experiment enabled', () => {
    const getStateNoProducts = () => {
      const state = getState();
      // @ts-expect-error ts-migrate(2741) FIXME: Property ''AdmissionItems:admissionItemWidgetId'' ... Remove this comment to see the full error message
      state.visibleProducts = {
        Sessions: undefined
      };
      // @ts-expect-error ts-migrate(2741) FIXME: Property 'hidingAdmissionItems' is missing in type... Remove this comment to see the full error message
      state.experiments = {};
      return state;
    };
    const props = {
      ...defaultProps,
      store: { dispatch, getState: getStateNoProducts, subscribe }
    };
    const component = createWidget(getStateNoProducts(), props);
    expect(component).toMatchSnapshot();
  });

  // DO NOT REMOVE // Verifies FLEX-71362.2.1
  test('should NOT render with just a single available admission item', () => {
    const props = {
      ...defaultProps,
      store: { getState: getStateSingleAvailableProduct }
    };
    const includeFee = false;
    const component = createWidget(getStateSingleAvailableProduct(includeFee), props);
    expect(component.toJSON()).toBeNull();
  });

  // DO NOT REMOVE // Verifies FLEX-71362.2.2
  test('should render with just a single available admission item with a fee', () => {
    const props = {
      ...defaultProps,
      store: { getState: getStateSingleAvailableProduct }
    };
    const includeFee = true;
    const component = createWidget(getStateSingleAvailableProduct(includeFee), props);
    expect(component.toJSON()).toBeTruthy();
  });

  // DO NOT REMOVE // Verifies FLEX-71362.2.2
  test('should NOT render with just a single available admission item if it has no fee', () => {
    const props = {
      ...defaultProps,
      store: { getState: getStateSingleAvailableProduct }
    };
    const includeFee = false;
    const component = createWidget(getStateSingleAvailableProduct(includeFee), props);
    expect(component.toJSON()).toBeNull();
  });

  // DO NOT REMOVE // Verifies FLEX-71362.2.3
  test('should render with just a single available admission item if isPlanner', () => {
    const props = {
      ...defaultProps,
      store: {
        getState: getStateSingleAvailableProduct
      }
    };
    const includeFee = true;
    const isPlanner = true;
    const component = createWidget(getStateSingleAvailableProduct(includeFee, isPlanner), props);
    expect(component).toMatchSnapshot();
  });
});

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Admission Item Widget tests when isGraphQLExperiment is enabled.
describe('isGraphQLExperiment ON: AdmissionItems tests', () => {
  const admissionItems = {
    admissionItem1: {
      id: 'admissionItem1',
      capacityId: 'admissionItem1',
      name: 'Admission Item Name',
      code: 'Admission Item Code',
      description: 'Admission Item Description',
      defaultFeeId: 'fee1',
      displayOrder: 1,
      visible: 'AVAILABLE',
      capacity: {
        inPerson: {
          available: 10
        }
      }
    },
    admissionItem2WithCap1: {
      id: 'admissionItem2WithCap1',
      capacityId: 'admissionItem2WithCap1',
      name: 'Admission Item 2 Name',
      code: 'Admission Item 2 Code',
      description: 'Admission Item 2 Description',
      defaultFeeId: 'fee1',
      associatedOptionalSessions: [],
      displayOrder: 1,
      visible: 'AVAILABLE',
      capacity: {
        inPerson: {
          available: 10
        }
      }
    }
  };
  (useAdmissionItems as $TSFixMe).mockImplementation(() => admissionItems);
  (getPrimaryVisibleAdmissionItems as $TSFixMe).mockImplementation(() => admissionItems);

  const state = {
    ...getState(),
    experiments: {
      graphQLForEventCapacitiesVariant: 1
    }
  };

  test('should show capacity and select button', async () => {
    const widget = mountWidget(state, defaultProps);
    expect(
      widget
        .find(
          '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-capacity"]'
        )
        .exists()
    ).toBeTruthy();
    expect(
      widget
        .find(
          '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-capacity-inPersonCapacity"]'
        )
        .exists()
    ).toBeTruthy();
    expect(
      widget
        .find(
          '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-capacity-virtualCapacity"]'
        )
        .exists()
    ).toBeFalsy();
    expect(
      widget
        .find(
          '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-select-button"]'
        )
        .exists()
    ).toBe(true);
  });

  test('should show capacity full and no select button', async () => {
    Object.values(admissionItems)[1].capacity.inPerson.available = 0;

    const widget = mountWidget(state, defaultProps);
    expect(
      widget
        .find(
          '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-capacity"]'
        )
        .exists()
    ).toBeTruthy();
    expect(
      widget
        .find(
          '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-capacity-capacityFull"]'
        )
        .exists()
    ).toBeTruthy();
    expect(
      widget
        .find(
          '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-capacity-inPersonCapacity"]'
        )
        .exists()
    ).toBeFalsy();
    expect(
      widget
        .find(
          '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-capacity-virtualCapacity"]'
        )
        .exists()
    ).toBeFalsy();
    expect(
      widget
        .find(
          '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-select-button"]'
        )
        .exists()
    ).toBe(false);
  });

  test('should not show capacity when capacity is unlimited and show select button', async () => {
    Object.values(admissionItems)[1].capacity.inPerson.available = -1;
    (Object.values(admissionItems)[1].capacity.inPerson as $TSFixMe).total = -1;

    const widget = mountWidget(state, defaultProps);
    expect(
      widget
        .find(
          '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-capacity"]'
        )
        .exists()
    ).toBeTruthy();
    expect(
      widget
        .find(
          '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-capacity-capacityFull"]'
        )
        .exists()
    ).toBeFalsy();
    expect(
      widget
        .find(
          '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-capacity-inPersonCapacity"]'
        )
        .exists()
    ).toBeFalsy();
    expect(
      widget
        .find(
          '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-capacity-virtualCapacity"]'
        )
        .exists()
    ).toBeFalsy();
    expect(
      widget
        .find(
          '[data-cvent-id="widget-AdmissionItems-widget:admissionItems-admission-items-item-admissionItem2WithCap1-select-button"]'
        )
        .exists()
    ).toBe(true);
  });
});
