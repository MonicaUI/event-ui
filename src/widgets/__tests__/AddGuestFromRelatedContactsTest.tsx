import React from 'react';
import AddGuestFromRelatedContacts from '../AddGuestFromRelatedContacts';
import { shallow, mount } from 'enzyme';
import { setIn } from 'icepick';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import { Grid } from 'nucleus-core/layout/flexbox';

const PRIMARY_INVITEE_REGISTRATION_ID = 'primaryEventRegId';

const defaultState = {
  appData: {
    registrationSettings: {
      registrationPaths: {
        'TEST-REGISTRATION-PATH': {
          isDefault: true,
          id: 'TEST-REGISTRATION-PATH',
          guestRegistrationSettings: {
            isGuestRegistrationTypeSelectionEnabled: true,
            canAddGuestFromRelatedContact: undefined
          }
        }
      }
    }
  },
  registrationForm: {
    regCart: {
      regCartId: 'regCartId',
      eventRegistrations: {
        [PRIMARY_INVITEE_REGISTRATION_ID]: {
          eventRegistrationId: PRIMARY_INVITEE_REGISTRATION_ID,
          eventId: 'EventAId',
          registrationTypeId: defaultRegistrationTypeId,
          attendee: {
            personalInformation: {
              firstName: 'shray',
              lastName: 'sahai',
              emailAddress: 's.sahai@j.mail',
              contactId: 'some-contact-id'
            }
          },
          attendeeType: 'ATTENDEE',
          productRegistrations: [
            {
              productId: 'admissionItemAId',
              productType: 'AdmissionItem',
              quantity: 1,
              requestedAction: 'REGISTER'
            }
          ],
          registrationPathId: 'TEST-REGISTRATION-PATH'
        }
      }
    }
  },
  addGuestFromRelatedContacts: {
    'some-contact-id': {
      relatedContacts: [
        {
          firstName: 'firstName11',
          lastName: 'lastName11',
          emailAddress: 'emailAddress11',
          relatedContactStub: 'relatedContactStub11'
        },
        {
          firstName: 'firstName12',
          lastName: 'lastName12',
          emailAddress: 'emailAddress12',
          relatedContactStub: 'relatedContactStub12'
        }
      ]
    }
  }
};

async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getStateWithAddGuestFromRelatedContactsSetting);
  }
}

const subscribe = jest.fn();
const defaultProps = {
  classes: {},
  style: {},
  translate: jest.fn(),
  isSiteEditorPreview: false,
  store: { dispatch, getState: getStateWithAddGuestFromRelatedContactsSetting, subscribe }
};

function getStateWithAddGuestFromRelatedContactsSetting(
  canAddGuestFromRelatedContact = false,
  isPopulateKnownInviteeInformation = false,
  isPlanner = false
) {
  let newState = defaultState;
  newState = setIn(
    newState,
    [
      'appData',
      'registrationSettings',
      'registrationPaths',
      'TEST-REGISTRATION-PATH',
      'guestRegistrationSettings',
      'canAddGuestFromRelatedContact'
    ],
    canAddGuestFromRelatedContact
  );
  newState = setIn(
    newState,
    [
      'appData',
      'registrationSettings',
      'registrationPaths',
      'TEST-REGISTRATION-PATH',
      'identityConfirmation',
      'populateKnownInviteeInformation'
    ],
    isPopulateKnownInviteeInformation
  );
  newState = setIn(newState, ['userSession', 'inviteeId'], undefined);
  return setIn(newState, ['defaultUserSession', 'isPlanner'], isPlanner);
}

describe('AddGuestFromRelatedContacts for guestSite should produce props from state', () => {
  test('when addGuestFromRelatedContactSetting is disabled', () => {
    const widget = shallow(<AddGuestFromRelatedContacts {...defaultProps} />);
    expect(widget.props()).toMatchSnapshot();
  });
  test('when addGuestFromRelatedContactSetting is enabled', () => {
    const newProps = {
      classes: {},
      style: {},
      translate: jest.fn(),
      store: {
        dispatch,
        getState: () => getStateWithAddGuestFromRelatedContactsSetting(true),
        subscribe
      }
    };
    const widget = shallow(<AddGuestFromRelatedContacts {...newProps} />);
    expect(widget.props()).toMatchSnapshot();
  });
  test('when addGuestFromRelatedContactSetting is enabled and widgetCanBeShownOnGuestSideSetting is enabled', () => {
    const newProps = {
      ...defaultProps,
      config: {
        text: 'Add Guest'
      },
      store: {
        dispatch,
        getState: () => getStateWithAddGuestFromRelatedContactsSetting(true, true),
        subscribe
      }
    };
    const widget = mount(
      <Grid>
        <AddGuestFromRelatedContacts {...newProps} />
      </Grid>
    );
    const wrapper = widget.find('AddGuestFromRelatedContactsWidget');
    expect(wrapper).toHaveLength(1);
    expect(wrapper.find('AddGuestFromRelatedContactsLinkTypeButton')).toHaveLength(1);
  });
  test('when addGuestFromRelatedContactSetting is enabled and widgetCanBeShownOnGuestSideSetting is disabled', () => {
    const newProps = {
      ...defaultProps,
      config: {
        text: 'Add Guest'
      },
      store: {
        dispatch,
        getState: () => getStateWithAddGuestFromRelatedContactsSetting(true, false),
        subscribe
      }
    };
    const widget = mount(
      <Grid>
        <AddGuestFromRelatedContacts {...newProps} />
      </Grid>
    );
    const wrapper = widget.find('AddGuestFromRelatedContactsWidget');
    expect(wrapper).toHaveLength(1);
    expect(wrapper.find('AddGuestFromRelatedContactsLinkTypeButton')).toHaveLength(0);
  });
  test('when addGuestFromRelatedContactSetting is enabled and planner mode is enabled', () => {
    const newProps = {
      ...defaultProps,
      config: {
        text: 'Add Guest'
      },
      store: {
        dispatch,
        getState: () => getStateWithAddGuestFromRelatedContactsSetting(true, false, true),
        subscribe
      }
    };
    const widget = mount(
      <Grid>
        <AddGuestFromRelatedContacts {...newProps} />
      </Grid>
    );
    const wrapper = widget.find('AddGuestFromRelatedContactsWidget');
    expect(wrapper).toHaveLength(1);
    expect(wrapper.find('AddGuestFromRelatedContactsLinkTypeButton')).toHaveLength(1);
  });
});
