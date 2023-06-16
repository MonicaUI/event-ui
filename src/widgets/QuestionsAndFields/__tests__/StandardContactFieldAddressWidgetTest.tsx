import React from 'react';
import StandardContactFieldAddressWidget from '../StandardContactFieldAddressWidget';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from '../../../redux/configureStore';
import { getRegCart } from '../../../redux/selectors/shared';
import { CLEAR_REG_CART_INFERRED_FIELDS } from '../../../redux/registrationForm/regCart/actionTypes';
import WidgetFactory from '../../../widgetFactory';
import Grid from 'nucleus-core/layout/flexbox/Grid';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import pageContainingWidgetFixture from '../../../testUtils/pageContainingWidgetFixture';
import { setIn } from 'icepick';
import { getFilteredCountries } from '../StandardContactFieldAddressWidget';

const HOME_ADDRESS_FIELD_ID = 'b5a8362f-91e7-46ff-a704-20bfb3ca6ce5';

const getInitialState = (defaultCountry?, countryList?) => ({
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
              homeAddressSettings: {
                countryCodes: countryList
              },
              registrationFields: {
                [HOME_ADDRESS_FIELD_ID]: {
                  fieldName: 'Home Address',
                  fieldId: HOME_ADDRESS_FIELD_ID,
                  displayName: 'Home Address',
                  display: 2,
                  isCustomField: false,
                  defaultCountry: {
                    value: defaultCountry
                  },
                  subFieldDisplayNames: {
                    address1: 'Address 1',
                    address2: 'Address 2',
                    address3: 'Address 3',
                    city: 'City',
                    country: 'Country',
                    state: 'State',
                    zip: 'Zip'
                  }
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
  countries: {
    countries: {
      '': { nameResourceKey: '', name: '', code: '' },
      US: { nameResourceKey: 'us_name_resx', name: 'US', code: 'US' },
      GB3: { nameResourceKey: 'wales_name_resx', name: 'Wales', code: 'GB3' }
    }
  },
  states: {
    US: {
      states: {
        '': {},
        AL: { name: 'Alabama' }
      }
    }
  }
});

const initialState = getInitialState('US', []);

const defaultProps = {
  translate: (resx, opts) => (opts ? `${resx}:${JSON.stringify(opts)}` : resx),
  style: {},
  classes: {},
  id: 'widgetId',
  disabled: false
};

test('address standard contact field renders and allows you to enter values', async () => {
  const store = configureStore(initialState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldAddressWidget
          {...defaultProps}
          config={{
            fieldId: HOME_ADDRESS_FIELD_ID,
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );

  // unanswered view
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();

  // enter text
  component.find('[name^="address1"]').simulate('change', { target: { value: 'address 1 answer' } });
  component.find('[name^="countryCode"]').simulate('change', { target: { value: '2' } });
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
});

test('address standard contact field renders default country name on selecting empty country when default country is set', async () => {
  const store = configureStore(initialState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldAddressWidget
          {...defaultProps}
          config={{
            fieldId: HOME_ADDRESS_FIELD_ID,
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  component.find('[name^="countryCode"]').simulate('change', { target: { value: '0' } });
  expect(
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .homeAddress.country
  ).toBe('US');
  expect(
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .homeAddress.countryCode
  ).toBe('US');
});

test('address standard contact field renders no country name on selecting empty country when default country is not set', async () => {
  const nonDefaultCountryCodeState = setIn(
    initialState,
    [
      'appData',
      'registrationSettings',
      'registrationPaths',
      'regPathId',
      'registrationPageFields',
      registrationFieldPageType.Registration,
      'registrationFields',
      HOME_ADDRESS_FIELD_ID,
      'defaultCountry',
      'value'
    ],
    ''
  );

  const store = configureStore(nonDefaultCountryCodeState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldAddressWidget
          {...defaultProps}
          config={{
            fieldId: HOME_ADDRESS_FIELD_ID,
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  component.find('[name^="countryCode"]').simulate('change', { target: { value: '0' } });
  expect(
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .homeAddress.country
  ).toBe('');
});

test('address standard contact field records selected state name on selecting a state', async () => {
  const store = configureStore(initialState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldAddressWidget
          {...defaultProps}
          config={{
            fieldId: HOME_ADDRESS_FIELD_ID,
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  component.find('[name^="stateCode"]').simulate('change', { target: { value: '1' } });
  expect(
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .homeAddress.state
  ).toBe('Alabama');
  expect(
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .homeAddress.stateCode
  ).toBe('AL');

  component.find('[name^="stateCode"]').simulate('change', { target: { value: '0' } });
  expect(
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .homeAddress.state
  ).toBe('');
  expect(
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .homeAddress.stateCode
  ).toBe('');
});

test('address standard contact field resets blank country to default on address change', async () => {
  const store = configureStore(initialState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldAddressWidget
          {...defaultProps}
          config={{
            fieldId: HOME_ADDRESS_FIELD_ID,
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );

  expect(
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .homeAddress.countryCode
  ).toBe('US');
  expect(
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .homeAddress.country
  ).toBe('US');

  // clear fields
  store.dispatch({
    type: CLEAR_REG_CART_INFERRED_FIELDS,
    payload: {
      regCart: setIn(
        getRegCart(store.getState()),
        ['eventRegistrations', 'eventRegistration1', 'attendee', 'personalInformation'],
        {}
      )
    }
  });

  expect(
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .homeAddress
  ).toBeUndefined();

  // simulate address change
  component.find('[name^="address1"]').simulate('change', { target: { value: 'address 1 answer' } });

  expect(
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .homeAddress.countryCode
  ).toBe('US');
  expect(
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .homeAddress.country
  ).toBe('US');
});

test("address standard contact field doesn't reset country when no default value set", async () => {
  const state = getInitialState();
  const store = configureStore(state);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldAddressWidget
          {...defaultProps}
          config={{
            fieldId: HOME_ADDRESS_FIELD_ID,
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );

  // clear fields
  store.dispatch({
    type: CLEAR_REG_CART_INFERRED_FIELDS,
    payload: {
      regCart: setIn(
        getRegCart(store.getState()),
        ['eventRegistrations', 'eventRegistration1', 'attendee', 'personalInformation'],
        {}
      )
    }
  });

  expect(
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .homeAddress
  ).toBeUndefined();

  // simulate address change
  component.find('[name^="address1"]').simulate('change', { target: { value: 'address 1 answer' } });

  expect(
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .homeAddress.countryCode
  ).toBeUndefined();
  expect(
    store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee.personalInformation
      .homeAddress.country
  ).toBeUndefined();
});

test('getFilteredCountries function must return countries in homeAddressSettings only', async () => {
  const state = getInitialState('US', ['US']);
  const props = {
    ...defaultProps,
    config: {
      fieldId: HOME_ADDRESS_FIELD_ID,
      registrationFieldPageType: registrationFieldPageType.Registration
    }
  };
  const result = getFilteredCountries(state, props.id, props.config);
  const expectedResult = {
    '': { nameResourceKey: '', name: '', code: '' },
    US: { nameResourceKey: 'us_name_resx', name: 'US', code: 'US' }
  };
  expect(result).toStrictEqual(expectedResult);
});

test('getFilteredCountries function should return default contries if country list is empty', async () => {
  const state = getInitialState();
  const props = {
    ...defaultProps,
    config: {
      fieldId: HOME_ADDRESS_FIELD_ID,
      registrationFieldPageType: registrationFieldPageType.Registration
    }
  };
  const result = getFilteredCountries(state, props.id, props.config);
  const expectedResult = {
    '': { nameResourceKey: '', name: '', code: '' },
    US: { nameResourceKey: 'us_name_resx', name: 'US', code: 'US' },
    GB3: { nameResourceKey: 'wales_name_resx', name: 'Wales', code: 'GB3' }
  };
  expect(result).toStrictEqual(expectedResult);
});
