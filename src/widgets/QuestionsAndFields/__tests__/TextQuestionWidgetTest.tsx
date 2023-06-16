import React from 'react';
import TextQuestionWidget, { TextQuestionWidgetWithGraphQL, TextQuestionWidgetWithRedux } from '../TextQuestionWidget';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { MockedProvider } from '@apollo/client/testing';
import configureStore from '../../../redux/configureStore';
import WidgetFactory from '../../../widgetFactory';
import Grid from 'nucleus-core/layout/flexbox/Grid';
import { AnswerPlacements } from 'cvent-question-widgets/lib/questionSettings';
import { AnswerFormatTypes } from 'cvent-question-widgets/lib/TextQuestion';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import { CUSTOM_ANSWER_FORMAT } from 'event-widgets/utils/customAnswerFormatUtils';
import { getIn, setIn, updateIn } from 'icepick';
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

const textQuestion = {
  textQuestion1: {
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
    }
  }
};

const textQuestionWithCustomFormat = {
  textQuestion2: {
    question: {
      code: 'TextQuestion2',
      questionTypeInfo: {
        questionType: 'OpenEndedText',
        openEndedType: 'OneLine',
        answerPlacementType: AnswerPlacements.BELOW,
        answerFormatType: CUSTOM_ANSWER_FORMAT,
        customAnswerFormat: {
          id: 101
        }
      },
      additionalInfo: {
        required: false,
        helpText: ''
      },
      id: 'textQuestion2',
      text: 'Text Question Custom Format'
    }
  }
};

const textQuestionWithSpaceOnlyCustomFormat = {
  textQuestion3: {
    question: {
      code: 'TextQuestion3',
      questionTypeInfo: {
        questionType: 'OpenEndedText',
        openEndedType: 'OneLine',
        answerPlacementType: AnswerPlacements.BELOW,
        answerFormatType: CUSTOM_ANSWER_FORMAT,
        customAnswerFormat: {
          id: 104
        }
      },
      additionalInfo: {
        required: false,
        helpText: ''
      },
      id: 'textQuestion3',
      text: 'Text Question Space Only Format'
    }
  }
};

