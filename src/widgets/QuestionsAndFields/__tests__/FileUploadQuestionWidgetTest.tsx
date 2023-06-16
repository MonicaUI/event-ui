import React from 'react';
import FileUploadQuestionWidget from '../FileUploadQuestionWidget';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from '../../../redux/configureStore';
import WidgetFactory from '../../../widgetFactory';
import Grid from 'nucleus-core/layout/flexbox/Grid';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import { setIn, unsetIn, updateIn } from 'icepick';

const fileUploadQuestions = {
  fileUploadQuestion: {
    question: {
      code: 'code',
      questionTypeInfo: {
        questionType: 'FileUpload',
        exports: [],
        answerPlacement: 'Below'
      },
      id: 'fileUploadQuestionId',
      questionText: 'File Upload Question',
      html: 'File Upload Question html',
      isProductQuestion: false,
      additionalInfo: {
        required: false
      }
    }
  },
  otherFileUploadQuestion: {
    question: {
      code: 'code',
      questionTypeInfo: {
        questionType: 'FileUpload',
        exports: [],
        answerPlacement: 'Below'
      },
      id: 'otherFileUploadQuestionId',
      questionText: 'File Upload Question',
      isProductQuestion: false,
      additionalInfo: {
        required: false
      }
    }
  }
};

const fileUploadQuestion = {
  fileUploadQuestion1: {
    question: {
      code: 'code',
      questionTypeInfo: {
        questionType: 'FileUpload',
        exports: [],
        answerPlacement: 'Below'
      },
      id: 'fileUploadQuestionId',
      questionText: 'File Upload Question',
      additionalInfo: {
        required: false
      }
    }
  }
};

const deleteFileMock = jest.fn();
deleteFileMock.mockReturnValue(Promise.resolve());
const getFileUploadUrlMock = jest.fn();
getFileUploadUrlMock.mockReturnValue('uploadurl');

const initialState = (
  setAsProductQuestion,
  guestProductId = 'guestAdmissionItemId',
  guestSessionId = 'guestSessionId',
  spinnerSelectionPayload = false
) => {
  let productQuestions = {};
  let registrationQuestions = {};
  if (setAsProductQuestion) {
    productQuestions = {
      fileUploadQuestion1: {
        ...fileUploadQuestion.fileUploadQuestion1,
        productQuestionAssociations: ['admissionItemAId']
      },
      sessionFileUploadQuestion3: {
        ...fileUploadQuestion.fileUploadQuestion1,
        question: {
          ...fileUploadQuestion.fileUploadQuestion1.question,
          id: 'sessionFileUploadQuestion3',
          text: 'Session File Upload Question 3'
        },
        productQuestionAssociations: ['sessionId']
      }
    };
  } else {
    registrationQuestions = {
      ...fileUploadQuestions
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
                productId: guestSessionId,
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
              name: 'Session',
              id: 'sessionId'
            },
            guestSessionId: {
              name: 'Guest Session',
              id: 'guestSessionId'
            }
          }
        },
        dummyGuestEventRegId: {
          sessionProducts: {
            sessionId: {
              name: 'Session',
              id: 'sessionId'
            },
            guestSessionId: {
              name: 'Guest Session',
              id: 'guestSessionId'
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
    clients: {
      flexFileClient: {
        deleteFile: deleteFileMock,
        getFileUploadUrl: getFileUploadUrlMock
      }
    },
    spinnerSelection: {
      pendingSpinnerSelection: spinnerSelectionPayload
    }
  };
};

const defaultProps = {
  translate: (resx, opts) => (opts ? `${resx}:${JSON.stringify(opts)}` : resx),
  style: {},
  classes: {},
  themeImages: {}
};

test('File Upload Questions renders', async () => {
  const store = configureStore(initialState(false));
  const component = mount(
    <Provider store={store}>
      <Grid>
        <FileUploadQuestionWidget {...defaultProps} config={{ id: 'fileUploadQuestion' }} type="FileUploadQuestion" />
        <FileUploadQuestionWidget
          {...defaultProps}
          config={{ id: 'otherFileUploadQuestion' }}
          type="FileUploadQuestion"
        />
      </Grid>
    </Provider>
  );
  expect(component.find('#fileUploadQuestionId-eventRegistration1_input').exists()).toBeTruthy();
  expect(component.find('#otherFileUploadQuestionId-eventRegistration1_input').exists()).toBeTruthy();
  expect(component).toMatchSnapshot();
});

test('File Upload Product Question renders for invitee and guest when guest product questions enabled and they both have the associated product selected', async () => {
  let state = initialState(true, 'admissionItemAId');
  // enable guest product question
  state = setIn(
    state,
    ['appData', 'registrationSettings', 'productQuestions', 'fileUploadQuestion1', 'question', 'isProductQuestion'],
    true
  );

  const store = configureStore(state);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <FileUploadQuestionWidget {...defaultProps} config={{ id: 'fileUploadQuestion1' }} type="FileUploadQuestion" />
      </Grid>
    </Provider>
  );

  expect(component.find('#fileUploadQuestionId-eventRegistration1_input').exists()).toBeTruthy();
  expect(component.find('#fileUploadQuestionId-dummyGuestEventRegId_input').exists()).toBeTruthy();
  expect(
    component.containsMatchingElement(<div>EventWidgets_QuestionWidget_ProductQuestionHeader_TwoPartName</div>)
  ).toBeTruthy();
  expect(component).toMatchSnapshot();
});

