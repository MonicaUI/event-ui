import React from 'react';
import StandardContactFieldDateTimeWidget from '../StandardContactFieldDateTimeWidget';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from '../../../redux/configureStore';
import WidgetFactory from '../../../widgetFactory';
import Grid from 'nucleus-core/layout/flexbox/Grid';
import { NOT_VISIBLE } from 'cvent-question-widgets/lib/DisplayType';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import pageContainingWidgetFixture from '../../../testUtils/pageContainingWidgetFixture';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

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
                'b468074b-b6a7-4149-8f97-e6b21b2ca8b3': {
                  fieldName: 'Date of Birth',
                  fieldId: 'b468074b-b6a7-4149-8f97-e6b21b2ca8b3',
                  displayName: 'Date of Birth',
                  display: NOT_VISIBLE,
                  isCustomField: false
                }
              }
            }
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
  text: {
    locale: 'en-us'
  },
  userSession: {},
  defaultUserSession: {},
  clients: {},
  event: {}
};

const defaultProps = {
  translate: (resx, opts) => (opts ? `${resx}:${JSON.stringify(opts)}` : resx),
  style: {},
  classes: {},
  id: 'widgetId'
};

test('datetime standard contact field renders and allows you to enter datetime', () => {
  const store = configureStore(initialState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldDateTimeWidget
          {...defaultProps}
          config={{
            fieldId: 'b468074b-b6a7-4149-8f97-e6b21b2ca8b3',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldDateTime"
        />
      </Grid>
    </Provider>
  );

  // unanswered view
  expect(component).toMatchSnapshot();

  // enter date
  component
    .find('[data-cvent-id="input"]')
    .hostNodes()
    .simulate('change', { target: { value: '11/02/2006' } });
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();

  // enter text in date
  component
    .find('[data-cvent-id="input"]')
    .hostNodes()
    .simulate('change', { target: { value: '3' } });
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
});

describe('Visibility logic tests', () => {
  let store;
  let component;
  beforeEach(() => {
    store = mockStore(initialState);
    component = mount(
      <Provider store={store}>
        <Grid>
          <StandardContactFieldDateTimeWidget
            {...defaultProps}
            config={{
              fieldId: 'b468074b-b6a7-4149-8f97-e6b21b2ca8b3',
              registrationFieldPageType: registrationFieldPageType.Registration
            }}
            type="EventStandardContactFieldDateTime"
          />
        </Grid>
      </Provider>
    );
  });
  it('Should evaluate visibility logic when a valid date is input', () => {
    component
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '10/16/2019' } });
    expect(store.getActions()).toMatchSnapshot();
  });
  it('Should evaluate visibilty logic when a empty value is input', () => {
    component
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '' } });
    expect(store.getActions()).toMatchSnapshot();
  });
  it('Should not evaluate visibility logic when an invalid date is input', () => {
    component
      .find('[data-cvent-id="input"]')
      .hostNodes()
      .simulate('change', { target: { value: '1/2' } });
    expect(store.getActions()).toMatchSnapshot();
  });
});
