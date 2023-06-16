/* global */
import React from 'react';
import { mount } from 'enzyme';
import { openSubstituteRegistrationDialog } from '../SubstituteRegistrationDialog';
import SubstituteRegistrationForm from '../SubstituteRegistrationDialog/SubstituteRegistrationForm';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { Provider } from 'react-redux';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../__mocks__/documentElementMock';
getMockedMessageContainer();

const defaultProps = {
  title: 'Dummy title',
  requestClose: jest.fn(),
  translate: jest.fn(),
  onSubmit: jest.fn(),
  onChange: jest.fn(),
  resetSubstituteRegistration: jest.fn(),
  substituteRegistrationSuccess: false,
  substituteRegistrationError: false,
  autoFocus: true,
  firstName: '',
  lastName: '',
  emailAddress: '',
  hasConfirmed: false,
  getConfirmation: jest.fn(),
  denyConfirmation: jest.fn(),
  style: {},
  classes: {}
};
const widgetStyles = {
  popupWindowStyles: {
    modalHeaderStyles: {
      styleMapping: 'header2'
    },
    modalInstructionalTextStyles: {
      styleMapping: 'body1'
    },
    modalPopupFieldStyles: {
      styleMapping: 'input',
      customSettings: {
        text: {
          textAlign: 'left'
        }
      }
    },
    modalPopupLabelStyles: {
      styleMapping: 'label',
      customSettings: {
        text: {
          textAlign: 'left'
        }
      }
    },
    modalSubmitButtonStyles: {
      styleMapping: 'primaryButton',
      customSettings: {
        text: {
          textAlign: 'center'
        }
      }
    }
  }
};
describe('SubstituteRegistrationDialog', () => {
  test('matches snapshot when opened', () => {
    const store = createStoreWithMiddleware(
      combineReducers({
        dialogContainer,
        website: (x = {}) => x,
        text: (x = {}) => x,
        registrationSubstitution: (x = {}) => x
      }),
      {
        website: EventSnapshot.eventSnapshot.siteEditor.website,
        text: {
          translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
        },
        registrationSubstitution: {
          substitutionForm: {
            firstName: '',
            lastName: '',
            emailAddress: ''
          },
          autoFocus: false,
          showConfirmationMessage: false,
          hasConfirmed: false,
          substituteRegistrationSuccess: false,
          substituteRegistrationError: false,
          validationList: null
        }
      }
    );
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openSubstituteRegistrationDialog('Dummy title', widgetStyles));
    expect(dialog).toMatchSnapshot();
  });
  test('matches snapshot when submit button is clicked', () => {
    const store = createStoreWithMiddleware(
      combineReducers({
        dialogContainer,
        website: (x = {}) => x,
        text: (x = {}) => x,
        registrationSubstitution: (x = {}) => x
      }),
      {
        website: EventSnapshot.eventSnapshot.siteEditor.website,
        text: {
          translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
        },
        registrationSubstitution: {
          substitutionForm: {
            firstName: 'firstName',
            lastName: 'lastName',
            emailAddress: 'emailAddress'
          },
          autoFocus: true,
          showConfirmationMessage: true,
          hasConfirmed: false,
          substituteRegistrationSuccess: false,
          substituteRegistrationError: false
        }
      }
    );
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openSubstituteRegistrationDialog('Dummy title', widgetStyles));
    expect(dialog).toMatchSnapshot();
  });
  test('matches snapshot when submit button is clicked but validation is thrown', () => {
    const store = createStoreWithMiddleware(
      combineReducers({
        dialogContainer,
        website: (x = {}) => x,
        text: (x = {}) => x,
        registrationSubstitution: (x = {}) => x
      }),
      {
        website: EventSnapshot.eventSnapshot.siteEditor.website,
        text: {
          translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
        },
        registrationSubstitution: {
          validationList: ['This is a Validation.', 'This is another Validation.'],
          substitutionForm: {
            firstName: 'firstName',
            lastName: 'lastName',
            emailAddress: 'emailAddress'
          },
          autoFocus: true,
          showConfirmationMessage: false,
          hasConfirmed: false,
          substituteRegistrationSuccess: false,
          substituteRegistrationError: false
        }
      }
    );
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openSubstituteRegistrationDialog('Dummy title', widgetStyles));
    expect(dialog).toMatchSnapshot();
  });
  test('matches snapshot when submit button is clicked but this is concurrent action', () => {
    const store = createStoreWithMiddleware(
      combineReducers({
        dialogContainer,
        website: (x = {}) => x,
        text: (x = {}) => x,
        registrationSubstitution: (x = {}) => x
      }),
      {
        website: EventSnapshot.eventSnapshot.siteEditor.website,
        text: {
          translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
        },
        registrationSubstitution: {
          validationList: [],
          substitutionForm: {
            firstName: 'firstName',
            lastName: 'lastName',
            emailAddress: 'emailAddress'
          },
          autoFocus: true,
          showConfirmationMessage: false,
          hasConfirmed: false,
          substituteRegistrationSuccess: false,
          substituteRegistrationError: false,
          showConcurrentActionMessage: true,
          cartAborted: false
        }
      }
    );
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openSubstituteRegistrationDialog('Dummy title', widgetStyles));
    expect(dialog).toMatchSnapshot();
  });
  test('matches snapshot when confirmed', () => {
    const store = createStoreWithMiddleware(
      combineReducers({
        dialogContainer,
        website: (x = {}) => x,
        text: (x = {}) => x,
        registrationSubstitution: (x = {}) => x
      }),
      {
        website: EventSnapshot.eventSnapshot.siteEditor.website,
        text: {
          translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
        },
        registrationSubstitution: {
          substitutionForm: {
            firstName: 'firstName',
            lastName: 'lastName',
            emailAddress: 'emailAddress'
          },
          autoFocus: true,
          showConfirmationMessage: false,
          hasConfirmed: true,
          substituteRegistrationSuccess: true,
          substituteRegistrationError: false
        }
      }
    );
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openSubstituteRegistrationDialog('Dummy title', widgetStyles));
    expect(dialog).toMatchSnapshot();
  });
  test('matches snapshot when aborted', () => {
    const store = createStoreWithMiddleware(
      combineReducers({
        dialogContainer,
        website: (x = {}) => x,
        text: (x = {}) => x,
        registrationSubstitution: (x = {}) => x
      }),
      {
        website: EventSnapshot.eventSnapshot.siteEditor.website,
        text: {
          translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
        },
        registrationSubstitution: {
          substitutionForm: {
            firstName: 'firstName',
            lastName: 'lastName',
            emailAddress: 'emailAddress'
          },
          autoFocus: true,
          showConfirmationMessage: false,
          hasConfirmed: true,
          substituteRegistrationSuccess: false,
          substituteRegistrationError: false,
          cartAborted: true
        }
      }
    );
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openSubstituteRegistrationDialog('Dummy title', widgetStyles));
    expect(dialog).toMatchSnapshot();
  });
  test('matches snapshot when confirmed but error out', () => {
    const store = createStoreWithMiddleware(
      combineReducers({
        dialogContainer,
        website: (x = {}) => x,
        text: (x = {}) => x,
        registrationSubstitution: (x = {}) => x
      }),
      {
        website: EventSnapshot.eventSnapshot.siteEditor.website,
        text: {
          translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
        },
        registrationSubstitution: {
          substitutionForm: {
            firstName: 'firstName',
            lastName: 'lastName',
            emailAddress: 'emailAddress'
          },
          autoFocus: true,
          showConfirmationMessage: false,
          hasConfirmed: true,
          substituteRegistrationSuccess: false,
          substituteRegistrationError: true
        }
      }
    );
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openSubstituteRegistrationDialog('Dummy title', widgetStyles));
    expect(dialog).toMatchSnapshot();
  });
  test('matches snapshot when submit button is disabled on concurrent validation', () => {
    const store = createStoreWithMiddleware(
      combineReducers({
        dialogContainer,
        website: (x = {}) => x,
        text: (x = {}) => x,
        registrationSubstitution: (x = {}) => x
      }),
      {
        website: EventSnapshot.eventSnapshot.siteEditor.website,
        text: {
          translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
        },
        registrationSubstitution: {
          substitutionForm: {
            firstName: 'firstName',
            lastName: 'lastName',
            emailAddress: 'emailAddress'
          },
          autoFocus: true,
          showConfirmationMessage: false,
          hasConfirmed: false,
          substituteRegistrationSuccess: false,
          substituteRegistrationError: false,
          disabledSubmitButton: true,
          validationList: [
            'This substituent is already a part of another substitution. Please try with other substituent or try again later.'
          ]
        }
      }
    );
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openSubstituteRegistrationDialog('Dummy title', widgetStyles));
    expect(dialog).toMatchSnapshot();
  });
});

describe('On popup', () => {
  test('should call handleClose with false param', () => {
    const props = {
      ...defaultProps,
      showConfirmationMessage: false
    };
    const wrapper = mount(<SubstituteRegistrationForm {...props} />);
    wrapper.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    expect(props.requestClose).toHaveBeenCalled();
    expect(props.resetSubstituteRegistration).toHaveBeenCalled();
  });
  test('should call denyConfirmationClicked with false param', () => {
    const props = {
      ...defaultProps,
      showConfirmationMessage: true
    };
    const wrapper = mount(<SubstituteRegistrationForm {...props} />);
    wrapper.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    expect(props.denyConfirmation).toHaveBeenCalled();
  });
  test('should call onSubmit with false param', () => {
    const props = {
      ...defaultProps,
      showConfirmationMessage: true
    };
    const wrapper = mount(<SubstituteRegistrationForm {...props} />);
    wrapper.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    expect(props.onSubmit).toHaveBeenCalled();
  });
});
