/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import RegistrationTypeWidget from '../RegistrationTypeWidget/RegistrationTypeWidget';
import { Grid } from 'nucleus-core/layout/flexbox';
import { set, get, cloneDeep } from 'lodash';
import { mount } from 'enzyme';
import {
  DisplayTypes,
  ChoiceSortOrders,
  LabelPlacements
} from 'event-widgets/lib/RegistrationType/RegistrationTypeSettings';
import pageContainingWidgetFixture from '../../testUtils/pageContainingWidgetFixture';
import { validateUserRegistrationTypeSelection } from '../../dialogs/selectionConflictDialogs';
import { getUpdateErrors } from '../../redux/registrationForm/errors';
import {
  openEventTemporaryClosedErrorDialog,
  openNoAdmissionItemAvailableForRegistrationTypeDialog,
  openPrivateEventErrorDialog
} from '../../dialogs';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import { setRegistrationTypeId } from '../../redux/registrationForm/regCart/registrationTypes';
import { wait } from '../../testUtils';
import { expect } from '@jest/globals';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';
import { Provider } from 'react-redux';

jest.mock('../../redux/registrationForm/errors', () => {
  return {
    getUpdateErrors: {
      isPrivateEvent: jest.fn(),
      isAttendeeNotAllowedByCustomLogic: jest.fn(),
      isAdmissionItemsNotAvailableForRegTypeError: jest.fn(),
      isEventTemporaryClosed: jest.fn()
    }
  };
});
jest.mock('../../dialogs/selectionConflictDialogs', () => {
  return {
    validateUserRegistrationTypeSelection: jest.fn()
  };
});
jest.mock('../../dialogs');
jest.mock('../../redux/actions', () => {
  return {
    filterEventSnapshot: jest.fn(() => () => {}),
    loadRegistrationContent: jest.fn(() => () => {})
  };
});

jest.mock('../../redux/registrationForm/regCart/registrationTypes');

jest.mock('../../redux/pathInfo', () => {
  return {
    getCurrentPageId: jest.fn()
  };
});

const baseState = {
  text: {
    locale: 'en'
  },
  event: {
    registrationTypes: {},
    eventFeatureSetup: {
      registrationProcess: {
        multipleRegistrationTypes: true
      },
      agendaItems: {
        admissionItems: false
      }
    }
  },
  website: {
    ...pageContainingWidgetFixture('pageId', 'widgetId'),
    pluginData: {
      registrationProcessNavigation: {
        registrationPaths: {
          regPathId: {
            id: 'regPathId',
            pageIds: ['pageId']
          }
        }
      }
    }
  },
  appData: {
    registrationSettings: {
      registrationPaths: {
        regPathId: {
          registrationTypeSettings: {
            limitVisibility: false
          },
          guestRegistrationSettings: {
            registrationTypeSettings: {
              limitVisibility: false
            }
          },
          accessRules: {
            invitationListAccess: {
              isEmailOnlyInvite: false
            }
          }
        }
      }
    }
  },
  userSession: {},
  defaultUserSession: {
    isPreview: false
  },
  registrationForm: {
    regCart: {
      eventRegistrations: {
        eventRegId: {
          registrationPathId: 'regPathId'
        }
      }
    }
  },
  capacity: {},
  limits: {
    perEventLimits: {
      maxNumberOfGuests: {
        limit: 10
      }
    }
  }
};

const registrationTypes = {
  attendee: {
    id: 'attendee',
    name: 'Attendee',
    isOpenForRegistration: true
  },
  vip: {
    id: 'vip',
    name: 'VIP',
    isOpenForRegistration: true
  },
  employee: {
    id: 'employee',
    name: 'Employee',
    isOpenForRegistration: true
  },
  student: {
    id: 'student',
    name: 'Student',
    isOpenForRegistration: false
  },
  guest: {
    id: 'guest',
    name: 'Guest',
    isOpenForRegistration: true
  }
};

