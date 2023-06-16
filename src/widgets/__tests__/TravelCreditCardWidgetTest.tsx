import React from 'react';
import TravelCreditCardWidget from '../TravelCreditCardWidget';
import { shallow } from 'enzyme';
import * as travelUtils from '../../utils/travelUtils';

jest.mock('../../redux/travelCart/selectors', () => {
  return {
    getTravelCart: () => {},
    getTravelBookingsByEventRegistrations: state => {
      if (state.registrationForm.currentEventRegistrationId === '87654321') return [];
      else if (state.registrationForm.currentEventRegistrationId === '123456789') {
        return [
          {
            hotelRoomBookings: [
              {
                id: '123456789',
                hotelId: 'hotelId',
                roomTypeId: 'room1Id',
                requestedAction: 'BOOK',
                checkinDate: '2019-04-13T12:00:00.000Z',
                checkoutDate: '2019-04-15T12:00:00.000Z'
              }
            ],
            registrationTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0372',
            requestedAction: 'BOOK'
          }
        ];
      }
      return [
        {
          airBookings: [
            {
              id: '123456789',
              requestedAction: 'BOOK'
            }
          ],
          requestedAction: 'BOOK'
        }
      ];
    }
  };
});

jest.mock('event-widgets/lib/HotelRequest/utils/HotelRequestUtil', () => {
  return {
    filterRoomRatesForBookingByUTCDates: () => {
      return [
        {
          rate: 100,
          contactTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0372',
          roomRateDate: '2019-04-13T12:00:00.000Z'
        },
        {
          rate: 100,
          contactTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0372',
          roomRateDate: '2019-04-14T12:00:00.000Z'
        }
      ];
    }
  };
});

const defaultState = {
  event: {
    timezone: 35,
    products: {
      admissionItems: {
        '3349dc98-e303-4bf9-b698-e1bdae85f946': {
          id: '3349dc98-e303-4bf9-b698-e1bdae85f946'
        }
      }
    },
    registrationTypes: {
      'b8e50dbf-7437-4eec-a964-bc27d79d0372': {
        id: 'b8e50dbf-7437-4eec-a964-bc27d79d0372'
      }
    }
  },
  editor: {
    selectedRegistrationPathId: 'regPathId'
  },
  registrationForm: {
    currentEventRegistrationId: '123456789',
    regCart: {
      eventRegistrations: {
        123456789: {
          eventRegistrationId: '123456789',
          registrationPathId: 'regPathId',
          registrationTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0372',
          productRegistrations: [
            {
              productId: '3349dc98-e303-4bf9-b698-e1bdae85f946',
              productType: 'AdmissionItem',
              requestedAction: 'REGISTER'
            }
          ]
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
          id: 'regPathId',
          travelSettings: {
            travelCreditCardSettings: {
              acceptedCardTypes: ['Visa', 'MasterCard'],
              displayWidget: 'balanceDueForHotelRequest'
            }
          }
        }
      }
    }
  },
  text: {
    resolver: {
      date: () => 'some date'
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
  account: {
    settings: {
      allowExtendedLogin: false,
      offlineCreditCards: [{ paymentMethodId: 'Visa' }, { paymentMethodId: 'MasterCard' }]
    }
  },
  website: {
    pluginData: {
      registrationProcessNavigation: {
        registrationPaths: {
          regPathId: {
            id: 'regPathId'
          }
        }
      }
    }
  },
  eventTravel: {
    hotelsData: {
      hotels: [
        {
          id: 'hotelId',
          roomTypes: [
            {
              id: 'room1Id',
              roomRate: []
            }
          ]
        }
      ]
    }
  }
};

function getStateWithBalanceNotDue() {
  return {
    ...defaultState,
    registrationForm: {
      currentEventRegistrationId: 'balanceNotDue',
      regCart: {
        eventRegistrations: {
          balanceNotDue: {
            eventRegistrationId: 'balanceNotDue',
            registrationPathId: 'regPathId',
            registrationTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0372',
            productRegistrations: [
              {
                productId: '3349dc98-e303-4bf9-b698-e1bdae85f946',
                productType: 'AdmissionItem',
                requestedAction: 'REGISTER'
              }
            ]
          }
        }
      }
    }
  };
}

function getStateWithoutExtendedLogin() {
  return {
    ...defaultState,
    account: {
      settings: {
        ...defaultState.account.settings,
        allowExtendedLogin: false
      }
    }
  };
}

function getStateWithExtendedLogin() {
  return {
    ...defaultState,
    account: {
      settings: {
        ...defaultState.account.settings,
        allowExtendedLogin: true
      }
    }
  };
}

function getStateWithUnSupportedCreditCards() {
  return {
    ...defaultState,
    account: {
      settings: {
        ...defaultState.account.settings,
        allowExtendedLogin: false,
        offlineCreditCards: [
          {
            paymentMethodId: 'XYZ'
          }
        ]
      }
    }
  };
}

function getStateWithoutTravelRequest() {
  return {
    ...defaultState,
    registrationForm: {
      currentEventRegistrationId: '87654321',
      regCart: {
        eventRegistrations: {
          87654321: {
            eventRegistrationId: '87654321',
            registrationPathId: 'regPathId',
            registrationTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0372',
            productRegistrations: [
              {
                productId: '3349dc98-e303-4bf9-b698-e1bdae85f946',
                productType: 'AdmissionItem',
                requestedAction: 'REGISTER'
              }
            ]
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
            id: 'regPathId',
            travelSettings: {
              travelCreditCardSettings: {
                acceptedCardTypes: ['Visa', 'MasterCard'],
                displayWidget: 'atleastOneTravelRequest'
              }
            }
          }
        }
      }
    }
  };
}

function getStateWithTravelRequest() {
  return {
    ...defaultState,
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
            id: 'regPathId',
            travelSettings: {
              travelCreditCardSettings: {
                acceptedCardTypes: ['Visa', 'MasterCard'],
                displayWidget: 'atleastOneTravelRequest'
              }
            }
          }
        }
      }
    }
  };
}

