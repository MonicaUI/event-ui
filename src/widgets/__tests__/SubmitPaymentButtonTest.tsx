import React from 'react';
jest.mock('../../redux/pathInfo');
jest.mock('../../redux/registrationForm/regCart', () => ({
  saveRegistration: x => x,
  finalizeCancelRegistration: x => x
}));
jest.mock('../../redux/registrantLogin/actions', () => ({
  logoutRegistrant: () => {},
  loginRegistrant: jest.fn()
}));
jest.mock('../../redux/website', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/website'),
    __esModule: true,
    getDefaultWebsitePageId: () => 'website1'
  };
});

import SubmitPayment from '../SubmitPaymentWidget';
import { REGISTERING } from '../../redux/registrationIntents';
import pageContainingWidgetFixture from '../../testUtils/pageContainingWidgetFixture';
import Form from 'nucleus-form/src/components/Form';
import { mount } from 'enzyme';
import { Grid } from 'nucleus-core/layout/flexbox';
import { Provider } from 'react-redux';
import { shallow } from 'enzyme/build/index';
import ButtonWidget from 'nucleus-widgets/lib/Button/ButtonWidget';
import { routeToPage } from '../../redux/pathInfo';

const initialState = {
  text: { translate: x => x },
  registrationForm: {
    warnings: {},
    regCart: {
      eventRegistrations: {
        REG1: {
          id: 'REG1',
          attendeeType: 'ATTENDEE',
          attendee: {
            personalInformation: {
              emailAddress: 'tony@stark.com'
            }
          },
          confirmationNumber: 'CONFIRMNUM'
        }
      }
    }
  },
  regCartStatus: {
    registrationIntent: REGISTERING
  },
  defaultUserSession: {
    isPlanner: false
  },
  plannerRegSettings: {
    exitUrl: 'https://www.google.com/'
  },
  event: {
    registrationTypes: {
      '00000000-0000-0000-0000-000000000000': {
        id: '00000000-0000-0000-0000-000000000000'
      }
    }
  },
  website: {
    ...pageContainingWidgetFixture('cancellationPageId', 'widgetId'),
    pluginData: {
      registrationProcessNavigation: {
        registrationPaths: {
          regPathId: {
            id: 'regPathId',
            pageIds: ['pageId'],
            cancellationPageIds: ['cancellationPageId'],
            confirmationPageId: 'confirmationPageId'
          }
        }
      }
    }
  },
  orders: [
    {
      orderId: '62f18482-b84a-436d-9654-008fab33cc23',
      attendeeId: '15d6acf3-901b-461d-a54a-76538c6529fe',
      groupMemberTitle: 'Member',
      submittedOn: '2019-10-28T14:07:11.000Z',
      orderType: 'OfflineCharge',
      orderItems: [
        {
          itemId: '42a2e2c7-7a4c-4e07-8865-5a5a19709d19',
          registrantId: '62de896b-7d58-45e4-ab97-dec5ee9bbe96',
          firstName: 'dfsan',
          lastName: 'indsfo',
          productType: 'AdmissionItem',
          itemPrice: 500,
          itemName: 'Event Registration',
          quantity: 1,
          amount: 500,
          amountPaid: 0,
          amountDue: 500
        }
      ]
    }
  ],
  appData: {
    registrationSettings: {
      registrationPaths: {
        regPathId: {
          id: 'regPathId',
          cancellation: {
            enabled: true
          },
          isDefault: true
        }
      }
    }
  }
};
const getState = () => {
  return { ...initialState };
};
async function dispatch(action) {
  if (typeof action === 'function') {
    return await action(dispatch, getState);
  }
}
const subscribe = () => {};
const defaultPaymentProps = {
  config: {
    text: 'text',
    link: {
      text: 'text',
      enabled: true
    }
  },
  style: {},
  isGuest: true,
  id: 'widget:postRegistrationPayment',
  store: { dispatch, subscribe, getState },
  translate: x => x
};

let mockStore;
const mountWidget = () => {
  mockStore = { dispatch, subscribe, getState };
  return mount(
    <Provider store={mockStore}>
      <Form>
        <Grid>
          <SubmitPayment {...defaultPaymentProps} />
        </Grid>
      </Form>
    </Provider>
  );
};

describe('Tests for SubmitPaymentWidget', () => {
  test('Checking if it is rendering properly', () => {
    const component = mountWidget();
    expect(component).toMatchSnapshot('Widget Renders');
  });
});

describe('RegistrationNavigatorWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to the post reg payment page on click', async () => {
    const wrapper = shallow(<SubmitPayment {...defaultPaymentProps} />).dive();
    const widget = wrapper.find(ButtonWidget);
    await widget.props().clickHandler();
    expect(routeToPage).toHaveBeenCalledWith('PostRegistrationPayment');
  });
});
