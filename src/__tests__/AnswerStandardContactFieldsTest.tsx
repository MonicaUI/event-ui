import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from '../redux/configureStore';
import WidgetFactory from '../widgetFactory';
import { REQUIRED } from 'cvent-question-widgets/lib/DisplayType';
import IdentifyConfirmationWidget from 'event-widgets/lib/IdentityConfirmation/IdentityConfirmationWidget';
import StandardContactFieldTextWidget from '../widgets/QuestionsAndFields/StandardContactFieldTextWidget';
import { Grid } from 'nucleus-core/layout/grid';
import Form from 'nucleus-form/src/components/Form';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import pageContainingWidgetFixture from '../testUtils/pageContainingWidgetFixture';

describe('when answering fields', () => {
  it('should update personal information', () => {
    const eventRegistrationId = 'eventRegistrationId1';
    const store = configureStore({
      event: {
        timezone: 2
      },
      timezones: {},
      registrationForm: {
        currentEventRegistrationId: [eventRegistrationId],
        regCart: {
          regCartId: 'regCartId',
          eventRegistrations: {
            [eventRegistrationId]: {
              eventRegistrationId,
              attendee: {
                personalInformation: {}
              },
              registrationPathId: 'regPathId1'
            }
          }
        }
      },
      website: {
        ...pageContainingWidgetFixture('pageId', 'widgetId'),
        pluginData: {
          registrationProcessNavigation: {
            registrationPaths: {
              regPathId1: {
                id: 'regPathId1',
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
            regPathId1: {
              registrationPageFields: {
                [registrationFieldPageType.Registration]: {
                  registrationFieldPageType: registrationFieldPageType.Registration,
                  registrationFields: {
                    '56aeaca6-a0ad-4548-8afc-94d8d4361ba1': {
                      display: REQUIRED,
                      displayName: 'First Name'
                    },
                    'cfc98829-80b7-41b6-82b5-b968d43ef1c1': {
                      display: REQUIRED,
                      displayName: 'Last Name'
                    },
                    'ff919d05-4281-4d9c-aa0d-82e3722d580d': {
                      display: REQUIRED,
                      displayName: 'Email Address'
                    },
                    'beb6ac56-2672-4c33-976b-06ab07379cf3': {
                      display: REQUIRED,
                      displayName: 'Twitter URL'
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    const content = mount(
      <Provider store={store}>
        <Form>
          <Grid>
            <IdentifyConfirmationWidget
              style={{ elements: {} }}
              config={{ shared: { headerText: {}, instructionalText: {} } }}
              translate={() => {}}
            >
              <StandardContactFieldTextWidget
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ id: string; translate: (text: any) => any;... Remove this comment to see the full error message
                id="widgetId"
                translate={text => text}
                config={{
                  fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
                  registrationFieldPageType: registrationFieldPageType.Registration
                }}
                style={{}}
                type="EventStandardContactSecureFieldText"
              />
              <StandardContactFieldTextWidget
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ id: string; translate: (text: any) => any;... Remove this comment to see the full error message
                id="widgetId"
                translate={text => text}
                config={{
                  fieldId: 'cfc98829-80b7-41b6-82b5-b968d43ef1c1',
                  registrationFieldPageType: registrationFieldPageType.Registration
                }}
                style={{}}
                type="EventStandardContactSecureFieldText"
              />
              <StandardContactFieldTextWidget
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ id: string; translate: (text: any) => any;... Remove this comment to see the full error message
                id="widgetId"
                translate={text => text}
                config={{
                  fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d',
                  registrationFieldPageType: registrationFieldPageType.Registration
                }}
                style={{}}
                type="EventStandardContactSecureFieldText"
              />
              <StandardContactFieldTextWidget
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ id: string; translate: (text: any) => any;... Remove this comment to see the full error message
                id="widgetId"
                translate={text => text}
                config={{
                  fieldId: 'beb6ac56-2672-4c33-976b-06ab07379cf3',
                  registrationFieldPageType: registrationFieldPageType.Registration
                }}
                style={{}}
                type="EventStandardContactSecureFieldText"
              />
            </IdentifyConfirmationWidget>
          </Grid>
        </Form>
      </Provider>
    );

    const inputs = content.find('input');
    inputs.at(0).simulate('change', { target: { value: 'First' } });
    inputs.at(1).simulate('change', { target: { value: 'Last' } });
    inputs.at(2).simulate('change', { target: { value: 'first@last.com' } });
    inputs.at(3).simulate('change', { target: { value: 'twitter.com/firstlast' } });
    expect(
      store.getState().registrationForm.regCart.eventRegistrations[eventRegistrationId].attendee.personalInformation
    ).toEqual({
      firstName: 'First',
      lastName: 'Last',
      emailAddress: 'first@last.com',
      socialMediaUrls: {
        TWITTER: 'twitter.com/firstlast'
      }
    });
  });
});
