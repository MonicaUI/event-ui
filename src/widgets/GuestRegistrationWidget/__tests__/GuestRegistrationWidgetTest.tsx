import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer from '../../../redux/reducer';
import renderer from 'react-test-renderer';
import GuestRegistration, { updateGuestCountWithLoading } from '../GuestRegistration';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { mount, shallow } from 'enzyme';
import { updateIn } from 'icepick';
import { setEventRegistrationFieldValue } from '../../../redux/registrationForm/regCart/actions';
import StandardContactFields from 'event-widgets/lib/StandardContactFields/StandardContactFields';
import GuestRegistrationWidget from 'event-widgets/lib/GuestRegistration/GuestRegistrationWidget';
import GuestEventSnapshot from '../../../../fixtures/EventSnapshotWithGuestRegPage.json';
// eslint-disable-next-line jest/no-mocks-import
import { getState, response } from '../../../redux/registrationForm/regCart/__mocks__/regCart';
import { REGISTERING } from '../../../redux/registrationIntents';
import { CLOSED, PENDING } from 'event-widgets/clients/EventStatus';
import { dstInfo } from '../../../../fixtures/EasternTimeDstInfoFixture';

jest.mock('event-widgets/lib/GuestRegistration/GuestRegistrationWidget', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return class BaseWidget extends require('react').Component {
    render() {
      return null;
    }
  };
});

const MAX_GUEST_LIMIT = 10;
const eventId = EventSnapshot.eventSnapshot.id;
const initialState = {
  capacity: {
    eventId: {
      capacityId: eventId,
      totalCapacityAvailable: -1,
      availableCapacity: -1,
      active: true
    }
  },
  event: EventSnapshot.eventSnapshot,
  regCartStatus: {
    lastSavedRegCart: {
      eventRegistrations: {
        primaryId: {
          eventRegistrationId: 'primaryId',
          attendeeType: 'ATTENDEE'
        }
      }
    }
  },
  registrationForm: {
    currentEventRegistrationId: 'primaryId',
    regCart: {
      eventRegistrations: {
        primaryId: {
          eventRegistrationId: 'primaryId',
          attendeeType: 'ATTENDEE',
          registrationPathId: 'registrationPath1'
        }
      }
    }
  },
  appData: {
    registrationSettings: {
      registrationPaths: {
        registrationPath1: {
          id: 'registrationPath1',
          isDefault: true,
          registrationTypeSettings: {},
          guestRegistrationSettings: {
            isGuestRegistrationTypeSelectionEnabled: true,
            isGuestProductSelectionEnabled: false,
            maxGuestsAllowedOnRegPath: 5,
            registrationTypeSettings: {
              isRequired: true
            }
          }
        }
      }
    }
  },
  accountLimits: {
    perEventLimits: {
      maxNumberOfGuests: { limit: 5 },
      minNumberOfGuests: { limit: 0 }
    }
  },
  visibleProducts: {
    Sessions: {
      primaryId: {
        admissionItems: {},
        sessionProducts: {}
      }
    }
  },
  defaultUserSession: {
    isTestMode: false,
    isPlanner: false,
    httpReferrer: 'http://cvent.com'
  },
  limits: {
    perEventLimits: {
      maxNumberOfGuests: {
        limit: 10
      }
    }
  }
};

/*
 * let store = createStoreWithMiddleware(combineReducers(
 * { account, registrantLogin, registrationForm, website: (x = {}) => x,
 * appData: (x = {}) => x, text: (x = {}) => x, clients: (x = {}) => x, userSession: (x = {}) => x }),
 * { ...initialState });
 */
let store;
const createPropsWithGuests = (
  guestRegEnabled,
  numGuests,
  isAddGuestButton,
  setupTemporaryGuestInfo?,
  givenState?,
  regTypesEnabled?,
  isPlanner?
) => {
  const state = givenState
    ? {
        ...givenState
      }
    : {
        ...initialState
      };

  state.defaultUserSession.isPlanner = isPlanner;
  state.event.eventFeatureSetup.registrationProcess.guestRegistration = !!guestRegEnabled;
  state.event.eventFeatureSetup.registrationProcess.multipleRegistrationTypes = !!regTypesEnabled;

  const guestReg = {
    attendeeType: 'GUEST',
    primaryRegistrationId: 'primaryId',
    requestedAction: 'REGISTER'
  };

  let guestId;
  for (let i = 0; i < numGuests; i++) {
    guestId = `GUEST_${i}`;
    state.registrationForm.regCart.eventRegistrations[guestId] = {
      ...guestReg,
      eventRegistrationId: guestId
    };
  }

  if (setupTemporaryGuestInfo) {
    state.registrationForm.currentGuestEventRegistration = {
      ...guestReg,
      eventRegistrationId: guestId
    };
  }
  store = createStore(reducer, state, applyMiddleware(thunk));
  const resolveAddGuestDisplayType = isAddGuestButton ? 'standardButton' : 'dropdown';

  return {
    store,
    style: {},
    classes: {},
    config: {
      guestRegistrationHeaderText: 'header text',
      guestRegistrationInstructionalText: 'instructions',
      addGuestDisplayType: resolveAddGuestDisplayType
    },
    translate: a => a
  };
};

