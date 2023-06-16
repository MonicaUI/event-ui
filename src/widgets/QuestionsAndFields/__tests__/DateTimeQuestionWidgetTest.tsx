import React from 'react';
import DateTimeQuestionWidget, {
  DateTimeQuestionWidgetWithGraphQL,
  DateTimeQuestionWidgetWithRedux
} from '../DateTimeQuestionWidget';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { MockedProvider } from '@apollo/client/testing';
import configureStore from '../../../redux/configureStore';
import WidgetFactory from '../../../widgetFactory';
import Grid from 'nucleus-core/layout/flexbox/Grid';
import { AnswerPlacements } from 'cvent-question-widgets/lib/questionSettings';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import { setIn, updateIn } from 'icepick';
// eslint-disable-next-line jest/no-mocks-import
import { getApolloClientMocks } from '../__mocks__/apolloClient';
import { GraphQLSiteEditorDataReleases } from '../../../ExperimentHelper';

jest.mock('../../../apollo/siteEditor/pageVarietyPathQueryHooks', () => ({
  __esModule: true,
  ...jest.requireActual<$TSFixMe>('../__mocks__/pageVarietyPathQueryHooks')
}));

const widgetPresentProps = {
  isAirActualWidgetPresent: true,
  isAirRequestWidgetPresent: true,
  isGroupFlightWidgetPresent: true,
  isHotelRequestWidgetPresent: true
};

const dateTimeQuestion = {
  dateTimeQuestion1: {
    question: {
      code: 'DateTimeQuestion1',
      questionTypeInfo: {
        questionType: 'OpenEndedDateTime',
        openEndedType: 'DateTime',
        answerPlacementType: AnswerPlacements.BELOW,
        displayFormatTypeId: 'DateAndTimeMonthFirst24HourTime',
        defaultToCurrentDate: false
      },
      additionalInfo: {
        required: false,
        helpText: ''
      },
      id: 'dateTimeQuestion1',
      text: 'Date Time Question 1'
    }
  }
};