test('File Upload Session Question renders for invitee and guest when they both have the associated session selected', async () => {
  let state = initialState(true, 'guestAdmissionItemId', 'sessionId');
  // enable guest product question
  state = setIn(
    state,
    [
      'appData',
      'registrationSettings',
      'productQuestions',
      'sessionFileUploadQuestion3',
      'question',
      'isProductQuestion'
    ],
    true
  );

  const store = configureStore(state);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <FileUploadQuestionWidget
          {...defaultProps}
          config={{ id: 'sessionFileUploadQuestion3' }}
          type="FileUploadQuestion"
        />
      </Grid>
    </Provider>
  );

  expect(component.find('#sessionFileUploadQuestion3-eventRegistration1_input').exists()).toBeTruthy();
  expect(component.find('#sessionFileUploadQuestion3-dummyGuestEventRegId_input').exists()).toBeTruthy();
  expect(
    component.containsMatchingElement(<div>EventWidgets_QuestionWidget_ProductQuestionHeader_TwoPartName</div>)
  ).toBeTruthy();
  expect(component).toMatchSnapshot();
});

test('File Upload Questions render on guest form', async () => {
  const store = configureStore(initialState(false));
  const component = mount(
    <Provider store={store}>
      <Grid>
        <FileUploadQuestionWidget
          {...defaultProps}
          config={{
            id: 'fileUploadQuestion',
            registrationFieldPageType: registrationFieldPageType.GuestRegistration
          }}
          type="FileUploadQuestion"
        />
      </Grid>
    </Provider>
  );

  expect(component.find('#fileUploadQuestionId_input').exists()).toBeTruthy();
  expect(component).toMatchSnapshot();
});

test('guest page only renders product question for the related guest', async () => {
  const guestQuestionId = 'sessionFileUploadQuestion3';
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
    <Provider store={store}>
      <Grid>
        <FileUploadQuestionWidget
          {...defaultProps}
          config={{
            id: guestQuestionId,
            registrationFieldPageType: registrationFieldPageType.GuestRegistration
          }}
          type="FileUploadQuestion"
        />
      </Grid>
    </Provider>
  );

  // Only one question for curent guest (none for primary and other guests)
  expect(component.find('iframe').length).toEqual(1);
});

describe('File Upload Questions', () => {
  it('on guest form should show spinner inside button', async () => {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
    const store = configureStore(initialState(false, 'guestAdmissionItemId', 'guestSessionId', 'fileUploadQuestion'));
    const component = mount(
      <Provider store={store}>
        <Grid>
          <FileUploadQuestionWidget
            {...defaultProps}
            config={{
              id: 'fileUploadQuestion',
              registrationFieldPageType: registrationFieldPageType.GuestRegistration
            }}
            type="FileUploadQuestion"
          />
        </Grid>
      </Provider>
    );
    expect(component.find('[data-cvent-id="upload-form-spinner"]').exists()).toBeTruthy();
  });

  it('on invitee form should not show spinner inside button', async () => {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
    const store = configureStore(initialState(false, 'guestAdmissionItemId', 'guestSessionId', 'fileUploadQuestion'));
    const component = mount(
      <Provider store={store}>
        <Grid>
          <FileUploadQuestionWidget
            {...defaultProps}
            config={{
              id: 'fileUploadQuestion'
            }}
            type="FileUploadQuestion"
          />
        </Grid>
      </Provider>
    );
    expect(component.find('[data-cvent-id="upload-form-spinner"]').exists()).not.toBeTruthy();
  });
});

