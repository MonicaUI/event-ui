import React from 'react';
import { mount } from 'enzyme';
import { MockedProvider } from '@apollo/client/testing';
import RegistrationNavigatorWidgetWrapper from '../widgets/RegistrationNavigator/RegistrationNavigatorWidget';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import { Provider } from 'react-redux';
import { createLocalNucleusForm } from 'nucleus-form/src/NucleusForm';
import { REGISTERING } from '../redux/registrationIntents';
import { PRIVATE_ALL_TARGETED_LISTS } from 'event-widgets/clients/RegistrationPathType';
import reducer from '../redux/reducer';
import pageContainingWidgetFixture from '../testUtils/pageContainingWidgetFixture';
import EventSnapshot from '../../fixtures/EventSnapshot.json';
import { ServiceError } from '@cvent/event-ui-networking';
// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../dialogs/__mocks__/documentElementMock';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
// eslint-disable-next-line jest/no-mocks-import
import { getApolloClientMocks, mockApolloClient } from '../widgets/PaymentWidget/__mocks__/apolloClient';
getMockedMessageContainer();

const mockOpenAlreadyRegisteredDialog = jest.fn();
jest.mock('../dialogs//AlreadyRegisteredDialog', () => ({
  openAlreadyRegisteredDialog: () => () => {
    mockOpenAlreadyRegisteredDialog();
  }
}));

const mockopenEventStatusDialog = jest.fn();
jest.mock('../dialogs//EventStatusDialog', () => () => () => {
  return { openEventStatusDialog: mockopenEventStatusDialog() };
});

jest.mock('../widgets/PaymentWidget/useCachedRegCartPricing', () => ({
  ...jest.requireActual<$TSFixMe>('../widgets/PaymentWidget/useCachedRegCartPricing'),
  getTravelCartForQuery: () => {
    return JSON.stringify({});
  },
  lastSavedRegCartForQuery: () => {
    return JSON.stringify({});
  },
  getPaymentInfoForQuery: () => {
    return JSON.stringify({});
  }
}));

jest.mock('../widgets/PaymentWidget/getRegCartPricingAction', () => async state => {
  return state;
});

const translate = (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx);