function getStateWithShoulderDatesOn() {
  return {
    ...defaultState,
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId: {
            ...defaultState.appData.registrationSettings.registrationPaths.regPathId,
            travelSettings: {
              travelCreditCardSettings: {
                acceptedCardTypes: ['Visa', 'MasterCard'],
                displayWidget: 'shoulderDatesOn'
              }
            }
          }
        }
      }
    }
  };
}

const defaultStateBI = {
  ...defaultState,
  appData: {
    registrationSettings: {
      registrationPaths: {
        regPathId: {
          ...defaultState.appData.registrationSettings.registrationPaths.regPathId,
          travelSettings: {
            travelCreditCardSettings: {
              acceptedCardTypes: ['Visa', 'MasterCard'],
              displayWidget: 'billingInstructionOn',
              billingInstruction: {
                billingInstructionCode: 'selectedBICode'
              }
            }
          }
        }
      }
    }
  },
  account: {
    ...defaultState.account,
    hotelBillingInstructions: [
      {
        code: 'selectedBICode',
        id: 'selectedBIID'
      }
    ]
  }
};

function getStateWithBillingInstructionOn() {
  return defaultStateBI;
}

function getStateWithSelectedBIDeleted() {
  return {
    ...defaultStateBI,
    account: {
      ...defaultState.account,
      hotelBillingInstructions: []
    }
  };
}

async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getStateWithoutExtendedLogin);
  }
}

const subscribe = () => {};
const defaultProps = {
  classes: {},
  style: {},
  translate: c => c,
  store: { dispatch, getState: getStateWithoutExtendedLogin, subscribe }
};

