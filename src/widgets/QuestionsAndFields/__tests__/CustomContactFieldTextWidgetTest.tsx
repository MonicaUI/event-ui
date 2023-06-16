import React from 'react';
import ContactCustomFieldTextWidget from '../CustomContactFieldTextWidget';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from '../../../redux/configureStore';
import WidgetFactory from '../../../widgetFactory';
import Grid from 'nucleus-core/layout/flexbox/Grid';
import { AnswerPlacements } from 'cvent-question-widgets/lib/questionSettings';
import { AnswerFormatTypes } from 'cvent-question-widgets/lib/TextQuestion';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import pageContainingWidgetFixture from '../../../testUtils/pageContainingWidgetFixture';
import { CUSTOM_ANSWER_FORMAT } from 'event-widgets/utils/customAnswerFormatUtils';
import { getContactFieldForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';

jest.mock('event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation');
// @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementation' does not exist on ty... Remove this comment to see the full error message
getContactFieldForWidget.mockImplementation(() => ({ display: 2 }));

const initialState = (includeCustomAnswerFormat = false) => {
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
  const state = {
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
      },
      siteInfo: {
        sharedConfigs: {}
      }
    },
    widgetFactory: new WidgetFactory(),
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId: {
            registrationPageFields: {
              [registrationFieldPageType.Registration]: {
                registrationFieldPageType: registrationFieldPageType.Registration,
                registrationFields: {
                  textCustomField1: {
                    fieldName: 'Text Custom Field',
                    fieldId: 'textCustomField1',
                    displayName: 'Text Custom Field',
                    display: 2,
                    isCustomField: true
                  }
                }
              }
            }
          }
        }
      }
    },
    account: {
      customAnswerFormats: {
        ...customAnswerFormats
      },
      contactCustomFields: {
        textCustomField1: {
          question: {
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
              id: 'textCustomField1',
              text: 'Text Question 1'
            }
          }
        },
        textCustomField2: {
          question: {
            code: 'textCustomField2',
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
            id: 'textCustomField2',
            text: 'Text Question 2'
          }
        },
        textCustomField3: {
          question: {
            code: 'textCustomField3',
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
            id: 'textCustomField3',
            text: 'Text Question 3'
          },
          questionTypeInfo: {
            customAnswerFormat: {
              id: 104
            }
          }
        }
      }
    },
    registrationForm: {
      currentEventRegistrationId: 'eventRegistration1',
      regCart: {
        eventRegistrations: {
          eventRegistration1: {
            registrationPathId: 'regPathId'
          }
        }
      }
    },
    event: {
      id: 'eventId'
    }
  };
  return state;
};

const defaultProps = {
  translate: (resx, opts) => (opts ? `${resx}:${JSON.stringify(opts)}` : resx),
  style: {},
  classes: {},
  id: 'widgetId'
};

test.skip('text custom field renders and allows you to enter text', async () => {
  const store = configureStore(initialState(false));
  const component = mount(
    <Provider store={store}>
      <Grid>
        <ContactCustomFieldTextWidget
          {...defaultProps}
          config={{
            fieldId: 'textCustomField1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventCustomContactFieldText"
        />
      </Grid>
    </Provider>
  );

  // unanswered view
  expect(component).toMatchSnapshot();

  // enter text
  component
    .find('[data-cvent-id="input"]')
    .hostNodes()
    .simulate('change', { target: { value: 'text answer' } });
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
});
test('text custom field with custom answer format renders and allows you to enter text', async () => {
  const store = configureStore(initialState(true));
  const component = mount(
    <Provider store={store}>
      <Grid>
        <ContactCustomFieldTextWidget
          {...defaultProps}
          config={{
            fieldId: 'textCustomField2',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventCustomContactFieldText"
        />
      </Grid>
    </Provider>
  );

  // unanswered view
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

test('text custom field defaults to GENERAL when custom format is not available', async () => {
  const store = configureStore(initialState(false));
  const component = mount(
    <Provider store={store}>
      <Grid>
        <ContactCustomFieldTextWidget
          {...defaultProps}
          config={{
            fieldId: 'textCustomField2',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventCustomContactFieldText"
        />
      </Grid>
    </Provider>
  );

  // unanswered view
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

test.skip('text custom field defaults to GENERAL when custom format if it is a SPACE only format', async () => {
  const store = configureStore(initialState(true));
  const component = mount(
    <Provider store={store}>
      <Grid>
        <ContactCustomFieldTextWidget
          {...defaultProps}
          config={{
            fieldId: 'textCustomField3',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventCustomContactFieldText"
        />
      </Grid>
    </Provider>
  );

  // unanswered view
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
