import React from 'react';
import UberVouchersWidget from '../UberVouchersWidget';
import { Provider } from 'react-redux';
import EventGuestSideWidgetFactory from '../../widgetFactory/index';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { mount } from 'enzyme';

const onClickHandler = jest.fn(() => {
  return {};
});

function translate(res, opts) {
  return opts ? `${res}:${JSON.stringify(opts)}` : res;
}

function getState() {
  return {
    registrationForm: {
      regCart: {
        regCartId: '6b6cb8f0-812b-4ccc-b0af-e7ec08750fc5',
        eventRegistrations: {
          '00000000-0000-0000-0000-000000000001': {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001',
            attendee: {
              personalInformation: {
                contactGroups: [],
                customFields: {},
                emailAddressDomain: '',
                homeAddress: {
                  countryCode: 'US'
                }
              },
              eventAnswers: {}
            },
            attendeeType: 'ATTENDEE',
            displaySequence: 1,
            productRegistrations: [],
            registrationTypeId: '00000000-0000-0000-0000-000000000000',
            requestedAction: 'REGISTER',
            eventId: '4d57a132-93e5-4187-a25f-e06ad2f4bb67',
            primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
            sessionRegistrations: {
              '22b2fa58-a446-46cd-8888-2720925fb669': {
                requestedAction: 'REGISTER',
                productId: '22b2fa58-a446-46cd-8888-2720925fb669',
                registrationSourceType: 'Selected',
                includedInAgenda: false
              }
            },
            trackRegistrations: {},
            registrationTypeName: '',
            registrationPathId: 'b5463d12-2f6f-4696-9b30-e38aa4144b86',
            travelVouchers: [
              {
                code_text: 'r_EI0S4q33e2',
                max_num_redemptions: 1,
                program_id: '52df0c8a-962d-4111-96e5-8a0ba48cf5da',
                redemption_link: 'https://r.uber.com/r_EI0S4q33e2',
                voucher_id: '41427065-756c-4e7a-b0e0-08332d904f6f'
              }
            ]
          }
        }
      }
    },
    appData: {
      selectedUberVoucherPrograms: [
        {
          id: 'widget:b3df74b9-8908-4ed6-9a2b-9a84b754bf7f',
          voucherPrograms: [
            {
              programID: '52df0c8a-962d-4111-96e5-8a0ba48cf5da',
              name: 'Test Uber Voucher Program',
              voucherName: 'Test Uber Voucher Name',
              redemptionLink: 'www.fakelink'
            }
          ]
        }
      ]
    },
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    widgetFactory: {
      loadMetaData: x => (new EventGuestSideWidgetFactory() as $TSFixMe).loadMetaData(x),
      loadComponent: x => (new EventGuestSideWidgetFactory() as $TSFixMe).loadComponent(x)
    }
  };
}

const mockFn = jest.fn();
const defaultProps = {
  classes: {},
  style: {
    elements: {},
    palette: {}
  },
  translate,
  store: { getState, subscribe: mockFn, dispatch: mockFn },
  config: {
    style: {
      uberLogo: 'black'
    }
  },
  clickHandler: onClickHandler,
  type: 'UberVouchers',
  id: 'widget:b3df74b9-8908-4ed6-9a2b-9a84b754bf7f'
};

describe('Tests for UberVouchersWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('it matches snapshot', () => {
    const widget = mount(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Provider store={defaultProps.store}>
        <UberVouchersWidget {...defaultProps} />
      </Provider>
    );
    expect(widget.find('UberVouchers').first()).toMatchSnapshot();
  });
});
