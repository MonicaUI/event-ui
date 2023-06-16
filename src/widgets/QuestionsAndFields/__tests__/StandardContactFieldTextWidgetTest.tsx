/* global*/
import React from 'react';
import StandardContactFieldTextWidget from '../StandardContactFieldTextWidget';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from '../../../redux/configureStore';
import { StandardContactFieldTextWrapper, getSettingBasedRegistrationField } from '../BaseStandardFieldTextWidget';
import WidgetFactory from '../../../widgetFactory';
import Grid from 'nucleus-core/layout/flexbox/Grid';
import { REQUIRED, READ_ONLY, NOT_REQUIRED } from 'cvent-question-widgets/lib/DisplayType';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import pageContainingWidgetFixture from '../../../testUtils/pageContainingWidgetFixture';

jest.mock('../../../redux/selectors/currentRegistrant', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../../redux/selectors/currentRegistrant'),
    __esModule: true,
    isAttendeeRegistered: jest.fn().mockReturnValue(true)
  };
});

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
                  fieldName: 'First Name',
                  fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
                  displayName: 'First Name',
                  display: REQUIRED,
                  isCustomField: false
                },
                'ff919d05-4281-4d9c-aa0d-82e3722d580d': {
                  fieldName: 'Email Address',
                  fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
                  displayName: 'Email Address',
                  display: REQUIRED,
                  isCustomField: false
                },
                'd110fb3f-83ad-46ae-a442-dfe51c83fa2b': {
                  fieldName: 'Source Id',
                  fieldId: 'd110fb3f-83ad-46ae-a442-dfe51c83fa2b',
                  displayName: 'Source Id',
                  display: REQUIRED,
                  isCustomField: false
                },
                'cfc98829-80b7-41b6-82b5-b968d43ef1c1': {
                  fieldName: 'Last Name',
                  fieldId: 'cfc98829-80b7-41b6-82b5-b968d43ef1c1',
                  displayName: 'Last Name',
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
          registrationPathId: 'regPathId',
          attendee: {
            personalInformation: {
              emailAddress: 'external@auth.com'
            }
          }
        }
      }
    }
  },
  event: {
    eventSecuritySetupSnapshot: {
      authenticationType: 1
    }
  },
  account: {
    settings: {
      accountSecuritySettings: {
        allowHTTPPost: true,
        allowSSOLogin: false,
        allowSecureHTTPPost: false
      }
    }
  }
};

const defaultProps = {
  translate: (resx, opts) => (opts ? `${resx}:${JSON.stringify(opts)}` : resx),
  style: {},
  classes: {},
  id: 'widgetId'
};

const guestEventRegistration = {
  eventRegistrationId: '00000000-0000-0000-0000-000000000002',
  attendee: {
    personalInformation: {},
    eventAnswers: {}
  },
  attendeeType: 'GUEST'
};

test('first name is non-editable in new reg when invitee is known and isIdConfirmationReadOnly is true', async () => {
  const localState15 = { ...initialState };
  (localState15.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe).isIdConfirmationReadOnly = true;
  (localState15 as $TSFixMe).userSession = { inviteeId: '5cd38752-e117-11e7-80c1-9a214cf093ae' };
  localState15.registrationForm = {
    ...localState15.registrationForm,
    regCart: {
      ...localState15.registrationForm.regCart,
      eventRegistrations: {
        ...localState15.registrationForm.regCart.eventRegistrations,
        eventRegistration1: {
          ...localState15.registrationForm.regCart.eventRegistrations.eventRegistration1,
          attendee: {
            ...localState15.registrationForm.regCart.eventRegistrations.eventRegistration1.attendee,
            personalInformation: {
              // @ts-expect-error ts-migrate(2322) FIXME: Type '{ firstName: string; }' is not assignable to... Remove this comment to see the full error message
              firstName: 'first name'
            }
          }
        }
      }
    }
  };
  (localState15.registrationForm as $TSFixMe).currentGuestEventRegistration = undefined;
  (localState15.registrationForm.regCart as $TSFixMe).regMod = false;
  (localState15.registrationForm.regCart as $TSFixMe).regCancel = false;
  const store = configureStore(localState15);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component.find('[data-cvent-id="input"]').hostNodes().getElements().length).toBe(0);
  expect(component).toMatchSnapshot();
});

