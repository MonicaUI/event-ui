import React from 'react';
import StandardContactFieldChoiceWidget from '../StandardContactFieldChoiceWidget';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from '../../../redux/configureStore';
import WidgetFactory from '../../../widgetFactory';
import Grid from 'nucleus-core/layout/flexbox/Grid';
import { REQUIRED } from 'cvent-question-widgets/lib/DisplayType';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import pageContainingWidgetFixture from '../../../testUtils/pageContainingWidgetFixture';
import { genderType } from '@cvent/event-fields/gender';
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
                [fields.passportCountry.id]: {
                  fieldName: 'Passport Country',
                  fieldId: fields.passportCountry.id,
                  displayName: 'Passport Country',
                  display: REQUIRED,
                  isCustomField: false
                },
                [fields.gender.id]: {
                  fieldName: 'Gender',
                  fieldId: '93bf707b-924c-4dbf-908c-4311233d17ae',
                  displayName: 'Gender',
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
  countries: {
    countries: {
      '': {
        code: '',
        nameResourceKey: ''
      },
      IN: {
        code: 'IN',
        nameResourceKey: 'translated-IN'
      },
      US: {
        code: 'US',
        nameResourceKey: 'translated-US'
      }
    }
  },
  clients: {
    regCartClient: {}
  },
  event: {
    id: 'eventId'
  },
  account: {
    settings: {
      accountGenderTypeId: 1
    }
  }
};

const defaultProps = {
  translate: (resx, opts) => (opts ? `${resx}:${JSON.stringify(opts)}` : resx),
  style: {},
  classes: {},
  id: 'widgetId'
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function mountContactFieldChoiceWidget(store, config, type) {
  return mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldChoiceWidget {...defaultProps} config={{ ...config }} type={type} />
      </Grid>
    </Provider>
  );
}

test('passport country standard contact field renders and allows you to select country', async () => {
  const store = configureStore(initialState);
  const config = {
    fieldId: fields.passportCountry.id,
    registrationFieldPageType: registrationFieldPageType.Registration
  };
  const component = mountContactFieldChoiceWidget(store, config, 'EventStandardContactFieldChoice');

  // unanswered view
  expect(component).toMatchSnapshot();

  // select the first choice
  component
    .find('[data-cvent-id="option-bbe011f6-855c-41f2-ac1f-d1cbc6b15af8_0"] input')
    .simulate('change', { target: { checked: true } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
  // select the second choice
  component
    .find('[data-cvent-id="option-bbe011f6-855c-41f2-ac1f-d1cbc6b15af8_0"] input')
    .simulate('change', { target: { checked: true } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
});

test('gender standard contact field renders and allows you to select choice', async () => {
  const store = configureStore(initialState);
  const config = {
    fieldId: fields.gender.id,
    registrationFieldPageType: registrationFieldPageType.Registration
  };
  const component = mountContactFieldChoiceWidget(store, config, 'EventStandardContactFieldChoice');

  // unanswered view
  expect(component).toMatchSnapshot();

  // select the first choice
  component
    .find('[data-cvent-id="option-93bf707b-924c-4dbf-908c-4311233d17ae_0"] input')
    .simulate('change', { target: { checked: true } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
  // select the second choice
  component
    .find('[data-cvent-id="option-93bf707b-924c-4dbf-908c-4311233d17ae_0"] input')
    .simulate('change', { target: { checked: true } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
});

test('skipping required fields during planner reg', async () => {
  (initialState as $TSFixMe).userSession = { isPlanner: true };
  const store = configureStore(initialState);
  const config = {
    fieldId: fields.passportCountry.id,
    registrationFieldPageType: registrationFieldPageType.Registration
  };
  const component = mountContactFieldChoiceWidget(store, config, 'EventStandardContactFieldChoice');

  expect(component).toMatchSnapshot();
});

describe('gender options based on accountGenderTypeId setting', () => {
  function validateGenderOptions(component, genderTexts) {
    genderTexts.forEach((text, index) => {
      expect(component.find(`[data-cvent-id="option-${fields.gender.id}_${index}"] label`).contains(text)).toBeTruthy();
    });
  }

  const mockState = Object.assign({}, initialState);
  mockState.registrationForm = {
    currentEventRegistrationId: 'eventRegistration1',
    regCart: {
      eventRegistrations: {
        eventRegistration1: {
          registrationPathId: 'regPathId',
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ registrationPathId: string; attendee: { pe... Remove this comment to see the full error message
          attendee: {
            personalInformation: {
              gender: genderType.NON_BINARY.id
            }
          }
        }
      }
    }
  };

  it('will show nonBinary for setting "TWO_OPTIONS" in gender options in gender widget since it was selected', () => {
    const store = configureStore(mockState);
    const config = {
      fieldId: fields.gender.id,
      registrationFieldPageType: registrationFieldPageType.Registration
    };
    const component = mountContactFieldChoiceWidget(store, config, 'EventStandardContactFieldChoice');
    validateGenderOptions(component, [
      '_fieldOption_male__resx',
      '_fieldOption_female__resx',
      '_fieldOption_nonBinary__resx'
    ]);
  });

  it('will show male, female, nonBinary, preferNotToAnswer in gender options in gender widget', () => {
    const store = configureStore({
      ...mockState,
      account: {
        ...mockState.account,
        settings: {
          ...mockState.account.settings,
          accountGenderTypeId: 3
        }
      }
    });
    const config = {
      fieldId: fields.gender.id,
      registrationFieldPageType: registrationFieldPageType.Registration
    };
    const component = mountContactFieldChoiceWidget(store, config, 'EventStandardContactFieldChoice');
    validateGenderOptions(component, [
      '_fieldOption_male__resx',
      '_fieldOption_female__resx',
      '_fieldOption_nonBinary__resx',
      '_fieldOption_preferNotToAnswer__resx'
    ]);
  });
});