const singleAutoAssignRegistrationType = {
  attendee: {
    id: 'autoAssignRegTypeId',
    name: 'autoAssignRegTypeName',
    isOpenForRegistration: true
  }
};

const plannerSelectedRegistrationTypes = ['vip', 'attendee'];

const plannerSelectedRegTypesForGuest = ['guest'];

const eventRegistrationWithIncludedRegistrationType = () =>
  cloneDeep({
    'b3d4dd5f-f52d-4270-b45a-df90fb91f931': {
      registrationTypeId: 'vip',
      registrationPathId: 'regPathId'
    }
  });

const eventRegistrationWithAutoAssignRegTypeAssigned = isAutoAssignRegTypeApplicable =>
  cloneDeep({
    'b3d4dd5f-f52d-4270-b45a-df90fb91f931': {
      registrationTypeId: 'autoAssignRegTypeId',
      registrationPathId: 'regPathId',
      autoAssignRegTypeForEventRegistration: isAutoAssignRegTypeApplicable
    }
  });

const eventRegistrationWithNoneIncludedRegistrationType = () =>
  cloneDeep({
    'b3d4dd5f-f52d-4270-b45a-df90fb91f931': {
      registrationTypeId: 'registration-type-not-included',
      registrationPathId: 'regPathId'
    }
  });

const eventRegistrationWithRegistrationTypeNotVisibleByPlannerSettings = () =>
  cloneDeep({
    'b3d4dd5f-f52d-4270-b45a-df90fb91f931': {
      registrationTypeId: 'employee',
      registrationPathId: 'regPathId'
    }
  });

const eventRegistrationWithRegistrationTypeAtCapacity = () =>
  cloneDeep({
    'b3d4dd5f-f52d-4270-b45a-df90fb91f931': {
      registrationTypeId: 'employee',
      registrationPathId: 'regPathId'
    }
  });

const registrationTypeCapacity = {
  regType_capacity_attendee: {
    totalCapacityAvailable: -1,
    availableCapacity: -1
  },
  regType_capacity_vip: {
    totalCapacityAvailable: 200,
    availableCapacity: 200
  },
  regType_capacity_employee: {
    totalCapacityAvailable: 10,
    availableCapacity: -1
  },
  regType_capacity_student: {
    totalCapacityAvailable: 10,
    availableCapacity: 10
  },
  regType_capacity_guest: {
    totalCapacityAvailable: 2,
    availableCapacity: 2
  }
};

const reducer = state => state;

const cloneState = state => {
  const clonedState = cloneDeep(state);
  set(
    clonedState,
    ['widgetFactory', 'loadMetaData'],
    jest.fn(() => {
      return {};
    })
  );
  return clonedState;
};

const markAllRegistrationsAsRegistered = state => {
  Object.keys(get(state, ['registrationForm', 'regCart', 'eventRegistrations'])).forEach(eventRegistrationId => {
    set(
      state,
      ['registrationForm', 'regCart', 'eventRegistrations', eventRegistrationId, 'registrationStatus'],
      'REGISTERED'
    );
  });
};

const updateStateWithRegistrationTypes = state => {
  set(state, ['event', 'registrationTypes'], registrationTypes);
};

const updateStateWithEventAttendingFormat = (state, attendingFormat = AttendingFormat.INPERSON) => {
  set(state, ['event', 'attendingFormat'], attendingFormat);
};

const updateStateWithSingleAutoAssignRegistrationType = state => {
  set(state, ['event', 'registrationTypes'], singleAutoAssignRegistrationType);
};

const updateStateWithAutoAssignRegistrationTypeExperimentOn = state => {
  set(state, ['experiments', 'isFlexAutoAssignRegTypeEnabled'], true);
};

const updateStateWithPlannerLimitRegistrationTypes = state => {
  set(
    state,
    [
      'appData',
      'registrationSettings',
      'registrationPaths',
      ['regPathId'] as $TSFixMe,
      'registrationTypeSettings',
      'limitVisibility'
    ],
    true
  );
};

