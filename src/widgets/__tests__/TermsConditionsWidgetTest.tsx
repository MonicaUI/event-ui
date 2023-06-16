import React from 'react';
import { mount } from 'enzyme';
import TermsConditionsWidget from '../TermsConditionsWidget';
import { setEventRegistrationFieldValue } from '../../redux/registrationForm/regCart/actions';
jest.mock('../../redux/registrationForm/regCart/actions');

const eventRegistrationId = 'eventRegistrationId1';
let isRegMode = false;
function getState() {
  return {
    event: {
      timezone: 2
    },
    timezones: {},
    registrationForm: {
      currentEventRegistrationId: [eventRegistrationId],
      regCart: {
        regCartId: 'regCartId',
        regMod: isRegMode,
        eventRegistrations: {
          [eventRegistrationId]: {
            eventRegistrationId,
            attendee: {
              termsConditionsAccepted: false,
              personalInformation: {}
            },
            registrationStatus: 'REGISTERED'
          }
        }
      }
    }
  };
}
async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState);
  }
}

const subscribe = () => {};
const props = {
  store: { dispatch, getState, subscribe },
  translate: (res, opts) => (opts ? `${res}:${JSON.stringify(opts)}` : res),
  style: {
    palette: {
      primary: ''
    }
  },
  config: {
    headerText: '',
    instructionalText: '',
    termsConditionsText: ''
  }
};

describe('TermsConditionsWidget', () => {
  test('should render when not hidden', () => {
    const widget = mount(<TermsConditionsWidget {...props} />);
    expect(widget).toMatchSnapshot();
    widget.find('[id="agreementText_0"]').simulate('change');
    expect(setEventRegistrationFieldValue).toHaveBeenCalledWith(
      eventRegistrationId,
      ['attendee', 'termsAndConditionsAccepted'],
      true
    );
  });

  test('should not render when hidden', () => {
    isRegMode = true;
    const updatedProps = { ...props };
    const widget = mount(<TermsConditionsWidget {...updatedProps} />);
    expect(widget).toMatchSnapshot();
  });

  test('should not render when previous reg cart is reg mod,and current reg cart is in TRANSIENT', () => {
    const state = getState();
    function getLocalState() {
      return {
        ...state,
        registrationForm: {
          ...state.registrationForm,
          regCart: {
            ...state.registrationForm.regCart,
            regMod: false,
            status: 'TRANSIENT'
          }
        },
        regCartStatus: {
          lastSavedRegCart: {
            regMod: true
          }
        }
      };
    }
    const updatedProps = {
      ...props,
      store: { dispatch, getState: getLocalState, subscribe }
    };
    const widget = mount(<TermsConditionsWidget {...updatedProps} />);
    expect(widget).toMatchSnapshot();
  });
});
