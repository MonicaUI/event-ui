import React from 'react';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import { mount } from 'enzyme';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import dialogContainerReducer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import { wait } from '../../../testUtils';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../../__mocks__/documentElementMock';
import { validateNoAvailableAdmissionItemOrEventCapacity } from '../GuestProductCapacityReachedDialog';
import { getTotalAdmissionItemCapacityAvailable } from '../../../redux/selectors/currentRegistrant';
import { isGuestProductSelectionEnabledOnRegPath } from '../../../redux/selectors/currentRegistrationPath';
import { getAdmissionItems } from '../../../redux/selectors/event';
import { openGuestProductCapacityReachedDialog } from '../GuestProductCapacityReachedDialog';
getMockedMessageContainer();

let regCartGuests;
beforeEach(() => {
  jest.resetModules();
  regCartGuests = require('../../../redux/registrationForm/regCart/guests');
  regCartGuests.updateGuestsInRegCart = jest.fn(() => ({ type: 'DummyAction' }));
});
jest.mock('../../../dialogs/shared/getDialogContainerStyle', () => jest.fn(() => ({ type: 'DummyAction' })));
jest.mock('../../../redux/selectors/currentRegistrationPath', () => ({
  getRegistrationStartPageId: jest.fn(() => () => {}),
  isGuestProductSelectionEnabledOnRegPath: jest.fn(() => {
    return false;
  }),
  getRegistrationPathIdOrDefault: jest.fn(() => () => {}),
  isGuestRegistrationTypeSelectionEnabledOnRegPath: jest.fn(() => () => {})
}));
jest.mock('../../../redux/selectors/productSelectors', () => ({
  getSelectedSessionDefinitions: jest.fn(() => {
    return {
      s1: {
        id: 's1',
        capacityId: 's1',
        isOpenForRegistration: true
      },
      s2: {
        id: 's2',
        capacityId: 's2',
        isOpenForRegistration: false
      }
    };
  }),
  getPrimaryAndGuestSortedVisibleAdmissionItems: jest.fn(() => [
    {
      id: '1',
      capacityId: '1'
    },
    {
      id: '2',
      capacityId: '2'
    }
  ]),
  getAllSortedSessionsForPrimaryAndGuest: jest.fn(() => [
    {
      id: 's1',
      capacityId: 's1'
    }
  ])
}));
jest.mock('../../../redux/selectors/currentRegistrant', () => ({
  getEventRegistrationId: jest.fn(() => 'primary'),
  isRegApprovalRequired: jest.fn(() => false),
  guests: jest.fn(() => [
    {
      eventRegistrationId: 'guest1',
      primaryRegistrationId: 'primary',
      productRegistrations: [
        {
          productId: '1',
          requestedAction: 'UNREGISTER'
        }
      ],
      requestedAction: 'REGISTER'
    }
  ]),
  getSelectedAdmissionItem: jest.fn(() => {
    return {
      productId: 1
    };
  }),
  getSelectedAdmissionItemDefinition: jest.fn(() => {
    return {
      id: '1',
      capacityId: '1',
      isOpenForRegistration: true
    };
  }),
  guestRegistrantsCount: jest.fn(() => {
    return 0;
  }),
  getVisibleRegistrationTypesForGuestDialog: jest.fn(() => {}),
  getTotalAdmissionItemCapacityAvailable: jest.fn(() => {
    return 0;
  }),
  getSelectedSessionWaitlists: jest.fn(() => {})
}));

jest.mock('../../../redux/registrationForm/regCart/selectors', () => ({
  getGuestsOfRegistrant: jest.fn(() => [
    {
      eventRegistrationId: 'guest1',
      primaryRegistrationId: 'primary',
      productRegistrations: [
        {
          productId: '1',
          requestedAction: 'REGISTER'
        }
      ],
      requestedAction: 'REGISTER'
    }
  ]),
  getSelectedAdmissionItem: jest.fn(cart =>
    cart?.eventRegistrations?.guest2
      ? undefined
      : {
          productId: 'AD1',
          productType: 'AdmissionItem',
          quantity: 1,
          requestedAction: 'REGISTER'
        }
  )
}));

