import React from 'react';
import ContactCustomFieldSingleChoiceWidget from '../CustomContactFieldSingleChoiceWidget';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from '../../../redux/configureStore';
import WidgetFactory from '../../../widgetFactory';
import Grid from 'nucleus-core/layout/flexbox/Grid';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import pageContainingWidgetFixture from '../../../testUtils/pageContainingWidgetFixture';
import { setIn } from 'icepick';

const initialState = {
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
                singleChoiceCustomField1: {
                  fieldName: 'Single Choice Custom Field',
                  fieldId: 'singleChoiceCustomField1',
                  displayName: 'Single Choice Custom Field',
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
    contactCustomFields: {
      singleChoiceCustomField1: {
        question: {
          code: 'SingleChoiceCustomField1',
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
            choiceSortOrder: 'AToZ'
          },
          additionalInfo: {
            required: false,
            helpText: ''
          },
          id: 'singleChoiceCustomField1',
          text: 'Single Choice Custom Field 1'
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
  clients: {
    regCartClient: {}
  },
  event: {
    id: 'eventId'
  }
};

const defaultProps = {
  translate: (resx, opts) => (opts ? `${resx}:${JSON.stringify(opts)}` : resx),
  style: {},
  classes: {},
  id: 'widgetId'
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('single choice custom field renders and allows you to select values', async () => {
  const store = configureStore(initialState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <ContactCustomFieldSingleChoiceWidget
          {...defaultProps}
          config={{
            fieldId: 'singleChoiceCustomField1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventCustomContactFieldSingleChoice"
        />
      </Grid>
    </Provider>
  );

  // unanswered view
  expect(component).toMatchSnapshot();

  // select the first choice
  component
    .find('[data-cvent-id="option-singleChoiceCustomField1_0"] input')
    .simulate('change', { target: { checked: true } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();

  // select the second choice
  component
    .find('[data-cvent-id="option-singleChoiceCustomField1_1"] input')
    .simulate('change', { target: { checked: true } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
});

test('single choice custom field with "."s renders and allows you to select values', async () => {
  const modifiedState = {
    ...initialState,
    account: {
      ...initialState.account,
      contactCustomFields: {
        singleChoiceCustomField1: {
          question: {
            code: 'SingleChoiceCustomField1',
            questionTypeInfo: {
              questionType: 'SingleChoice',
              choices: [
                {
                  id: 'ChoiceA',
                  text: 'A.D'
                },
                {
                  id: 'ChoiceB',
                  text: 'B.D'
                }
              ],
              exports: [],
              displayType: 'Horizontal',
              answerPlacement: 'Below',
              choiceSortOrder: 'AToZ'
            },
            additionalInfo: {
              required: false,
              helpText: ''
            },
            id: 'singleChoiceCustomField1',
            text: 'Single Choice Custom Field 1'
          }
        }
      }
    }
  };
  const store = configureStore(modifiedState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <ContactCustomFieldSingleChoiceWidget
          {...defaultProps}
          config={{
            fieldId: 'singleChoiceCustomField1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventCustomContactFieldSingleChoice"
        />
      </Grid>
    </Provider>
  );

  // unanswered view
  expect(component).toMatchSnapshot();

  // select the first choice
  component
    .find('[data-cvent-id="option-singleChoiceCustomField1_0"] input')
    .simulate('change', { target: { checked: true } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();

  // select the second choice
  component
    .find('[data-cvent-id="option-singleChoiceCustomField1_1"] input')
    .simulate('change', { target: { checked: true } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
});

// added for prod issue: PROD-86670
test('when single choice custom field is changed to multi select type it should render and allows you to select values', async () => {
  const testState = setIn(
    initialState,
    ['account', 'contactCustomFields', 'singleChoiceCustomField1', 'question', 'questionTypeInfo', 'questionType'],
    'MultiChoice'
  );
  const store = configureStore(testState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <ContactCustomFieldSingleChoiceWidget
          {...defaultProps}
          config={{
            fieldId: 'singleChoiceCustomField1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventCustomContactFieldSingleChoice"
        />
      </Grid>
    </Provider>
  );

  component
    .find('[data-cvent-id="option-singleChoiceCustomField1_0"] input[type="checkbox"]')
    .simulate('change', { target: { checked: true } });
  await wait(0);

  component
    .find('[data-cvent-id="option-singleChoiceCustomField1_1"] input[type="checkbox"]')
    .simulate('change', { target: { checked: true } });
  await wait(0);

  expect(
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .customFields.singleChoiceCustomField1.answers.length
  ).toBe(2);
});
