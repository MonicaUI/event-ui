import React from 'react';
import ChoiceQuestionWidget, {
  ChoiceQuestionWidgetWithGraphQL,
  ChoiceQuestionWidgetWithRedux
} from '../ChoiceQuestionWidget';
import TextQuestionWidget from '../TextQuestionWidget';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from '../../../redux/configureStore';
import { MockedProvider } from '@apollo/client/testing';
import WidgetFactory from '../../../widgetFactory';
import Grid from 'nucleus-core/layout/flexbox/Grid';
import { setIn, updateIn, getIn } from 'icepick';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import { AnswerPlacements } from 'cvent-question-widgets/lib/questionSettings';
import { AnswerFormatTypes } from 'cvent-question-widgets/lib/TextQuestion';
import { getAnswers } from '../ChoiceQuestionWidget/ChoiceQuestionWidget';
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

const choiceQuestions = {
  choiceQuestion1: {
    question: {
      code: 'ChoiceQuestion1',
      questionTypeInfo: {
        questionType: 'SingleChoice',
        choices: [
          {
            id: 'ChoiceA',
            text: 'Choice A'
          },
          {
            id: 'ChoiceB',
            text: 'Choice B'
          }
        ],
        otherAnswer: {
          text: 'Other'
        },
        naAnswer: {
          text: 'N/A'
        },
        exports: [],
        displayType: 'Horizontal',
        answerPlacement: 'Below',
        choiceSortOrder: 'AToZ'
      },
      additionalInfo: {
        required: false,
        helpText: ''
      },
      id: 'choiceQuestion1',
      text: 'Choice Question 1'
    }
  },
  choiceQuestion2: {
    question: {
      code: 'choiceQuestion2',
      questionTypeInfo: {
        questionType: 'MultiChoice',
        choices: [
          {
            id: 'ChoiceA',
            text: 'Choice A'
          },
          {
            id: 'ChoiceB',
            text: 'Choice B'
          }
        ],
        otherAnswer: {
          text: 'Other'
        },
        naAnswer: {
          text: 'N/A'
        },
        exports: [],
        displayType: 'Horizontal',
        answerPlacement: 'Below',
        choiceSortOrder: 'AToZ'
      },
      additionalInfo: {
        required: false,
        helpText: ''
      },
      id: 'choiceQuestion2',
      text: 'Choice Question 2'
    }
  },
  choiceQuestion3: {
    question: {
      code: 'ChoiceQuestion3',
      questionTypeInfo: {
        questionType: 'SingleChoice',
        choices: [
          {
            id: 'dropDownA',
            text: 'DropDown A'
          },
          {
            id: 'dropDownB',
            text: 'DropDown B'
          }
        ],
        exports: [],
        displayType: 'List',
        answerPlacement: 'Below',
        choiceSortOrder: 'AsEntered'
      },
      additionalInfo: {
        required: false,
        helpText: ''
      },
      id: 'choiceQuestion3',
      text: 'Choice Question Dropdown 3'
    }
  },
  subChoiceQuestion1: {
    question: {
      code: 'subChoiceQuestion1',
      questionTypeInfo: {
        questionType: 'SingleChoice',
        choices: [
          {
            id: 'ChoiceA',
            text: 'Choice A'
          },
          {
            id: 'ChoiceB',
            text: 'Choice B'
          }
        ],
        otherAnswer: {
          text: 'Other'
        },
        naAnswer: {
          text: 'N/A'
        },
        exports: [],
        displayType: 'Horizontal',
        answerPlacement: 'Below',
        choiceSortOrder: 'AToZ'
      },
      additionalInfo: {
        required: false,
        helpText: ''
      },
      id: 'subChoiceQuestion1',
      text: 'Sub Choice Question 1'
    },
    parentQuestionId: 'choiceQuestion1',
    subQuestionLogicChoices: [
      {
        name: 'Choice A',
        value: 'ChoiceA'
      },
      {
        name: 'N/A',
        value: 'N/A'
      }
    ]
  }
};
const textQuestion1 = {
  question: {
    code: 'TextQuestion1',
    questionTypeInfo: {
      questionType: 'OpenEndedText',
      openEndedType: 'OneLine',
      answerPlacementType: AnswerPlacements.BELOW,
      answerFormatType: AnswerFormatTypes.GENERAL
    },
    additionalInfo: {
      required: false,
      helpText: ''
    },
    id: 'textQuestion1',
    text: 'Text Question 1'
  },
  parentQuestionId: 'choiceQuestion1',
  subQuestionLogicChoices: [
    {
      name: 'Choice A',
      value: 'ChoiceA'
    },
    {
      name: 'N/A',
      value: 'N/A'
    }
  ]
};