jest.mock('../../../redux/visibleProducts', () => {
  return {
    populateVisibleProducts: jest.fn(() => ({
      type: '[MOCK]/LOAD_VISIBLE_SESSION_PRODUCTS',
      payload: {}
    }))
  };
});

jest.mock('../../../redux/selectors/event', () => ({
  getGuestRegistrationTypeSettings: jest.fn(() => {
    return {
      limitVisibility: false,
      isRequired: true,
      categorizedRegistrationTypes: []
    };
  }),
  getAdmissionItems: jest.fn(() => [
    {
      id: '1',
      capacityId: '1'
    },
    {
      id: '2',
      capacityId: '2'
    }
  ]),
  getAdmissionItem: jest.fn(() => {
    return {
      id: '1',
      capacityId: '1'
    };
  })
}));

jest.mock('../../../redux/pathInfo', () => ({
  routeToPage: jest.fn(() => ({ type: 'DummyAction' }))
}));

jest.mock('../../GuestDetailsDialog/GuestDetailsDialog', () => ({
  openGuestDetailsDialog: jest.fn(() => () => {})
}));

jest.mock('../../CapacityReachedDialog', () => ({
  openCapacityReachedDialog: jest.fn(() => () => {})
}));

jest.mock('event-widgets/lib/Sessions/useVisibleSessionBundles', () => ({
  allSessionBundlesVar: jest.fn(() => ({
    bundle1: {
      id: 'bundle1',
      capacity: {
        availableCapacity: 0
      }
    }
  }))
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CapacityReachedDialog = require('../../CapacityReachedDialog');

test('Capacity reached dialog should be opened if there are no admission items with capacity', () => {
  // create store with capacity
  const capacity = {
    1: {
      capacityId: '1',
      availableCapacity: 0,
      active: true
    },
    2: {
      capacityId: '2',
      availableCapacity: 1,
      active: true
    },
    [EventSnapshot.eventSnapshot.capacityId]: {
      capacityId: EventSnapshot.eventSnapshot.capacityId,
      availableCapacity: -1,
      active: true
    },
    s1: {
      capacityId: 's1',
      active: true,
      availableCapacity: -1
    }
  };
  const regCart = {
    ...registrationFormForStore.regCart,
    eventRegistrations: {
      ...registrationFormForStore.regCart.eventRegistrations,
      guest2: {
        eventRegistrationId: 'guest2',
        primaryRegistrationId: 'primaryId',
        productRegistrations: [],
        requestedAction: 'REGISTER'
      }
    }
  };
  const store = createStore(capacity, regCart);
  store.dispatch(openGuestProductCapacityReachedDialog(regCart));
  expect(CapacityReachedDialog.openCapacityReachedDialog).toHaveBeenCalled();
});

test('Capacity reached dialog should be opened if event is out of capacity', () => {
  // create store with capacity
  const capacity = [
    {
      capacityId: '1',
      availableCapacity: -1,
      active: true
    },
    {
      capacityId: '2',
      availableCapacity: -1,
      active: true
    },
    {
      capacityId: EventSnapshot.eventSnapshot.capacityId,
      availableCapacity: 0,
      active: true
    },
    {
      capacityId: 's1',
      active: true,
      availableCapacity: -1
    }
  ];
  const store = createStore(capacity);
  const regCart = {};
  store.dispatch(openGuestProductCapacityReachedDialog(regCart));
  expect(CapacityReachedDialog.openCapacityReachedDialog).toHaveBeenCalled();
});

test('Guest conflict dialog should not be displayed if selected admission item reached capacity', () => {
  // create store with capacity
  const capacity = [
    {
      capacityId: '1',
      availableCapacity: 0,
      active: true
    },
    {
      capacityId: '2',
      availableCapacity: 2,
      active: true
    },
    {
      capacityId: EventSnapshot.eventSnapshot.capacityId,
      availableCapacity: 5,
      active: true
    },
    {
      capacityId: 's1',
      active: true,
      availableCapacity: -1
    }
  ];
  const store = createStore(capacity);
  const dialogContainer = createDialogContainer(store);
  const regCart = {};
  store.dispatch(openGuestProductCapacityReachedDialog(regCart));
  expect(CapacityReachedDialog.openCapacityReachedDialog).toHaveBeenCalled();
  expect(dialogContainer).toMatchSnapshot();
});

test('Guest conflict dialog should be displayed if there is any session selected in the regcart with insufficient capacity', () => {
  // create store with capacity
  const capacity = [
    {
      capacityId: '1',
      availableCapacity: 4,
      active: true
    },
    {
      capacityId: '2',
      availableCapacity: 2,
      active: true
    },
    {
      capacityId: EventSnapshot.eventSnapshot.capacityId,
      availableCapacity: 5,
      active: true
    },
    {
      capacityId: 's1',
      active: true,
      availableCapacity: 1
    }
  ];
  const store = createStore(capacity);
  const dialogContainer = createDialogContainer(store);
  const regCart = {
    eventRegistrations: {
      primary: {
        eventRegistrationId: 'primary',
        productRegistrations: [
          {
            productId: '1',
            requestedAction: 'REGISTER'
          }
        ],
        sessionRegistrations: {
          s1: {
            productId: 's1',
            requestedAction: 'REGISTER'
          }
        },
        requestedAction: 'REGISTER'
      },
      guest1: {
        eventRegistrationId: 'guest1',
        primaryRegistrationId: 'primary',
        productRegistrations: [
          {
            productId: '1',
            requestedAction: 'REGISTER'
          }
        ],
        sessionRegistrations: {
          s1: {
            productId: 's1',
            requestedAction: 'REGISTER'
          }
        },
        requestedAction: 'REGISTER'
      }
    }
  };
  store.dispatch(openGuestProductCapacityReachedDialog(regCart));
  expect(dialogContainer).toMatchSnapshot();
});

test("validateNoAvailableAdmissionItemOrEventCapacity should return TRUE if:\n\t- guest product selection is enabled (don't assign agenda to guests)\n\t- guest reg type selection is OFF\n\t- default reg type has no admission items available", async () => {
  const state = {
    event: {
      eventFeatureSetup: {
        registrationProcess: {
          multipleRegistrationTypes: true
        }
      }
    },
    registrationForm: { regCart: {} },
    defaultUserSession: { isPreview: false }
  };
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockReturnValueOnce' does not exist on t... Remove this comment to see the full error message
  getAdmissionItems.mockReturnValueOnce([
    {
      id: '1',
      capacityId: '1',
      applicableContactTypes: ['00000000-0000-0000-0000-000000000000'],
      isOpenForRegistration: true
    },
    {
      id: '2',
      capacityId: '2',
      applicableContactTypes: ['00000000-0000-0000-0000-000000000000'],
      isOpenForRegistration: true
    }
  ]);
  (isGuestProductSelectionEnabledOnRegPath as $TSFixMe).mockReturnValueOnce(true);
  expect(validateNoAvailableAdmissionItemOrEventCapacity(1, state, true)).toEqual(true);
});

test("validateNoAvailableAdmissionItemOrEventCapacity should return FALSE if:\n\t- guest product selection is enabled (don't assign agenda to guests)\n\t- guest reg type selection is OFF\n\t- default reg type has admission items available", async () => {
  const state = {
    event: {
      eventFeatureSetup: {
        registrationProcess: {
          multipleRegistrationTypes: false
        }
      }
    },
    registrationForm: { regCart: {} },
    defaultUserSession: { isPreview: false },
    capacity: {
      1: {
        totalCapacityAvailable: -1
      }
    }
  };
  (isGuestProductSelectionEnabledOnRegPath as $TSFixMe).mockReturnValueOnce(true);
  (getTotalAdmissionItemCapacityAvailable as $TSFixMe).mockReturnValueOnce(2);
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockReturnValueOnce' does not exist on t... Remove this comment to see the full error message
  getAdmissionItems.mockReturnValueOnce([
    {
      id: '1',
      capacityId: '1',
      applicableContactTypes: ['00000000-0000-0000-0000-000000000000'],
      isOpenForRegistration: true
    },
    {
      id: '2',
      capacityId: '2',
      applicableContactTypes: ['00000000-0000-0000-0000-000000000000'],
      isOpenForRegistration: true
    }
  ]);
  expect(validateNoAvailableAdmissionItemOrEventCapacity(1, state, true)).toEqual(false);
});

test("validateNoAvailableAdmissionItemOrEventCapacity should return TRUE if:\n\t- guest product selection is enabled (don't assign agenda to guests)\n\t- guest reg type selection is ON\n\t- default reg type has no admission items available", async () => {
  const state = {
    event: {
      eventFeatureSetup: {
        registrationProcess: {
          multipleRegistrationTypes: true
        }
      }
    },
    registrationForm: { regCart: {} },
    defaultUserSession: { isPreview: false }
  };
  (isGuestProductSelectionEnabledOnRegPath as $TSFixMe).mockReturnValueOnce(true);
  expect(validateNoAvailableAdmissionItemOrEventCapacity(1, state, true)).toEqual(true);
});

test(`validateNoAvailableAdmissionItemOrEventCapacity should return FALSE if:
    - guest product selection is enabled (don't assign agenda to guests)
    - guest reg type selection is OFF
    - admission item capacity is available but only across multiple admission items (PROD-126052)`, async () => {
  const state = {
    event: {
      eventFeatureSetup: {
        registrationProcess: {
          multipleRegistrationTypes: false
        }
      }
    },
    registrationForm: { regCart: {} },
    defaultUserSession: { isPreview: false },
    capacity: {
      1: {
        totalCapacityAvailable: 4,
        availableCapacity: 4
      },
      2: {
        totalCapacityAvailable: 1,
        availableCapacity: 1
      }
    }
  };
  (isGuestProductSelectionEnabledOnRegPath as $TSFixMe).mockReturnValueOnce(true);
  getTotalAdmissionItemCapacityAvailable.mockReturnValueOnce(5);
  (getAdmissionItems as $TSFixMe).mockReturnValueOnce([
    {
      id: '1',
      capacityId: '1',
      applicableContactTypes: ['00000000-0000-0000-0000-000000000000'],
      isOpenForRegistration: true
    },
    {
      id: '2',
      capacityId: '2',
      applicableContactTypes: ['00000000-0000-0000-0000-000000000000'],
      isOpenForRegistration: true
    }
  ]);
  expect(validateNoAvailableAdmissionItemOrEventCapacity(4, state, true)).toEqual(false);
});

describe('GuestProductSelectionOn Tests', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let event = require('../../../redux/selectors/event');
  event.getAdmissionItems = jest.fn(() => [
    {
      id: '1',
      capacityId: '1',
      applicableContactTypes: ['00000000-0000-0000-0000-000000000000'],
      isOpenForRegistration: true
    },
    {
      id: '2',
      capacityId: '2',
      applicableContactTypes: ['00000000-0000-0000-0000-000000000000'],
      isOpenForRegistration: true
    }
  ]);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const currentRegistrationPath = require('../../../redux/selectors/currentRegistrationPath');
  currentRegistrationPath.isGuestProductSelectionEnabledOnRegPath = jest.fn(() => {
    return true;
  });
  currentRegistrationPath.isGuestRegistrationTypeSelectionEnabledOnRegPath = jest.fn(() => {
    return true;
  });
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let currentRegistrant = require('../../../redux/selectors/currentRegistrant');
  currentRegistrant.getVisibleRegistrationTypesForGuestDialog = jest.fn(() => [
    {
      id: '4e271dd1-8e5c-4a95-95f5-da6897d64e5d',
      text: 'regType 1'
    }
  ]);
  // GuestRegTypeSelectonOn RegTypes required
  test('CapacityReachedDialog renders if there are no adm items associated to guest regTypes', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const regCartSelectors = require('../../../redux/registrationForm/regCart/selectors');
    regCartSelectors.getGuestsOfRegistrant = jest.fn(() => [
      {
        eventRegistrationId: 'guest1',
        primaryRegistrationId: 'primary',
        requestedAction: 'REGISTER'
      }
    ]);
    regCartSelectors.getSelectedAdmissionItem = jest.fn(() => undefined);
    // create store with capacity
    const capacity = [
      {
        capacityId: '1',
        availableCapacity: 0,
        active: true
      },
      {
        capacityId: '2',
        availableCapacity: 0,
        active: true
      },
      {
        capacityId: EventSnapshot.eventSnapshot.capacityId,
        availableCapacity: -1,
        active: true
      },
      {
        capacityId: 's1',
        active: true,
        availableCapacity: -1
      }
    ];
    const store = createStore(capacity);
    const dialogContainer = createDialogContainer(store);
    const regCart = {};
    store.dispatch(openGuestProductCapacityReachedDialog(regCart, true));
    expect(dialogContainer).toMatchSnapshot();
    expect(CapacityReachedDialog.openCapacityReachedDialog).toHaveBeenCalled();
  });

  // GuestRegTypeSelectonOn RegTypes not required
  test('CapacityReachedDialog doesnt renders if there are available products to guest regType', () => {
    event = require('../../../redux/selectors/event');
    currentRegistrant = require('../../../redux/selectors/currentRegistrant');
    currentRegistrant.getTotalAdmissionItemCapacityAvailable.mockImplementation(() => Infinity);
    event.getGuestRegistrationTypeSettings = jest.fn(() => {
      return {
        limitVisibility: false,
        isRequired: false,
        categorizedRegistrationTypes: []
      };
    });
    // create store with capacity
    const capacity = [
      {
        capacityId: '1',
        totalCapacityAvailable: -1,
        availableCapacity: -1,
        active: true
      },
      {
        capacityId: '2',
        totalCapacityAvailable: -1,
        availableCapacity: -1,
        active: true
      },
      {
        capacityId: EventSnapshot.eventSnapshot.capacityId,
        availableCapacity: -1,
        active: true
      },
      {
        capacityId: 's1',
        active: true,
        availableCapacity: -1
      }
    ];
    const store = createStore(capacity);
    const dialogContainer = createDialogContainer(store);
    const regCart = {};
    store.dispatch(openGuestProductCapacityReachedDialog(regCart));
    expect(dialogContainer).toMatchSnapshot();
  });

  test('Simulate continue click on conflict dialog for sessions, should call updateGuestsInRegCart', async () => {
    // create store with capacity
    const capacity = [
      {
        capacityId: '1',
        availableCapacity: 4,
        active: true
      },
      {
        capacityId: '2',
        availableCapacity: 2,
        active: true
      },
      {
        capacityId: EventSnapshot.eventSnapshot.capacityId,
        availableCapacity: 5,
        active: true
      },
      {
        capacityId: 's1',
        active: true,
        availableCapacity: 0
      }
    ];
    const store = createStore(capacity);
    const dialogContainer = createDialogContainer(store);
    const regCart = {
      eventRegistrations: {
        primary: {
          eventRegistrationId: 'primary',
          productRegistrations: [
            {
              productId: '1',
              requestedAction: 'REGISTER'
            }
          ],
          sessionRegistrations: {
            s1: {
              productId: 's1',
              requestedAction: 'REGISTER'
            },
            sessionFromBundle1: {
              productId: 'sessionFromBundle1',
              registrationSourceParentId: 'bundle1',
              requestedAction: 'REGISTER'
            }
          },
          sessionBundleRegistrations: {
            bundle1: {
              productId: 'bundle1',
              requestedAction: 'REGISTER'
            }
          },
          requestedAction: 'REGISTER'
        },
        guest1: {
          eventRegistrationId: 'guest1',
          primaryRegistrationId: 'primary',
          productRegistrations: [
            {
              productId: '1',
              requestedAction: 'REGISTER'
            }
          ],
          sessionRegistrations: {
            s1: {
              productId: 's1',
              requestedAction: 'REGISTER'
            }
          },
          sessionBundleRegistrations: {
            bundle1: {
              productId: 'bundle1',
              requestedAction: 'REGISTER'
            }
          },
          requestedAction: 'REGISTER'
        }
      }
    };
    store.dispatch(openGuestProductCapacityReachedDialog(regCart));
    dialogContainer.update();
    dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
    await wait(0);
    const regCartAfterUpdate = {
      eventRegistrations: {
        primary: {
          eventRegistrationId: 'primary',
          productRegistrations: [
            {
              productId: '1',
              requestedAction: 'REGISTER'
            }
          ],
          sessionRegistrations: {
            s1: {
              productId: 's1',
              requestedAction: 'UNREGISTER'
            },
            sessionFromBundle1: {
              productId: 'sessionFromBundle1',
              registrationSourceParentId: 'bundle1',
              requestedAction: 'UNREGISTER'
            }
          },
          sessionBundleRegistrations: {
            bundle1: {
              productId: 'bundle1',
              requestedAction: 'UNREGISTER'
            }
          },
          requestedAction: 'REGISTER'
        },
        guest1: {
          eventRegistrationId: 'guest1',
          primaryRegistrationId: 'primary',
          productRegistrations: [
            {
              productId: '1',
              requestedAction: 'REGISTER'
            }
          ],
          sessionRegistrations: {
            s1: {
              productId: 's1',
              requestedAction: 'UNREGISTER'
            }
          },
          sessionBundleRegistrations: {
            bundle1: {
              productId: 'bundle1',
              requestedAction: 'UNREGISTER'
            }
          },
          requestedAction: 'REGISTER'
        }
      }
    };
    expect(regCartGuests.updateGuestsInRegCart).toHaveBeenCalledWith(regCartAfterUpdate);
  });
  test("validateNoAvailableAdmissionItemOrEventCapacity should return FALSE if:\n\t- guest product selection is enabled (don't assign agenda to guests)\n\t- guest reg type selection is ON\n\t- default reg type has admission items available", async () => {
    const state = {
      event: {
        product: {
          admissionItems: {}
        },
        eventFeatureSetup: {
          registrationProcess: {}
        }
      },
      registrationForm: { regCart: {} },
      defaultUserSession: { isPreview: false },
      capacity: [
        {
          capacityId: '1',
          availableCapacity: 4,
          active: true
        },
        {
          capacityId: '2',
          availableCapacity: 2,
          active: true
        }
      ]
    };
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockReturnValueOnce' does not exist on t... Remove this comment to see the full error message
    getAdmissionItems.mockReturnValueOnce([
      {
        id: '1',
        capacityId: '1',
        applicableContactTypes: ['00000000-0000-0000-0000-000000000000'],
        isOpenForRegistration: true
      },
      {
        id: '2',
        capacityId: '2',
        applicableContactTypes: ['00000000-0000-0000-0000-000000000000'],
        isOpenForRegistration: true
      }
    ]);
    (getTotalAdmissionItemCapacityAvailable as $TSFixMe).mockReturnValueOnce(2);
    (isGuestProductSelectionEnabledOnRegPath as $TSFixMe).mockReturnValueOnce(true);
    expect(validateNoAvailableAdmissionItemOrEventCapacity(1, state, true)).toEqual(false);
  });
});

test('Simulate continue click on conflict dialog for sessions, should call updateGuestsInRegCart for closed registrations', async () => {
  // create store with capacity
  const capacity = [
    {
      capacityId: '1',
      availableCapacity: 4,
      active: true
    },
    {
      capacityId: 's1',
      active: true,
      availableCapacity: 3
    }
  ];
  const store = createStore(capacity);
  const dialogContainer = createDialogContainer(store);
  const regCart = {
    eventRegistrations: {
      primary: {
        eventRegistrationId: 'primary',
        productRegistrations: [
          {
            productId: '1',
            requestedAction: 'REGISTER'
          }
        ],
        sessionRegistrations: {
          s1: {
            productId: 's1',
            requestedAction: 'REGISTER'
          }
        },
        requestedAction: 'REGISTER'
      },
      guest1: {
        eventRegistrationId: 'guest1',
        primaryRegistrationId: 'primary',
        productRegistrations: [
          {
            productId: '1',
            requestedAction: 'REGISTER'
          }
        ],
        sessionRegistrations: {
          s2: {
            productId: 's2',
            requestedAction: 'REGISTER'
          }
        },
        requestedAction: 'REGISTER'
      }
    }
  };

  store.dispatch(openGuestProductCapacityReachedDialog(regCart));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  const regCartAfterUpdate = {
    eventRegistrations: {
      primary: {
        eventRegistrationId: 'primary',
        productRegistrations: [
          {
            productId: '1',
            requestedAction: 'REGISTER'
          }
        ],
        sessionRegistrations: {
          s1: {
            productId: 's1',
            requestedAction: 'REGISTER'
          }
        },
        requestedAction: 'REGISTER'
      },
      guest1: {
        eventRegistrationId: 'guest1',
        primaryRegistrationId: 'primary',
        productRegistrations: [
          {
            productId: '1',
            requestedAction: 'REGISTER'
          }
        ],
        sessionRegistrations: {
          s2: {
            productId: 's2',
            requestedAction: 'UNREGISTER'
          }
        },
        requestedAction: 'REGISTER'
      }
    }
  };
  expect(regCartGuests.updateGuestsInRegCart).toHaveBeenCalledWith(regCartAfterUpdate);
});
function createDialogContainer(store) {
  return mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );
}