const getStateWithCapacitiesAndEventDates = (inputState, status, yearsOffset) => {
  const now = new Date();
  const year = now.getFullYear() + yearsOffset;
  const month = now.getMonth();
  const day = now.getDate();
  return {
    ...inputState,
    capacity: {
      ...inputState.capacity,
      AD1: {
        capacityId: 'AD1',
        totalCapacityAvailable: 2,
        availableCapacity: 2,
        active: true
      },
      session1: {
        capacityId: 'session1',
        totalCapacityAvailable: 2,
        availableCapacity: 2,
        active: true
      }
    },
    event: {
      ...inputState.event,
      status,
      closeDate: new Date(year, month, day + 1).toISOString(),
      startDate: new Date(year, month, day + 2).toISOString(),
      endDate: new Date(year, month, day + 3).toISOString(),
      archiveDate: new Date(year, month, day + 4).toISOString()
    },
    timezones: {
      ...inputState.timezones,
      35: {
        id: 35,
        name: 'Eastern Time',
        nameResourceKey: 'Event_Timezone_Name_35__resx',
        plannerDisplayName: '(GMT-05:00) Eastern [US & Canada]',
        hasDst: true,
        utcOffset: -300,
        abbreviation: 'ET',
        abbreviationResourceKey: 'Event_Timezone_Abbr_35__resx',
        dstInfo
      }
    }
  };
};

describe('GuestRegistrationWidget', () => {
  // TODO: figure out how to trick nucleus Row component into not breaking due to missing context
  it.skip('should render dropdown', () => {
    const defaultProps = createPropsWithGuests(true, 1, false);

    const component = renderer.create(<GuestRegistration {...defaultProps} />);
    expect(component).toMatchSnapshot();
  });

  it('should be hidden if the feature is off', () => {
    const defaultProps = createPropsWithGuests(false, 0, false);

    const component = renderer.create(<GuestRegistration {...defaultProps} />);
    expect(component).toMatchSnapshot();
  });

  it('should be a button instead of a dropdown', () => {
    const defaultProps = createPropsWithGuests(true, 0, true);
    const widget = shallow(<GuestRegistration {...defaultProps} />);
    // Hack to stop pretty-format from breaking on this object
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));
    expect(props).toMatchSnapshot();
  });

  it('should render a modal if guest are added with a button instead of a dropdown', async () => {
    const defaultProps = createPropsWithGuests(true, 0, true);
    const widget = shallow(<GuestRegistration {...defaultProps} />);
    // Hack to stop pretty-format from breaking on this object
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));
    expect(props).toMatchSnapshot();
  });

  it('should not render unconfirmed guests', async () => {
    const defaultProps = createPropsWithGuests(true, 2, true, true);
    const widget = shallow(<GuestRegistration {...defaultProps} />);
    // Hack to stop pretty-format from breaking on this object
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));
    // The 'guests' field of the props in the snapshot will contain only 1 guest
    expect(props).toMatchSnapshot();
  });

  it('should not re-render if an unrelated property in regCart changes', async () => {
    const defaultProps = createPropsWithGuests(true, 2, true, false);
    const widget = mount(<GuestRegistration {...defaultProps} />);
    const widgetInstance = widget.find(GuestRegistrationWidget).instance();
    const renderSpy = jest.spyOn(widgetInstance, 'render');
    const fieldPath = StandardContactFields['cfc98829-80b7-41b6-82b5-b968d43ef1c1'].regApiPath;
    await store.dispatch(
      setEventRegistrationFieldValue('primaryId', ['attendee', 'personalInformation', ...fieldPath], 'Hodor')
    );
    expect(renderSpy).not.toHaveBeenCalled();
  });

  it('should re-render if an guest related property displayed in GuestWidget changes', async () => {
    const defaultProps = createPropsWithGuests(true, 2, true, false);
    const widget = mount(<GuestRegistration {...defaultProps} />);
    const widgetInstance = widget.find(GuestRegistrationWidget).instance();
    const renderSpy = jest.spyOn(widgetInstance, 'render');
    const fieldPath = StandardContactFields['cfc98829-80b7-41b6-82b5-b968d43ef1c1'].regApiPath;
    await store.dispatch(
      setEventRegistrationFieldValue('GUEST_0', ['attendee', 'personalInformation', ...fieldPath], 'Hodor')
    );
    expect(renderSpy).toHaveBeenCalled();
  });

  it('guestRegTypesRequired should be true if regType feature on and correct settings', () => {
    const defaultProps = createPropsWithGuests(true, 2, true, false, null, true);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));
    expect(props.guestRegTypeRequired).toBeTruthy();
  });

  it('guestRegTypesRequired should be false if regType feature on and isRequired false', () => {
    const state = {
      ...initialState,
      appData: {
        ...initialState.appData,
        registrationSettings: {
          ...initialState.appData.registrationSettings,
          registrationPaths: {
            ...initialState.appData.registrationSettings.registrationPaths,
            registrationPath1: {
              ...initialState.appData.registrationSettings.registrationPaths.registrationPath1,
              guestRegistrationSettings: {
                isGuestRegistrationTypeSelectionEnabled: true,
                registrationTypeSettings: {
                  isRequired: false
                }
              }
            }
          }
        }
      }
    };
    const defaultProps = createPropsWithGuests(true, 2, true, false, state, true);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));
    expect(props.guestRegTypeRequired).toBeFalsy();
  });

  it('guestRegTypesRequired should be false if regType feature off', () => {
    const defaultProps = createPropsWithGuests(true, 2, true, false, null, false);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));
    expect(props.guestRegTypeRequired).toBeFalsy();
  });
});