const updateStateWithPlannerSelectedRegistrationTypes = state => {
  set(
    state,
    [
      'appData',
      'registrationSettings',
      'registrationPaths',
      ['regPathId'] as $TSFixMe,
      'registrationTypeSettings',
      'categorizedRegistrationTypes'
    ],
    plannerSelectedRegistrationTypes
  );
};

const updateStateWithPlannerSelectedGuestRegTypes = state => {
  set(
    state,
    [
      'appData',
      'registrationSettings',
      'registrationPaths',
      ['regPathId'] as $TSFixMe,
      'guestRegistrationSettings',
      'registrationTypeSettings',
      'categorizedRegistrationTypes'
    ],
    plannerSelectedRegTypesForGuest
  );
};

const updateStateWithPlannerLimitGuestRegTypes = state => {
  set(
    state,
    [
      'appData',
      'registrationSettings',
      'registrationPaths',
      ['regPathId'] as $TSFixMe,
      'guestRegistrationSettings',
      'registrationTypeSettings',
      'limitVisibility'
    ],
    true
  );
};

const updateStateWithEventRegistration = (state, eventRegistrations) => {
  set(state, ['registrationForm', 'regCart', 'eventRegistrations'], eventRegistrations);
};

const updateStateWithDefaultRegistrationTypeIncluded = state => {
  set(state, ['userSession', 'regTypeId'], 'vip');
};

const updateStateWithDefaultRegistrationTypeNotIncluded = state => {
  set(state, ['userSession', 'regTypeId'], 'registration-type-not-included');
};

const updateStateWithDefaultRegistrationTypeNotVisibleByPlannerSettings = state => {
  set(state, ['userSession', 'regTypeId'], 'employee');
};

const updateStateWithRegistrationTypeCapacities = state => {
  set(state, ['capacity'], registrationTypeCapacity);
};

const createMockStore = state => {
  const apolloClient = {};
  return createStore(reducer, state, applyMiddleware(thunk.withExtraArgument({ apolloClient })));
};

const registrationTypeWidgetProps = {
  style: {},
  classes: {},
  translate: text => text,
  config: {
    shared: {},
    registrationFieldPageType: registrationFieldPageType.Registration
  },
  id: 'widgetId'
};

const createWidget = (state, overrides = {}) => {
  const mockStore = createMockStore(state);
  const props = { ...registrationTypeWidgetProps, ...overrides, store: mockStore };
  return renderer.create(
    <Grid>
      <Provider store={mockStore}>
        <RegistrationTypeWidget {...props} />
      </Provider>
    </Grid>
  );
};

const mountWidget = (state, overrides = {}) => {
  const mockStore = createMockStore(state);
  const props = { ...registrationTypeWidgetProps, ...overrides, store: mockStore };
  return mount(
    <Grid>
      <Provider store={mockStore}>
        <RegistrationTypeWidget {...props} />
      </Provider>
    </Grid>
  );
};

const createError = responseBody => ({
  responseStatus: 422,
  responseBody,
  httpLogRequestId: 'requestHeader',
  httpLogPageLoadId: 'pageLoadId',
  errorDateTime: new Date()
});

