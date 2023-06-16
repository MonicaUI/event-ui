import React from 'react';
import ContactCustomFieldMultiChoiceWidget from '../CustomContactFieldMultiChoiceWidget';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from '../../../redux/configureStore';
import WidgetFactory from '../../../widgetFactory';
import Grid from 'nucleus-core/layout/flexbox/Grid';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import pageContainingWidgetFixture from '../../../testUtils/pageContainingWidgetFixture';
import { openContactCustomFieldChoiceSelectionConflictDialog } from '../../../dialogs/selectionConflictDialogs';
import { getContactFieldForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';

(Array as $TSFixMe).console = console;

jest.mock('../../../dialogs/selectionConflictDialogs', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../../dialogs/selectionConflictDialogs'),
    openContactCustomFieldChoiceSelectionConflictDialog: jest.fn(() => ({ type: 'NO_OP' }))
  };
});

jest.mock('event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation');
// @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementation' does not exist on ty... Remove this comment to see the full error message
getContactFieldForWidget.mockImplementation(() => ({ display: 2 }));

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
                multiChoiceCustomField1: {
                  fieldName: 'Multi Choice Custom Field',
                  fieldId: 'multiChoiceCustomField1',
                  displayName: 'Multi Choice Custom Field',
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
      multiChoiceCustomField1: {
        question: {
          code: 'MultiChoiceCustomField1',
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
            exports: [],
            displayType: 'Horizontal',
            answerPlacement: 'Below',
            choiceSortOrder: 'AToZ'
          },
          additionalInfo: {
            required: false,
            helpText: ''
          },
          id: 'multiChoiceCustomField1',
          text: 'Multi Choice Custom Field 1'
        }
      },
      linkLogicSource: {
        questionServiceEntityType: 'CustomField',
        question: {
          code: 'LinkLogicSource',
          questionTypeInfo: {
            questionType: 'MultiChoice',
            scores: [],
            isConsent: false,
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
            exceedsQuestionChoiceLimit: false,
            displayType: 'Vertical'
          },
          additionalInfo: {
            additionalInfoType: 'CustomFieldAdditionalInfo',
            required: false,
            helpText: ''
          },
          id: 'linkLogicSource',
          text: 'Link Logic Source'
        }
      },
      linkLogicChild: {
        questionServiceEntityType: 'CustomField',
        question: {
          code: 'LinkLogicChild',
          questionTypeInfo: {
            questionType: 'MultiChoice',
            scores: [],
            isConsent: false,
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
            exceedsQuestionChoiceLimit: false,
            displayType: 'Vertical',
            linkLogic: {
              linkRules: [
                {
                  childChoices: ['Choice A'],
                  parentChoice: 'Choice A'
                },
                {
                  childChoices: ['Choice B'],
                  parentChoice: 'Choice B'
                }
              ],
              parentQuestionLinkType: 'ContactCustomField',
              parentQuestionId: 'linkLogicSource'
            }
          },
          additionalInfo: {
            additionalInfoType: 'CustomFieldAdditionalInfo',
            required: false,
            helpText: ''
          },
          id: 'linkLogicChild',
          text: 'Link Logic Child'
        }
      }
    }
  },
  registrationForm: {
    currentEventRegistrationId: 'eventRegistration1',
    currentGuestEventRegistration: {
      eventRegistrationId: 'guestRegistration1',
      attendee: {
        personalInformation: {},
        eventAnswers: {}
      },
      attendeeType: 'GUEST',
      primaryRegistrationId: 'eventRegistration1',
      registrationPathId: 'regPathId'
    },
    regCart: {
      eventRegistrations: {
        eventRegistration1: {
          registrationPathId: 'regPathId'
        },
        guestRegistration1: {
          eventRegistrationId: 'guestRegistration1',
          attendee: {
            personalInformation: {},
            eventAnswers: {}
          },
          attendeeType: 'GUEST',
          primaryRegistrationId: 'eventRegistration1',
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

test('multi choice custom field renders and allows you to select values', async () => {
  const store = configureStore(initialState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <ContactCustomFieldMultiChoiceWidget
          {...defaultProps}
          config={{
            fieldId: 'multiChoiceCustomField1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventCustomContactFieldMultiChoice"
        />
      </Grid>
    </Provider>
  );

  // unanswered view
  expect(component).toMatchSnapshot();

  // select the first choice
  component
    .find('[data-cvent-id="option-multiChoiceCustomField1_0"] input[type="checkbox"]')
    .simulate('change', { target: { checked: true } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();

  // select the second choice
  component
    .find('[data-cvent-id="option-multiChoiceCustomField1_1"] input[type="checkbox"]')
    .simulate('change', { target: { checked: true } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();

  // unselect the second choice
  component
    .find('[data-cvent-id="option-multiChoiceCustomField1_1"] input[type="checkbox"]')
    .simulate('change', { target: { checked: false } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
});

test('multi choice custom field in guest registration page renders and allows you to select values', async () => {
  const store = configureStore(initialState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <ContactCustomFieldMultiChoiceWidget
          {...defaultProps}
          config={{
            fieldId: 'linkLogicSource',
            registrationFieldPageType: registrationFieldPageType.GuestRegistration
          }}
          type="EventCustomContactFieldMultiChoice"
        />
        <ContactCustomFieldMultiChoiceWidget
          id="linkLogicChild"
          {...defaultProps}
          config={{
            fieldId: 'linkLogicChild',
            registrationFieldPageType: registrationFieldPageType.GuestRegistration
          }}
          type="EventCustomContactFieldMultiChoice"
        />
      </Grid>
    </Provider>
  );

  // unanswered view
  expect(component).toMatchSnapshot();

  // select the first choice
  component
    .find('[data-cvent-id="option-linkLogicSource_0"] input[type="checkbox"]')
    .simulate('change', { target: { checked: true } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.currentGuestEventRegistration.attendee).toMatchSnapshot();

  // select the second choice
  component
    .find('[data-cvent-id="option-linkLogicChild_0"] input[type="checkbox"]')
    .simulate('change', { target: { checked: true } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.currentGuestEventRegistration.attendee).toMatchSnapshot();

  // unselect the first choice
  component
    .find('[data-cvent-id="option-linkLogicSource_0"] input[type="checkbox"]')
    .simulate('change', { target: { checked: false } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.currentGuestEventRegistration.attendee).toMatchSnapshot();

  expect(openContactCustomFieldChoiceSelectionConflictDialog).toHaveBeenCalled();
});

test('multi choice custom field with "."s in guest registration page renders and allows you to select values', async () => {
  const modifiedState = {
    ...initialState,
    account: {
      ...initialState.account,
      contactCustomFields: {
        multiChoiceCustomField1: {
          question: {
            code: 'MultiChoiceCustomField1',
            questionTypeInfo: {
              questionType: 'MultiChoice',
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
            id: 'multiChoiceCustomField1',
            text: 'Multi Choice Custom Field 1'
          }
        },
        linkLogicSource: {
          questionServiceEntityType: 'CustomField',
          question: {
            code: 'LinkLogicSource',
            questionTypeInfo: {
              questionType: 'MultiChoice',
              scores: [],
              isConsent: false,
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
              exceedsQuestionChoiceLimit: false,
              displayType: 'Vertical'
            },
            additionalInfo: {
              additionalInfoType: 'CustomFieldAdditionalInfo',
              required: false,
              helpText: ''
            },
            id: 'linkLogicSource',
            text: 'Link Logic Source'
          }
        },
        linkLogicChild: {
          questionServiceEntityType: 'CustomField',
          question: {
            code: 'LinkLogicChild',
            questionTypeInfo: {
              questionType: 'MultiChoice',
              scores: [],
              isConsent: false,
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
              exceedsQuestionChoiceLimit: false,
              displayType: 'Vertical',
              linkLogic: {
                linkRules: [
                  {
                    childChoices: ['A.D'],
                    parentChoice: 'A.D'
                  },
                  {
                    childChoices: ['B.D'],
                    parentChoice: 'B.D'
                  }
                ],
                parentQuestionLinkType: 'ContactCustomField',
                parentQuestionId: 'linkLogicSource'
              }
            },
            additionalInfo: {
              additionalInfoType: 'CustomFieldAdditionalInfo',
              required: false,
              helpText: ''
            },
            id: 'linkLogicChild',
            text: 'Link Logic Child'
          }
        }
      }
    }
  };
  const store = configureStore(modifiedState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <ContactCustomFieldMultiChoiceWidget
          {...defaultProps}
          config={{
            fieldId: 'linkLogicSource',
            registrationFieldPageType: registrationFieldPageType.GuestRegistration
          }}
          type="EventCustomContactFieldMultiChoice"
        />
        <ContactCustomFieldMultiChoiceWidget
          id="linkLogicChild"
          {...defaultProps}
          config={{
            fieldId: 'linkLogicChild',
            registrationFieldPageType: registrationFieldPageType.GuestRegistration
          }}
          type="EventCustomContactFieldMultiChoice"
        />
      </Grid>
    </Provider>
  );

  // unanswered view
  expect(component).toMatchSnapshot();

  // select the first choice
  component
    .find('[data-cvent-id="option-linkLogicSource_0"] input[type="checkbox"]')
    .simulate('change', { target: { checked: true } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.currentGuestEventRegistration.attendee).toMatchSnapshot();

  // select the second choice
  component
    .find('[data-cvent-id="option-linkLogicChild_0"] input[type="checkbox"]')
    .simulate('change', { target: { checked: true } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.currentGuestEventRegistration.attendee).toMatchSnapshot();

  // unselect the first choice
  component
    .find('[data-cvent-id="option-linkLogicSource_0"] input[type="checkbox"]')
    .simulate('change', { target: { checked: false } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.currentGuestEventRegistration.attendee).toMatchSnapshot();

  expect(openContactCustomFieldChoiceSelectionConflictDialog).toHaveBeenCalled();
});