const defaultChoiceQuestions = {
  defaultChoiceQuestion1: {
    question: {
      code: 'defaultChoiceQuestion1',
      questionTypeInfo: {
        questionType: 'SingleChoice',
        choices: [
          {
            id: 'ChoiceA',
            text: 'Choice A'
          },
          {
            id: 'ChoiceB',
            text: 'Choice B'
          }
        ],
        exports: [],
        displayType: 'Horizontal',
        answerPlacement: 'Below',
        choiceSortOrder: 'AToZ',
        defaultChoice: 'ChoiceA'
      },
      additionalInfo: {
        required: false,
        helpText: ''
      },
      id: 'defaultChoiceQuestion1',
      text: 'Default Choice Question 1'
    }
  },
  defaultChoiceQuestion2: {
    question: {
      code: 'defaultChoiceQuestion2',
      questionTypeInfo: {
        questionType: 'MultiChoice',
        choices: [
          {
            id: 'ChoiceA',
            text: 'Choice A'
          },
          {
            id: 'ChoiceB',
            text: 'Choice B'
          },
          {
            id: 'ChoiceC',
            text: 'Choice C'
          }
        ],
        exports: [],
        displayType: 'Horizontal',
        answerPlacement: 'Below',
        choiceSortOrder: 'AToZ',
        defaultChoice: [
          {
            id: 'ChoiceB',
            sortOrder: 'Ascending'
          },
          {
            id: 'ChoiceC',
            sortOrder: 'Ascending'
          }
        ]
      },
      additionalInfo: {
        required: false,
        helpText: ''
      },
      id: 'defaultChoiceQuestion2',
      text: 'Default Choice Question 2'
    }
  }
};