describe('admission item included sessions tests', () => {
  let state;
  beforeEach(() => {
    state = {
      ...initialState,
      capacity: {
        ...initialState.capacity,
        AD1: {
          capacityId: 'AD1',
          totalCapacityAvailable: -1,
          availableCapacity: -1,
          active: true
        },
        AD2: {
          capacityId: 'AD2',
          totalCapacityAvailable: -1,
          availableCapacity: -1,
          active: true
        },
        AD3: {
          capacityId: 'AD3',
          totalCapacityAvailable: -1,
          availableCapacity: -1,
          active: true
        },
        session1: {
          capacityId: 'session1',
          totalCapacityAvailable: 0,
          availableCapacity: 0,
          active: true
        },
        session2: {
          capacityId: 'session2',
          totalCapacityAvailable: 0,
          availableCapacity: 0,
          active: true
        }
      },
      event: {
        ...initialState.event,
        eventFeatureSetup: {
          ...initialState.event.eventFeatureSetup,
          agendaItems: {
            sessions: true,
            admissionItems: true
          }
        },
        products: {
          admissionItems: {
            AD1: {
              limitOptionalItemsToSelect: false,
              isOpenForRegistration: true,
              limitGuestsByContactType: false,
              includeWaitlistSessionsTowardsMaxiumumLimit: false,
              applicableContactTypes: ['00000000-0000-0000-0000-000000000000', 'regType1'],
              limitOptionalSessionsToSelect: false,
              associatedOptionalSessions: ['session1'],
              applicableOptionalItems: [],
              minimumNumberOfSessionsToSelect: 0,
              applicableOptionalSessions: [],
              capacityByGuestContactTypes: [],
              displayOrder: 0,
              code: '',
              description: '',
              id: 'AD1',
              capacityId: 'AD1',
              name: 'AD1',
              status: 2,
              defaultFeeId: '00000000-0000-0000-0000-000000000000'
            },
            AD2: {
              limitOptionalItemsToSelect: false,
              isOpenForRegistration: true,
              limitGuestsByContactType: false,
              includeWaitlistSessionsTowardsMaxiumumLimit: false,
              applicableContactTypes: ['regType2', '00000000-0000-0000-0000-000000000000'],
              limitOptionalSessionsToSelect: false,
              associatedOptionalSessions: ['session2'],
              applicableOptionalItems: [],
              minimumNumberOfSessionsToSelect: 0,
              applicableOptionalSessions: [],
              capacityByGuestContactTypes: [],
              displayOrder: 0,
              code: '',
              description: '',
              id: 'AD2',
              capacityId: 'AD2',
              name: 'AD2',
              status: 2,
              defaultFeeId: '00000000-0000-0000-0000-000000000000'
            },
            AD3: {
              limitOptionalItemsToSelect: false,
              isOpenForRegistration: true,
              limitGuestsByContactType: false,
              includeWaitlistSessionsTowardsMaxiumumLimit: false,
              applicableContactTypes: ['regType3'],
              limitOptionalSessionsToSelect: false,
              associatedOptionalSessions: [],
              applicableOptionalItems: [],
              minimumNumberOfSessionsToSelect: 0,
              applicableOptionalSessions: [],
              capacityByGuestContactTypes: [],
              displayOrder: 0,
              code: '',
              description: '',
              id: 'AD3',
              capacityId: 'AD3',
              name: 'AD3',
              status: 2,
              defaultFeeId: '00000000-0000-0000-0000-000000000000'
            }
          },
          sessionContainer: {
            optionalSessions: {
              session1: {
                associatedRegistrationTypes: [],
                associatedWithAdmissionItems: ['AD1'],
                availableToAdmissionItems: [],
                capacityId: 'session1',
                categoryId: '00000000-0000-0000-0000-000000000000',
                code: '',
                defaultFeeId: '00000000-0000-0000-0000-000000000000',
                description: '',
                endTime: '2017-09-10T23:00:00.000Z',
                fees: {},
                id: 'session1',
                isIncludedSession: false,
                isOpenForRegistration: true,
                name: 'Associated Session',
                registeredCount: 1,
                sessionCustomFieldValues: {},
                startTime: '2017-09-10T22:00:00.000Z',
                status: 2,
                type: 'Session'
              },
              session2: {
                associatedRegistrationTypes: [],
                associatedWithAdmissionItems: ['AD2'],
                availableToAdmissionItems: [],
                capacityId: 'session2',
                categoryId: '00000000-0000-0000-0000-000000000000',
                code: '',
                defaultFeeId: '00000000-0000-0000-0000-000000000000',
                description: '',
                endTime: '2017-09-10T23:00:00.000Z',
                fees: {},
                id: 'session2',
                isIncludedSession: false,
                isOpenForRegistration: true,
                name: 'Associated Session',
                registeredCount: 1,
                sessionCustomFieldValues: {},
                startTime: '2017-09-10T22:00:00.000Z',
                status: 2,
                type: 'Session'
              }
            }
          }
        }
      },
      registrationForm: {
        currentEventRegistrationId: 'primaryId',
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
      },
      visibleProducts: {
        Sessions: {
          primaryId: {
            admissionItems: {
              AD1: {
                limitOptionalItemsToSelect: false,
                isOpenForRegistration: true,
                limitGuestsByContactType: false,
                includeWaitlistSessionsTowardsMaxiumumLimit: false,
                applicableContactTypes: ['00000000-0000-0000-0000-000000000000', 'regType1'],
                limitOptionalSessionsToSelect: false,
                associatedOptionalSessions: ['session1'],
                applicableOptionalItems: [],
                minimumNumberOfSessionsToSelect: 0,
                applicableOptionalSessions: [],
                capacityByGuestContactTypes: [],
                displayOrder: 0,
                code: '',
                description: '',
                id: 'AD1',
                capacityId: 'AD1',
                name: 'AD1',
                status: 2,
                defaultFeeId: '00000000-0000-0000-0000-000000000000'
              },
              AD2: {
                limitOptionalItemsToSelect: false,
                isOpenForRegistration: true,
                limitGuestsByContactType: false,
                includeWaitlistSessionsTowardsMaxiumumLimit: false,
                applicableContactTypes: ['regType2', '00000000-0000-0000-0000-000000000000'],
                limitOptionalSessionsToSelect: false,
                associatedOptionalSessions: ['session2'],
                applicableOptionalItems: [],
                minimumNumberOfSessionsToSelect: 0,
                applicableOptionalSessions: [],
                capacityByGuestContactTypes: [],
                displayOrder: 0,
                code: '',
                description: '',
                id: 'AD2',
                capacityId: 'AD2',
                name: 'AD2',
                status: 2,
                defaultFeeId: '00000000-0000-0000-0000-000000000000'
              }
            },
            sessionProducts: {
              session1: {
                associatedRegistrationTypes: [],
                associatedWithAdmissionItems: ['AD1'],
                availableToAdmissionItems: [],
                capacityId: 'session1',
                categoryId: '00000000-0000-0000-0000-000000000000',
                code: '',
                defaultFeeId: '00000000-0000-0000-0000-000000000000',
                description: '',
                endTime: '2017-09-10T23:00:00.000Z',
                fees: {},
                id: 'session1',
                isIncludedSession: false,
                isOpenForRegistration: true,
                name: 'Associated Session',
                registeredCount: 1,
                sessionCustomFieldValues: {},
                startTime: '2017-09-10T22:00:00.000Z',
                status: 2,
                type: 'Session'
              },
              session2: {
                associatedRegistrationTypes: [],
                associatedWithAdmissionItems: ['AD2'],
                availableToAdmissionItems: [],
                capacityId: 'session2',
                categoryId: '00000000-0000-0000-0000-000000000000',
                code: '',
                defaultFeeId: '00000000-0000-0000-0000-000000000000',
                description: '',
                endTime: '2017-09-10T23:00:00.000Z',
                fees: {},
                id: 'session2',
                isIncludedSession: false,
                isOpenForRegistration: true,
                name: 'Associated Session',
                registeredCount: 1,
                sessionCustomFieldValues: {},
                startTime: '2017-09-10T22:00:00.000Z',
                status: 2,
                type: 'Session'
              }
            }
          }
        }
      }
    };
  });
  it('should be disabled if adm item has capacity but included session doesnt', () => {
    const defaultProps = createPropsWithGuests(true, 0, true, false, state, true, false);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));
    expect(props.disabled).toBeTruthy();
  });

  it('should not be disabled if isPlanner and guest count 0 irrespective of adm item or included session capacity', () => {
    const defaultProps = createPropsWithGuests(true, 0, true, false, state, true, true);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));
    expect(props.disabled).toBeFalsy();
  });

  it('should be disabled if isPlanner and guest count equals MAX_GUEST_LIMIT irrespective of adm item or included session capacity', () => {
    const defaultProps = createPropsWithGuests(true, 10, true, false, state, true, true);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));
    expect(props.disabled).toBeTruthy();
  });

  it('should be disabled if guest count 0 adm item has capacity but included session doesnt. No reg type', () => {
    const dropdownState = {
      ...state,
      capacity: {
        ...state.capacity,
        AD1: {
          capacityId: 'AD1',
          totalCapacityAvailable: 0,
          availableCapacity: 0,
          active: true
        },
        session1: {
          capacityId: 'session1',
          totalCapacityAvailable: 0,
          availableCapacity: 0,
          active: true
        }
      }
    };
    const defaultProps = createPropsWithGuests(true, 0, true, false, dropdownState, false, false);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));
    expect(props.disabled).toBeTruthy();
  });

  it('should be disabled if guest count equals MAX_GUEST_LIMIT and adm item has capacity but included session doesnt. No reg type', () => {
    const dropdownState = {
      ...state,
      capacity: {
        ...state.capacity,
        AD1: {
          capacityId: 'AD1',
          totalCapacityAvailable: 0,
          availableCapacity: 0,
          active: true
        },
        session1: {
          capacityId: 'session1',
          totalCapacityAvailable: 0,
          availableCapacity: 0,
          active: true
        }
      }
    };
    const defaultProps = createPropsWithGuests(true, 10, true, false, dropdownState, false, false);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));
    expect(props.disabled).toBeTruthy();
  });

  it('should not be disabled if isPlanner and guest count 0 irrespective of adm item or included session capacity. No reg type', () => {
    const dropdownState = {
      ...state,
      capacity: {
        ...state.capacity,
        AD1: {
          capacityId: 'AD1',
          totalCapacityAvailable: 0,
          availableCapacity: 0,
          active: true
        },
        session1: {
          capacityId: 'session1',
          totalCapacityAvailable: 0,
          availableCapacity: 0,
          active: true
        }
      }
    };
    const defaultProps = createPropsWithGuests(true, 0, true, false, dropdownState, false, true);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));
    expect(props.disabled).toBeFalsy();
  });

  it('should be disabled if isPlanner and guest count equals MAX_GUEST_LIMIT irrespective of adm item or included session capacity. No reg type', () => {
    const dropdownState = {
      ...state,
      capacity: {
        ...state.capacity,
        AD1: {
          capacityId: 'AD1',
          totalCapacityAvailable: 0,
          availableCapacity: 0,
          active: true
        },
        session1: {
          capacityId: 'session1',
          totalCapacityAvailable: 0,
          availableCapacity: 0,
          active: true
        }
      }
    };
    const defaultProps = createPropsWithGuests(true, 10, true, false, dropdownState, false, true);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));
    expect(props.disabled).toBeTruthy();
  });

  it('should be disabled if event is closed', () => {
    const newState = getStateWithCapacitiesAndEventDates(state, CLOSED, +1);
    const defaultProps = createPropsWithGuests(true, 0, true, false, newState, false, false);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    expect(widget.props().disabled).toBeTruthy();
  });

  it('should be disabled if past event close date', () => {
    const newState = getStateWithCapacitiesAndEventDates(state, PENDING, -1);
    const defaultProps = createPropsWithGuests(true, 0, true, false, newState, false, false);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    expect(widget.props().disabled).toBeTruthy();
  });

  it('should not be disabled if products and capacities available, and not closed', () => {
    const newState = getStateWithCapacitiesAndEventDates(state, PENDING, +1);
    const defaultProps = createPropsWithGuests(true, 0, true, false, newState, false, false);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    expect(widget.props().disabled).toBeFalsy();
  });

  // Max dropdown tests when isPlanner = false
  it('Max dropdown count should be min of total of available capacities of adm item/event/regType cap and max guest size when guestProductselection is on', () => {
    const dropdownState = {
      ...state,
      appData: {
        ...state.appData,
        registrationSettings: {
          ...state.appData.registrationSettings,
          registrationPaths: {
            ...state.appData.registrationSettings.registrationPaths,
            registrationPath1: {
              ...state.appData.registrationSettings.registrationPaths.registrationPath1,
              guestRegistrationSettings: {
                isGuestRegistrationTypeSelectionEnabled: true,
                isGuestProductSelectionEnabled: true,
                maxGuestsAllowedOnRegPath: 5,
                registrationTypeSettings: {
                  isRequired: true
                }
              }
            }
          }
        }
      },
      capacity: {
        ...state.capacity,
        session1: {
          capacityId: 'session1',
          totalCapacityAvailable: 2,
          availableCapacity: 2,
          active: true
        },
        session2: {
          capacityId: 'session2',
          totalCapacityAvailable: 1,
          availableCapacity: 1,
          active: true
        }
      }
    };
    const defaultProps = createPropsWithGuests(true, 0, false, false, dropdownState, true, false);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));

    expect(props.guestLimit).toBe(3);
  });
  it('Max dropdown count should be min of event/regType cap and max guest sizeand the highest capacity of available admission items when guestProductselection is off', () => {
    const dropdownState = {
      ...state,
      capacity: {
        ...state.capacity,
        session1: {
          capacityId: 'session1',
          totalCapacityAvailable: 2,
          availableCapacity: 2,
          active: true
        },
        session2: {
          capacityId: 'session2',
          totalCapacityAvailable: 1,
          availableCapacity: 1,
          active: true
        }
      }
    };
    const defaultProps = createPropsWithGuests(true, 0, false, false, dropdownState, true, false);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));

    expect(props.guestLimit).toBe(2);
  });

  /*
   * same test as above but turned preview flag on and added a guest with a reserve already
   * still should return 1 since in preview capacity isn't taken
   */
  it('Max dropdown shouldnt change in preview mode with a guest with reserved capacity', () => {
    const dropdownState = {
      ...state,
      defaultUserSession: {
        ...state.defaultUserSession,
        isPreview: true
      },
      registrationForm: {
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
            },
            guest1: {
              eventRegistrationId: 'guest1',
              attendeeType: 'GUEST',
              primaryRegistrationId: 'primaryId',
              registrationPathId: 'registrationPath1',
              requestedAction: 'REGISTER',
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
      },
      capacity: {
        ...state.capacity,
        session1: {
          capacityId: 'session1',
          totalCapacityAvailable: 2,
          availableCapacity: 2,
          active: true
        },
        session2: {
          capacityId: 'session2',
          totalCapacityAvailable: 1,
          availableCapacity: 1,
          active: true
        }
      }
    };
    const defaultProps = createPropsWithGuests(true, 0, false, false, dropdownState, true, false);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));

    expect(props.guestLimit).toBe(1);
  });

  /*
   * same test as above but turned pending approval flag on and added a guest with a reserve already
   * still should return 1 since in pending approval capacity isn't taken
   */
  it('Max dropdown shouldnt change in pending approval mode with a guest with reserved capacity', () => {
    const dropdownState = {
      ...state,
      defaultUserSession: {
        ...state.defaultUserSession,
        isPreview: false
      },
      registrationForm: {
        regCart: {
          registrationApprovalRequired: true,
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
            },
            guest1: {
              eventRegistrationId: 'guest1',
              attendeeType: 'GUEST',
              primaryRegistrationId: 'primaryId',
              registrationPathId: 'registrationPath1',
              requestedAction: 'REGISTER',
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
      },
      capacity: {
        ...state.capacity,
        session1: {
          capacityId: 'session1',
          totalCapacityAvailable: 2,
          availableCapacity: 2,
          active: true
        },
        session2: {
          capacityId: 'session2',
          totalCapacityAvailable: 1,
          availableCapacity: 1,
          active: true
        }
      }
    };
    const defaultProps = createPropsWithGuests(true, 0, false, false, dropdownState, true, false);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));

    expect(props.guestLimit).toBe(1);
  });

  // Max dropdown tests when isPlanner = true
  it('Max dropdown count when isPlanner should be maxGuestsAllowed when guestProductselection is on', () => {
    const dropdownState = {
      ...state,
      appData: {
        ...state.appData,
        registrationSettings: {
          ...state.appData.registrationSettings,
          registrationPaths: {
            ...state.appData.registrationSettings.registrationPaths,
            registrationPath1: {
              ...state.appData.registrationSettings.registrationPaths.registrationPath1,
              guestRegistrationSettings: {
                isGuestRegistrationTypeSelectionEnabled: true,
                isGuestProductSelectionEnabled: true,
                maxGuestsAllowedOnRegPath: 5,
                registrationTypeSettings: {
                  isRequired: true
                }
              }
            }
          }
        }
      },
      capacity: {
        ...state.capacity,
        session1: {
          capacityId: 'session1',
          totalCapacityAvailable: 2,
          availableCapacity: 2,
          active: true
        },
        session2: {
          capacityId: 'session2',
          totalCapacityAvailable: 1,
          availableCapacity: 1,
          active: true
        }
      }
    };
    const defaultProps = createPropsWithGuests(true, 0, false, false, dropdownState, true, true);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));

    expect(props.guestLimit).toBe(MAX_GUEST_LIMIT);
  });

  it('Max dropdown count when isPlanner should be maxGuestsAllowed when guestProductselection is off', () => {
    const dropdownState = {
      ...state,
      capacity: {
        ...state.capacity,
        session1: {
          capacityId: 'session1',
          totalCapacityAvailable: 2,
          availableCapacity: 2,
          active: true
        },
        session2: {
          capacityId: 'session2',
          totalCapacityAvailable: 1,
          availableCapacity: 1,
          active: true
        }
      }
    };
    const defaultProps = createPropsWithGuests(true, 0, false, false, dropdownState, true, true);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));

    expect(props.guestLimit).toBe(MAX_GUEST_LIMIT);
  });

  // same test as above but turned preview flag on and added a guest with a reserve already
  it('Max dropdown when isPlanner shouldnt change in preview mode with a guest with reserved capacity', () => {
    const dropdownState = {
      ...state,
      defaultUserSession: {
        ...state.defaultUserSession,
        isPreview: true
      },
      registrationForm: {
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
            },
            guest1: {
              eventRegistrationId: 'guest1',
              attendeeType: 'GUEST',
              primaryRegistrationId: 'primaryId',
              registrationPathId: 'registrationPath1',
              requestedAction: 'REGISTER',
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
      },
      capacity: {
        ...state.capacity,
        session1: {
          capacityId: 'session1',
          totalCapacityAvailable: 2,
          availableCapacity: 2,
          active: true
        },
        session2: {
          capacityId: 'session2',
          totalCapacityAvailable: 1,
          availableCapacity: 1,
          active: true
        }
      }
    };
    const defaultProps = createPropsWithGuests(true, 0, false, false, dropdownState, true, true);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));

    expect(props.guestLimit).toBe(MAX_GUEST_LIMIT);
  });

  // same test as above but turned pending approval flag on and added a guest with a reserve already
  it('Max dropdown when isPlanner shouldnt change in pending approval mode with a guest with reserved capacity', () => {
    const dropdownState = {
      ...state,
      defaultUserSession: {
        ...state.defaultUserSession,
        isPreview: false
      },
      registrationForm: {
        regCart: {
          registrationApprovalRequired: true,
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
            },
            guest1: {
              eventRegistrationId: 'guest1',
              attendeeType: 'GUEST',
              primaryRegistrationId: 'primaryId',
              registrationPathId: 'registrationPath1',
              requestedAction: 'REGISTER',
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
      },
      capacity: {
        ...state.capacity,
        session1: {
          capacityId: 'session1',
          totalCapacityAvailable: 2,
          availableCapacity: 2,
          active: true
        },
        session2: {
          capacityId: 'session2',
          totalCapacityAvailable: 1,
          availableCapacity: 1,
          active: true
        }
      }
    };
    const defaultProps = createPropsWithGuests(true, 0, false, false, dropdownState, true, true);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));

    expect(props.guestLimit).toBe(MAX_GUEST_LIMIT);
  });
});