test('text standard contact field renders and allows you to enter text', async () => {
  const store = configureStore(initialState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
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

test('text standard contact field will be set to null if regtype changed and field is read only', async () => {
  const onTextChange = jest.fn();
  const defaultPropsNew = {
    translate: (resx, opts) => (opts ? `${resx}:${JSON.stringify(opts)}` : resx),
    style: {},
    classes: {},
    id: 'widgetId',
    registrationField: {
      display: 3
    },
    isRegTypeChanged: 'test',
    onTextChange
  };
  const store = configureStore(initialState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWrapper
          {...defaultPropsNew}
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          config={{
            fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
  expect(onTextChange).toHaveBeenCalled();
});

test('skipping required fields during planner reg', async () => {
  const localState1 = { ...initialState };
  (localState1 as $TSFixMe).defaultUserSession = { isPlanner: true };
  const store = configureStore(localState1);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
});

test('email field not marked as non required when external auth disabled', async () => {
  const localState15 = {
    ...initialState,
    appData: {
      ...initialState.appData,
      registrationSettings: {
        ...initialState.appData.registrationSettings,
        registrationPaths: {
          ...initialState.appData.registrationSettings.registrationPaths,
          regPathId: {
            ...initialState.appData.registrationSettings.registrationPaths.regPathId,
            registrationPageFields: {
              ...initialState.appData.registrationSettings.registrationPaths.regPathId.registrationPageFields,
              [registrationFieldPageType.Registration]: {
                ...initialState.appData.registrationSettings.registrationPaths.regPathId.registrationPageFields[
                  registrationFieldPageType.Registration
                ],
                registrationFields: {
                  ...initialState.appData.registrationSettings.registrationPaths.regPathId.registrationPageFields[
                    registrationFieldPageType.Registration
                  ].registrationFields,
                  'ff919d05-4281-4d9c-aa0d-82e3722d580d': {
                    fieldName: 'Email Address',
                    fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
                    displayName: 'Email Address',
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
    account: {
      ...initialState.account,
      settings: {
        ...initialState.account.settings,
        accountSecuritySettings: {
          ...initialState.account.settings.accountSecuritySettings,
          allowHTTPPost: false,
          allowSecureHTTPPost: true
        }
      }
    }
  };
  (localState15 as $TSFixMe).defaultUserSession = { isPlanner: false };
  const store = configureStore(localState15);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component.find('[data-cvent-id="input"]').hostNodes().getElement().props.required).toBeTruthy();
});

test('email field is marked as required when external auth is enabled and admin registration', async () => {
  const localState15 = {
    ...initialState,
    appData: {
      ...initialState.appData,
      registrationSettings: {
        ...initialState.appData.registrationSettings,
        registrationPaths: {
          ...initialState.appData.registrationSettings.registrationPaths,
          regPathId: {
            ...initialState.appData.registrationSettings.registrationPaths.regPathId,
            registrationPageFields: {
              ...initialState.appData.registrationSettings.registrationPaths.regPathId.registrationPageFields,
              [registrationFieldPageType.Registration]: {
                ...initialState.appData.registrationSettings.registrationPaths.regPathId.registrationPageFields[
                  registrationFieldPageType.Registration
                ],
                registrationFields: {
                  ...initialState.appData.registrationSettings.registrationPaths.regPathId.registrationPageFields[
                    registrationFieldPageType.Registration
                  ].registrationFields,
                  'ff919d05-4281-4d9c-aa0d-82e3722d580d': {
                    fieldName: 'Email Address',
                    fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
                    displayName: 'Email Address',
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
    account: {
      ...initialState.account,
      settings: {
        ...initialState.account.settings,
        accountSecuritySettings: {
          ...initialState.account.settings.accountSecuritySettings,
          allowHTTPPost: false,
          allowSecureHTTPPost: true,
          allowSSOLogin: true
        }
      }
    }
  };
  (localState15 as $TSFixMe).defaultUserSession = { isPlanner: false };
  (localState15.registrationForm.regCart as $TSFixMe).admin = { selectedValue: true };
  const store = configureStore(localState15);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component.find('[data-cvent-id="input"]').hostNodes().getElement().props.required).toBeTruthy();
});

test('email field is marked as required when external auth is enabled and is guest registration', async () => {
  const localState18 = {
    ...initialState,
    appData: {
      ...initialState.appData,
      registrationSettings: {
        ...initialState.appData.registrationSettings,
        registrationPaths: {
          ...initialState.appData.registrationSettings.registrationPaths,
          regPathId: {
            ...initialState.appData.registrationSettings.registrationPaths.regPathId,
            registrationPageFields: {
              ...initialState.appData.registrationSettings.registrationPaths.regPathId.registrationPageFields,
              [registrationFieldPageType.Registration]: {
                ...initialState.appData.registrationSettings.registrationPaths.regPathId.registrationPageFields[
                  registrationFieldPageType.Registration
                ],
                registrationFields: {
                  ...initialState.appData.registrationSettings.registrationPaths.regPathId.registrationPageFields[
                    registrationFieldPageType.Registration
                  ].registrationFields,
                  'ff919d05-4281-4d9c-aa0d-82e3722d580d': {
                    fieldName: 'Email Address',
                    fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
                    displayName: 'Email Address',
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
    account: {
      ...initialState.account,
      settings: {
        ...initialState.account.settings,
        accountSecuritySettings: {
          ...initialState.account.settings.accountSecuritySettings,
          allowHTTPPost: false,
          allowSecureHTTPPost: true,
          allowSSOLogin: true
        }
      }
    },
    registrationForm: {
      currentGuestEventRegistration: guestEventRegistration
    }
  };
  (localState18 as $TSFixMe).defaultUserSession = { isPlanner: false };
  const store = configureStore(localState18);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component.find('[data-cvent-id="input"]').hostNodes().getElement().props.required).toBeTruthy();
});

test('email field is marked as non-required for guest when it is configured not required from site designer and external auth is on', async () => {
  const localState19 = {
    ...initialState,
    appData: {
      ...initialState.appData,
      registrationSettings: {
        ...initialState.appData.registrationSettings,
        registrationPaths: {
          ...initialState.appData.registrationSettings.registrationPaths,
          regPathId: {
            ...initialState.appData.registrationSettings.registrationPaths.regPathId,
            registrationPageFields: {
              ...initialState.appData.registrationSettings.registrationPaths.regPathId.registrationPageFields,
              [registrationFieldPageType.Registration]: {
                ...initialState.appData.registrationSettings.registrationPaths.regPathId.registrationPageFields[
                  registrationFieldPageType.Registration
                ],
                registrationFields: {
                  ...initialState.appData.registrationSettings.registrationPaths.regPathId.registrationPageFields[
                    registrationFieldPageType.Registration
                  ].registrationFields,
                  'ff919d05-4281-4d9c-aa0d-82e3722d580d': {
                    fieldName: 'Email Address',
                    fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
                    displayName: 'Email Address',
                    display: NOT_REQUIRED,
                    isCustomField: false
                  }
                }
              }
            }
          }
        }
      }
    },
    account: {
      ...initialState.account,
      settings: {
        ...initialState.account.settings,
        accountSecuritySettings: {
          ...initialState.account.settings.accountSecuritySettings,
          allowHTTPPost: false,
          allowSecureHTTPPost: true,
          allowSSOLogin: true
        }
      }
    },
    registrationForm: {
      currentGuestEventRegistration: guestEventRegistration
    }
  };
  (localState19 as $TSFixMe).defaultUserSession = { isPlanner: false };
  const store = configureStore(localState19);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component.find('[data-cvent-id="input"]').hostNodes().getElement().props.required).toBeFalsy();
});

test('email field marked as non required during external auth', async () => {
  const localState2 = { ...initialState };
  (localState2 as $TSFixMe).defaultUserSession = { isPlanner: true };
  const store = configureStore(localState2);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
});

test('email field marked as non required during external auth even when allowPersonalModification is true in reg mod', async () => {
  const localState3 = { ...initialState };
  (localState3 as $TSFixMe).defaultUserSession = { isPlanner: true };
  (localState3.registrationForm.regCart as $TSFixMe).regMod = true;
  (
    localState3.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe
  ).allowPersonalInformationModification = true;
  const store = configureStore(localState3);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
});

test('email field marked as non required during external auth will become read only when allowPersonalModification is false in reg mod', async () => {
  const localState4 = { ...initialState };
  (localState4 as $TSFixMe).defaultUserSession = { isPlanner: true };
  (localState4.registrationForm.regCart as $TSFixMe).regMod = true;
  (
    localState4.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe
  ).allowPersonalInformationModification = false;
  const store = configureStore(localState4);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
});

test('source id required for unknown invitee', async () => {
  const localState5 = { ...initialState };
  (localState5 as $TSFixMe).userSession = { inviteeId: undefined };
  (localState5.registrationForm.regCart as $TSFixMe).regMod = false;
  const store = configureStore(localState5);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'd110fb3f-83ad-46ae-a442-dfe51c83fa2b',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
});

test('source id is read-only in reg mod when allowPersonalInformationModification is false', async () => {
  const localState = { ...initialState };
  (localState as $TSFixMe).defaultUserSession = { isPlanner: true };
  (localState.registrationForm.regCart as $TSFixMe).regMod = true;
  (
    localState.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe
  ).allowPersonalInformationModification = false;
  const store = configureStore(localState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'd110fb3f-83ad-46ae-a442-dfe51c83fa2b',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component.find('[data-cvent-id="input"]').hostNodes().getElements().length).toBe(0);
  expect(component).toMatchSnapshot();
});

test('source id is editable in reg mod when allowPersonalInformationModification is true', async () => {
  const localState = { ...initialState };
  (localState.registrationForm.regCart as $TSFixMe).regMod = true;
  (
    localState.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe
  ).allowPersonalInformationModification = true;
  const store = configureStore(localState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'd110fb3f-83ad-46ae-a442-dfe51c83fa2b',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component.find('[data-cvent-id="input"]').hostNodes().getElements().length).toBe(1);
  expect(component).toMatchSnapshot();
});

test('source id is read-only when arriving from email for known invitee inital reg and isIdConfirmationReadOnly is true', async () => {
  const localState = { ...initialState };
  (localState as $TSFixMe).userSession = { inviteeId: 'knownInviteeId' };
  (localState.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe).isIdConfirmationReadOnly = true;
  (localState.registrationForm.regCart as $TSFixMe).regMod = false;
  const store = configureStore(localState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'd110fb3f-83ad-46ae-a442-dfe51c83fa2b',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component.find('[data-cvent-id="input"]').hostNodes().getElements().length).toBe(0);
  expect(component).toMatchSnapshot();
});

test('source id is editable when arriving from email for known invitee inital reg and isIdConfirmationReadOnly is false', async () => {
  const localState = { ...initialState };
  (localState as $TSFixMe).userSession = { inviteeId: 'knownInviteeId' };
  (localState.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe).isIdConfirmationReadOnly = false;
  (localState.registrationForm.regCart as $TSFixMe).regMod = false;
  const store = configureStore(localState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'd110fb3f-83ad-46ae-a442-dfe51c83fa2b',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component.find('[data-cvent-id="input"]').hostNodes().getElements().length).toBe(1);
  expect(component).toMatchSnapshot();
});

test('first name is read-only in reg mod when allowPersonalInformationModification is false', async () => {
  const localState8 = { ...initialState };
  (localState8 as $TSFixMe).defaultUserSession = { isPlanner: true };
  (localState8.registrationForm.regCart as $TSFixMe).regMod = true;
  (
    localState8.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe
  ).allowPersonalInformationModification = false;
  const store = configureStore(localState8);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
});

test('first name is editable in reg mod when allowPersonalInformationModification is true', async () => {
  const localState9 = { ...initialState };
  (localState9.registrationForm.regCart as $TSFixMe).regMod = true;
  (
    localState9.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe
  ).allowPersonalInformationModification = true;
  const store = configureStore(localState9);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
});

test('first name is read-only after reg mod is cancelled and allowPersonalInformationModification is false', async () => {
  const localState8 = { ...initialState };
  (localState8.registrationForm.regCart as $TSFixMe).regRetrieval = true;
  (localState8.registrationForm.regCart as $TSFixMe).status = 'TRANSIENT';
  (
    localState8.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe
  ).allowPersonalInformationModification = false;
  const store = configureStore(localState8);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
});

test('last name is read-only in reg mod when allowPersonalInformationModification is false', async () => {
  const localState10 = { ...initialState };
  (localState10 as $TSFixMe).defaultUserSession = { isPlanner: true };
  (localState10.registrationForm.regCart as $TSFixMe).regMod = true;
  (
    localState10.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe
  ).allowPersonalInformationModification = false;
  const store = configureStore(localState10);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'cfc98829-80b7-41b6-82b5-b968d43ef1c1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
});

test('last name is editable in reg mod when allowPersonalInformationModification is true', async () => {
  const localState11 = { ...initialState };
  (localState11.registrationForm.regCart as $TSFixMe).regMod = true;
  (
    localState11.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe
  ).allowPersonalInformationModification = true;
  const store = configureStore(localState11);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'cfc98829-80b7-41b6-82b5-b968d43ef1c1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
});

test('first name is editable in reg mod when allowPersonalInformationModification is false but the request is for a guest', async () => {
  const localState12 = { ...initialState };
  (localState12.registrationForm as $TSFixMe).currentGuestEventRegistration = { eventRegistrationId: 'eventRegId' };
  (localState12.registrationForm.regCart as $TSFixMe).regMod = true;
  (
    localState12.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe
  ).allowPersonalInformationModification = false;
  const store = configureStore(localState12);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
});

test('first name is read-only in reg cancel when allowPersonalInformationModification is false', async () => {
  const localState13 = { ...initialState };
  (localState13 as $TSFixMe).defaultUserSession = { isPlanner: true };
  (localState13.registrationForm.regCart as $TSFixMe).regCancel = true;
  (
    localState13.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe
  ).allowPersonalInformationModification = false;
  const store = configureStore(localState13);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
});

test('first name is editable in reg cancel when allowPersonalInformationModification is true', async () => {
  const localState14 = { ...initialState };
  (localState14.registrationForm.regCart as $TSFixMe).regCancel = true;
  (
    localState14.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe
  ).allowPersonalInformationModification = true;
  const store = configureStore(localState14);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
});

test('does not crash if no registration path is found', async () => {
  const localState15 = { ...initialState };
  localState15.registrationForm.regCart.eventRegistrations.eventRegistration1.registrationPathId = null;
  const store = configureStore(localState15);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
});
test('email and sourceId field is marked as read only when invitee is redirected to guest side after oauth authentication', async () => {
  const localState16 = { ...initialState };
  (localState16.account.settings.accountSecuritySettings as $TSFixMe).allowOAuth = true;
  localState16.event.eventSecuritySetupSnapshot.authenticationType = 3;
  (localState16.registrationForm as $TSFixMe).currentGuestEventRegistration = undefined;
  (localState16 as $TSFixMe).userSession = { inviteeId: '5cd38752-e117-11e7-80c1-9a214cf093ae' };
  (localState16.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe).isIdConfirmationReadOnly = false;
  const store = configureStore(localState16);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'd110fb3f-83ad-46ae-a442-dfe51c83fa2b',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component.find('[data-cvent-id="input"]').hostNodes().getElements().length).toBe(0);
});

test('first name, last name, email and source id is marked as read only when invitee is redirected to guest side after oauth authentication and isIdConfirmationReadOnly is true', async () => {
  const localState16 = { ...initialState };
  (localState16.account.settings.accountSecuritySettings as $TSFixMe).allowOAuth = true;
  localState16.event.eventSecuritySetupSnapshot.authenticationType = 3;
  (localState16.registrationForm as $TSFixMe).currentGuestEventRegistration = undefined;
  (localState16 as $TSFixMe).userSession = { inviteeId: '5cd38752-e117-11e7-80c1-9a214cf093ae' };
  (localState16.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe).isIdConfirmationReadOnly = true;
  const store = configureStore(localState16);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'cfc98829-80b7-41b6-82b5-b968d43ef1c1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'd110fb3f-83ad-46ae-a442-dfe51c83fa2b',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component.find('[data-cvent-id="input"]').hostNodes().getElements().length).toBe(0);
});

test('first name and last name is marked as read only when invitee is redirected to guest side after oauth authentication and dup match key is EMAIL_LAST_FIRST_NAME', async () => {
  const localState17 = { ...initialState };
  (localState17.account.settings.accountSecuritySettings as $TSFixMe).allowOAuth = true;
  localState17.event.eventSecuritySetupSnapshot.authenticationType = 3;
  (localState17.registrationForm as $TSFixMe).currentGuestEventRegistration = undefined;
  (localState17.appData.registrationSettings.registrationPaths.regPathId as $TSFixMe).isIdConfirmationReadOnly = false;
  (localState17.account.settings as $TSFixMe).dupMatchKeyType = 'EMAIL_LAST_FIRST_NAME';
  (localState17 as $TSFixMe).userSession = { inviteeId: '5cd38752-e117-11e7-80c1-9a214cf093ae' };
  const store = configureStore(localState17);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
        <StandardContactFieldTextWidget
          {...defaultProps}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { fieldId: string; registrationFie... Remove this comment to see the full error message
          config={{
            fieldId: 'cfc98829-80b7-41b6-82b5-b968d43ef1c1',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldText"
        />
      </Grid>
    </Provider>
  );
  expect(component.find('[data-cvent-id="input"]').hostNodes().getElements().length).toBe(0);
});

describe('getSettingBasedRegistrationField()', () => {
  const commonState = {
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPath1: {
            allowPersonalInformationModification: true
          }
        }
      }
    },
    registrationForm: {
      regCart: {
        eventRegistrations: {
          reg1: {
            registrationStatus: 'REGISTERED',
            registrationPathId: 'regPath1'
          }
        },
        status: 'INPROGRESS'
      }
    }
  };
  it('should return correct field settings for source id', () => {
    const sourceIdField = {
      fieldId: 'd110fb3f-83ad-46ae-a442-dfe51c83fa2b'
    };
    const readOnlySourceIdField = {
      ...sourceIdField,
      display: READ_ONLY
    };
    const state = JSON.parse(JSON.stringify(commonState)); // deep copy
    // allowPersonalInformationModification enabled
    expect(
      getSettingBasedRegistrationField(state, state.registrationForm.regCart, false, false, sourceIdField)
    ).toEqual(false);
    // allowPersonalInformationModification disabled
    state.appData.registrationSettings.registrationPaths.regPath1.allowPersonalInformationModification = false;
    expect(
      getSettingBasedRegistrationField(state, state.registrationForm.regCart, false, false, sourceIdField)
    ).toEqual(readOnlySourceIdField);
    // allowPersonalInformationModification disabled, registration status not present and regCart in progress
    state.registrationForm.regCart.eventRegistrations.reg1.registrationStatus = null;
    expect(getSettingBasedRegistrationField(state, state.registrationForm.regCart, true, false, sourceIdField)).toEqual(
      false
    );
    // allowPersonalInformationModification disabled, registration status not present and regCart not in progress
    state.registrationForm.regCart.status = 'TRANSIENT';
    expect(
      getSettingBasedRegistrationField(state, state.registrationForm.regCart, false, false, sourceIdField)
    ).toEqual(readOnlySourceIdField);
    // new registration
    expect(getSettingBasedRegistrationField(state, state.registrationForm.regCart, true, false, sourceIdField)).toEqual(
      false
    );
  });
  it('should return correct field settings for eligible field', () => {
    const emailAddressField = {
      fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d'
    };
    const readOnlyEmailAddressField = {
      ...emailAddressField,
      display: READ_ONLY
    };
    const state = JSON.parse(JSON.stringify(commonState)); // deep copy
    // allowPersonalInformationModification enabled
    expect(
      getSettingBasedRegistrationField(state, state.registrationForm.regCart, false, false, emailAddressField)
    ).toEqual(false);
    // allowPersonalInformationModification disabled
    state.appData.registrationSettings.registrationPaths.regPath1.allowPersonalInformationModification = false;
    expect(
      getSettingBasedRegistrationField(state, state.registrationForm.regCart, false, false, emailAddressField)
    ).toEqual(readOnlyEmailAddressField);
    // allowPersonalInformationModification disabled, registration status not present and regCart in progress
    state.registrationForm.regCart.eventRegistrations.reg1.registrationStatus = null;
    expect(
      getSettingBasedRegistrationField(state, state.registrationForm.regCart, true, false, emailAddressField)
    ).toEqual(false);
    // allowPersonalInformationModification disabled, registration status not present and regCart not in progress
    state.registrationForm.regCart.status = 'TRANSIENT';
    expect(
      getSettingBasedRegistrationField(state, state.registrationForm.regCart, false, false, emailAddressField)
    ).toEqual(readOnlyEmailAddressField);
    // new registration
    expect(
      getSettingBasedRegistrationField(state, state.registrationForm.regCart, true, false, emailAddressField)
    ).toEqual(false);
    // guest registration
    expect(
      getSettingBasedRegistrationField(state, state.registrationForm.regCart, false, true, emailAddressField)
    ).toEqual(false);
  });
});