describe('RegistrationTypeWidget (connected) no registration types -', () => {
  test('baseline', () => {
    const initialState = cloneState(baseState);
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
  test('readonly', () => {
    const initialState = cloneState(baseState);
    markAllRegistrationsAsRegistered(initialState);
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
});

describe('RegistrationTypeWidget (connected) with registration types -', () => {
  test('baseline', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
  test('with selected registration type (included)', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithIncludedRegistrationType());
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
  test('with selected registration type (not included)', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithNoneIncludedRegistrationType());
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
  test('readonly', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    markAllRegistrationsAsRegistered(initialState);
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
  test('readonly with selected registration type (included)', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithIncludedRegistrationType());
    markAllRegistrationsAsRegistered(initialState);
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
  test('ready only with selected registration type (not included)', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithNoneIncludedRegistrationType());
    markAllRegistrationsAsRegistered(initialState);
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
});

describe('RegistrationTypeWidget (connected) with planner settings - no registration types -', () => {
  test('limit to no registration types', () => {
    const initialState = cloneState(baseState);
    updateStateWithPlannerLimitRegistrationTypes(initialState);
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
  test('limit registration types', () => {
    /*
     * TODO!!!
     * should this be an error condition? this should never happen:
     * 1. no registration types defined for an event
     * 2. planner selected registration types as visible ones
     */
    const initialState = cloneState(baseState);
    updateStateWithPlannerLimitRegistrationTypes(initialState);
    updateStateWithPlannerSelectedRegistrationTypes(initialState);
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
});

describe('RegistrationTypeWidget (connected) with planner settings - limit registration types', () => {
  test('baseline', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithPlannerLimitRegistrationTypes(initialState);
    updateStateWithPlannerSelectedRegistrationTypes(initialState);
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
  test('with selected registration type (included)', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithPlannerLimitRegistrationTypes(initialState);
    updateStateWithPlannerSelectedRegistrationTypes(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithIncludedRegistrationType());
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
  test('with selected registration type (not visible)', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithPlannerLimitRegistrationTypes(initialState);
    updateStateWithPlannerSelectedRegistrationTypes(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithRegistrationTypeNotVisibleByPlannerSettings());
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
  test('with default registration type (included)', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithPlannerLimitRegistrationTypes(initialState);
    updateStateWithPlannerSelectedRegistrationTypes(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithIncludedRegistrationType());
    updateStateWithDefaultRegistrationTypeIncluded(initialState);
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
  // this test is for attendee arriving as a known invitee
  test('with default registration type (not visible)', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithPlannerLimitRegistrationTypes(initialState);
    updateStateWithPlannerSelectedRegistrationTypes(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithRegistrationTypeNotVisibleByPlannerSettings());
    updateStateWithDefaultRegistrationTypeNotVisibleByPlannerSettings(initialState);
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
  test('with default registration type (not included)', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithPlannerLimitRegistrationTypes(initialState);
    updateStateWithPlannerSelectedRegistrationTypes(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithNoneIncludedRegistrationType());
    updateStateWithDefaultRegistrationTypeNotIncluded(initialState);
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
});

describe('RegistrationTypeWidget (connected) layouts -', () => {
  test('as list (select)', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    const displayType = DisplayTypes.LIST;
    const widget = createWidget(initialState, { config: { displayType } });
    expect(widget).toMatchSnapshot();
  });
  test('sort order A to Z', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    const choiceSortOrder = ChoiceSortOrders.A_TO_Z;
    const widget = createWidget(initialState, { choiceSortOrder });
    expect(widget).toMatchSnapshot();
  });
  test('label placement above', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    const labelPlacement = LabelPlacements.ABOVE;
    const widget = createWidget(initialState, { config: { labelPlacement } });
    expect(widget).toMatchSnapshot();
  });
  test('label placement left', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    const labelPlacement = LabelPlacements.LEFT;
    const widget = createWidget(initialState, { config: { labelPlacement } });
    expect(widget).toMatchSnapshot();
  });
  test('required', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    const widget = createWidget(initialState, { config: { required: true } });
    expect(widget).toMatchSnapshot();
  });
  test('display text', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    const displayText = 'Some special display text';
    const widget = createWidget(initialState, { config: { displayText } });
    expect(widget).toMatchSnapshot();
  });
});

describe('RegistrationTypeWidget (connected) user interactions -', () => {
  test('with selected registration type (included)', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithIncludedRegistrationType());
    const displayType = DisplayTypes.LIST;
    const widget = mountWidget(initialState, { config: { displayType } });
    widget.find('select').simulate('change', { target: { value: '2' } });
    expect(widget).toMatchSnapshot();
  });
  test('should trigger regTypeError modal', async () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithIncludedRegistrationType());
    const displayType = DisplayTypes.LIST;
    const widget = mountWidget(initialState, { config: { displayType } });
    expect(widget).toMatchSnapshot();
    (validateUserRegistrationTypeSelection as $TSFixMe).mockImplementation(() => {
      const responseBody = {
        validationMessages: [
          {
            severity: 'Error',
            localizationKey: 'REGAPI.REGAPI_ADMISSION_CAPACITY_NOT_AVAILABLE_FOR_REGTYPE'
          }
        ]
      };
      throw createError(responseBody);
    });
    (getUpdateErrors.isPrivateEvent as $TSFixMe).mockImplementation(() => {
      return false;
    });
    (getUpdateErrors.isAttendeeNotAllowedByCustomLogic as $TSFixMe).mockImplementation(() => {
      return false;
    });
    (getUpdateErrors.isAdmissionItemsNotAvailableForRegTypeError as $TSFixMe).mockImplementation(() => {
      return true;
    });
    // eslint-disable-next-line jest/valid-expect
    expect(widget.find('select').simulate('change', { target: { value: '2' } }));
    await wait(0);
    expect(openNoAdmissionItemAvailableForRegistrationTypeDialog).toHaveBeenCalled();
  });
  test('should trigger privateEvent modal', async () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithIncludedRegistrationType());
    const displayType = DisplayTypes.LIST;
    const widget = mountWidget(initialState, { config: { displayType } });
    expect(widget).toMatchSnapshot();
    (setRegistrationTypeId as $TSFixMe).mockImplementation(() => {
      const responseBody = {
        validationMessages: [
          {
            severity: 'Error',
            localizationKey: 'REGAPI.EMAIL_ONLY_INVITEE'
          }
        ]
      };
      throw createError(responseBody);
    });
    (getUpdateErrors.isPrivateEvent as $TSFixMe).mockImplementation(() => {
      return true;
    });
    (getUpdateErrors.isAttendeeNotAllowedByCustomLogic as $TSFixMe).mockImplementation(() => {
      return false;
    });
    (getUpdateErrors.isAdmissionItemsNotAvailableForRegTypeError as $TSFixMe).mockImplementation(() => {
      return false;
    });
    // eslint-disable-next-line jest/valid-expect
    expect(widget.find('select').simulate('change', { target: { value: '2' } }));
    await wait(0);
    expect(openPrivateEventErrorDialog).toHaveBeenCalled();
  });
  test('should trigger eventTemporaryClosed modal for hybrid event when in-person/virtual event capacity reached', async () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithIncludedRegistrationType());
    updateStateWithEventAttendingFormat(initialState, AttendingFormat.HYBRID);
    const displayType = DisplayTypes.LIST;
    const widget = mountWidget(initialState, { config: { displayType } });
    (setRegistrationTypeId as $TSFixMe).mockImplementation(() => {
      const responseBody = {
        validationMessages: [
          {
            severity: 'Error',
            localizationKey: 'REGAPI.EVENT_TEMPORARY_NOT_OPEN_FOR_REGISTRATION'
          }
        ]
      };
      throw createError(responseBody);
    });
    (getUpdateErrors.isPrivateEvent as $TSFixMe).mockImplementation(() => {
      return false;
    });
    (getUpdateErrors.isAttendeeNotAllowedByCustomLogic as $TSFixMe).mockImplementation(() => {
      return false;
    });
    (getUpdateErrors.isAdmissionItemsNotAvailableForRegTypeError as $TSFixMe).mockImplementation(() => {
      return false;
    });
    (getUpdateErrors.isEventTemporaryClosed as $TSFixMe).mockImplementation(() => {
      return true;
    });
    // eslint-disable-next-line jest/valid-expect
    expect(widget.find('select').simulate('change', { target: { value: '2' } }));
    await wait(0);
    expect(openEventTemporaryClosedErrorDialog).toHaveBeenCalledWith(
      'EventGuestSide_EventTemporaryClosed_Error_SubMessage__resx',
      false
    );
  });
});

describe('group member registration types', () => {
  const groupMemberState = {
    text: {
      locale: 'en'
    },
    event: {
      registrationTypes: {
        vip: {
          id: 'vip',
          name: 'VIP',
          isOpenForRegistration: true
        },
        employee: {
          id: 'employee',
          name: 'Employee',
          isOpenForRegistration: true
        }
      },
      eventFeatureSetup: {
        agendaItems: {
          admissionItems: false
        },
        registrationProcess: {
          multipleRegistrationTypes: true
        }
      }
    },
    website: {
      ...pageContainingWidgetFixture('pageId', 'widgetId'),
      pluginData: {
        registrationProcessNavigation: {
          registrationPaths: {
            regPathId: {
              id: 'regPathId',
              pageIds: ['pageId']
            }
          }
        }
      }
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId: {
            registrationTypeSettings: {
              limitVisibility: false
            },
            allowGroupRegistration: true,
            groupRegistrationSettings: {
              registrationTypeSettings: {
                limitVisibility: true,
                categorizedRegistrationTypes: ['employee']
              }
            },
            accessRules: {
              invitationListAccess: {
                isEmailOnlyInvite: false
              }
            }
          },
          regPathId2: {
            registrationTypeSettings: {
              limitVisibility: false
            },
            allowGroupRegistration: true,
            groupRegistrationSettings: {
              registrationTypeSettings: {
                limitVisibility: true,
                categorizedRegistrationTypes: ['vip']
              }
            },
            accessRules: {
              invitationListAccess: {
                isEmailOnlyInvite: false
              }
            }
          }
        }
      }
    },
    userSession: {},
    defaultUserSession: {
      isPreview: false
    },
    registrationForm: {
      currentEventRegistrationId: 'member',
      regCart: {
        eventRegistrations: {
          leader: {
            registrationPathId: 'regPathId',
            eventRegistrationId: 'leader'
          },
          member: {
            registrationPathId: 'regPathId2',
            eventRegistrationId: 'member',
            primaryEventRegistrationId: 'leader'
          }
        }
      }
    },
    capacity: {},
    limits: {
      perEventLimits: {
        maxNumberOfGuests: {
          limit: 10
        }
      }
    },
    experiments: {
      isFlexAutoAssignRegTypeEnabled: false
    }
  };
  test('render only employee reg type', () => {
    const initialState = cloneState(groupMemberState);
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
});

/*
 * Test the Reg type widget in Radio button mode for unlimited capacity, available capacity and full capacity
 */
describe('RegistrationTypeWidget (connected) with registration types capacities', () => {
  test('baseline', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithRegistrationTypeCapacities(initialState);
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
  test('selected regtype at capacity', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithRegistrationTypeAtCapacity());
    updateStateWithRegistrationTypeCapacities(initialState);
    const widget = createWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
});

describe('RegistrationTypeWidget placed on guest info modal', () => {
  test('render', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithPlannerLimitGuestRegTypes(initialState);
    updateStateWithPlannerSelectedGuestRegTypes(initialState);
    const widget = createWidget(initialState, {
      config: {
        shared: {},
        registrationFieldPageType: registrationFieldPageType.GuestRegistration
      }
    });

    expect(widget).toMatchSnapshot();
  });
});

describe('Registration types that have no admission items available for selection are disabled', () => {
  const initialState = {
    text: {
      locale: 'en'
    },
    event: {
      products: {
        admissionItems: {
          admissionItem: {
            id: 'admissionItem',
            capacityId: 'admissionItem',
            name: 'Admission Item Name',
            code: 'Admission Item Code',
            description: 'Admission Item Description',
            associatedOptionalSessions: [],
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {},
            displayOrder: 1,
            isOpenForRegistration: true,
            applicableContactTypes: ['regType4', 'regType5', 'regType6', 'regType7']
          },
          admissionItemFull: {
            id: 'admissionItemFull',
            capacityId: 'admissionItemFull',
            name: 'Admission Item Full Name',
            code: 'Admission Item Full Code',
            description: 'Admission Item Full Description',
            associatedOptionalSessions: [],
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {},
            displayOrder: 2,
            isOpenForRegistration: true,
            applicableContactTypes: ['regType1', 'regType3', 'regType5', 'regType7']
          },
          admissionItemClosed: {
            id: 'admissionItemClosed',
            capacityId: 'admissionItemClosed',
            name: 'Admission Item Closed Name',
            code: 'Admission Item Closed Code',
            description: 'Admission Item Closed Description',
            associatedOptionalSessions: [],
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {},
            displayOrder: 3,
            isOpenForRegistration: false,
            applicableContactTypes: ['regType2', 'regType3', 'regType6', 'regType7']
          }
        }
      },
      registrationTypes: {
        regType1: {
          id: 'regType1',
          name: 'Reg Type 1',
          isOpenForRegistration: true
        },
        regType2: {
          id: 'regType2',
          name: 'Reg Type 2',
          isOpenForRegistration: true
        },
        regType3: {
          id: 'regType3',
          name: 'Reg Type 3',
          isOpenForRegistration: true
        },
        regType4: {
          id: 'regType4',
          name: 'Reg Type 4',
          isOpenForRegistration: true
        },
        regType5: {
          id: 'regType5',
          name: 'Reg Type 5',
          isOpenForRegistration: true
        },
        regType6: {
          id: 'regType6',
          name: 'Reg Type 6',
          isOpenForRegistration: true
        },
        regType7: {
          id: 'regType7',
          name: 'Reg Type 7',
          isOpenForRegistration: true
        }
      },
      eventFeatureSetup: {
        agendaItems: {
          admissionItems: true
        },
        registrationProcess: {
          multipleRegistrationTypes: true
        }
      }
    },
    website: {
      ...pageContainingWidgetFixture('pageId', 'widgetId'),
      pluginData: {
        registrationProcessNavigation: {
          registrationPaths: {
            regPathId: {
              id: 'regPathId',
              pageIds: ['pageId']
            }
          }
        }
      }
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId: {
            registrationTypeSettings: {
              limitVisibility: false
            },
            guestRegistrationSettings: {
              registrationTypeSettings: {
                limitVisibility: false
              }
            },
            accessRules: {
              invitationListAccess: {
                isEmailOnlyInvite: false
              }
            }
          }
        }
      }
    },
    registrationForm: {
      regCart: {
        eventRegistrations: {
          eventRegId: {
            registrationPathId: 'regPathId'
          }
        }
      }
    },
    capacity: {
      admissionItem: {
        active: true,
        availableCapacity: -1,
        capacityId: 'admissionItem',
        totalCapacityAvailable: -1
      },
      admissionItemFull: {
        active: true,
        availableCapacity: 0,
        capacityId: 'admissionItemFull',
        totalCapacityAvailable: 1
      },
      admissionItemClosed: {
        active: true,
        availableCapacity: -1,
        capacityId: 'admissionItemClosed',
        totalCapacityAvailable: -1
      }
    },
    userSession: {},
    defaultUserSession: {
      isPlanner: false,
      isPreview: false
    },
    limits: {
      perEventLimits: {
        maxNumberOfGuests: {
          limit: 10
        }
      }
    },
    experiments: {
      isFlexAutoAssignRegTypeEnabled: false
    }
  };

  test('disabled and enabled reg types match snapshot', () => {
    const displayType = DisplayTypes.LIST;
    const widget = createWidget(initialState, { config: { displayType } });
    expect(widget).toMatchSnapshot();
  });
});