describe('no open admission item test', () => {
  let state;
  beforeEach(() => {
    state = {
      ...initialState,
      capacity: {
        ...initialState.capacity,
        AD1: {
          capacityId: 'AD1',
          totalCapacityAvailable: -1,
          availableCapacity: -1,
          active: true
        }
      },
      event: {
        ...initialState.event,
        eventFeatureSetup: {
          ...initialState.event.eventFeatureSetup,
          agendaItems: {
            sessions: true,
            admissionItems: true
          }
        },
        products: {
          admissionItems: {
            AD1: {
              limitOptionalItemsToSelect: false,
              isOpenForRegistration: false,
              limitGuestsByContactType: false,
              includeWaitlistSessionsTowardsMaxiumumLimit: false,
              applicableContactTypes: ['00000000-0000-0000-0000-000000000000', 'regType1'],
              limitOptionalSessionsToSelect: false,
              associatedOptionalSessions: ['session1'],
              applicableOptionalItems: [],
              minimumNumberOfSessionsToSelect: 0,
              applicableOptionalSessions: [],
              capacityByGuestContactTypes: [],
              displayOrder: 0,
              code: '',
              description: '',
              id: 'AD1',
              capacityId: 'AD1',
              name: 'AD1',
              status: 2,
              defaultFeeId: '00000000-0000-0000-0000-000000000000'
            }
          },
          sessionContainer: {
            optionalSessions: {
              session1: {
                associatedRegistrationTypes: [],
                associatedWithAdmissionItems: ['AD1'],
                availableToAdmissionItems: [],
                capacityId: 'session1',
                categoryId: '00000000-0000-0000-0000-000000000000',
                code: '',
                defaultFeeId: '00000000-0000-0000-0000-000000000000',
                description: '',
                endTime: '2017-09-10T23:00:00.000Z',
                fees: {},
                id: 'session1',
                isIncludedSession: false,
                isOpenForRegistration: true,
                name: 'Associated Session',
                registeredCount: 1,
                sessionCustomFieldValues: {},
                startTime: '2017-09-10T22:00:00.000Z',
                status: 2,
                type: 'Session'
              }
            }
          }
        }
      },
      registrationForm: {
        currentEventRegistrationId: 'primaryId',
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
      },
      visibleProducts: {
        Sessions: {
          primaryId: {
            admissionItems: {
              AD1: {
                limitOptionalItemsToSelect: false,
                isOpenForRegistration: false,
                limitGuestsByContactType: false,
                includeWaitlistSessionsTowardsMaxiumumLimit: false,
                applicableContactTypes: ['00000000-0000-0000-0000-000000000000', 'regType1'],
                limitOptionalSessionsToSelect: false,
                associatedOptionalSessions: ['session1'],
                applicableOptionalItems: [],
                minimumNumberOfSessionsToSelect: 0,
                applicableOptionalSessions: [],
                capacityByGuestContactTypes: [],
                displayOrder: 0,
                code: '',
                description: '',
                id: 'AD1',
                capacityId: 'AD1',
                name: 'AD1',
                status: 2,
                defaultFeeId: '00000000-0000-0000-0000-000000000000'
              }
            },
            sessionProducts: {
              session1: {
                associatedRegistrationTypes: [],
                associatedWithAdmissionItems: ['AD1'],
                availableToAdmissionItems: [],
                capacityId: 'session1',
                categoryId: '00000000-0000-0000-0000-000000000000',
                code: '',
                defaultFeeId: '00000000-0000-0000-0000-000000000000',
                description: '',
                endTime: '2017-09-10T23:00:00.000Z',
                fees: {},
                id: 'session1',
                isIncludedSession: false,
                isOpenForRegistration: true,
                name: 'Associated Session',
                registeredCount: 1,
                sessionCustomFieldValues: {},
                startTime: '2017-09-10T22:00:00.000Z',
                status: 2,
                type: 'Session'
              }
            }
          }
        }
      }
    };
  });
  it('should be disabled if no open admission item is available', () => {
    const defaultProps = createPropsWithGuests(true, 0, true, false, state, true, false);
    const widget = shallow(<GuestRegistration {...defaultProps} />).find(GuestRegistrationWidget);
    const props = updateIn(widget.props(), ['classes'], x => ({ ...x }));
    expect(props.disabled).toBeTruthy();
  });
});

