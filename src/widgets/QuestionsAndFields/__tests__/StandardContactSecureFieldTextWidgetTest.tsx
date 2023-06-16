import React from 'react';
import StandardContactSecureFieldTextWidget from '../StandardContactSecureFieldTextWidget';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from '../../../redux/configureStore';
import WidgetFactory from '../../../widgetFactory';
import Grid from 'nucleus-core/layout/flexbox/Grid';
import { REQUIRED } from 'cvent-question-widgets/lib/DisplayType';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import pageContainingWidgetFixture from '../../../testUtils/pageContainingWidgetFixture';
import fields from '@cvent/event-fields/RegistrationOptionFields.json';

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
                '56aeaca6-a0ad-4548-8afc-94d8d4361ba1': {
                  fieldName: 'Social Security Number',
                  fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
                  displayName: 'SSN',
                  display: REQUIRED,
                  isCustomField: false
                },
                'ff919d05-4281-4d9c-aa0d-82e3722d580d': {
                  fieldName: 'National Identification Number',
                  fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
                  displayName: 'NIN',
                  display: REQUIRED,
                  isCustomField: false
                },
                [fields.passportNumber.id]: {
                  fieldName: 'Passport Number',
                  fieldId: fields.passportNumber.id,
                  displayName: 'Passport Number',
                  display: REQUIRED,
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
  event: {
    eventSecuritySetupSnapshot: null
  }
};

const defaultProps = {
  translate: (resx, opts) => (opts ? `${resx}:${JSON.stringify(opts)}` : resx),
  style: {},
  classes: {},
  id: 'widgetId'
};

test('text standard contact secure field renders and allows you to enter text', async () => {
  const store = configureStore(initialState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactSecureFieldTextWidget
          {...defaultProps}
          config={{
            fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactSecureFieldText"
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

test('skipping required fields during planner reg', async () => {
  (initialState as $TSFixMe).defaultUserSession = { isPlanner: true };
  const store = configureStore(initialState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactSecureFieldTextWidget
          {...defaultProps}
          config={{
            fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactSecureFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
});

test('prepopulated secure field renders and allows you to enter text', async () => {
  const customState = {
    ...initialState,
    registrationForm: {
      ...initialState.registrationForm,
      currentGuestEventRegistration: {
        attendee: {
          personalInformation: {
            isEncryptedPassportNumberPresent: true
          }
        }
      }
    }
  };
  const store = configureStore(customState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactSecureFieldTextWidget
          {...defaultProps}
          config={{
            fieldId: fields.passportNumber.id,
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactSecureFieldText"
        />
      </Grid>
    </Provider>
  );

  // prepopulated view
  let input = component.find('input[data-cvent-id="input"]');
  expect(input.prop('value')).toBe('905-00-1234');
  expect(input.prop('type')).toBe('password');

  // enter override text
  component
    .find('[data-cvent-id="input"]')
    .hostNodes()
    .simulate('change', { target: { value: '123' } });
  input = component.find('input[data-cvent-id="input"]');
  expect(input.prop('value')).toBe('123');
  expect(input.prop('type')).toBe('password');
  const passportNumber =
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .passportNumber;
  expect(passportNumber).toBe('123');
});