const runTests = useGraphQLSiteEditorData => {
  const initialState = (
    setAsProductQuestion,
    guestProductId = 'guestAdmissionItemId',
    includeCustomAnswerFormat = false
  ) => {
    let productQuestions = {};
    let registrationQuestions = {};
    if (setAsProductQuestion) {
      productQuestions = {
        textQuestion1: {
          ...textQuestion.textQuestion1,
          productQuestionAssociations: ['admissionItemAId']
        },
        textQuestion2: {
          ...textQuestion.textQuestion1,
          productQuestionAssociations: ['admissionItemAId1']
        },
        sessionTextQuestion3: {
          ...textQuestion.textQuestion1,
          question: {
            ...textQuestion.textQuestion1.question,
            id: 'sessionTextQuestion3',
            text: 'Session Text Question 3'
          },
          productQuestionAssociations: ['sessionId']
        },
        textQuestion4: {
          ...textQuestion.textQuestion1,
          productQuestionAssociations: ['guestAdmissionItemId']
        },
        sessionTextQuestion5: {
          ...textQuestion.textQuestion1,
          question: {
            ...textQuestion.textQuestion1.question,
            id: 'sessionTextQuestion4',
            text: 'Session Text Question 4'
          },
          productQuestionAssociations: ['guestSessionId']
        }
      };
    } else {
      registrationQuestions = {
        ...textQuestion,
        ...textQuestionWithCustomFormat,
        ...textQuestionWithSpaceOnlyCustomFormat
      };
    }
    let customAnswerFormats = {};
    if (includeCustomAnswerFormat) {
      customAnswerFormats = {
        101: {
          customAnswerFormatType: 'CharacterTypesAndPosition',
          id: 'a14c8550-05ed-4984-97f7-111b9c289309',
          formatTypeId: 101,
          name: 'ThreeNumThreeSpaceAnyNum',
          formatPattern: '999AAA?9'
        },
        102: {
          customAnswerFormatType: 'CharacterTypes',
          id: '1d7f57cd-e5a7-4aae-8a32-bdeccdf808f7',
          formatTypeId: 102,
          name: 'YEET',
          charactersOnly: true,
          allowNumbers: false,
          allowLetters: false,
          allowedCharacters: ['@', ':', '\\', ',']
        },
        103: {
          customAnswerFormatType: 'CharacterTypes',
          id: '2924eaeb-c36e-4efd-b167-771b65ea8bb6',
          formatTypeId: 103,
          name: 'YEET2',
          charactersOnly: true,
          allowNumbers: false,
          allowLetters: false,
          allowedCharacters: ['#', ':', '\\', ',', '-']
        },
        104: {
          customAnswerFormatType: 'CharacterTypes',
          id: '1a6346b9-f7e5-4f2b-9aa3-e72740e8808d',
          formatTypeId: 104,
          name: 'YEET3',
          charactersOnly: true,
          allowNumbers: false,
          allowLetters: false,
          allowedCharacters: [' ']
        }
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
      },
      account: {
        customAnswerFormats
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
        <TextQuestionWidget {...defaultProps} config={{ id: 'textQuestion1' }} type="OpenEndedTextQuestion" />
      </MockWrapper>
    );
    expect(component.exists(TextQuestionWidgetWithGraphQL)).toEqual(!!useGraphQLSiteEditorData);
    expect(component.exists(TextQuestionWidgetWithRedux)).toEqual(!useGraphQLSiteEditorData);
  });
  test('text question renders and allows you to enter text', async () => {
    const store = configureStore(initialState(false));
    const component = mount(
      <MockWrapper store={store}>
        <TextQuestionWidget {...defaultProps} config={{ id: 'textQuestion1' }} type="OpenEndedTextQuestion" />
      </MockWrapper>
    );

    // unanswered view
    expect(component.find('#textQuestion1').exists()).toBeTruthy();
    expect(component).toMatchSnapshot();

    // enter text
    component
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: 'text answer' } });
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
  });

  test('text question renders and allows invitee to enter text on behalf of guest', async () => {
    const store = configureStore(initialState(false));
    const component = mount(
      <MockWrapper store={store}>
        <TextQuestionWidget
          {...defaultProps}
          config={{
            id: 'textQuestion1',
            registrationFieldPageType: registrationFieldPageType.GuestRegistration
          }}
          type="OpenEndedTextQuestion"
        />
      </MockWrapper>
    );

    // unanswered view
    expect(component.find('#textQuestion1').exists()).toBeTruthy();
    expect(component).toMatchSnapshot();

    // enter text
    component
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: 'text answer' } });
    expect(component).toMatchSnapshot();
    expect(store.getState().registrationForm.currentGuestEventRegistration.attendee).toMatchSnapshot();
  });

  test('text product question does not render when associated product is not selected', async () => {
    const store = configureStore(initialState(true));
    const component = mount(
      <MockWrapper store={store}>
        <TextQuestionWidget {...defaultProps} config={{ id: 'textQuestion2' }} type="OpenEndedTextQuestion" />
      </MockWrapper>
    );
    expect(component.find('input').exists()).toBeFalsy();
    expect(component).toMatchSnapshot();
  });

  test('text product question renders when associated product is selected', async () => {
    const store = configureStore(initialState(true));
    const component = mount(
      <MockWrapper store={store}>
        <TextQuestionWidget {...defaultProps} config={{ id: 'textQuestion1' }} type="OpenEndedTextQuestion" />
      </MockWrapper>
    );
    // unanswered view
    expect(component.find('#textQuestion1').exists()).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  test('text session product question renders when associated product is selected', async () => {
    const store = configureStore(initialState(true));
    const component = mount(
      <MockWrapper store={store}>
        <TextQuestionWidget {...defaultProps} config={{ id: 'sessionTextQuestion3' }} type="OpenEndedTextQuestion" />
      </MockWrapper>
    );
    // unanswered view
    expect(component.find('#sessionTextQuestion3').exists()).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  test('Product question does not render for guest if they dont have the corresponding product selected', async () => {
    const store = configureStore(initialState(true));
    const component = mount(
      <MockWrapper store={store}>
        <TextQuestionWidget
          {...defaultProps}
          config={{
            id: 'textQuestion1',
            registrationFieldPageType: registrationFieldPageType.GuestRegistration
          }}
          type="OpenEndedTextQuestion"
        />
      </MockWrapper>
    );
    // unanswered view
    expect(component.find('input').exists()).toBeFalsy();
    expect(component).toMatchSnapshot();
  });

  test('Text product question renders for invitee and guests when they both select associated product', async () => {
    let state = initialState(true, 'admissionItemAId');
    // enable guest product question
    state = setIn(
      state,
      ['appData', 'registrationSettings', 'productQuestions', 'textQuestion1', 'question', 'isProductQuestion'],
      true
    );
    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <TextQuestionWidget {...defaultProps} config={{ id: 'textQuestion1' }} type="OpenEndedTextQuestion" />
      </MockWrapper>
    );
    // unanswered view
    expect(component.find('#textQuestion1').exists()).toBeTruthy();
    expect(component.find('#textQuestion1-dummyGuestEventRegId').exists()).toBeTruthy();
    expect(
      component.containsMatchingElement(<div>EventWidgets_QuestionWidget_ProductQuestionHeader_TwoPartName</div>)
    ).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  test('Text product question header does not render for invitee or guest when they select product but have no first or last name', async () => {
    let state = initialState(true, 'admissionItemAId');
    // enable guest product question
    state = setIn(
      state,
      ['appData', 'registrationSettings', 'productQuestions', 'textQuestion1', 'question', 'isProductQuestion'],
      true
    );
    // set first and last name for invitee and guest to undefined
    state = setIn(
      state,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        'eventRegistration1',
        'attendee',
        'personalInformation',
        'firstName'
      ],
      undefined
    );
    state = setIn(
      state,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        'eventRegistration1',
        'attendee',
        'personalInformation',
        'lastName'
      ],
      undefined
    );
    state = setIn(
      state,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        'dummyGuestEventRegId',
        'attendee',
        'personalInformation',
        'firstName'
      ],
      undefined
    );
    state = setIn(
      state,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        'dummyGuestEventRegId',
        'attendee',
        'personalInformation',
        'lastName'
      ],
      undefined
    );
    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <TextQuestionWidget {...defaultProps} config={{ id: 'textQuestion1' }} type="OpenEndedTextQuestion" />
      </MockWrapper>
    );
    // unanswered view
    expect(component.find('#textQuestion1').exists()).toBeTruthy();
    expect(component.find('#textQuestion1-dummyGuestEventRegId').exists()).toBeTruthy();
    expect(
      component.containsMatchingElement(<div>EventWidgets_QuestionWidget_ProductQuestionHeader_TwoPartName</div>)
    ).toBeFalsy();
    expect(component).toMatchSnapshot();
  });

  test('Text product question header renders for invitee and guest when they select product but have only first or last name', async () => {
    let state = initialState(true, 'admissionItemAId');
    // enable guest product question
    state = setIn(
      state,
      ['appData', 'registrationSettings', 'productQuestions', 'textQuestion1', 'question', 'isProductQuestion'],
      true
    );
    // set first and last name for invitee and guest to undefined
    state = setIn(
      state,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        'eventRegistration1',
        'attendee',
        'personalInformation',
        'firstName'
      ],
      'first name'
    );
    state = setIn(
      state,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        'eventRegistration1',
        'attendee',
        'personalInformation',
        'lastName'
      ],
      undefined
    );
    state = setIn(
      state,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        'dummyGuestEventRegId',
        'attendee',
        'personalInformation',
        'firstName'
      ],
      undefined
    );
    state = setIn(
      state,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        'dummyGuestEventRegId',
        'attendee',
        'personalInformation',
        'lastName'
      ],
      'guest 01'
    );
    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <TextQuestionWidget {...defaultProps} config={{ id: 'textQuestion1' }} type="OpenEndedTextQuestion" />
      </MockWrapper>
    );
    // unanswered view
    expect(component.find('#textQuestion1').exists()).toBeTruthy();
    expect(component.find('#textQuestion1-dummyGuestEventRegId').exists()).toBeTruthy();
    expect(
      component.containsMatchingElement(<div>EventWidgets_QuestionWidget_ProductQuestionHeader_TwoPartName</div>)
    ).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  test('Text product question renders for invitee and guests when they both select associated product w/ CommentBox', async () => {
    let state = initialState(true, 'admissionItemAId');
    // enable guest product question
    state = setIn(
      state,
      ['appData', 'registrationSettings', 'productQuestions', 'textQuestion1', 'question', 'guestProductQuestions'],
      true
    );
    state = setIn(
      state,
      ['appData', 'registrationSettings', 'productQuestions', 'textQuestion1', 'question', 'isProductQuestion'],
      true
    );
    // change from OneLine textQuestion to CommentBlock
    state = setIn(
      state,
      [
        'appData',
        'registrationSettings',
        'productQuestions',
        'textQuestion1',
        'question',
        'questionTypeInfo',
        'openEndedType'
      ],
      'CommentBox'
    );
    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <TextQuestionWidget {...defaultProps} config={{ id: 'textQuestion1' }} type="OpenEndedTextQuestion" />
      </MockWrapper>
    );
    // unanswered view
    expect(component.find('#textQuestion1').exists()).toBeTruthy();
    expect(component.find('#textQuestion1-dummyGuestEventRegId').exists()).toBeTruthy();
    expect(
      component.containsMatchingElement(<div>EventWidgets_QuestionWidget_ProductQuestionHeader_TwoPartName</div>)
    ).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  test('Text product question header does not render for invitee or guest when they select product but have no first or last name w/ CommentBox', async () => {
    let state = initialState(true, 'admissionItemAId');
    // enable guest product question
    state = setIn(
      state,
      ['appData', 'registrationSettings', 'productQuestions', 'textQuestion1', 'question', 'guestProductQuestions'],
      true
    );
    state = setIn(
      state,
      ['appData', 'registrationSettings', 'productQuestions', 'textQuestion1', 'question', 'isProductQuestion'],
      true
    );
    // change from OneLine textQuestion to CommentBlock
    state = setIn(
      state,
      [
        'appData',
        'registrationSettings',
        'productQuestions',
        'textQuestion1',
        'question',
        'questionTypeInfo',
        'openEndedType'
      ],
      'CommentBox'
    );
    // set first and last name for invitee and guest to undefined
    state = setIn(
      state,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        'eventRegistration1',
        'attendee',
        'personalInformation',
        'firstName'
      ],
      undefined
    );
    state = setIn(
      state,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        'eventRegistration1',
        'attendee',
        'personalInformation',
        'lastName'
      ],
      undefined
    );
    state = setIn(
      state,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        'dummyGuestEventRegId',
        'attendee',
        'personalInformation',
        'firstName'
      ],
      undefined
    );
    state = setIn(
      state,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        'dummyGuestEventRegId',
        'attendee',
        'personalInformation',
        'lastName'
      ],
      undefined
    );
    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <TextQuestionWidget {...defaultProps} config={{ id: 'textQuestion1' }} type="OpenEndedTextQuestion" />
      </MockWrapper>
    );
    // unanswered view
    expect(component.find('#textQuestion1').exists()).toBeTruthy();
    expect(component.find('#textQuestion1-dummyGuestEventRegId').exists()).toBeTruthy();
    expect(
      component.containsMatchingElement(<div>EventWidgets_QuestionWidget_ProductQuestionHeader_TwoPartName</div>)
    ).toBeFalsy();
    expect(component).toMatchSnapshot();
  });

  test('Text product question header renders for invitee and guest when they select product but have only first or last name w/ CommentBox', async () => {
    let state = initialState(true, 'admissionItemAId');
    // enable guest product question
    state = setIn(
      state,
      ['appData', 'registrationSettings', 'productQuestions', 'textQuestion1', 'question', 'guestProductQuestions'],
      true
    );
    state = setIn(
      state,
      ['appData', 'registrationSettings', 'productQuestions', 'textQuestion1', 'question', 'isProductQuestion'],
      true
    );
    // change from OneLine textQuestion to CommentBlock
    state = setIn(
      state,
      [
        'appData',
        'registrationSettings',
        'productQuestions',
        'textQuestion1',
        'question',
        'questionTypeInfo',
        'openEndedType'
      ],
      'CommentBox'
    );
    // set first and last name for invitee and guest to undefined
    state = setIn(
      state,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        'eventRegistration1',
        'attendee',
        'personalInformation',
        'firstName'
      ],
      'first name'
    );
    state = setIn(
      state,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        'eventRegistration1',
        'attendee',
        'personalInformation',
        'lastName'
      ],
      undefined
    );
    state = setIn(
      state,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        'dummyGuestEventRegId',
        'attendee',
        'personalInformation',
        'firstName'
      ],
      undefined
    );
    state = setIn(
      state,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        'dummyGuestEventRegId',
        'attendee',
        'personalInformation',
        'lastName'
      ],
      'guest 01'
    );
    const store = configureStore(state);
    const component = mount(
      <MockWrapper store={store}>
        <TextQuestionWidget {...defaultProps} config={{ id: 'textQuestion1' }} type="OpenEndedTextQuestion" />
      </MockWrapper>
    );
    // unanswered view
    expect(component.find('#textQuestion1').exists()).toBeTruthy();
    expect(component.find('#textQuestion1-dummyGuestEventRegId').exists()).toBeTruthy();
    expect(
      component.containsMatchingElement(<div>EventWidgets_QuestionWidget_ProductQuestionHeader_TwoPartName</div>)
    ).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  test('text question renders and validates with custom answer format', async () => {
    const store = configureStore(initialState(false, '', true));
    const component = mount(
      <MockWrapper store={store}>
        <TextQuestionWidget {...defaultProps} config={{ id: 'textQuestion2' }} type="OpenEndedTextQuestion" />
      </MockWrapper>
    );

    // unanswered view
    expect(component.find('#textQuestion2').exists()).toBeTruthy();
    expect(component).toMatchSnapshot();

    // enter text
    component
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: 'text answer' } });
    component.find('[data-cvent-id="input"]').hostNodes().simulate('blur');
    expect(component).toMatchSnapshot();
    expect(component.find('[data-cvent-id="error-messages"]').exists()).toBeTruthy();
    component
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '123ABC?5' } });
    component.find('[data-cvent-id="input"]').hostNodes().simulate('blur');
    expect(component).toMatchSnapshot();
    expect(component.find('[data-cvent-id="error-messages"]').exists()).toBeFalsy();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
  });

  test('text question defaults to General if format is not available', async () => {
    const store = configureStore(initialState(false, '', false));
    const component = mount(
      <MockWrapper store={store}>
        <TextQuestionWidget {...defaultProps} config={{ id: 'textQuestion2' }} type="OpenEndedTextQuestion" />
      </MockWrapper>
    );

    // unanswered view
    expect(component.find('#textQuestion2').exists()).toBeTruthy();
    expect(component).toMatchSnapshot();

    // enter text
    component
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: 'text answer' } });
    component.find('[data-cvent-id="input"]').hostNodes().simulate('blur');
    expect(component).toMatchSnapshot();
    expect(component.find('[data-cvent-id="error-messages"]').exists()).toBeFalsy();
    component
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '123ABC?5' } });
    component.find('[data-cvent-id="input"]').hostNodes().simulate('blur');
    expect(component).toMatchSnapshot();
    expect(component.find('[data-cvent-id="error-messages"]').exists()).toBeFalsy();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
  });

  test('text question defaults to General if format is SPACE ONLY', async () => {
    const store = configureStore(initialState(false, '', true));
    const component = mount(
      <MockWrapper store={store}>
        <TextQuestionWidget {...defaultProps} config={{ id: 'textQuestion3' }} type="OpenEndedTextQuestion" />
      </MockWrapper>
    );

    // unanswered view
    expect(component.find('#textQuestion3').exists()).toBeTruthy();
    expect(component).toMatchSnapshot();

    // enter text
    component
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: 'text answer' } });
    component.find('[data-cvent-id="input"]').hostNodes().simulate('blur');
    expect(component).toMatchSnapshot();
    expect(component.find('[data-cvent-id="error-messages"]').exists()).toBeFalsy();
    component
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '123ABC?5' } });
    component.find('[data-cvent-id="input"]').hostNodes().simulate('blur');
    expect(component).toMatchSnapshot();
    expect(component.find('[data-cvent-id="error-messages"]').exists()).toBeFalsy();
    expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
  });

  test('guest page only renders product question for the related guest', async () => {
    const guestQuestionId = 'sessionTextQuestion3';
    const guestTextPath = [
      'registrationForm',
      'currentGuestEventRegistration',
      'attendee',
      'eventAnswers',
      guestQuestionId,
      'answers',
      '0',
      'text'
    ];
    let state = initialState(true, '', false);
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
        <TextQuestionWidget
          {...defaultProps}
          config={{
            id: guestQuestionId,
            registrationFieldPageType: registrationFieldPageType.GuestRegistration
          }}
          type="OpenEndedTextQuestion"
        />
      </MockWrapper>
    );

    // Only one question for curent guest (none for primary and other guests)
    expect(component.find('input').length).toEqual(1);
    // No text entered yet
    expect(getIn(store.getState(), guestTextPath)).toBeFalsy();
    // Change text answer
    component
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: 'text answer' } });
    component.find('[data-cvent-id="input"]').hostNodes().simulate('blur');
    expect(getIn(store.getState(), guestTextPath)).toEqual('text answer');
  });
};

describe('TextQuestionWidget', () => {
  describe('Use GraphQL widget data', () => {
    runTests(GraphQLSiteEditorDataReleases.Development);
  });
  describe('Use Redux widget data', () => {
    runTests(GraphQLSiteEditorDataReleases.Off);
  });
});
