/* global */
import React from 'react';
import { mount } from 'enzyme';
import { openInvitationForwardingDialog, boundCloseDialog } from '../InvitationForwardingDialog';
import InvitationForwardingForm from '../InvitationForwardingDialog/InvitationForwardingForm';
import InvitationForm from '../InvitationForwardingDialog/InvitationForm';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { Provider } from 'react-redux';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../__mocks__/documentElementMock';
getMockedMessageContainer();

describe('InvitationForwardingDialog', () => {
  test('matches snapshot when opened with Additional Comments', () => {
    const store = createStoreWithMiddleware(
      combineReducers({
        dialogContainer,
        website: (x = {}) => x,
        text: (x = {}) => x,
        invitationForwarding: (x = {}) => x
      }),
      {
        website: EventSnapshot.eventSnapshot.siteEditor.website,
        text: {
          translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
        },
        invitationForwarding: {
          invitationForwardingSuccess: false,
          invitationForwardingError: false,
          autoFocus: true,
          entityList: []
        }
      }
    );
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(
      openInvitationForwardingDialog({
        title: 'dummy title',
        invitationForwardingSettings: {
          isCustomMessageEnabled: true
        }
      })
    );
    expect(dialog).toMatchSnapshot();
  });
  test('matches snapshot when popup is closed', () => {
    const store = createStoreWithMiddleware(
      combineReducers({
        dialogContainer,
        website: (x = {}) => x,
        text: (x = {}) => x,
        invitationForwarding: (x = {}) => x
      }),
      {
        website: EventSnapshot.eventSnapshot.siteEditor.website,
        text: {
          translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
        },
        invitationForwarding: {
          invitationForwardingSuccess: false,
          invitationForwardingError: false,
          autoFocus: true,
          entityList: []
        }
      }
    );
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(boundCloseDialog());
    expect(dialog).toMatchSnapshot();
  });
  test('matches snapshot when opened without Additional Comments', () => {
    const store = createStoreWithMiddleware(
      combineReducers({
        dialogContainer,
        website: (x = {}) => x,
        text: (x = {}) => x,
        invitationForwarding: (x = {}) => x
      }),
      {
        website: EventSnapshot.eventSnapshot.siteEditor.website,
        text: {
          translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
        },
        invitationForwarding: {
          invitationForwardingSuccess: false,
          invitationForwardingError: false,
          autoFocus: true,
          entityList: []
        }
      }
    );
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(
      openInvitationForwardingDialog({
        title: 'dummy title',
        invitationForwardingSettings: {
          isCustomMessageEnabled: false
        }
      })
    );
    expect(dialog).toMatchSnapshot();
  });
});

describe('On popup', () => {
  test('should call handleClose with false param', () => {
    const props = {
      title: 'Dummy title',
      requestClose: jest.fn(),
      translate: jest.fn(),
      onSubmit: jest.fn(),
      resetInvitationForwarding: jest.fn(),
      invitationForwardingSettings: {
        isCustomMessageEnabled: false,
        invitationForwardingSuccess: false,
        invitationForwardingError: false,
        autoFocus: true
      },
      style: {},
      classes: {}
    };
    const wrapper = mount(<InvitationForwardingForm {...props} />);
    wrapper.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    expect(props.requestClose).toHaveBeenCalled();
    expect(props.resetInvitationForwarding).toHaveBeenCalled();
  });
  test('should call methods with false param', () => {
    const props = {
      classes: {},
      style: {},
      showAdditionalCommentSection: true,
      onChange: jest.fn(),
      onAddAnother: jest.fn(),
      onSubmit: jest.fn(),
      translate: jest.fn(),
      autoFocus: true,
      formData: {
        firstName: 'Reetika',
        lastName: 'Raj',
        emailAddress: 'r.raj@cvent.com',
        comments: 'No'
      },
      onCancel: jest.fn(),
      validation: {
        firstNameValidation: jest.fn(),
        lastNameValidation: jest.fn(),
        emailAddressValidation: jest.fn()
      }
    };
    const wrapper = mount(<InvitationForm {...props} />);
    wrapper.find('[data-cvent-id="add-another-button"]').hostNodes().simulate('click');
    expect(props.onAddAnother).toHaveBeenCalled();
    wrapper.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    expect(props.onSubmit).toHaveBeenCalled();
    wrapper.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    expect(props.onCancel).toHaveBeenCalled();
  });
  test('handleEnter method call', () => {
    const props = {
      classes: {},
      style: {},
      showAdditionalCommentSection: true,
      onChange: jest.fn(),
      onAddAnother: jest.fn(),
      onSubmit: jest.fn(),
      translate: jest.fn(),
      autoFocus: true,
      formData: {
        firstName: 'Reetika',
        lastName: 'Raj',
        emailAddress: 'r.raj@cvent.com',
        comments: 'No'
      },
      onCancel: jest.fn(),
      validation: {
        firstNameValidation: jest.fn(),
        lastNameValidation: jest.fn(),
        emailAddressValidation: jest.fn()
      }
    };
    const invitationForm = mount(<InvitationForm {...props} />);
    const event = { key: 'Enter' };
    const formInstance = invitationForm.instance();
    formInstance.formRef.current = {
      nucleusForm: {
        actions: {
          submitForm: jest.fn(() => ({ catch: () => {} }))
        }
      }
    };

    // handle enter method triggered
    formInstance.handleEnter(event);
    const invitationFormRef = formInstance.formRef.current;
    expect(invitationFormRef.nucleusForm.actions.submitForm).toHaveBeenCalledWith(props.onSubmit, {
      validateBeforeSubmit: true
    });
  });
});
