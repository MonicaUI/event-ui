import * as eventRegistrationData from '../eventRegistrationData';
import React from 'react';
import { createStore } from 'redux';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import { mount } from 'enzyme';
import HotelsFixtureData from 'event-widgets/lib/HotelRequest/HotelsDataFixture.json';
import { SURVEY_TYPE } from 'event-widgets/utils/questionConstants';
import { setIn, getIn } from 'icepick';

jest.mock('event-widgets/redux/modules/timezones', () => {
  return {
    ...jest.requireActual<$TSFixMe>('event-widgets/redux/modules/timezones'),
    displayToUtcDateString: () => 'dummy-date'
  };
});

const rootState = {
  registrationForm: {
    currentEventRegistrationId: 'attendee1',
    currentGuestEventRegistration: {
      eventRegistrationId: 'guest1',
      attendee: {
        personalInformation: {
          stringField: 'guest value',
          numberField: 83,
          arrayField: [4, 'guest', 'on', 'a', 'cliff'],
          objectField: {
            subField: 'guest sub field'
          }
        }
      }
    },
    regCart: {
      regMod: false,
      eventRegistrations: {
        attendee1: {
          eventRegistrationId: 'attendee1',
          attendee: {
            personalInformation: {
              stringField: 'string value',
              numberField: 71,
              arrayField: ['some', 'array', 'values', 5],
              objectField: {
                subField: 'oh hello there'
              },
              lastName: 'Doe',
              firstName: 'John'
            }
          }
        },
        guest1: {
          eventRegistrationId: 'guest1',
          attendee: {
            personalInformation: {
              stringField: 'guest value',
              numberField: 83,
              arrayField: [4, 'guest', 'on', 'a', 'cliff'],
              objectField: {
                subField: 'guest sub field'
              }
            }
          }
        }
      }
    }
  },
  airports: {
    303: {
      city: 'Mumbai',
      code: 'BOM',
      country: 'India',
      id: 303,
      name: 'Chhatrapati Shivaji',
      stateCode: ''
    },
    360: {
      city: 'Delhi',
      code: 'DEL',
      country: 'India',
      id: 360,
      name: 'Indira Gandhi Intl',
      stateCode: ''
    }
  },
  timezones: {
    dummyTimezone: {}
  },
  event: {
    timezone: 'dummyTimezone'
  },
  eventTravel: {
    hotelsData: {
      hotels: HotelsFixtureData.hotels
    }
  },
  text: {
    translate: c => c,
    translateDate: c => c
  }
};

const getVisibleProducts = () => {
  return {
    Sessions: {
      eventRegistrationAId: {
        admissionItems: {
          admissionItemAId: {
            applicableContactTypes: ['registrationTypeAId'],
            associatedRegistrationTypes: [],
            availableOptionalSessions: ['sessionIId', 'sessionJId'],
            displayOrder: 2,
            id: 'admissionItemAId',
            isOpenForRegistration: true,
            isVisibleToPrimary: true,
            limitOptionalSessionsToSelect: false
          }
        },
        sessionProducts: {
          sessionAId: {
            id: 'sessionAId',
            isOpenForRegistration: true,
            showOnAgenda: true,
            type: 'Session',
            name: 'Session A'
          },
          sessionDId: {
            id: 'sessionDId',
            isOpenForRegistration: true,
            showOnAgenda: false,
            type: 'Session',
            name: 'Session D'
          }
        },
        sortKeys: {
          sessionGroupAId: ['2016-10-10T21:20:20.935Z'],
          sessionAId: ['2016-10-09T21:20:20.935Z']
        }
      }
    },
    Widget: {
      sessionProducts: {
        sessionIncId: {
          id: 'sessionIncId',
          isOpenForRegistration: true,
          name: 'Included Session'
        },
        sessionAId: {
          id: 'sessionAId',
          isOpenForRegistration: true,
          status: 7
        }
      }
    }
  };
};

