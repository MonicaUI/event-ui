import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from '../../../redux/configureStore';
import WidgetFactory from '../../../widgetFactory';
import Grid from 'nucleus-core/layout/flexbox/Grid';
import { AnswerPlacements } from 'cvent-question-widgets/lib/questionSettings';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import pageContainingWidgetFixture from '../../../testUtils/pageContainingWidgetFixture';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { MockedProvider } from '@apollo/client/testing';
import CustomContactFieldDateTimeWidget, {
  CustomContactFieldDateTimeWidgetWithGraphQL,
  CustomContactFieldDateTimeWidgetWithRedux
} from '../CustomContactFieldDateTimeWidget';
import { GraphQLSiteEditorDataReleases } from '../../../ExperimentHelper';
import { act } from 'react-dom/test-utils';
import { QueryResult } from '@apollo/client';
import { useContactCustomField } from '../useContactCustomField';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../useContactCustomField');
const mockedUseContactCustomField = useContactCustomField as jest.Mock<QueryResult>;

function runTests(useGraphQLSiteEditorData) {
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
                  dateTimeCustomField1: {
                    fieldName: 'Date Time Custom Field',
                    fieldId: 'dateTimeCustomField1',
                    displayName: 'Date Time Custom Field',
                    display: 2,
                    isCustomField: true
                  },
                  dateTimeCustomField2: {
                    fieldName: 'Date Time Custom Field 2',
                    fieldId: 'dateTimeCustomField2',
                    displayName: 'Date Time Custom Field 2',
                    display: 2,
                    isCustomField: true
                  },
                  dateTimeCustomField3: {
                    fieldName: 'Date Time Custom Field 3',
                    fieldId: 'dateTimeCustomField3',
                    displayName: 'Date Time Custom Field 3',
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
        dateTimeCustomField1: {
          question: {
            code: 'DateTimeCustomField1',
            questionTypeInfo: {
              questionType: 'OpenEndedDateTime',
              openEndedType: 'DateTime',
              answerPlacementType: AnswerPlacements.BELOW,
              displayFormatTypeId: 'DateAndTimeMonthFirst24HourTime',
              defaultToCurrentDate: false,
              minDate: '2019-01-02T00:00:00.000Z',
              maxDate: '2019-01-25T00:00:00.000Z'
            },
            additionalInfo: {
              required: false,
              helpText: ''
            },
            id: 'dateTimeCustomField1',
            text: 'Date Time Custom Field 1'
          }
        },
        dateTimeCustomField2: {
          question: {
            code: 'DateTimeCustomField2',
            questionTypeInfo: {
              questionType: 'OpenEndedDateTime',
              openEndedType: 'DateTime',
              answerPlacementType: AnswerPlacements.BELOW,
              displayFormatTypeId: 'DateOnlyMonthFirst',
              defaultToCurrentDate: false
            },
            additionalInfo: {
              required: false,
              helpText: ''
            },
            id: 'dateTimeCustomField2',
            text: 'Date Time Custom Field 2'
          }
        },
        dateTimeCustomField3: {
          question: {
            code: 'DateTimeCustomField3',
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
            id: 'dateTimeCustomField3',
            text: 'Date Time Custom Field 3'
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
    userSession: {},
    defaultUserSession: {},
    clients: {},
    event: {},
    text: {},
    experiments: {
      useGraphQLSiteEditorData
    }
  };

  const setMocks = fieldId => {
    mockedUseContactCustomField.mockReturnValue(initialState.account.contactCustomFields[fieldId]);
  };

  const defaultProps = {
    translate: (resx, opts) => (opts ? `${resx}:${JSON.stringify(opts)}` : resx),
    style: {},
    classes: {},
    id: 'widgetId'
  };

  const getStatusCode = (state, customFieldId) => {
    const regCart = state.registrationForm.regCart;
    const eventRegistration = regCart.eventRegistrations.eventRegistration1;
    const { [customFieldId]: dateTimeCustomFieldData } = eventRegistration.attendee.personalInformation.customFields;
    const statusCode = dateTimeCustomFieldData.answers[0].text.statusCode;
    return statusCode;
  };

  const waitWithAct = async () => {
    // Act is used because the Redux store is updated during wait
    return act(async () => {
      await new Promise(resolve => setTimeout(resolve));
    });
  };

  const store = configureStore(initialState);
  const mountComponent1 = async () => {
    setMocks('dateTimeCustomField1');
    const component = await mount(
      <Provider store={store}>
        <MockedProvider mocks={[]} addTypename={false}>
          <Grid>
            <CustomContactFieldDateTimeWidget
              {...defaultProps}
              config={{
                fieldId: 'dateTimeCustomField1',
                registrationFieldPageType: registrationFieldPageType.Registration
              }}
              type="EventCustomContactFieldDateTime"
            />
          </Grid>
        </MockedProvider>
      </Provider>
    );
    await waitWithAct();
    await component.update();
    return component;
  };

  it('should render based on experiment wrapper', async () => {
    const component = await mountComponent1();
    expect(component.exists(CustomContactFieldDateTimeWidgetWithGraphQL)).toEqual(!!useGraphQLSiteEditorData);
    expect(component.exists(CustomContactFieldDateTimeWidgetWithRedux)).toEqual(!useGraphQLSiteEditorData);
  });

  it('date time custom field renders and allows you to enter values', async () => {
    const component = await mountComponent1();

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

  // Tests that test for a SELECT are testing date picking via calendar pop-up click
  it('date time custom field have all dates between max date and min date (inclusive) enabled in calendar pop-up', async () => {
    const component = await mountComponent1();

    // simulate click to get calendar picker to pop out
    component.find('[data-cvent-id="date-picker"] [data-cvent-id="input"]').hostNodes().simulate('click');

    // this snapshot in the calendar section should specify that that aria-disabled = true dates outside of range
    expect(component).toMatchSnapshot();

    // TODO: actually select the min and max dates and confirm that date change was successful for each
  });

  it('date time custom field allows you to ENTER min date', async () => {
    const component = await mountComponent1();

    // enter date
    component
      .find('[data-cvent-id="date-picker"] [data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '01/02/2019' } });

    // enter time
    const timeInput = component.find('[data-cvent-id="time-picker"] [data-cvent-id="input"]').hostNodes();
    timeInput.simulate('paste').simulate('change', { target: { value: '12:00 AM' } });

    // check statusCode for answer
    const statusCode = getStatusCode(store.getState(), 'dateTimeCustomField1');
    expect(statusCode).toBe('DATE_CHANGE_SUCCESS');
  });

  it('date time custom field DOES NOT allow you to ENTER a date BEFORE the MIN date', async () => {
    const component = await mountComponent1();
    // enter date
    component
      .find('[data-cvent-id="date-picker"] [data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '01/01/2019' } });

    // enter time
    const timeInput = component.find('[data-cvent-id="time-picker"] [data-cvent-id="input"]').hostNodes();
    timeInput.simulate('paste').simulate('change', { target: { value: '12:00 AM' } });

    // check statusCode for answer
    const statusCode = getStatusCode(store.getState(), 'dateTimeCustomField1');
    expect(statusCode).toBe('DATE_CHANGE_ERROR_OUT_OF_RANGE');
  });

  it('date time custom field DOES NOT allow you to ENTER a date AFTER the MAX date', async () => {
    const component = await mountComponent1();
    // enter date
    component
      .find('[data-cvent-id="date-picker"] [data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '04/02/2019' } });

    // enter time
    const timeInput = component.find('[data-cvent-id="time-picker"] [data-cvent-id="input"]').hostNodes();
    timeInput.simulate('paste').simulate('change', { target: { value: '12:00 AM' } });

    // check statusCode for answer
    const statusCode = getStatusCode(store.getState(), 'dateTimeCustomField1');
    expect(statusCode).toBe('DATE_CHANGE_ERROR_OUT_OF_RANGE');
  });

  const mountComponent3 = async () => {
    setMocks('dateTimeCustomField3');
    const component = mount(
      <Provider store={store}>
        <MockedProvider mocks={[]} addTypename={false}>
          <Grid>
            <CustomContactFieldDateTimeWidget
              {...defaultProps}
              config={{
                fieldId: 'dateTimeCustomField3',
                registrationFieldPageType: registrationFieldPageType.Registration
              }}
              type="EventCustomContactFieldDateTime"
            />
          </Grid>
        </MockedProvider>
      </Provider>
    );
    await waitWithAct();
    await component.update();
    return component;
  };

  // Tests for Date time custom field without min max [Uses default min 1900-01-01T00:00:00]
  it('date time custom field allows you to ENTER DEFAULT min date', async () => {
    const component = await mountComponent3();

    // enter date
    component
      .find('[data-cvent-id="date-picker"] [data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '01/01/1900' } });

    // enter time
    const timeInput = component.find('[data-cvent-id="time-picker"] [data-cvent-id="input"]').hostNodes();
    timeInput.simulate('paste').simulate('change', { target: { value: '12:00 AM' } });

    // check statusCode for answer
    const statusCode = getStatusCode(store.getState(), 'dateTimeCustomField3');
    expect(statusCode).toBe('DATE_CHANGE_SUCCESS');
  });

  it('date time custom field DOES NOT allow you to ENTER a date BEFORE the DEFAULT MIN date', async () => {
    const component = await mountComponent3();
    // enter date
    component
      .find('[data-cvent-id="date-picker"] [data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '12/31/1899' } });

    // enter time
    const timeInput = component.find('[data-cvent-id="time-picker"] [data-cvent-id="input"]').hostNodes();
    timeInput.simulate('paste').simulate('change', { target: { value: '12:00 AM' } });

    // check statusCode for answer
    const statusCode = getStatusCode(store.getState(), 'dateTimeCustomField3');
    expect(statusCode).toBe('DATE_CHANGE_ERROR_OUT_OF_RANGE');
  });

  const mountComponent2 = async () => {
    setMocks('dateTimeCustomField2');
    const component = mount(
      <Provider store={store}>
        <MockedProvider mocks={[]} addTypename={false}>
          <Grid>
            <CustomContactFieldDateTimeWidget
              {...defaultProps}
              config={{
                fieldId: 'dateTimeCustomField2',
                registrationFieldPageType: registrationFieldPageType.Registration
              }}
              type="EventCustomContactFieldDateTime"
            />
          </Grid>
        </MockedProvider>
      </Provider>
    );
    await waitWithAct();
    await component.update();
    return component;
  };

  // Tests for Date only custom field without min max [Uses default min 1900-01-01T00:00:00]
  it('date only custom field allows you to ENTER min date', async () => {
    const component = await mountComponent2();

    // enter date
    component
      .find('[data-cvent-id="contact-custom-field-dateTimeCustomField2"] [data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '01/01/1900' } });

    // check statusCode for answer
    const statusCode = getStatusCode(store.getState(), 'dateTimeCustomField2');
    expect(statusCode).toBe('DATE_CHANGE_SUCCESS');
  });

  it('date only custom field DOES NOT allow you to ENTER a date BEFORE the MIN date', async () => {
    const component = await mountComponent2();
    // enter date
    component
      .find('[data-cvent-id="contact-custom-field-dateTimeCustomField2"] [data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '12/31/1899' } });
    // check statusCode for answer
    const statusCode = getStatusCode(store.getState(), 'dateTimeCustomField2');
    expect(statusCode).toBe('DATE_CHANGE_ERROR_OUT_OF_RANGE');
  });

  const store2 = mockStore(initialState);
  describe('Visibility logic tests', () => {
    const mountComponent4 = async () => {
      setMocks('dateTimeCustomField1');
      const component = await mount(
        <Provider store={store2}>
          <MockedProvider mocks={[]} addTypename={false}>
            <Grid>
              <CustomContactFieldDateTimeWidget
                {...defaultProps}
                config={{
                  fieldId: 'dateTimeCustomField1',
                  registrationFieldPageType: registrationFieldPageType.Registration
                }}
                type="EventCustomContactFieldDateTime"
              />
            </Grid>
          </MockedProvider>
        </Provider>
      );
      await waitWithAct();
      await component.update();
      return component;
    };

    it('Should evaluate visibility logic when a valid date is input', async () => {
      const component = await mountComponent4();
      component
        .find('[data-cvent-id="date-picker"] [data-cvent-id="input"]')
        .hostNodes()
        .simulate('change', { target: { value: '10/16/2019' } });
      expect(store2.getActions()).toMatchSnapshot();
    });

    it('Should evaluate visibilty logic when a empty value is input', async () => {
      const component = await mountComponent4();
      component
        .find('[data-cvent-id="date-picker"] [data-cvent-id="input"]')
        .hostNodes()
        .simulate('change', { target: { value: '' } });
      expect(store2.getActions()).toMatchSnapshot();
    });

    it('Should not evaluate visibility logic when an invalid date is input', async () => {
      const component = await mountComponent4();
      component
        .find('[data-cvent-id="date-picker"] [data-cvent-id="input"]')
        .hostNodes()
        .simulate('change', { target: { value: '1/2' } });
      expect(store2.getActions()).toMatchSnapshot();
    });
  });
}

describe('CustomContactFieldDateTime', () => {
  describe('Use GraphQL widget data', () => {
    runTests(GraphQLSiteEditorDataReleases.Development);
  });

  describe('Use Redux widget data', () => {
    runTests(GraphQLSiteEditorDataReleases.Off);
  });
});

/*
 * TODO: uncomment the tests below after NUKE-3630 is completed
 *
 * Tests that test for an ENTER date are testing date selection when you type or autofill in the input box
 * test('date time custom field allows you to ENTER max date', async () => {
 *   const store = configureStore(initialState);
 *   const component = mount(
 *     <Provider store={store}>
 *       <Grid>
 *         <ContactCustomFieldDateTimeWidget
 *           {...defaultProps}
 *           config={{
 *             fieldId: 'dateTimeCustomField1',
 *             registrationFieldPageType: registrationFieldPageType.Registration
 *           }}
 *           type="EventCustomContactFieldDateTime"
 *         />
 *       </Grid>
 *     </Provider>
 *   );
 */

/*
 *   // enter date
 *   component.find('[data-cvent-id="date-picker"] [data-cvent-id="input"]')
 *   .hostNodes()
 *   .simulate('change', { target: { value: '01/25/2019' } });
 */

/*
 *   // enter time
 *   const timeInput = component.find('[data-cvent-id="time-picker"] [data-cvent-id="input"]').hostNodes();
 *   timeInput.simulate('paste').simulate('change', { target: { value: '12:00 AM' } });
 */

/*
 *   // check statusCode for answer
 *   const statusCode = getStatusCode(store.getState());
 *   expect(statusCode).toBe('DATE_CHANGE_SUCCESS');
 * });
 */

/*
 * test('date time custom field allows you to ENTER max date with a time past midnight', async () => {
 *   const store = configureStore(initialState);
 *   const component = mount(
 *     <Provider store={store}>
 *       <Grid>
 *         <ContactCustomFieldDateTimeWidget
 *           {...defaultProps}
 *           config={{
 *             fieldId: 'dateTimeCustomField1',
 *             registrationFieldPageType: registrationFieldPageType.Registration
 *           }}
 *           type="EventCustomContactFieldDateTime"
 *         />
 *       </Grid>
 *     </Provider>
 *   );
 */

/*
 *   // enter date
 *   component.find('[data-cvent-id="date-picker"] [data-cvent-id="input"]')
 *   .hostNodes()
 *   .simulate('change', { target: { value: '01/25/2019' } });
 */

/*
 *   // enter time
 *   const timeInput = component.find('[data-cvent-id="time-picker"] [data-cvent-id="input"]').hostNodes();
 *   timeInput.simulate('paste').simulate('change', { target: { value: '12:01 AM' } });
 */

/*
 *   // check statusCode for answer
 *   const statusCode = getStatusCode(store.getState());
 *   expect(statusCode).toBe('DATE_CHANGE_SUCCESS');
 * });
 */