describe('RegTypeWidget in guest modal should not render regtypes present in userSession for primary', () => {
  test('render', () => {
    const initialState = cloneState(baseState);
    updateStateWithRegistrationTypes(initialState);
    updateStateWithPlannerLimitGuestRegTypes(initialState);
    updateStateWithPlannerSelectedGuestRegTypes(initialState);
    updateStateWithDefaultRegistrationTypeIncluded(initialState);
    const widget = createWidget(initialState, {
      config: {
        shared: {},
        registrationFieldPageType: registrationFieldPageType.GuestRegistration
      }
    });

    expect(widget).toMatchSnapshot();
  });
});

describe('RegTypeWidget with Auto-Assign RegType', () => {
  test('render regType-selection as editable with 2 options(blank and available reg-type) when experiment is OFF and auto-assign regType NOT applicable', () => {
    const initialState = cloneState(baseState);
    updateStateWithSingleAutoAssignRegistrationType(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithAutoAssignRegTypeAssigned(false));
    const widget = createWidget(initialState, {
      config: {
        displayType: DisplayTypes.LIST
      }
    });
    expect(widget.root.findAllByType('span')[1].props['data-cvent-id']).toEqual('label');
    expect(widget.root.findAllByType('option').length).toBe(2);
    expect(widget.root.findAllByType('option')[1].props.children.trim()).toEqual('autoAssignRegTypeName');
  });

  test('render regType-selection as editable with 2 options(blank and available reg-type) when auto-assign regType applicable but experiment is OFF', () => {
    const initialState = cloneState(baseState);
    updateStateWithSingleAutoAssignRegistrationType(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithAutoAssignRegTypeAssigned(true));
    const widget = createWidget(initialState, {
      config: {
        displayType: DisplayTypes.LIST
      }
    });
    expect(widget.root.findAllByType('span')[1].props['data-cvent-id']).toEqual('label');
    expect(widget.root.findAllByType('option').length).toBe(2);
    expect(widget.root.findAllByType('option')[1].props.children.trim()).toEqual('autoAssignRegTypeName');
  });

  test('render regType-selection as editable with 2 options(blank and available reg-type) when experiment is ON but auto-assign regType NOT applicable', () => {
    const initialState = cloneState(baseState);
    updateStateWithSingleAutoAssignRegistrationType(initialState);
    updateStateWithAutoAssignRegistrationTypeExperimentOn(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithAutoAssignRegTypeAssigned(false));
    const widget = createWidget(initialState, {
      config: {
        displayType: DisplayTypes.LIST
      }
    });
    expect(widget.root.findAllByType('span')[1].props['data-cvent-id']).toEqual('label');
    expect(widget.root.findAllByType('option').length).toBe(2);
    expect(widget.root.findAllByType('option')[1].props.children.trim()).toEqual('autoAssignRegTypeName');
  });

  test('render regType-selection as readonly with auto-assigned reg-type when experiment is ON & auto-assign regType applicable', () => {
    const initialState = cloneState(baseState);
    updateStateWithSingleAutoAssignRegistrationType(initialState);
    updateStateWithAutoAssignRegistrationTypeExperimentOn(initialState);
    updateStateWithEventRegistration(initialState, eventRegistrationWithAutoAssignRegTypeAssigned(true));
    const widget = createWidget(initialState, {
      config: {
        displayType: DisplayTypes.LIST
      }
    });
    expect(widget.root.findAllByType('span')[1].props['data-cvent-id']).toEqual('regTypeWidget-readOnly');
    expect(widget.root.findAllByType('option').length).toBe(0);
    expect(widget.root.findAllByType('div')[5].props.children[0].props.dangerouslySetInnerHTML.__html).toEqual(
      'autoAssignRegTypeName'
    );
  });
});