const defaultUserSessionForStore = {
  isPlanner: false
};

const eventForStore = {
  ...EventSnapshot.eventSnapshot,
  eventFeatureSetup: {
    ...EventSnapshot.eventSnapshot.eventFeatureSetup,
    registrationProcess: {
      ...EventSnapshot.eventSnapshot.eventFeatureSetup.registrationProcess,
      multipleRegistrationTypes: true
    }
  }
};

const registrationFormForStore = {
  regCart: {
    eventRegistrations: {
      primaryId: {
        eventRegistrationId: 'primaryId',
        attendeeType: 'ATTENDEE',
        registrationPathId: 'registrationPath1',
        productRegistrations: [
          {
            productId: 'AD1',
            productType: 'AdmissionItem',
            requestedAction: 'REGISTER'
          }
        ]
      }
    }
  }
};

const eventSnapshotClient = {
  getVisibleProducts: jest.fn(() => ({ Sessions: {} }))
};

function createStore(capacity, regCart = null) {
  return createStoreWithMiddleware(
    combineReducers({
      dialogContainer: dialogContainerReducer,
      userSession:
        () =>
        (x = {}) =>
          x,
      defaultUserSession: () => defaultUserSessionForStore,
      event: () => eventForStore,
      text: (x = {}) => x,
      registrationForm: () => (regCart ? { regCart } : registrationFormForStore),
      clients: (x = {}) => x,
      website: (x = {}) => x,
      capacity: () => capacity
    }),
    {
      text: {
        translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
      },
      clients: { productVisibilityClient: eventSnapshotClient },
      website: EventSnapshot.eventSnapshot.siteEditor.website
    }
  );
}
