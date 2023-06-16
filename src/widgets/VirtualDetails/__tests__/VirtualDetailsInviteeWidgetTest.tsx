import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { mount } from 'enzyme';
import VirtualDetailsInviteeWidgetWrapper from '../widgets/VirtualDetailsInviteeWidget';
import { Provider } from 'react-redux';
// eslint-disable-next-line jest/no-mocks-import
import { apolloClientMock } from '../__mocks__/inviteeInfo';
import { act } from 'react-dom/test-utils';

const state = {
  userSession: {
    inviteeId: ''
  },
  event: {
    id: ''
  },
  pathInfo: {
    queryParams: {}
  },
  clients: {
    eventGuestsideAttendeeClient: {
      buildRequestForInviteeInfo: jest.fn().mockReturnValue({})
    }
  }
};

const store = {
  getState() {
    return state;
  },
  subscribe() {},
  dispatch() {}
};

const props = {
  translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx),
  config: {
    text: 'EventGuestSide_VirtualDetails_JoiningInvitee__resx'
  },
  classes: {},
  style: {}
};

const waitWithAct = async () => {
  // Act is used because the Redux store is updated during wait
  return act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

const mountComponent = async () => {
  const component = mount(
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    <Provider store={store}>
      {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: { request: { que... Remove this comment to see the full error message */}
      <MockedProvider mocks={apolloClientMock} addTypeName={false} removeTypename>
        <VirtualDetailsInviteeWidgetWrapper {...props} />
      </MockedProvider>
    </Provider>
  );
  // Wait for Apollo Client MockedProvider to render mock query results
  await waitWithAct();
  await component.update();
  return component;
};

describe('Virtual Details Invitee Widget', () => {
  it('matches snapshot', async () => {
    const component = await mountComponent();
    expect(component).toMatchSnapshot();
  });
});