const runTests = useGraphQLSiteEditorData => {
  const initialState = (setAsProductQuestion, guestProductId = 'guestAdmissionItemId') => {
    let productQuestions = {};
    let registrationQuestions = {};
    if (setAsProductQuestion) {
      productQuestions = {
        dateTimeQuestion1: {
          ...dateTimeQuestion.dateTimeQuestion1,
          productQuestionAssociations: ['admissionItemAId']
        },
        dateTimeQuestion2: {
          ...dateTimeQuestion.dateTimeQuestion1,
          productQuestionAssociations: ['admissionItemAId1']
        },
        sessionDateTimeQuestion3: {
          ...dateTimeQuestion.dateTimeQuestion1,
          question: {
            ...dateTimeQuestion.dateTimeQuestion1.question,
            id: 'sessionDateTimeQuestion3',
            text: 'Session Date Time Question 3'
          },
          productQuestionAssociations: ['sessionId']
        }
      };
    } else {
      registrationQuestions = {
        ...dateTimeQuestion
      };
    }
    return {
      website: {
        siteInfo: {
          sharedConfigs: {}
        }
      },
      widgetFactory: new WidgetFactory(),
      appData: {
        registrationSettings: {
          registrationQuestions,
          productQuestions
        }
      },
      experiments: {
        useGraphQLSiteEditorData
      },
      registrationForm: {
        currentEventRegistrationId: 'eventRegistration1',
        regCart: {
          eventRegistrations: {
            eventRegistration1: {
              productRegistrations: [
                {
                  productId: 'admissionItemAId',
                  productType: 'AdmissionItem',
                  quantity: 1,
                  requestedAction: 'REGISTER'
                }
              ],
              sessionRegistrations: {
                sessionId: {
                  productId: 'sessionId',
                  requestedAction: 'REGISTER'
                }
              },
              attendee: {
                personalInformation: {
                  firstName: 'attendee',
                  lastName: '1'
                }
              }
            },
            dummyGuestEventRegId: {
              attendeeType: 'GUEST',
              primaryRegistrationId: 'eventRegistration1',
              requestedAction: 'REGISTER',
              displaySequence: 1,
              eventRegistrationId: 'dummyGuestEventRegId',
              productRegistrations: [
                {
                  requestedAction: 'REGISTER',
                  productType: 'AdmissionItem',
                  productId: guestProductId,
                  quantity: 1
                }
              ],
              sessionRegistrations: {
                sessionId: {
                  requestedAction: 'REGISTER',
                  productId: 'guestSessionId',
                  registrationSourceType: 'Selected',
                  includedInAgenda: false
                }
              },
              attendee: {
                personalInformation: {
                  firstName: 'g',
                  lastName: 'g'
                }
              }
            }
          }
        }
      },
      visibleProducts: {
        Sessions: {
          eventRegistration1: {
            sessionProducts: {
              sessionId: {
                name: 'Session'
              },
              guestSessionId: {
                name: 'Guest Session'
              }
            }
          },
          dummyGuestEventRegId: {
            sessionProducts: {
              sessionId: {
                name: 'Session'
              },
              guestSessionId: {
                name: 'Guest Session'
              }
            }
          }
        }
      },
      event: {
        products: {
          admissionItems: {
            admissionItemAId: {
              name: 'Admission Item A'
            },
            id: {
              name: 'Admission Item'
            }
          }
        }
      }
    };
  };

  const defaultProps = {
    translate: (resx, opts) => (opts ? `${resx}:${JSON.stringify(opts)}` : resx),
    style: {},
    classes: {}
  };

  // eslint-disable-next-line react/prop-types
  const MockWrapper = ({ store, siteEditorGraphQLData = widgetPresentProps, children }) => {
    return (
      <Provider store={store}>
        {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: MockedResponse<R... Remove this comment to see the full error message */}
        <MockedProvider mocks={getApolloClientMocks(siteEditorGraphQLData)} addTypeName={false}>
          <Grid>{children}</Grid>
        </MockedProvider>
      </Provider>
    );
  };
  test('widget should render based on experiment wrapper', async () => {
    const store = configureStore(initialState(false));
    const component = mount(
      <MockWrapper store={store}>
        <DateTimeQuestionWidget {...defaultProps} config={{ id: 'dateTimeQuestion1' }} type="DateTimeQuestion" />
      </MockWrapper>
    );
    expect(component.exists(DateTimeQuestionWidgetWithGraphQL)).toEqual(!!useGraphQLSiteEditorData);
    expect(component.exists(DateTimeQuestionWidgetWithRedux)).toEqual(!useGraphQLSiteEditorData);
  });
  test('date time question renders and allows you to enter values', async () => {
    const store = configureStore(initialState(false));
    const component = mount(
      <MockWrapper store={store}>
        <DateTimeQuestionWidget {...defaultProps} config={{ id: 'dateTimeQuestion1' }} type="DateTimeQuestion" />
      </MockWrapper>
    );

    // unanswered view
    expect(component).toMatchSnapshot();

    // enter date
    component
      .find('[data-cvent-id="date-picker"] [data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '01/02/2000' } });
    expect(component).toMatchSnapshot();

    // enter time
    const timeInput = component.find('[data-cvent-id="time-picker"] [data-cvent-id="input"]').hostNodes();
    timeInput.simulate('paste').simulate('change', { target: { value: '01:23 AM' } });
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
  });

  test('date time question renders and allows invitee to enter values for guest', async () => {
    const store = configureStore(initialState(false));
    const component = mount(
      <MockWrapper store={store}>
        <DateTimeQuestionWidget
          {...defaultProps}
          config={{
            id: 'dateTimeQuestion1',
            registrationFieldPageType: registrationFieldPageType.GuestRegistration
          }}
          type="DateTimeQuestion"
        />
      </MockWrapper>
    );

    // unanswered view
    expect(component).toMatchSnapshot();

    // enter date
    component
      .find('[data-cvent-id="date-picker"] [data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '01/02/2000' } });
    expect(component).toMatchSnapshot();

    // enter time
    const timeInput = component.find('[data-cvent-id="time-picker"] [data-cvent-id="input"]').hostNodes();
    timeInput.simulate('paste').simulate('change', { target: { value: '01:23 AM' } });
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.currentGuestEventRegistration.attendee).toMatchSnapshot();
  });

  test('date time properly returns empty when an empty string is passed', async () => {
    const store = configureStore(initialState(false));
    const component = mount(
      <MockWrapper store={store}>
        <DateTimeQuestionWidget
          {...defaultProps}
          config={{
            id: 'dateTimeQuestion1',
            registrationFieldPageType: registrationFieldPageType.GuestRegistration
          }}
          type="DateTimeQuestion"
        />
      </MockWrapper>
    );

    // enter date
    component
      .find('[data-cvent-id="date-picker"] [data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '' } });
    expect(component).toMatchSnapshot();
  });

  test('date time product question renders when associated product is selected', async () => {
    const store = configureStore(initialState(true));
    const component = mount(
      <MockWrapper store={store}>
        <DateTimeQuestionWidget {...defaultProps} config={{ id: 'dateTimeQuestion1' }} type="DateTimeQuestion" />
      </MockWrapper>
    );

    // unanswered view
    expect(component.find('[name="dateTimeQuestion1.date"]').exists()).toBeTruthy();
    expect(component.find('[name="dateTimeQuestion1.time"]').exists()).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  test('date time product question renders for invitee and guest when they both select associated product', async () => {
    let state = initialState(true, 'admissionItemAId');
    // enable guest product question
    state = setIn(
      state,
      ['appData', 'registrationSettings', 'productQuestions', 'dateTimeQuestion1', 'question', 'isProductQuestion'],
      true
    );

    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <DateTimeQuestionWidget {...defaultProps} config={{ id: 'dateTimeQuestion1' }} type="DateTimeQuestion" />
      </MockWrapper>
    );

    // unanswered view
    expect(component.find('[name="dateTimeQuestion1.date"]').exists()).toBeTruthy();
    expect(component.find('[name="dateTimeQuestion1.time"]').exists()).toBeTruthy();
    expect(component.find('[name="dateTimeQuestion1-dummyGuestEventRegId.date"]').exists()).toBeTruthy();
    expect(component.find('[name="dateTimeQuestion1-dummyGuestEventRegId.time"]').exists()).toBeTruthy();
    expect(
      component.containsMatchingElement(<div>EventWidgets_QuestionWidget_ProductQuestionHeader_TwoPartName</div>)
    ).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  test('date time product question does not renders when associated product is not selected', async () => {
    const store = configureStore(initialState(true));
    const component = mount(
      <MockWrapper store={store}>
        <DateTimeQuestionWidget {...defaultProps} config={{ id: 'dateTimeQuestion2' }} type="DateTimeQuestion" />
      </MockWrapper>
    );

    // unanswered view
    expect(component.find('input').exists()).toBeFalsy();
    expect(component).toMatchSnapshot();
  });

  test('date time session question renders when associated product is selected', async () => {
    const store = configureStore(initialState(true));
    const component = mount(
      <MockWrapper store={store}>
        <DateTimeQuestionWidget {...defaultProps} config={{ id: 'sessionDateTimeQuestion3' }} type="DateTimeQuestion" />
      </MockWrapper>
    );

    // unanswered view
    expect(component.find('[name="sessionDateTimeQuestion3.date"]').exists()).toBeTruthy();
    expect(component.find('[name="sessionDateTimeQuestion3.time"]').exists()).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  test('date product question renders when associated product is selected', async () => {
    let state = initialState(true);
    state = setIn(
      state,
      [
        'appData',
        'registrationSettings',
        'productQuestions',
        'dateTimeQuestion1',
        'question',
        'questionTypeInfo',
        'displayFormatTypeId'
      ],
      'DateOnlyDayFirst'
    );
    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <DateTimeQuestionWidget {...defaultProps} config={{ id: 'dateTimeQuestion1' }} type="DateTimeQuestion" />
      </MockWrapper>
    );

    // unanswered view
    expect(component.find('[name="dateTimeQuestion1"]').exists()).toBeTruthy();
    expect(component.find('[name="dateTimeQuestion1.time"]').exists()).toBeFalsy();
    expect(component).toMatchSnapshot();
  });

  test('guest page only renders product question for the related guest', async () => {
    const guestQuestionId = 'sessionDateTimeQuestion3';
    let state = initialState(true);
    // enable guest product question
    state = setIn(
      state,
      ['appData', 'registrationSettings', 'productQuestions', guestQuestionId, 'question', 'isProductQuestion'],
      true
    );
    state = updateIn(state, ['registrationForm'], registrationForm => {
      return {
        ...registrationForm,
        currentGuestEventRegistration: {
          eventRegistrationId: 'dummyGuestEventRegId'
        }
      };
    });

    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <DateTimeQuestionWidget
          {...defaultProps}
          config={{
            id: guestQuestionId,
            registrationFieldPageType: registrationFieldPageType.GuestRegistration
          }}
          type="DateTimeQuestion"
        />
      </MockWrapper>
    );

    // Only one question for curent guest (none for primary and other guests)
    expect(component.find('fieldset').length).toEqual(1);
  });
};

describe('DateTimeQuestionWidget', () => {
  describe('Use GraphQL widget data', () => {
    runTests(GraphQLSiteEditorDataReleases.Development);
  });
  describe('Use Redux widget data', () => {
    runTests(GraphQLSiteEditorDataReleases.Off);
  });
});