describe('TravelCreditCardWidget produces props from state', () => {
  beforeEach(() => {
    const mockedDate = new Date(2018, 10, 1);
    // @ts-expect-error ts-migrate(2739) FIXME: Type 'Mock<Date, []>' is missing the following pro... Remove this comment to see the full error message
    global.Date = jest.fn(() => mockedDate);
  });

  describe('when extended login is ON', () => {
    const newProps = {
      classes: {},
      style: {},
      translate: c => c,
      store: { dispatch, getState: getStateWithExtendedLogin, subscribe }
    };
    test('should render with props', () => {
      const widget = shallow(<TravelCreditCardWidget {...newProps} />);
      expect(widget.props()).toMatchSnapshot();
    });
  });

  describe('when extended login is OFF', () => {
    describe('when account has supported credit cards', () => {
      describe('when displayWidget value is balanceDueForHotelRequest', () => {
        describe('when balance due for hotel request', () => {
          test('should render with props', () => {
            const widget = shallow(<TravelCreditCardWidget {...defaultProps} />);
            expect(widget.props()).toMatchSnapshot();
          });
        });
        describe('when balance not due for hotel request', () => {
          test('should render with props', () => {
            const newProps = {
              classes: {},
              style: {},
              translate: c => c,
              store: { dispatch, getState: getStateWithBalanceNotDue, subscribe }
            };
            const widget = shallow(<TravelCreditCardWidget {...newProps} />);
            expect(widget.props()).toMatchSnapshot();
          });
        });
      });

      describe('when displayWidget value is atleastOneTravelRequest', () => {
        describe('when no travel request', () => {
          test('should render with props', () => {
            const newProps = {
              classes: {},
              style: {},
              translate: c => c,
              store: { dispatch, getState: getStateWithoutTravelRequest, subscribe }
            };
            const widget = shallow(<TravelCreditCardWidget {...newProps} />);
            expect(widget.props()).toMatchSnapshot();
          });
        });
        describe('when have atleast one travel request', () => {
          test('should render with props', () => {
            const newProps = {
              classes: {},
              style: {},
              translate: c => c,
              store: { dispatch, getState: getStateWithTravelRequest, subscribe }
            };
            const widget = shallow(<TravelCreditCardWidget {...newProps} />);
            expect(widget.props()).toMatchSnapshot();
          });
        });
      });

      describe('when displayWidget value is shoulderDatesOn >', () => {
        const newProps = {
          classes: {},
          style: {},
          translate: c => c,
          store: { dispatch, getState: getStateWithShoulderDatesOn, subscribe }
        };
        const ShoulderDatesSpy = jest.spyOn(travelUtils, 'hasAnyHotelRoomBookingsWithShoulderDates');
        beforeEach(() => {
          ShoulderDatesSpy.mockClear();
        });
        test('when at least one hotel room request has shoulder dates > should render with props', () => {
          ShoulderDatesSpy.mockReturnValue(true);
          const widget = shallow(<TravelCreditCardWidget {...newProps} />);
          expect(widget.props()).toMatchSnapshot();
        });
        test('when no hotel room request has shoulder dates > should render with props', () => {
          ShoulderDatesSpy.mockReturnValue(false);
          const widget = shallow(<TravelCreditCardWidget {...newProps} />);
          expect(widget.props()).toMatchSnapshot();
        });
      });

      describe('when displayWidget value is billingInstructionOn >', () => {
        // also tests getSelectedBillingInstruction()
        const newProps = {
          classes: {},
          style: {},
          translate: c => c,
          store: { dispatch, getState: getStateWithBillingInstructionOn, subscribe }
        };
        const BillingInstructionsSpy = jest.spyOn(travelUtils, 'hasAnyHotelRoomBookingsWithBI');
        beforeEach(() => {
          BillingInstructionsSpy.mockClear();
        });
        test("when any of the primary invitee's hotel room request is associated with the selected BI > should render with props", () => {
          BillingInstructionsSpy.mockReturnValue(true);
          const widget = shallow(<TravelCreditCardWidget {...newProps} />);
          expect(widget.props()).toMatchSnapshot();
        });
        test("when no primary invitee's hotel room request is associated with the selected BI > should render with props", () => {
          BillingInstructionsSpy.mockReturnValue(false);
          const widget = shallow(<TravelCreditCardWidget {...newProps} />);
          expect(widget.props()).toMatchSnapshot();
        });
        test('when selectedBI is deleted/deactivated from planner side > should render with props', () => {
          const modifiedNewProps = {
            classes: {},
            style: {},
            translate: c => c,
            store: { dispatch, getState: getStateWithSelectedBIDeleted, subscribe }
          };
          const widget = shallow(<TravelCreditCardWidget {...modifiedNewProps} />);
          expect(widget.props()).toMatchSnapshot();
        });
      });
    });

    describe('when account has unsupported credit cards', () => {
      const newProps = {
        classes: {},
        style: {},
        translate: c => c,
        store: { dispatch, getState: getStateWithUnSupportedCreditCards, subscribe }
      };
      test('should render with props', () => {
        const widget = shallow(<TravelCreditCardWidget {...newProps} />);
        expect(widget.props()).toMatchSnapshot();
      });
    });
  });
});