const createGuestRegistration = (regId, productId, attendeeInfo) => ({
  attendeeType: 'GUEST',
  primaryRegistrationId: 'eventRegistration1',
  requestedAction: 'REGISTER',
  displaySequence: 1,
  eventRegistrationId: regId,
  productRegistrations: [
    {
      requestedAction: 'REGISTER',
      productType: 'AdmissionItem',
      productId,
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
  attendee: attendeeInfo
});

const currentGuestEventRegistration = {
  attendee: {
    eventAnswers: {
      choiceQuestion1: {
        questionId: 'choiceQuestion1',
        answers: [{ answerType: 'Choice', choice: 'Choice A' }]
      }
    }
  },
  eventRegistrationId: 'dummyGuestEventRegId'
};

const defaultProps = {
  translate: (resx, opts) => (opts ? `${resx}:${JSON.stringify(opts)}` : resx),
  style: {},
  classes: {}
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const runTests = useGraphQLSiteEditorData => {
  const initialState = (
    setAsProductQuestion,
    setParentQuestionAnswer = false,
    guestProductId = 'id',
    setAsDefaultChoiceQuestion = false
  ) => {
    let productQuestions = {};
    let registrationQuestions = {};
    if (setAsProductQuestion) {
      productQuestions = {
        choiceQuestion1: {
          ...choiceQuestions.choiceQuestion1,
          productQuestionAssociations: ['admissionItemAId']
        },
        choiceQuestion2: {
          ...choiceQuestions.choiceQuestion2,
          productQuestionAssociations: ['admissionItemAId1']
        },
        sessionChoiceQuestion3: {
          ...choiceQuestions.choiceQuestion1,
          question: {
            ...choiceQuestions.choiceQuestion1.question,
            id: 'sessionChoiceQuestion3',
            text: 'Session Choice Question 3'
          },
          productQuestionAssociations: ['sessionId']
        },
        subChoiceQuestion1: {
          ...choiceQuestions.subChoiceQuestion1,
          productQuestionAssociations: ['admissionItemAId']
        }
      };
    } else if (setAsDefaultChoiceQuestion) {
      registrationQuestions = {
        ...defaultChoiceQuestions
      };
    } else {
      registrationQuestions = {
        ...choiceQuestions
      };
    }
    let attendee = {};
    let guestAttendeeInfo = {
      personalInformation: {
        firstName: 'g',
        lastName: 'g'
      }
    };
    if (setParentQuestionAnswer) {
      attendee = {
        personalInformation: {
          firstName: 'attendee',
          lastName: '1'
        },
        eventAnswers: {
          choiceQuestion1: {
            questionId: 'choiceQuestion1',
            answers: [{ answerType: 'Choice', choice: 'Choice A' }]
          }
        }
      };
      guestAttendeeInfo = {
        ...guestAttendeeInfo,
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ eventAnswers: { choiceQuestion1: { questio... Remove this comment to see the full error message
        eventAnswers: {
          choiceQuestion1: {
            questionId: 'choiceQuestion1',
            answers: [{ answerType: 'Choice', choice: 'Choice A' }]
          }
        }
      };
    }
    return {
      config: {
        appData: {
          question: 'productQuestions'
        }
      },
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
              registrationPathId: 'regPathId',
              attendee
            },
            dummyGuestEventRegId: createGuestRegistration('dummyGuestEventRegId', guestProductId, guestAttendeeInfo)
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
      },
      experiments: {
        useGraphQLSiteEditorData
      }
    };
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
        <ChoiceQuestionWidget {...defaultProps} config={{ id: 'choiceQuestion1' }} type="ChoiceQuestion" />
      </MockWrapper>
    );
    expect(component.exists(ChoiceQuestionWidgetWithGraphQL)).toEqual(!!useGraphQLSiteEditorData);
    expect(component.exists(ChoiceQuestionWidgetWithRedux)).toEqual(!useGraphQLSiteEditorData);
  });
  test('single choice question renders and allows you to select values', async () => {
    const store = configureStore(initialState(false));
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget {...defaultProps} config={{ id: 'choiceQuestion1' }} type="ChoiceQuestion" />
      </MockWrapper>
    );

    const inputIds = [
      '#choiceQuestion1-primary_0',
      '#choiceQuestion1-primary_1',
      '#choiceQuestion1-primary_2',
      '#choiceQuestion1-primary_3'
    ];

    // unanswered view
    expect(component.find('#choiceQuestion1-primary').exists()).toBeTruthy();
    inputIds.forEach(id => expect(component.find(id).exists().toBeTruthy));
    expect(component).toMatchSnapshot();

    // select the first choice
    component
      .find('[data-cvent-id="option-choiceQuestion1-primary_0"] input')
      .simulate('change', { target: { checked: true } });
    await wait(0);
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();

    // select the 'Other' choice and enter some text
    component
      .find('[data-cvent-id="option-choiceQuestion1-primary_2"] input[type="radio"]')
      .simulate('change', { target: { checked: true } });
    component
      .find('[data-cvent-id="option-choiceQuestion1-primary_2"] input[type="text"]')
      .simulate('change', { target: { value: 'other answer' } });
    await wait(0);
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();

    // select the 'N/A' choice
    component
      .find('[data-cvent-id="option-choiceQuestion1-primary_3"] input[type="radio"]')
      .simulate('change', { target: { checked: true } });
    await wait(0);
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
  });

  test('multi choice question renders and allows you to select values', async () => {
    const store = configureStore(initialState(false));
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget {...defaultProps} config={{ id: 'choiceQuestion2' }} type="ChoiceQuestion" />
      </MockWrapper>
    );

    // unanswered view
    expect(component).toMatchSnapshot();

    // select the first choice
    component
      .find('[data-cvent-id="option-choiceQuestion2-primary_0"] input[type="checkbox"]')
      .simulate('change', { target: { checked: true } });
    await wait(0);
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();

    // select the 'Other' choice and enter some text
    component
      .find('[data-cvent-id="option-choiceQuestion2-primary_2"] input[type="checkbox"]')
      .simulate('change', { target: { checked: true } });
    component
      .find('[data-cvent-id="option-choiceQuestion2-primary_2"] input[type="text"]')
      .simulate('change', { target: { value: 'other answer' } });
    await wait(0);
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();

    // select the 'N/A' choice causing the other choices to be unselected
    component
      .find('[data-cvent-id="option-choiceQuestion2-primary_3"] input[type="checkbox"]')
      .simulate('change', { target: { checked: true } });
    await wait(0);
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();

    // select the second choice causing 'N/A' to be unselected
    component
      .find('[data-cvent-id="option-choiceQuestion2-primary_1"] input[type="checkbox"]')
      .simulate('change', { target: { checked: true } });
    await wait(0);
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();

    // unselect the second choice
    component
      .find('[data-cvent-id="option-choiceQuestion2-primary_1"] input[type="checkbox"]')
      .simulate('change', { target: { checked: false } });
    await wait(0);
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
  });

  test('single choice product question renders when associated product is selected', async () => {
    const store = configureStore(initialState(true));
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget {...defaultProps} config={{ id: 'choiceQuestion1' }} type="ChoiceQuestion" />
      </MockWrapper>
    );

    // unanswered view
    const inputIds = [
      '#choiceQuestion1-primary_0',
      '#choiceQuestion1-primary_1',
      '#choiceQuestion1-primary_2',
      '#choiceQuestion1-primary_3'
    ];

    // unanswered view
    expect(component.find('#choiceQuestion1-primary').exists()).toBeTruthy();
    inputIds.forEach(id => expect(component.find(id).exists().toBeTruthy));
    expect(component).toMatchSnapshot();
  });

  test('single choice product question renders for invitee and guest when they both select associated product', async () => {
    let state = initialState(true, false, 'admissionItemAId');
    // enable guest product question
    state = setIn(
      state,
      ['appData', 'registrationSettings', 'productQuestions', 'choiceQuestion1', 'question', 'isProductQuestion'],
      true
    );

    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget {...defaultProps} config={{ id: 'choiceQuestion1' }} type="ChoiceQuestion" />
      </MockWrapper>
    );

    // unanswered view
    expect(component.find('#choiceQuestion1-primary').exists()).toBeTruthy();
    expect(component.find('#choiceQuestion1-dummyGuestEventRegId-primary').exists()).toBeTruthy();
    expect(
      component.containsMatchingElement(<div>EventWidgets_QuestionWidget_ProductQuestionHeader_TwoPartName</div>)
    ).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  test('guest page only renders product question for the related guest', async () => {
    const guestQuestionId = 'sessionChoiceQuestion3';
    const guestChoicePath = [
      'registrationForm',
      'currentGuestEventRegistration',
      'attendee',
      'eventAnswers',
      guestQuestionId,
      'answers',
      '0',
      'choice'
    ];
    let state = initialState(true, false);
    // enable guest product question
    state = setIn(
      state,
      ['appData', 'registrationSettings', 'productQuestions', guestQuestionId, 'question', 'isProductQuestion'],
      true
    );
    state = updateIn(state, ['registrationForm'], registrationForm => {
      return {
        ...registrationForm,
        regCart: {
          ...registrationForm.regCart,
          eventRegistrations: {
            ...registrationForm.regCart.eventRegistrations,
            extraDummyGuest: createGuestRegistration('extraDummyGuest', 'id', {
              personalInformation: {
                firstName: 'g2',
                lastName: 'g2'
              }
            })
          }
        },
        currentGuestEventRegistration
      };
    });

    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget
          {...defaultProps}
          config={{
            id: guestQuestionId,
            registrationFieldPageType: registrationFieldPageType.GuestRegistration
          }}
          type="ChoiceQuestion"
        />
      </MockWrapper>
    );

    // Only one question for curent guest (none for primary and other guests)
    expect(component.find('fieldset').length).toEqual(1);
    // No choice selected
    expect(getIn(store.getState(), guestChoicePath)).toBeFalsy();
    // Select 'Choice B'
    component
      .find(`[data-cvent-id="option-${guestQuestionId}_1"] input`)
      .simulate('change', { target: { checked: true } });
    expect(getIn(store.getState(), guestChoicePath)).toEqual('Choice B');
  });

  test('single choice product sub-question renders guest associated product question is answered', async () => {
    let state = initialState(true, true, 'admissionItemAId');
    // enable guest product question
    state = setIn(
      state,
      ['appData', 'registrationSettings', 'productQuestions', 'subChoiceQuestion1', 'question', 'isProductQuestion'],
      true
    );

    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget
          {...defaultProps}
          config={{ id: 'subChoiceQuestion1' }}
          metaData={{ parentQuestionEventRegId: 'dummyGuestEventRegId' }}
          type="ChoiceQuestion"
        />
      </MockWrapper>
    );
    // unanswered view
    expect(component.find('#subChoiceQuestion1-dummyGuestEventRegId-primary').exists()).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  test('multi choice product question does not render when associated product is not selected', async () => {
    const store = configureStore(initialState(true));
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget {...defaultProps} config={{ id: 'choiceQuestion2' }} type="ChoiceQuestion" />
      </MockWrapper>
    );

    // unanswered view
    expect(component.find('input').exists()).toBeFalsy();
    expect(component).toMatchSnapshot();
  });

  test('single choice session question renders when associated product is selected', async () => {
    const store = configureStore(initialState(true));
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget {...defaultProps} config={{ id: 'sessionChoiceQuestion3' }} type="ChoiceQuestion" />
      </MockWrapper>
    );

    // unanswered view
    expect(component.find('#sessionChoiceQuestion3-primary').exists()).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  test('single choice question renders as a dropdown and choices are selectable', async () => {
    const store = configureStore(initialState(false));
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget {...defaultProps} config={{ id: 'choiceQuestion3' }} type="ChoiceQuestion" />
      </MockWrapper>
    );

    const dropdownIds = ['[data-cvent-id="option-0"]', '[data-cvent-id="option-1"]', '[data-cvent-id="option-2"]'];

    // unanswered view
    expect(component.find('option').length === 3).toBeTruthy();
    dropdownIds.forEach(id => expect(component.find(id).exists()).toBeTruthy());
    expect(component).toMatchSnapshot();

    // select the choice A from dropdown
    component.find('#choiceQuestion3-primary').simulate('change', { target: { value: '1' } });
    await wait(0);
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();

    component.find('#choiceQuestion3-primary').simulate('change', { target: { value: '2' } });
    await wait(0);
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();

    // clear the dropdown choice by selecting choice 0 i.e default or no selection
    component.find('#choiceQuestion3-primary').simulate('change', { target: { value: '0' } });
    await wait(0);
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
  });

  test('single choice parent question renders sub-question when associated parent choice is selected', async () => {
    const state = initialState(false, true);
    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget {...defaultProps} config={{ id: 'subChoiceQuestion1' }} type="ChoiceQuestion" />
      </MockWrapper>
    );

    const subquestionChoiceIds = [
      '#subChoiceQuestion1-primary_0',
      '#subChoiceQuestion1-primary_1',
      '#subChoiceQuestion1-primary_2',
      '#subChoiceQuestion1-primary_3'
    ];

    // unanswered view
    expect(component.find('#subChoiceQuestion1-primary').exists()).toBeTruthy();
    subquestionChoiceIds.forEach(id => expect(component.find(id).exists()).toBeTruthy());
    expect(component).toMatchSnapshot();

    // select the choice
    component
      .find('[data-cvent-id="option-subChoiceQuestion1-primary_0"] input')
      .simulate('change', { target: { checked: true } });
    await wait(0);
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
  });

  test('single choice parent question renders sub-question when associated parent choice is selected on guest form', async () => {
    const state = updateIn(initialState(false, false), ['registrationForm'], registrationForm => {
      return {
        ...registrationForm,
        currentGuestEventRegistration
      };
    });
    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget
          {...defaultProps}
          config={{
            id: 'subChoiceQuestion1',
            registrationFieldPageType: registrationFieldPageType.GuestRegistration
          }}
          type="ChoiceQuestion"
        />
      </MockWrapper>
    );

    const subquestionChoiceIds = [
      '#subChoiceQuestion1_0',
      '#subChoiceQuestion1_1',
      '#subChoiceQuestion1_2',
      '#subChoiceQuestion1_3'
    ];

    // unanswered view
    expect(component.find('#subChoiceQuestion1').exists()).toBeTruthy();
    subquestionChoiceIds.forEach(id => expect(component.find(id).exists()).toBeTruthy());
    expect(component).toMatchSnapshot();

    // select the choice
    component
      .find('[data-cvent-id="option-subChoiceQuestion1_0"] input')
      .simulate('change', { target: { checked: true } });
    await wait(0);
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.currentGuestEventRegistration.attendee).toMatchSnapshot();
  });

  test('single choice parent product question renders sub-question when associated parent choice is selected', () => {
    const store = configureStore(initialState(true, true));
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget
          {...defaultProps}
          config={{ id: 'subChoiceQuestion1' }}
          metaData={{ parentQuestionEventRegId: null }}
          type="ChoiceQuestion"
        />
      </MockWrapper>
    );

    // unanswered view
    expect(component.find('#subChoiceQuestion1-primary').exists()).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  test('single choice parent question choice selection sets non-visible sub-question answers', async () => {
    const state = updateIn(
      initialState(false, true),
      ['registrationForm', 'regCart', 'eventRegistrations', 'eventRegistration1', 'attendee', 'eventAnswers'],
      eventAnswers => {
        return {
          ...eventAnswers,
          subChoiceQuestion1: {
            questionId: 'subChoiceQuestion1',
            answers: [{ answerType: 'Choice', choice: 'Choice A' }]
          }
        };
      }
    );
    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget {...defaultProps} config={{ id: 'choiceQuestion1' }} type="ChoiceQuestion" />
      </MockWrapper>
    );

    let eventAnswers = Object.values(
      store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.eventAnswers
    ).map(answer =>
      typeof (answer as $TSFixMe).toJSON === 'function' && (answer as $TSFixMe).toJSON()
        ? (answer as $TSFixMe).toJSON()
        : answer
    );
    expect(eventAnswers).toMatchSnapshot();

    /*
     * changing the parent answer after selection of sub-question choice
     * select the second choice
     */
    component
      .find('[data-cvent-id="option-choiceQuestion1-primary_1"] input')
      .simulate('change', { target: { checked: true } });
    await wait(0);

    eventAnswers = Object.values(
      store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.eventAnswers
    ).map(answer =>
      typeof (answer as $TSFixMe).toJSON === 'function' && (answer as $TSFixMe).toJSON()
        ? (answer as $TSFixMe).toJSON()
        : answer
    );

    expect(eventAnswers).toMatchSnapshot();
  });

  test('single choice guest parent question choice selection sets non-visible sub-question answers', async () => {
    let state = updateIn(
      initialState(true, true, 'admissionItemAId'),
      ['registrationForm', 'regCart', 'eventRegistrations', 'dummyGuestEventRegId', 'attendee', 'eventAnswers'],
      eventAnswers => {
        return {
          ...eventAnswers,
          subChoiceQuestion1: {
            questionId: 'subChoiceQuestion1',
            answers: [{ answerType: 'Choice', choice: 'Choice A' }]
          }
        };
      }
    );

    state = setIn(
      state,
      ['appData', 'registrationSettings', 'productQuestions', 'choiceQuestion1', 'question', 'isProductQuestion'],
      true
    );
    const store = configureStore(state);
    const props = {
      ...defaultProps,
      eventRegistrationId: 'dummyGuestEventRegId'
    };
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget {...props} config={{ id: 'choiceQuestion1' }} type="ChoiceQuestion" />
      </MockWrapper>
    );

    let eventAnswers = Object.values(
      store.getState().registrationForm.regCart.eventRegistrations.dummyGuestEventRegId.attendee.eventAnswers
    ).map(answer =>
      typeof (answer as $TSFixMe).toJSON === 'function' && (answer as $TSFixMe).toJSON()
        ? (answer as $TSFixMe).toJSON()
        : answer
    );
    expect(eventAnswers).toMatchSnapshot();

    /*
     * changing the parent answer after selection of sub-question choice
     * select the second choice
     */
    component
      .find('[data-cvent-id="option-choiceQuestion1-dummyGuestEventRegId-primary_1"] input')
      .simulate('change', { target: { checked: true } });
    await wait(0);

    eventAnswers = Object.values(
      store.getState().registrationForm.regCart.eventRegistrations.dummyGuestEventRegId.attendee.eventAnswers
    ).map(answer =>
      typeof (answer as $TSFixMe).toJSON === 'function' && (answer as $TSFixMe).toJSON()
        ? (answer as $TSFixMe).toJSON()
        : answer
    );

    expect(eventAnswers).toMatchSnapshot();
  });

  test('(For Multilanguage) single choice parent question does not render sub-question when associated parent choice is NOT selected', async () => {
    let state = initialState(false);
    state = {
      ...state,
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ localizedUserText: { currentLocale: string... Remove this comment to see the full error message
      localizedUserText: {
        currentLocale: 'en-US',
        localizations: {
          'en-US': {}
        }
      }
    };
    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget {...defaultProps} config={{ id: 'subChoiceQuestion1' }} type="ChoiceQuestion" />
      </MockWrapper>
    );
    expect(component.find('#subChoiceQuestion1-primary').exists()).toBeFalsy();
  });

  test('(For Multilanguage) single choice parent question renders sub-question when associated parent choice is selected', async () => {
    let state = initialState(false, true);
    state = {
      ...state,
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ localizedUserText: { currentLocale: string... Remove this comment to see the full error message
      localizedUserText: {
        currentLocale: 'en-US',
        localizations: {
          'en-US': {}
        }
      }
    };
    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget {...defaultProps} config={{ id: 'subChoiceQuestion1' }} type="ChoiceQuestion" />
      </MockWrapper>
    );

    const subquestionChoiceIds = [
      '#subChoiceQuestion1-primary_0',
      '#subChoiceQuestion1-primary_1',
      '#subChoiceQuestion1-primary_2',
      '#subChoiceQuestion1-primary_3'
    ];

    // unanswered view
    expect(component.find('#subChoiceQuestion1-primary').exists()).toBeTruthy();
    subquestionChoiceIds.forEach(id => expect(component.find(id).exists()).toBeTruthy());
    expect(component).toMatchSnapshot();

    // select the choice
    component
      .find('[data-cvent-id="option-subChoiceQuestion1-primary_0"] input')
      .simulate('change', { target: { checked: true } });
    await wait(0);
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
  });

  test('guest text subquestion renders with no answer when invitee has answers', async () => {
    const inviteeTextAnswer = 'test';
    let state = updateIn(initialState(false, true), ['registrationForm'], registrationForm => {
      return {
        ...registrationForm,
        currentEventRegistrationId: 'eventRegistration1',
        currentGuestEventRegistration
      };
    });
    state = updateIn(
      state,
      ['registrationForm', 'regCart', 'eventRegistrations', 'eventRegistration1', 'attendee', 'eventAnswers'],
      eventAnswers => {
        return {
          ...eventAnswers,
          textQuestion1: {
            questionId: 'textQuestion1',
            answers: [{ answerType: 'Text', text: inviteeTextAnswer }]
          }
        };
      }
    );
    state = updateIn(state, ['appData', 'registrationSettings', 'registrationQuestions'], registrationQuestions => {
      return {
        ...registrationQuestions,
        textQuestion1
      };
    });
    const store = configureStore(state);
    const props = {
      ...defaultProps,
      eventRegistrationId: 'dummyGuestEventRegId'
    };

    // Rendering the questions on guest page with no choice selected
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget
          {...props}
          config={{ id: 'choiceQuestion1', registrationFieldPageType: registrationFieldPageType.GuestRegistration }}
          type="ChoiceQuestion"
        />
        <TextQuestionWidget
          {...props}
          config={{ id: 'textQuestion1', registrationFieldPageType: registrationFieldPageType.GuestRegistration }}
          type="OpenEndedTextQuestion"
        />
      </MockWrapper>
    );

    // Selecting choice B of choiceQuestion1
    component.find('#choiceQuestion1_1').simulate('change', { target: { checked: true } });
    expect(component.find('#textQuestion1').exists()).toBeFalsy();

    // Selecting choice A of choiceQuestion1
    component.find('#choiceQuestion1_0').simulate('change', { target: { checked: true } });
    expect(component.find('#textQuestion1').hostNodes().getElement().props.value).not.toBe(inviteeTextAnswer);
    expect(component.find('#textQuestion1').hostNodes().getElement().props.value).toBe('');
  });

  test('When no answer is associated to question', async () => {
    const eventAnswers = {
      questionId: 'question'
    };
    const expectedAnswers = { selectedValues: [], otherText: '', useDefaultChoices: true };
    const result = getAnswers(eventAnswers);
    expect(result).toStrictEqual(expectedAnswers);
  });

  test('When event answers is undefined', async () => {
    let eventAnswers;
    const expectedAnswers = { selectedValues: [], otherText: '', useDefaultChoices: true };
    const result = getAnswers(eventAnswers);
    expect(result).toStrictEqual(expectedAnswers);
  });

  test('When answer is associated to text question', async () => {
    const eventAnswers = {
      questionId: 'textQuestion',
      answers: [
        {
          answerType: 'Text',
          text: ''
        }
      ]
    };
    const expectedAnswers = { selectedValues: [], otherText: null, useDefaultChoices: false };
    const result = getAnswers(eventAnswers);
    expect(result).toStrictEqual(expectedAnswers);
  });

  test('When answer is associated to choice question', async () => {
    const eventAnswers = {
      questionId: 'choiceQuestion',
      answers: [
        {
          answerType: 'Choice',
          choice: 'Choice A'
        }
      ]
    };
    const expectedAnswers = { selectedValues: ['Choice A'], otherText: null, useDefaultChoices: false };
    const result = getAnswers(eventAnswers);
    expect(result).toStrictEqual(expectedAnswers);
  });

  test('When answer type is Other for the question', async () => {
    const eventAnswers = {
      questionId: 'question',
      answers: [
        {
          answerType: 'Other',
          text: 'Other'
        },
        {
          answerType: 'NA',
          text: 'N/A'
        }
      ]
    };
    const result = getAnswers(eventAnswers);
    expect(result.otherText).toBe('Other');
  });

  test('single choice question renders with default choices pre-selected if not answered', async () => {
    const store = configureStore(initialState(false, false, 'id', true));
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget {...defaultProps} config={{ id: 'defaultChoiceQuestion1' }} type="ChoiceQuestion" />
      </MockWrapper>
    );

    // Default choice "Choice A" should be selected
    const li = component.find('[data-cvent-id="option-defaultChoiceQuestion1-primary_0"]');
    const radio = li.find('input[type="radio"]').hostNodes();
    expect(radio.props().checked).toBeTruthy();
  });

  test('single choice question renders with answered choices event if default choices initialized', async () => {
    const state = updateIn(
      initialState(false, true, 'id', true),
      ['registrationForm', 'regCart', 'eventRegistrations', 'eventRegistration1', 'attendee', 'eventAnswers'],
      eventAnswers => {
        return {
          ...eventAnswers,
          defaultChoiceQuestion1: {
            questionId: 'defaultChoiceQuestion1',
            answers: [{ answerType: 'Choice', choice: 'Choice B' }]
          }
        };
      }
    );

    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget {...defaultProps} config={{ id: 'defaultChoiceQuestion1' }} type="ChoiceQuestion" />
      </MockWrapper>
    );

    // Default choice "Choice A" should not be selected
    let li = component.find('[data-cvent-id="option-defaultChoiceQuestion1-primary_0"]');
    let radio = li.find('input[type="radio"]').hostNodes();
    expect(radio.props().checked).toBeFalsy();

    // Answered choice "Choice B" should be selected
    li = component.find('[data-cvent-id="option-defaultChoiceQuestion1-primary_1"]');
    radio = li.find('input[type="radio"]').hostNodes();
    expect(radio.props().checked).toBeTruthy();
  });

  test('multi default choice question renders with default choice pre-selected if not answered', async () => {
    const store = configureStore(initialState(false, false, 'id', true));
    const component = mount(
      <MockWrapper store={store}>
        <ChoiceQuestionWidget {...defaultProps} config={{ id: 'defaultChoiceQuestion2' }} type="ChoiceQuestion" />
      </MockWrapper>
    );

    // Non-default choice "Choice A" should not be selected
    let li = component.find('[data-cvent-id="option-defaultChoiceQuestion2-primary_0"]');
    let checkbox = li.find('input[type="checkbox"]').hostNodes();
    expect(checkbox.props().checked).toBeFalsy();

    // Default choice "Choice B" should be selected
    li = component.find('[data-cvent-id="option-defaultChoiceQuestion2-primary_1"]');
    checkbox = li.find('input[type="checkbox"]').hostNodes();
    expect(checkbox.props().checked).toBeTruthy();

    // Default choice "Choice C" should be selected
    li = component.find('[data-cvent-id="option-defaultChoiceQuestion2-primary_2"]');
    checkbox = li.find('input[type="checkbox"]').hostNodes();
    expect(checkbox.props().checked).toBeTruthy();
  });
};

describe('ChoiceQuestionWidget', () => {
  describe('Use GraphQL widget data', () => {
    runTests(GraphQLSiteEditorDataReleases.Development);
  });
  describe('Use Redux widget data', () => {
    runTests(GraphQLSiteEditorDataReleases.Off);
  });
});
