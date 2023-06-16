import React from 'react';
import { useMembershipUpdate } from '../useMembershipUpdate';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MockedProvider } from '@apollo/client/testing';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { mockMembershipDeselectionSuccess, mockMembershipSelectionSuccess } from '../mocks/apolloClient';
import { act } from '@testing-library/react';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const initialState = {
  clients: {
    productVisibilityClient: {
      getVisibleProducts: jest.fn(() => {})
    }
  },
  defaultUserSession: {
    eventId: 'd780d258-4b8d-422f-a686-fd43862f2d09'
  },
  registrationForm: {
    currentEventRegistrationId: '00000000-0000-0000-0000-000000000001',
    regCart: {
      sendEmail: true,
      eventId: 'd780d258-4b8d-422f-a686-fd43862f2d09',
      localeId: 1033,
      accountSnapshotVersion: 'XQlU4Bg_NkiqdRIYerVqOyBN_2RIrlCM',
      eventSnapshotVersions: {
        'f694fb1c-a278-4555-ae2b-73042fda2063': 'Opbs0Iz4WlyFxIVggb1vIg7DXC.dfMFj'
      },
      regCartId: '53372990-b26e-4556-8c42-efee05473e29',
      lastSavedPageId: 'regPage:617b1dc3-3ddb-4468-8087-049a4e6e51e8',
      status: 'INPROGRESS',
      groupRegistration: false,
      volumeDiscountsInCartStatusType: 'NO_VOLUME_DISCOUNT_IN_CART',
      eventRegistrations: {
        '00000000-0000-0000-0000-000000000001': {
          eventRegistrationId: '00000000-0000-0000-0000-000000000001',
          attendee: {
            personalInformation: {
              firstName: 'Alexandra',
              lastName: 'Petersen',
              emailAddress: 'rotemobeb@mailinator.com',
              company: 'Davidson and Copeland Inc',
              title: 'Accusamus et sunt incidunt officia ut repellendus Sit ut',
              mobilePhone: 'Id voluptatem laborum et quos',
              customFields: [],
              emailAddressDomain: 'mailinator.com'
            },
            isGroupMember: false,
            eventAnswers: []
          },
          attendeeType: 'ATTENDEE',
          displaySequence: 1,
          productRegistrations: [],
          requestedAction: 'REGISTER',
          externalRegistrationContactId: '',
          contactNoMatchInSfCampaign: false,
          eventId: 'd780d258-4b8d-422f-a686-fd43862f2d09',
          primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
          sessionRegistrations: {},
          quantityItemRegistrations: {},
          donationItemRegistrations: {},
          sessionWaitlists: {},
          membershipItemRegistrations: {},
          sessionBundleRegistrations: {},
          registrationTypeId: '00000000-0000-0000-0000-000000000000',
          registrationPathId: 'c6da5ffa-fa0d-465d-823a-8f4c328f7619',
          addGuestFromRelatedContacts: false,
          autoAssignRegTypeForEventRegistration: false,
          attendingFormatId: 0
        }
      },
      isAdmin: false,
      registrationApprovalRequired: false,
      hasTravel: false,
      partial: true,
      regApproval: false,
      regCancel: false,
      regMod: false,
      regDecline: false,
      regWaitList: false,
      postRegPayment: false
    }
  }
};

describe('useMembershipUpdate', () => {
  const TestComponent = () => {
    const [mutate] = useMembershipUpdate({
      id: '95bf4765-4706-425f-bb5a-bd3ba83075b9',
      membershipItemId: '457b1725-6394-4476-92b2-6ecfb106791f',
      amount: 10,
      code: '',
      description: '',
      name: '',
      renewal: false
    });
    return (
      <button type="button" onClick={mutate}>
        Select Membership Item
      </button>
    );
  };

  const mountComponent = (store, apolloClientMock) =>
    mount(
      <Provider store={store}>
        <MockedProvider mocks={[apolloClientMock]} addTypename={false}>
          <TestComponent />
        </MockedProvider>
      </Provider>
    );

  it('should call SELECT_MEMBERSHIP gql query when there is no membership item registered', async () => {
    const store = mockStore(initialState);
    const component = await mountComponent(store, mockMembershipSelectionSuccess);
    await act(() => component.find('button').prop('onClick')());
    const registerMembershipSelectionMock = mockMembershipSelectionSuccess.newData;
    expect(registerMembershipSelectionMock).toHaveBeenCalled();
  });

  it('should call DESELECT_MEMBERSHIP gql query when there is membership item registered', async () => {
    const state = {
      ...initialState,
      registrationForm: {
        ...initialState.registrationForm,
        regCart: {
          ...initialState.registrationForm.regCart,
          eventRegistrations: {
            '00000000-0000-0000-0000-000000000001': {
              ...initialState.registrationForm.regCart.eventRegistrations['00000000-0000-0000-0000-000000000001'],
              membershipItemRegistrations: {
                '95bf4765-4706-425f-bb5a-bd3ba83075b9': {
                  productType: 'MembershipItem',
                  requestedAction: 'REGISTER',
                  membershipItemId: '457b1725-6394-4476-92b2-6ecfb106791f',
                  renewal: false,
                  registrationTypeIdBeforeMembershipSelection: '00000000-0000-0000-0000-000000000000',
                  productId: '95bf4765-4706-425f-bb5a-bd3ba83075b9'
                }
              }
            }
          }
        }
      }
    };
    const store = mockStore(state);
    const component = await mountComponent(store, mockMembershipDeselectionSuccess);
    await act(() => component.find('button').prop('onClick')());
    const registerMembershipDeselectionMock = mockMembershipDeselectionSuccess.newData;
    expect(registerMembershipDeselectionMock).toHaveBeenCalled();
  });
});