describe('test reload sessions', () => {
  const regPathId = '411c6566-1e5a-4c38-b8e5-f63ab9239b4';
  const initialWebsite = GuestEventSnapshot.eventSnapshot.siteEditor.website;
  const website = {
    ...initialWebsite,
    pluginData: {
      ...initialWebsite.pluginData,
      registrationProcessNavigation: {
        registrationPaths: {
          ...initialWebsite.pluginData.registrationProcessNavigation.registrationPaths,
          '411c6566-1e5a-4c38-b8e5-f63ab9239b4': {
            ...initialWebsite.pluginData.registrationProcessNavigation.registrationPaths[
              '3db844da-2ce1-46e0-b1af-4fc1f4bad512'
            ]
          }
        }
      }
    }
  };
  const updatedRegCart = {
    ...response.regCart,
    eventRegistrations: {
      '5b7a9686-c9c5-4669-bbf3-51605a2b12b1': {
        ...response.regCart.eventRegistrations['00000000-0000-0000-0000-000000000001'],
        registrationTypeId: '34433',
        registrationPathId: regPathId
      },
      '12111-2222': {
        eventRegistrationId: '12111-2222',
        eventId,
        attendee: {
          personalInformation: {
            lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
            customFields: {}
          },
          eventAnswers: {}
        },
        attendeeType: 'GUEST',
        primaryRegistrationId: '5b7a9686-c9c5-4669-bbf3-51605a2b12b1',
        productRegistrations: [
          {
            productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        registrationTypeId: '00000000-0000-0000-0000-000000000000',
        requestedAction: 'REGISTER',
        sessionRegistrations: {}
      }
    }
  };
  const regCart = {
    ...response.regCart,
    eventRegistrations: {
      '5b7a9686-c9c5-4669-bbf3-51605a2b12b1': {
        ...response.regCart.eventRegistrations['00000000-0000-0000-0000-000000000001'],
        eventRegistrationId: '5b7a9686-c9c5-4669-bbf3-51605a2b12b1',
        registrationPathId: regPathId
      }
    }
  };
  const mockRegistrationProcess = {
    registrationPathId: regPathId,
    pageVariety: 'REGISTRATION',
    pageIds: [],
    pages: {},
    layoutItems: {},
    registrationPath: {
      id: regPathId,
      registrationPageFields: [],
      modification: {}
    }
  };
  const localState = {
    ...getState(),
    appData: {
      ...getState().appData,
      registrationSettings: {
        registrationPaths: {
          '411c6566-1e5a-4c38-b8e5-f63ab9239b4': {
            ...getState().appData.registrationSettings.registrationPaths['411c6566-1e5a-4c38-b8e5-f63ab9239b40'],
            guestRegistrationSettings: {
              registrationTypeSettings: {
                limitVisibility: false,
                categorizedRegistrationTypes: [],
                isRequired: false
              }
            }
          }
        }
      }
    },
    website,
    pathInfo: { currentPageId: 'regProcessStep1' },
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...regCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: {
        ...regCart
      }
    },
    clients: {
      ...getState().clients,
      eventGuestClient: {
        ...getState().clients.eventGuestClient,
        getRegistrationContent: jest.fn(() => mockRegistrationProcess)
      }
    }
  };
  let regCartClient;
  let productVisibilityClient;
  beforeEach(() => {
    jest.clearAllMocks(); // clear counters in jest mock functions
    store = createStore(reducer, localState, applyMiddleware(thunk));
    regCartClient = store.getState().clients.regCartClient;
    productVisibilityClient = store.getState().clients.productVisibilityClient;
    productVisibilityClient.getVisibleProducts = jest.fn();
    regCartClient.updateRegCart = jest.fn(async () => {
      return {
        regCart: updatedRegCart
      };
    });
  });

  it('when reg type is changed but sessions widget is not on  the current page, do not reload sessions', async () => {
    await store.dispatch(updateGuestCountWithLoading(1, true));
    expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
    expect(productVisibilityClient.getVisibleProducts).not.toHaveBeenCalled();
  });

  it('when reg type is changed and sessions widget is on the current page', async () => {
    localState.website.layoutItems = {
      ...initialWebsite.layoutItems,
      'widget:13bb374e-1011-4aa0-ab3c-cfde67d8b3e5': {
        layout: {
          type: 'widget',
          childIds: [],
          parentId: 'id-3'
        },
        id: 'widget:13bb374e-1011-4aa0-ab3c-cfde67d8b3e5',
        config: {
          instructionalText: 'EventWidgets_Sessions_DefaultInstructionalText__resx',
          headerText: 'EventWidgets_Sessions_SessionTitle__resx'
        },
        widgetType: 'Sessions'
      }
    };
    store = createStore(reducer, localState, applyMiddleware(thunk));
    await store.dispatch(updateGuestCountWithLoading(1, true));
    expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
    expect(productVisibilityClient.getVisibleProducts).toHaveBeenCalledTimes(1);
  });

  it('when reg type is same, do not reload sessions', async () => {
    regCartClient.updateRegCart = jest.fn(async () => {
      return {
        regCart
      };
    });
    store = createStore(reducer, localState, applyMiddleware(thunk));
    await store.dispatch(updateGuestCountWithLoading(1, true));
    expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
    expect(productVisibilityClient.getVisibleProducts).not.toHaveBeenCalled();
  });
});