describe('eventRegistrationData', () => {
  describe('buildEventRegistrationPath', () => {
    it('Should prepend the standard contact field path', () => {
      const fullPath = eventRegistrationData.buildEventRegistrationPath(['firstName']);
      expect(fullPath).toMatchSnapshot();
    });
  });

  describe('setAnswerAction', () => {
    const baseAction = {
      type: 'test action',
      anotherProperty: 'yay',
      payload: {
        id: 'id1',
        path: ['path', 'to', 'glory']
      }
    };

    it('Should not append more path', () => {
      const action = eventRegistrationData.setAnswerAction(baseAction, 'field value');
      expect(action).toMatchSnapshot();
    });

    it('Should append the single value to the path', () => {
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
      const action = eventRegistrationData.setAnswerAction(baseAction, 'field value', 'more path');
      expect(action).toMatchSnapshot();
    });

    it('Should append all elements in morePath to the path', () => {
      const action = eventRegistrationData.setAnswerAction(baseAction, 'field value', [
        'more',
        'path',
        'more',
        'glory'
      ]);
      expect(action).toMatchSnapshot();
    });
  });

  describe('answer', () => {
    let state;
    let regModState;
    let widgetConfig;
    let guestWidgetConfig;

    beforeEach(() => {
      state = {
        ...rootState
      };

      regModState = {
        ...state,
        regCartStatus: {
          modificationStartRegCart: {
            regMod: true,
            eventRegistrations: {
              attendee1: {
                eventRegistrationId: 'attendee1',
                attendee: {
                  personalInformation: {
                    stringField: '[preMod] string value',
                    numberField: 71,
                    arrayField: ['before', 'mod', 5],
                    objectField: {
                      beforeMode: 'there was this',
                      subField: 'oh hello there'
                    }
                  }
                }
              },
              guest1: {
                eventRegistrationId: 'guest1',
                attendee: {
                  personalInformation: {
                    stringField: '[preMod] guest value',
                    numberField: 47,
                    arrayField: [13, 'guest', 'on', 'a', 'plain'],
                    objectField: {
                      subField: '[preMod] guest sub field'
                    }
                  }
                }
              }
            }
          }
        }
      };
      regModState.registrationForm.regCart.regMod = true;

      widgetConfig = {
        registrationFieldPageType: 1
      };

      guestWidgetConfig = {
        registrationFieldPageType: 4
      };
    });

    describe('createAnswer', () => {
      it('Should return a function', () => {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        const answer = eventRegistrationData.createAnswer({
          state,
          widgetConfig,
          eventRegistrationPath: eventRegistrationData.buildEventRegistrationPath(['stringField'])
        });

        expect(answer).toBeInstanceOf(Function);
      });
    });

    describe('For widgets on normal registration pages', () => {
      it('Should pull values from regCart', () => {
        const answer = eventRegistrationData.answer({
          state,
          widgetConfig,
          eventRegistrationPath: eventRegistrationData.buildEventRegistrationPath(['stringField'])
        });

        expect(answer).toMatchSnapshot();
      });

      it('Should pull values from pre-mod cart during mod', () => {
        const answer = eventRegistrationData.answer({
          state: regModState,
          widgetConfig,
          eventRegistrationPath: eventRegistrationData.buildEventRegistrationPath(['stringField'])
        });

        expect(answer).toMatchSnapshot();
      });

      it('Should execute a formatter function if provided', () => {
        const formatter = jest.fn(val => `mocked: ${val}`);

        const answer = eventRegistrationData.answer({
          state: regModState,
          widgetConfig,
          eventRegistrationPath: eventRegistrationData.buildEventRegistrationPath(['stringField']),
          getAnswerFormatter: formatter
        });

        expect(formatter).toHaveBeenCalledTimes(2);
        expect(answer).toMatchSnapshot();
      });
    });

    describe('For widgets on guest information popup', () => {
      it('Should pull values from regCart', () => {
        const answer = eventRegistrationData.answer({
          state,
          widgetConfig: guestWidgetConfig,
          eventRegistrationPath: eventRegistrationData.buildEventRegistrationPath(['stringField'])
        });

        expect(answer).toMatchSnapshot();
      });

      it('Should pull values from pre-mod cart during mod', () => {
        const answer = eventRegistrationData.answer({
          state: regModState,
          widgetConfig: guestWidgetConfig,
          eventRegistrationPath: eventRegistrationData.buildEventRegistrationPath(['stringField'])
        });

        expect(answer).toMatchSnapshot();
      });
    });
  });

  describe('Tying it all together', () => {
    const initialState = {
      registrationForm: {
        currentEventRegistrationId: 'attendee1',
        regCart: {
          regMod: false,
          eventRegistrations: {
            attendee1: {
              eventRegistrationId: 'attendee1',
              attendee: {
                personalInformation: {
                  stringField: 'string value',
                  numberField: 71,
                  arrayField: ['some', 'array', 'values', 5],
                  objectField: {
                    subField: 'oh hello there'
                  }
                }
              }
            }
          }
        }
      },
      actions: []
    };

    class FakeComponent extends React.Component {
      static propTypes = {
        value: PropTypes.any,
        previousValue: PropTypes.any,
        onChange: PropTypes.func
      };

      render() {
        const onClick = () => (this.props as $TSFixMe).onChange(999);
        return (
          <div>
            <h1>Hello</h1>
            <button type="button" onClick={onClick} value="Activate" />
            <dl>
              <dd>value</dd>
              <dt>{(this.props as $TSFixMe).value}</dt>
              <dd>previous value</dd>
              <dt>{(this.props as $TSFixMe).previousValue}</dt>
            </dl>
            <pre>{JSON.stringify(this.props)}</pre>
          </div>
        );
      }
    }

    let getState = () => ({});

    const reducer = jest.fn((state, action) => {
      getState = () => state;
      // this prevents radomized @@redux/init entries from being added to snapshots which breaks predictability
      if (!action.type.includes('@@redux/INIT')) {
        state.actions.push(action);
      }
      return state;
    });

    const store = createStore(reducer, initialState);

    it('Should render', () => {
      const FakeComponentContainer = connect(
        (state: $TSFixMe, ownProps: $TSFixMe) => {
          const fieldPath = eventRegistrationData.buildEventRegistrationPath(ownProps.fieldPath);
          const answer = eventRegistrationData.answer({
            state,
            widgetConfig: ownProps.widgetConfig,
            eventRegistrationPath: fieldPath
          });

          return {
            value: answer.value,
            setterAction: answer.setterAction,
            previousValue: answer.valueBeforeMod,
            actions: state.actions
          };
        },
        {
          setAnswerAction: eventRegistrationData.setAnswerAction
        },
        (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
          return {
            ...ownProps,
            ...stateProps,
            ...dispatchProps,
            onChange: value => dispatchProps.setAnswerAction(stateProps.setterAction, value)
          };
        }
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof FakeComponent' is not ass... Remove this comment to see the full error message
      )(FakeComponent);

      const component = mount(
        <Provider store={store}>
          <FakeComponentContainer
            fieldPath={['numberField']}
            widgetConfig={{
              registrationFieldPageType: 1
            }}
          />
        </Provider>
      );

      expect(component).toMatchSnapshot();
      expect(getState()).toMatchSnapshot();
      expect(reducer).toHaveBeenCalledTimes(1);

      component.find('button').simulate('click');

      expect(component).toMatchSnapshot();
      expect(getState()).toMatchSnapshot();
      expect(reducer).toHaveBeenCalledTimes(2);
    });
  });

  describe('getQuestionHeader() method', () => {
    it('should return header text for hotel question', () => {
      const props = {
        config: {
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.HOTEL_QUESTIONS
              }
            }
          }
        },
        booking: {
          attendeeRegistrationId: 'attendee1',
          hotelId: '00000000-0000-0000-0000-000000000001',
          roomTypeId: '10000000-0000-0000-0000-000000000001'
        }
      };
      const res = eventRegistrationData.getQuestionHeader(rootState, props);
      expect(res).toBe('EventWidgets_QuestionWidget_HotelQuestionHeader__resx');
    });

    it('should return header for included session question', () => {
      const expectedProductQuestionHeader = {
        firstName: 'John',
        lastName: 'Doe',
        productName: 'Included Session'
      };
      const props = {
        config: {
          appData: {
            questionAssociations: ['sessionIncId'],
            question: {
              isProductQuestion: true,
              additionalInfo: {
                surveyType: SURVEY_TYPE.SESSION_REGISTRATION_QUESTIONS
              }
            }
          }
        },
        numGuests: 1
      };

      let currentState = {
        ...rootState,
        visibleProducts: getVisibleProducts()
      };
      const includedSessionInRegCart = {
        sessionRegistrations: {
          sessionIncId: {
            productId: 'sessionIncId',
            productType: 'Session',
            quantity: 1,
            requestedAction: 'REGISTER',
            registrationSourceType: 'Included'
          }
        }
      };
      let {
        text: { translate }
      } = currentState;
      const {
        config: {
          appData: { questionAssociations }
        }
      } = props;
      const eventReg = getIn(currentState, ['registrationForm', 'regCart', 'eventRegistrations', 'attendee1']);
      const firstName = getIn(eventReg, ['attendee', 'personalInformation', 'firstName']);
      const lastName = getIn(eventReg, ['attendee', 'personalInformation', 'lastName']);
      currentState = setIn(
        currentState,
        ['registrationForm', 'regCart', 'eventRegistrations', 'attendee1'],
        includedSessionInRegCart
      );
      const productName = eventRegistrationData.getProductNameForProductQuestion(
        translate,
        questionAssociations,
        {},
        currentState,
        'attendee1'
      );
      // @ts-expect-error ts-migrate(2322) FIXME: Type '(x: any, y: any) => any' is not assignable t... Remove this comment to see the full error message
      translate = (x, y) => {
        return y;
      };
      const res = eventRegistrationData.getHeaderForProductQuestion(translate, firstName, lastName, productName);
      expect(res).toEqual(expectedProductQuestionHeader);
    });

    it('should return null for hotel alternate question', () => {
      const props = {
        config: {
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.HOTEL_ALTERNATE_QUESTIONS
              }
            }
          }
        }
      };
      const res = eventRegistrationData.getQuestionHeader(rootState, props);
      expect(res).toBe(null);
    });

    it('should return header text for air question', () => {
      const props = {
        config: {
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.AIR_QUESTIONS
              }
            }
          }
        },
        booking: {
          attendeeRegistrationId: 'attendee1',
          travellerInfo: {
            firstName: 'dummy-first',
            lastName: 'dummy-last'
          },
          departureFrom: 303,
          departureTo: 360
        }
      };
      const res = eventRegistrationData.getQuestionHeader(rootState, props);
      expect(res).toBe('EventWidgets_QuestionWidget_AirQuestionHeader__resx');
    });

    it('should return header text for air question without airports specified', () => {
      const props = {
        config: {
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.AIR_QUESTIONS
              }
            }
          }
        },
        booking: {
          attendeeRegistrationId: 'attendee1',
          travellerInfo: {
            firstName: 'dummy-first',
            lastName: 'dummy-last'
          }
        }
      };
      const res = eventRegistrationData.getQuestionHeader(rootState, props);
      expect(res).toBe('EventWidgets_QuestionWidget_AirQuestionHeader_WithoutAirport__resx');
    });

    it('should return null for air alternate question', () => {
      const props = {
        config: {
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.AIR_ALTERNATE_QUESTIONS
              }
            }
          }
        }
      };
      const res = eventRegistrationData.getQuestionHeader(rootState, props);
      expect(res).toBe(null);
    });

    it('should return header text for air actual question', () => {
      const props = {
        config: {
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.AIR_ACTUAL_QUESTIONS
              }
            }
          }
        },
        booking: {
          attendeeRegistrationId: 'attendee1',
          travellerInfo: {
            firstName: 'dummy-first',
            lastName: 'dummy-last'
          },
          flightDetails: [
            {
              departureFrom: 303,
              arrivalTo: 360
            }
          ]
        }
      };
      const res = eventRegistrationData.getQuestionHeader(rootState, props);
      expect(res).toBe('EventWidgets_QuestionWidget_AirActualQuestionHeader__resx');
    });

    it('should return null for air actual alternate question', () => {
      const props = {
        config: {
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.AIR_ACTUAL_ALTERNATE_QUESTIONS
              }
            }
          }
        }
      };
      const res = eventRegistrationData.getQuestionHeader(rootState, props);
      expect(res).toBe(null);
    });
  });
});