describe('isFileUploaded', () => {
  let state;
  const props = {
    ...defaultProps,
    config: {
      id: 'fileUploadQuestion',
      registrationFieldPageType: registrationFieldPageType.Registration,
      appData: {
        question: {
          id: 'FileUploadQuestion',
          isProductQuestion: false
        }
      }
    },
    type: 'FileUploadQuestion'
  };

  beforeEach(() => {
    state = initialState(false);
    state = unsetIn(state, ['appData', 'registrationSettings', 'registrationQuestions', 'otherFileUploadQuestion']);
    state = unsetIn(state, [
      'registrationForm',
      'regCart',
      'eventRegistrations',
      'eventRegistration1',
      'sessionRegistrations'
    ]);
    state = setIn(
      state,
      ['appData', 'registrationSettings', 'registrationQuestions', 'fileUploadQuestion', 'question', 'id'],
      'fileUploadQuestion'
    );
  });

  it('should return true when a file is selected', async () => {
    state = updateIn(
      state,
      ['registrationForm', 'regCart', 'eventRegistrations', 'eventRegistration1', 'attendee'],
      attendee => {
        return {
          ...attendee,
          eventAnswers: {
            fileUploadQuestion: {
              questionId: 'fileUploadQuestion',
              answers: [
                {
                  answerType: 'Text',
                  text: 'image.png'
                }
              ]
            }
          }
        };
      }
    );
    const store = configureStore(state);
    const component = mount(
      <Provider store={store}>
        <Grid>
          <FileUploadQuestionWidget {...props} />
        </Grid>
      </Provider>
    );
    const wrapper = component.find('FileUploadWidget');
    expect(wrapper.at(0).props().value).toEqual(true);
  });
  it('should return false when file is not selected', async () => {
    const store = configureStore(state);
    const component = mount(
      <Provider store={store}>
        <Grid>
          <FileUploadQuestionWidget {...props} />
        </Grid>
      </Provider>
    );
    const wrapper = component.find('FileUploadWidget');
    expect(wrapper.at(0).props().value).toEqual(false);
  });
  it('should return false when file name is empty string', async () => {
    state = updateIn(
      state,
      ['registrationForm', 'regCart', 'eventRegistrations', 'eventRegistration1', 'attendee'],
      attendee => {
        return {
          ...attendee,
          eventAnswers: {
            fileUploadQuestion: {
              questionId: 'fileUploadQuestion',
              answers: [
                {
                  answerType: 'Text',
                  text: ''
                }
              ]
            }
          }
        };
      }
    );
    const store = configureStore(state);
    const component = mount(
      <Provider store={store}>
        <Grid>
          <FileUploadQuestionWidget {...props} />
        </Grid>
      </Provider>
    );
    const wrapper = component.find('FileUploadWidget');
    expect(wrapper.at(0).props().value).toEqual(false);
  });
  it('should return false when answers is empty', async () => {
    state = updateIn(
      state,
      ['registrationForm', 'regCart', 'eventRegistrations', 'eventRegistration1', 'attendee'],
      attendee => {
        return {
          ...attendee,
          eventAnswers: {
            fileUploadQuestion: {
              questionId: 'fileUploadQuestion',
              answers: []
            }
          }
        };
      }
    );
    const store = configureStore(state);
    const component = mount(
      <Provider store={store}>
        <Grid>
          <FileUploadQuestionWidget {...props} />
        </Grid>
      </Provider>
    );
    const wrapper = component.find('FileUploadWidget');
    expect(wrapper.at(0).props().value).toEqual(false);
  });
  it('should return false when answers is undefined', async () => {
    state = updateIn(
      state,
      ['registrationForm', 'regCart', 'eventRegistrations', 'eventRegistration1', 'attendee'],
      attendee => {
        return {
          ...attendee,
          eventAnswers: {
            fileUploadQuestion: {
              questionId: 'fileUploadQuestion'
            }
          }
        };
      }
    );
    const store = configureStore(state);
    const component = mount(
      <Provider store={store}>
        <Grid>
          <FileUploadQuestionWidget {...props} />
        </Grid>
      </Provider>
    );
    const wrapper = component.find('FileUploadWidget');
    expect(wrapper.at(0).props().value).toEqual(false);
  });
  it('should use span for fieldName to use this as validation error message with html data', async () => {
    state = updateIn(
      state,
      ['registrationForm', 'regCart', 'eventRegistrations', 'eventRegistration1', 'attendee'],
      attendee => {
        return {
          ...attendee,
          eventAnswers: {
            fileUploadQuestion: {
              questionId: 'fileUploadQuestion'
            }
          }
        };
      }
    );
    const store = configureStore(state);
    const component = mount(
      <Provider store={store}>
        <Grid>
          <FileUploadQuestionWidget {...props} />
        </Grid>
      </Provider>
    );
    const wrapper = component.find('FileUploadWidget');
    expect(wrapper.at(0).props().fieldName.type).toEqual('span');
    expect(wrapper.at(0).props().fieldName.props.dangerouslySetInnerHTML.__html).toEqual('File Upload Question html');
  });
});
