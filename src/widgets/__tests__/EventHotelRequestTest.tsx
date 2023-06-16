import React from 'react';
import { shallow } from 'enzyme/build';
import EventHotelRequest from '../EventHotelRequest';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';

jest.mock('event-widgets/utils/travelUtils', () => {
  return {
    transformEventDates: state => ({
      ...state.event,
      timezone: {
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
    })
  };
});

let isHotelRequestEnabled = true;

function getState() {
  return {
    environment: 'S437',
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
    registrationForm: {
      regCart: {
        eventRegistrations: {
          123456789: {
            eventRegistrationId: '123456789',
            registrationTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0372',
            registrationPathId: 'b8e50dbf-7437-4eec-a964-bc27d79d0373',
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

    eventTravel: {
      hotelsData: {
        hotels: [
          {
            id: '5ea37a1e-299a-4dc9-b1bf-c0ef74379fe2',
            name: 'aa',
            code: '',
            description: '',
            websiteLink: '',
            phone: '',
            fax: '',
            address: '',
            isActive: true,
            hotelId: '9d4f772f-dd54-4e56-a436-d91aab911c9c',
            registrationLinkUrl: '',
            rateCode: '',
            cancellationPolicy: '',
            arrivalDate: '2019-07-06T18:30:00.000Z',
            departureDate: '2019-07-07T18:30:00.000Z',
            hasShoulderDays: true,
            checkInShoulderDays: 3,
            checkOutShoulderDays: 3,
            allowRequestShoulderDays: true,
            hasPlannerApprovalShoulderDays: true,
            hasBillingInstructions: false,
            sourceType: 1,
            billingInstructions: [],
            billingInstructionOverrides: [],
            websiteUrl: '',
            distanceUnit: 'kilometers',
            roomTypes: [
              {
                id: '9a86e84a-9ca3-42f6-a0e3-e14df2ff2586',
                code: '',
                description: '',
                maxNumberOfRoomsPerRequest: 10,
                numberOfOccupantsPerRoom: 1,
                roomRateCalculationChoice: 1,
                sortOrder: 1,
                associatedRegPathSettings: {
                  '7121b5d7-604d-4e3f-9268-f85947d85337': {
                    regPathId: '7121b5d7-604d-4e3f-9268-f85947d85337',
                    allowCharge: false,
                    allowRefund: false
                  }
                },
                isMultiOccupancyRoom: false,
                isCombinedRoom: false,
                isOpenForRegistration: true,
                roomRate: [
                  {
                    rate: 80,
                    contactTypeId: '00000000-0000-0000-0000-000000000000',
                    capacityId:
                      '7503df79-64a7-4152-9315-4f1d27c87206::9a86e84a-9ca3-42f6-a0e3-e14df2ff2586::00000000-0000-0000-0000-000000000000::20190704',
                    isShoulderDate: true,
                    roomRateDate: '2019-07-03T18:30:00.000Z',
                    hasCapacity: true,
                    availableCapacity: 80
                  }
                ],
                roomTypeName: 'aa',
                minNumberOfNights: 1
              }
            ],
            sortOrder: 1
          }
        ],
        isHotelWebsiteEnabled: false,
        isHotelRequestEnabled,
        isPasskeyEnabled: false,
        hotelRequestRules: []
      }
    },

    travelCart: {
      cart: {
        bookings: [
          {
            hotelRequests: []
          }
        ]
      },
      userSession: {
        hotelRequest: {
          ownBooking: {}
        }
      }
    },
    text: {
      resolver: {
        date: () => 'some date ',
        currency: x => x
      },
      translate: x => x,
      translateDate: x => x
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
    appData: {
      registrationSettings: {
        registrationPaths: {
          'b8e50dbf-7437-4eec-a964-bc27d79d0373': {
            travelSettings: {
              hotelRequestSettings: {
                roommateRequestSettings: {
                  allowRequestFullRoom: true,
                  allowRoommatePreference: true,
                  roommatePreferenceOption: 'visible'
                }
              }
            }
          }
        }
      }
    },
    website: {
      theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
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
  translate: c => c,
  store: { dispatch, getState, subscribe }
};

describe('EventHotelRequest', () => {
  test('should produce props from state', () => {
    const widget = shallow(<EventHotelRequest {...defaultProps} />);
    expect(widget.props()).toMatchSnapshot();
  });

  test('should not render when air request is not enabled', () => {
    isHotelRequestEnabled = false;
    const widget = shallow(<EventHotelRequest {...defaultProps} />);
    expect(widget).toMatchSnapshot();
    isHotelRequestEnabled = true;
  });

  test('should set allowHotelRequestDateChange to false for pending invitee from state', () => {
    const state = getState();
    const getPendingApprovalState = () => ({
      ...state,
      registrationForm: {
        ...state.registrationForm,
        regCart: {
          ...state.registrationForm.regCart,
          registrationApprovalRequired: true
        }
      }
    });
    const newProps = {
      classes: {},
      style: {},
      translate: c => c,
      store: { dispatch, getState: getPendingApprovalState, subscribe }
    };
    const widget = shallow(<EventHotelRequest {...newProps} />);
    expect(widget.props().allowHotelRequestDateChange).toBeFalsy();
  });
});
