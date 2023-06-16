/* global */
/* eslint-env jest */
import SubstituteRegistrationWidget from '../RegistrationSubstitution/SubstituteRegistrationWidget';
import React from 'react';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import renderer from 'react-test-renderer';
import pageContainerWidgetFixture from '../../testUtils/pageContainingWidgetFixture';
import { mount } from 'enzyme';
import { SubstituteRegistrantWidgetWithHoverMessage } from '../RegistrationSubstitution/SubstituteRegistrationWidget';

jest.mock('../../dialogs', () => {
  return {
    openSubstituteRegistrationDialog: jest.fn(() => () => {})
  };
});

function getState() {
  return {
    environment: 'S437',
    event: {
      status: 2,
      products: {
        admissionItems: {
          '3349dc98-e303-4bf9-b698-e1bdae85f946': {
            id: '3349dc98-e303-4bf9-b698-e1bdae85f946'
          }
        }
      },
      registrationTypes: {
        'b8e50dbf-7437-4eec-a964-bc27d79d0372': {
          id: 'b8e50dbf-7437-4eec-a964-bc27d79d0372'
        }
      }
    },
    registrationForm: {
      regCart: {
        status: 'TRANSIENT',
        eventRegistrations: {
          123456789: {
            eventRegistrationId: '123456789',
            registrationTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0372',
            registrationPathId: 'b8e50dbf-7437-4eec-a964-bc27d79d0373',
            productRegistrations: [
              {
                productId: '3349dc98-e303-4bf9-b698-e1bdae85f946',
                productType: 'AdmissionItem',
                requestedAction: 'REGISTER'
              }
            ]
          }
        }
      }
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          'b8e50dbf-7437-4eec-a964-bc27d79d0373': {
            substituteRegistrationSettings: {
              isEnabled: true,
              deadline: 1905996943175
            }
          }
        }
      }
    },
    website: {
      pluginData: {
        registrationProcessNavigation: {
          registrationPaths: {
            'b8e50dbf-7437-4eec-a964-bc27d79d0373': {
              id: 'b8e50dbf-7437-4eec-a964-bc27d79d0373',
              postRegPageIds: ['confirmation']
            }
          }
        }
      },
      ...pageContainerWidgetFixture('confirmation', 'substituteRegistration')
    }
  };
}

const reducer = state => state;
const mockStore = createStore(reducer, getState(), applyMiddleware(thunk));
let defaultProps = {
  id: 'substituteRegistration',
  config: {
    text: 'Transfer Registration'
  },
  classes: {},
  style: {},
  translate: text => text,
  store: mockStore
};
describe('SubstituteRegistrationWidget', () => {
  it('exists', () => {
    expect(SubstituteRegistrationWidget).toBeDefined();
  });
  it('Checking if it is rendering properly', () => {
    const widget = renderer.create(<SubstituteRegistrationWidget {...defaultProps} />);
    expect(widget).toMatchSnapshot();
  });
  it('Show hover message when widget is disabled', () => {
    const store = {
      ...getState(),
      travelCart: {
        cart: {
          bookings: [
            {
              airBookings: [{}, {}]
            }
          ]
        }
      }
    };
    defaultProps = {
      id: 'substituteRegistration',
      config: {
        text: 'Transfer Registration'
      },
      classes: {},
      style: {},
      translate: text => text,
      store: createStore(reducer, store, applyMiddleware(thunk))
    };
    const widget = renderer.create(<SubstituteRegistrationWidget {...defaultProps} />);
    expect(widget).toMatchSnapshot();
  });
  it('Test button click', () => {
    const props = {
      title: 'Dummy title',
      translate: jest.fn(),
      style: {},
      classes: {},
      kind: 'button',
      disabled: false,
      hoverMessage: 'dummy message',
      config: {
        text: 'Transfer Registration'
      },
      clickHandler: jest.fn()
    };
    const wrapper = mount(<SubstituteRegistrantWidgetWithHoverMessage {...props} />);
    wrapper.find('[data-cvent-id="widget-button"]').hostNodes().simulate('click');
    expect(wrapper).toMatchSnapshot();
  });
});