const defaultProps = {
  config: {
    displayText: {
      backward: 'backward',
      forward: 'forward',
      complete: 'complete',
      exit: 'exit'
    }
  },
  classes: {},
  style: {},
  nucleusForm: createLocalNucleusForm(),
  translate,
  id: 'widgetId'
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const regCartPricing = {
  netFeeAmountCharge: 10
};

const apolloClient = mockApolloClient();
function createStore(regCartClient, pageIds) {
  return createStoreWithMiddleware(
    reducer,
    {
      text: {
        translate,
        resolver: {
          fetchAllDataTags: value => value
        }
      },
      partialPaymentSettings: {
        paymentAmountOption: {
          value: 1
        },
        paymentAmount: 23
      },
      website: {
        ...pageContainingWidgetFixture(pageIds[0], 'widgetId'),
        pluginData: {
          registrationProcessNavigation: {
            registrationPaths: {
              regPath1: {
                id: 'regPath1',
                pageIds,
                declinePageIds: ['declinePageId']
              }
            }
          },
          eventWebsiteNavigation: {
            defaultPageId: 'page1'
          }
        },
        theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
      },
      accessToken: 'BEARER fakeToken',
      appData: {
        registrationSettings: {
          registrationPaths: {
            regPath1: {
              accessRules: {
                invitationListAccess: {
                  type: PRIVATE_ALL_TARGETED_LISTS
                }
              }
            }
          }
        },
        registrationPathSettings: {
          regPath1: {}
        }
      },
      pathInfo: {
        currentPageId: 'page1',
        rootPath: 'some'
      },
      regCartStatus: {
        registrationIntent: REGISTERING,
        lastSavedRegCart: {}
      },
      registrationForm: {
        regCart: {
          eventRegistrations: {
            eventRegistration1: {
              attendee: {
                personalInformation: {
                  emailAddress: 'emailAddress'
                }
              },
              registrationPathId: 'regPath1'
            }
          }
        },
        regCartPayment: {
          selectedPaymentMethod: 'offline.optionOne',
          pricingInfo: {
            creditCard: {
              paymentType: PAYMENT_TYPE.ONLINE
            },
            offline: {
              optionOne: {
                paymentType: PAYMENT_TYPE.OFFLINE
              }
            }
          }
        }
      },
      regCartPricing,
      clients: {
        regCartClient,
        capacityClient: {
          getCapacitySummaries: () => Promise.resolve({})
        },
        eventGuestClient: {
          logout: () => Promise.resolve()
        }
      },
      event: {
        eventFeatureSetup: {
          fees: {
            fees: true
          }
        },
        registrationTypes: {
          '00000000-0000-0000-0000-000000000000': {
            id: '00000000-0000-0000-0000-000000000000',
            isOpenForRegistration: true
          }
        },
        products: {
          sessionContainer: {}
        }
      },
      testSettings: {
        registrationCheckoutTimeout: '2'
      },
      experiments: {}
    },
    {
      thunkExtraArgument: { apolloClient }
    }
  );
}

const apolloClientMocks = getApolloClientMocks({ regCartPricing });

function runTests(buttonId, pageIds) {
  it('displays private event dialog when warned about invitee not being on target list and then allows it to be closed', async () => {
    const regCartClient = {
      updateRegCart(regCart) {
        return Promise.resolve({
          regCart: {
            ...regCart,
            eventRegistrations: {
              eventRegistration1: {
                attendee: {
                  personalInformation: {
                    emailAddress: 'emailAddress'
                  }
                },
                registrationPathId: 'regPath1'
              }
            }
          },
          validationMessages: [
            {
              severity: 'Warning',
              localizationKey: 'REGAPI.ATTENDEE_NOT_IN_SPECIFIC_TARGET_LIST'
            }
          ]
        });
      },
      buildRequestForRegCartPricing() {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
        return new Request();
      },
      getRegCartPricing() {
        return Promise.resolve({});
      }
    };
    const view = mount(
      <Provider store={createStore(regCartClient, pageIds)}>
        {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: any; addTypeName... Remove this comment to see the full error message */}
        <MockedProvider mocks={apolloClientMocks} addTypeName={false}>
          <div>
            <DialogContainer spinnerMessage="spinnerMessage" message="message" />
            <RegistrationNavigatorWidgetWrapper {...defaultProps} />
          </div>
        </MockedProvider>
      </Provider>
    );

    view.find(buttonId).hostNodes().simulate('click');
    await wait(0);
    expect(view.getDOMNode()).toMatchSnapshot();

    view.update();
    view.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(view).toMatchSnapshot();

    // displays the same error again if you try to proceed without changing anything, FLEX-9893
    view.find(buttonId).hostNodes().simulate('click');
    await wait(0);
    expect(view).toMatchSnapshot();
  });

  it('displays private event dialog for error about invitee not being on target list', async () => {
    const regCartClient = {
      updateRegCart() {
        throw new ServiceError(
          'reg cart error',
          { status: 422 },
          { headers: { get() {} } },
          {
            validationMessages: [
              {
                severity: 'Error',
                localizationKey: 'REGAPI.ATTENDEE_NOT_IN_SPECIFIC_TARGET_LIST'
              }
            ]
          }
        );
      },
      buildRequestForRegCartPricing() {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
        return new Request();
      }
    };
    const view = mount(
      <Provider store={createStore(regCartClient, pageIds)}>
        {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: any; addTypeName... Remove this comment to see the full error message */}
        <MockedProvider mocks={apolloClientMocks} addTypeName={false}>
          <div>
            <DialogContainer spinnerMessage="spinnerMessage" message="message" />
            <RegistrationNavigatorWidgetWrapper {...defaultProps} />
          </div>
        </MockedProvider>
      </Provider>
    );
    view.find(buttonId).hostNodes().simulate('click');
    await wait(0);
    expect(view).toMatchSnapshot();
  });

  it('opens already registered dialog when invitee is already registered and then allows it to close', async () => {
    const regCartClient = {
      updateRegCart() {
        throw new ServiceError(
          'reg cart error',
          { status: 422 },
          { headers: { get() {} } },
          {
            validationMessages: [
              {
                severity: 'Error',
                localizationKey: 'REGAPI.INVALID_EXISTING_INVITEES_STATUS_REGISTRATION',
                parametersMap: {
                  inviteeStatus: 'Accepted'
                }
              }
            ]
          }
        );
      },
      buildRequestForRegCartPricing() {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
        return new Request();
      }
    };
    const view = mount(
      <Provider store={createStore(regCartClient, pageIds)}>
        {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: any; addTypeName... Remove this comment to see the full error message */}
        <MockedProvider mocks={apolloClientMocks} addTypeName={false}>
          <div>
            <DialogContainer spinnerMessage="spinnerMessage" message="message" />
            <RegistrationNavigatorWidgetWrapper {...defaultProps} />
          </div>
        </MockedProvider>
      </Provider>
    );
    view.find(buttonId).hostNodes().simulate('click');
    await wait(0);
    expect(mockOpenAlreadyRegisteredDialog).toHaveBeenCalled();
  });
  it.skip('opens event dialog when invitees reg type does not have open admission items', async () => {
    const regCartClient = {
      updateRegCart() {
        throw new ServiceError(
          'reg cart error',
          { status: 422 },
          { headers: { get() {} } },
          {
            validationMessages: [
              {
                severity: 'Error',
                localizationKey: 'REGAPI.REGAPI_ADMISSION_CAPACITY_NOT_AVAILABLE_FOR_REGTYPE'
              }
            ]
          }
        );
      },
      buildRequestForRegCartPricing() {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
        return new Request();
      }
    };
    const view = mount(
      <Provider store={createStore(regCartClient, pageIds)}>
        {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: any; addTypeName... Remove this comment to see the full error message */}
        <MockedProvider mocks={apolloClientMocks} addTypeName={false}>
          <div>
            <DialogContainer spinnerMessage="spinnerMessage" message="message" />
            <RegistrationNavigatorWidgetWrapper {...defaultProps} />
          </div>
        </MockedProvider>
      </Provider>
    );
    view.find(buttonId).hostNodes().simulate('click');
    await wait(0);
    expect(mockopenEventStatusDialog).toHaveBeenCalled();
  });
  [
    'REGAPI.IDENTITY_SOURCE_ID_MODIFIED',
    'REGAPI.IDENTITY_EMAIL_MODIFIED',
    'REGAPI.ID_CONFIRMATION_CONTACT_IDENTIFICATION_EXCEPTION',
    'REGAPI.ID_CONFIRMATION_SOURCE_ID_NO_MATCH',
    'REGAPI.ID_CONFIRMATION_SOURCE_ID_MULTIPLE_MATCHED',
    'REGAPI.ID_CONFIRMATION_SOURCE_ID_INCONSISTENT_MATCH',
    'REGAPI.DUP_MATCH_KEY_VIOLATION',
    'REGAPI.CHANGED_ID_CONFIRMATION_FIELDS',
    'REGAPI.PRODUCT_NOT_OPEN_FOR_REGISTRATION'
  ].forEach(localizationKey => {
    it(`displays error dialog for ${localizationKey} error and allows it to be closed`, async () => {
      const regCartClient = {
        updateRegCart() {
          throw new ServiceError(
            'reg cart error',
            { status: 422 },
            { headers: { get() {} } },
            {
              validationMessages: [
                {
                  severity: 'Error',
                  localizationKey
                }
              ]
            }
          );
        },
        buildRequestForRegCartPricing() {
          // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
          return new Request();
        },
        getRegCartPricing() {
          return Promise.resolve({});
        }
      };
      const view = mount(
        <Provider store={createStore(regCartClient, pageIds)}>
          {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: any; addTypeName... Remove this comment to see the full error message */}
          <MockedProvider mocks={apolloClientMocks} addTypeName={false}>
            <div>
              <DialogContainer spinnerMessage="spinnerMessage" message="message" />
              <RegistrationNavigatorWidgetWrapper {...defaultProps} />
            </div>
          </MockedProvider>
        </Provider>
      );
      view.find(buttonId).hostNodes().simulate('click');
      await wait(0);
      expect(view).toMatchSnapshot();

      view.update();
      view.find('[data-cvent-id="close"]').hostNodes().simulate('click');
      await wait(0);
      expect(view).toMatchSnapshot();
    });
  });
}

describe('updating registration', () => {
  runTests('#forward', ['page1', 'page2']);
});

describe('completing registration', () => {
  runTests('#complete', ['page1']);

  it('displays payment processing error and allows it to be closed', async () => {
    const regCartClient = {
      updateRegCart(regCart) {
        return Promise.resolve({
          regCart: {
            ...regCart,
            eventRegistrations: {
              eventRegistration1: {
                attendee: {
                  personalInformation: {
                    emailAddress: 'emailAddress'
                  }
                },
                registrationPathId: 'regPath1'
              }
            }
          },
          validationMessages: []
        });
      },
      calculateRegCartPricing() {
        return Promise.resolve({});
      },
      startRegCartCheckout() {
        throw new ServiceError(
          'reg cart error',
          { status: 422 },
          { headers: { get() {} } },
          {
            statusCode: 'INPROGRESS',
            paymentInfo: {
              paymentStatus: 'PaymentFailed',
              paymentResultCode: 'OtherError'
            }
          }
        );
      },
      buildRequestForRegCartPricing() {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
        return new Request();
      }
    };
    const view = mount(
      <Provider store={createStore(regCartClient, ['page1'])}>
        {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: any; addTypeName... Remove this comment to see the full error message */}
        <MockedProvider mocks={apolloClientMocks} addTypeName={false}>
          <div>
            <DialogContainer spinnerMessage="spinnerMessage" message="message" />
            <RegistrationNavigatorWidgetWrapper {...defaultProps} />
          </div>
        </MockedProvider>
      </Provider>
    );
    view.find('#complete').hostNodes().simulate('click');
    await wait(0);
    expect(view).toMatchSnapshot();

    view.update();
    view.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(view).toMatchSnapshot();
  });
  [
    'REGAPI.REGAPI.REGMOD_INVITEE_STATUS_INVALID',
    'REGAPI.REGAPI_VOUCHER_CODE_REQUIRED',
    'REGAPI.ATTENDEE_REQUIRED_FIELD_MISSING',
    'REGAPI.REGTYPE_MISSING',
    'REGAPI.ATTENDEE_QUESTION_MISSING',
    'REGAPI.IDENTITY_SOURCE_ID_MISSING'
  ].forEach(localizationKey => {
    it(`displays error dialog for ${localizationKey} error and allows it to be close`, async () => {
      const regCartClient = {
        updateRegCart(regCart) {
          return Promise.resolve({
            regCart: {
              ...regCart,
              eventRegistrations: {
                eventRegistration1: {
                  attendee: {
                    personalInformation: {
                      emailAddress: 'emailAddress'
                    }
                  },
                  registrationPathId: 'regPath1'
                }
              }
            },
            validationMessages: []
          });
        },
        calculateRegCartPricing() {
          return Promise.resolve({});
        },
        startRegCartCheckout() {
          throw new ServiceError(
            'reg cart error',
            { status: 422 },
            { headers: { get() {} } },
            {
              validationMessages: [
                {
                  severity: 'Error',
                  localizationKey
                }
              ]
            }
          );
        },
        buildRequestForRegCartPricing() {
          // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
          return new Request();
        },
        getRegCartPricing() {
          return Promise.resolve({});
        }
      };

      const view = mount(
        <Provider store={createStore(regCartClient, ['page1'])}>
          {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: any; addTypeName... Remove this comment to see the full error message */}
          <MockedProvider mocks={apolloClientMocks} addTypeName={false}>
            <div>
              <DialogContainer spinnerMessage="spinnerMessage" message="message" />
              <RegistrationNavigatorWidgetWrapper {...defaultProps} />
            </div>
          </MockedProvider>
        </Provider>
      );
      view.find('#complete').hostNodes().simulate('click');
      await wait(0);
      expect(view).toMatchSnapshot();

      view.update();
      view.find('[data-cvent-id="close"]').hostNodes().simulate('click');
      await wait(0);
      expect(view).toMatchSnapshot();
    });
  });
});
