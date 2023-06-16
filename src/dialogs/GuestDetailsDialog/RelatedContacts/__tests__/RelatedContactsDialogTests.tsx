import React from 'react';
import { Provider } from 'react-redux';
import RelatedContacts, { RelatedContactsWithGraphQL, RelatedContactsWithRedux } from '../RelatedContacts';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { merge } from 'lodash';
import { MockedProvider } from '@apollo/client/testing';
import EventSnapshot from '../../../../../fixtures/EventSnapshot.json';
import configureStore from '../../../../redux/configureStore';
import * as actions from '../../../../redux/addGuestFromRelatedContacts/actions';
import { getGuestRegistrationPageWidget } from '../../../../redux/website/pageContents';
// eslint-disable-next-line jest/no-mocks-import
import { getApolloClientMocks } from '../__mocks__/apolloClient';
import createCache from '../../../../apollo/apolloCache';
import { eventSnapshotVersionVar } from '../../../../redux/actions';
import { GraphQLSiteEditorDataReleases } from '../../../../ExperimentHelper';

const spyClearRelatedContactsSearchData = jest.spyOn(actions, 'clearRelatedContactsSearchData');

jest.mock('../../../../redux/website/pageContents', () => ({
  getGuestRegistrationPageWidget: jest.fn(() => () => {})
}));
jest.mock('../../../../apollo/siteEditor/pageVarietyPathQueryHooks', () => ({
  __esModule: true,
  ...jest.requireActual<$TSFixMe>('../__mocks__/pageVarietyPathQueryHooks')
}));

const mockRelatedContactsDialogText = {
  headerText: 'AddGuestHeaderText',
  addGuestButtonText: 'AddGuestButtonText',
  backButtonText: 'BackButton',
  searchButtonText: 'RelatedContactsSearch'
};

const mockRelatedContactsDialogStyle = {
  relatedContactsModalStyles: {
    modalHeaderStyle: {
      styleMapping: 'header2',
      customSettings: {
        text: {
          fontSize: 30,
          textAlign: 'left'
        }
      }
    },
    modalInstructionalTextStyle: {
      styleMapping: 'body1',
      customSettings: {
        text: {
          textAlign: 'center',
          fontSize: 22
        },
        spacing: {
          padding: {
            paddingTop: 64,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0
          }
        }
      }
    },
    modalFieldStyle: {
      styleMapping: 'input',
      customSettings: {
        text: {
          textAlign: 'left'
        }
      }
    },
    modalSearchButtonStyle: {
      styleMapping: 'primaryButton'
    },
    modalAddGuestButtonStyle: {
      styleMapping: 'primaryButton'
    },
    modalBackButtonStyle: {
      styleMapping: 'secondaryButton'
    },
    modalGuestNameStyle: {
      styleMapping: 'label',
      customSettings: {
        text: {
          textAlign: 'left',
          fontSize: 22
        },
        spacing: {
          paddingTop: 16,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0
        }
      }
    },
    modalGuestEmailStyle: {
      styleMapping: 'label',
      customSettings: {
        text: {
          textAlign: 'left',
          fontSize: 16
        },
        spacing: {
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 10
        }
      }
    },
    modalListNameStyle: {
      styleMapping: 'label',
      customSettings: {
        text: {
          textAlign: 'left',
          fontSize: 14
        },
        spacing: {
          paddingTop: 10,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0
        }
      }
    }
  }
};

(getGuestRegistrationPageWidget as $TSFixMe).mockImplementation(() => {
  return {
    config: {
      relatedContactsModalText: mockRelatedContactsDialogText,
      style: {
        relatedContactsModalStyles: mockRelatedContactsDialogStyle
      }
    }
  };
});

const defaultProps = {
  translate: c => c
};

const initialState = {
  registrationForm: {
    regCart: {
      regCartId: 'some-regCart-id',
      eventRegistrations: {
        primaryEventRegId: {
          eventRegistrationId: 'primaryEventRegId',
          registrationTypeId: '001',
          registrationPathId: 'testRegPath',
          attendeeType: 'ATTENDEE',
          attendee: {
            personalInformation: {
              contactId: 'some-contact-id'
            }
          }
        },
        guestEventRegId: {
          eventRegistrationId: 'guestEventRegId',
          primaryRegistrationId: 'primaryEventRegId',
          registrationTypeId: '001',
          registrationPathId: 'testRegPath',
          attendeeType: 'GUEST'
        }
      }
    },
    currentGuestEventRegistration: {
      eventRegistrationId: 'guestEventRegId'
    }
  },
  website: {
    theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
  },
  text: {
    translate: () => {}
  },
  addGuestFromRelatedContacts: {
    'some-contact-id': {
      relatedContacts: [
        {
          firstName: 'firstName21',
          lastName: 'lastName21',
          emailAddress: 'emailAddress21',
          relatedContactStub: 'relatedContactStub21'
        }
      ]
    }
  },
  dialogContainer: {
    dialog: {
      requestClose: () => {}
    }
  },
  experiments: {
    useGraphQLSiteEditorData: GraphQLSiteEditorDataReleases.Off
  }
};

const stateWithEmptyRelatedContactsList = {
  addGuestFromRelatedContacts: {
    'some-contact-id': {
      relatedContacts: []
    }
  }
};

const waitWithAct = async () => {
  // Act is used because the Redux store is updated during wait
  return act(async () => {
    await new Promise(resolve => setTimeout(resolve));
  });
};
const runTests = useGraphQLSiteEditorData => {
  let mockStore;
  const mountComponent = async (optionalProps = {}, optionalState = {}) => {
    const mergedState = merge({}, initialState, optionalState);
    if ((optionalState as $TSFixMe).addGuestFromRelatedContacts)
      mergedState.addGuestFromRelatedContacts = (optionalState as $TSFixMe).addGuestFromRelatedContacts;
    mergedState.experiments.useGraphQLSiteEditorData = useGraphQLSiteEditorData;
    const props = merge({}, defaultProps, optionalProps);
    mockStore = configureStore(mergedState, {}, {});
    eventSnapshotVersionVar('');
    const component = mount(
      <Provider store={mockStore}>
        <MockedProvider
          mocks={getApolloClientMocks({
            relatedContactsModalStyles: mockRelatedContactsDialogStyle.relatedContactsModalStyles,
            relatedContactsModalText: mockRelatedContactsDialogText
          })}
          cache={createCache(mockStore, {
            eventId: '',
            environment: ''
          })}
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: MockedResponse<R... Remove this comment to see the full error message
          addTypeName={false}
        >
          <RelatedContacts {...props} />
        </MockedProvider>
      </Provider>
    );
    // Wait for Apollo Client MockedProvider to render mock query results
    await waitWithAct();
    await component.update();
    return component;
  };

  describe('Related Contacts Dialog GraphQL', () => {
    it('dialog should render based on experiment wrapper', async () => {
      const component = await mountComponent();
      expect(component.exists(RelatedContactsWithGraphQL)).toEqual(!!useGraphQLSiteEditorData);
      expect(component.exists(RelatedContactsWithRedux)).toEqual(!useGraphQLSiteEditorData);
    });
  });
  describe('Test Related Contacts Dialog', () => {
    it('dialog should render with populated list', async () => {
      const component = await mountComponent();
      const listComponent = component.find('RelatedContactsList');
      expect(listComponent.find('[data-cvent-id="no-data-message"]').length).toBe(0);
    });

    it('dialog should render with no data message and search should be disabled', async () => {
      const component = await mountComponent({}, stateWithEmptyRelatedContactsList);
      const listComponent = component.find('RelatedContactsList');
      expect(listComponent.find('[data-cvent-id="no-data-message"]').length).toBe(1);
      expect(component.find('[data-cvent-id="related-contact-search-textbox"]')).toHaveLength(0);
      expect(component.find('[data-cvent-id="search-button"]')).toHaveLength(0);
    });

    it('add guest button should be disabled if no related contact is selected', async () => {
      const component = await mountComponent();
      expect(component.find('[data-cvent-id="add-guest-button"]').get(0).props.disabled).toBeTruthy();
    });

    it('add guest button should not be disabled if a related contact is selected', async () => {
      const component = await mountComponent();
      const listComponent = component.find('RelatedContactsList');
      listComponent.find('InteractiveElement').simulate('click');
      expect(component.find('[data-cvent-id="add-guest-button"]').get(0).props.disabled).toBeFalsy();
    });

    it('clearRelatedContactsSearchData is called on click of back button', async () => {
      const component = await mountComponent();
      const backButton = component.find('[data-cvent-id="back-button"]').at(0);
      backButton.simulate('click');
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
      await waitWithAct(component);
      expect(spyClearRelatedContactsSearchData).toHaveBeenCalled();
    });
  });

  describe('test search textbox and search button', () => {
    it('search button should be enabled when pop-up opens', async () => {
      const component = await mountComponent();
      expect(component.find('[data-cvent-id="search-button"]').get(0).props.disabled).toBeFalsy();
    });

    it('search button should be disabled when search-criteria is less than 3 characters', async () => {
      const component = await mountComponent();
      const textbox = component.find('[data-cvent-id="related-contact-search-textbox"]').at(0);
      textbox.props().onChange('blah', 'em');
      textbox.simulate('change');
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
      await waitWithAct(component);
      expect(component.find('[data-cvent-id="search-button"]').at(0).props().disabled).toBe(true);
    });

    it('search button should be enabled when search-criteria is greater than or equal to 3 characters', async () => {
      const component = await mountComponent();
      const textbox = component.find('[data-cvent-id="related-contact-search-textbox"]').at(0);
      textbox.props().onChange('blah', 'email');
      textbox.simulate('change');
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
      await waitWithAct(component);
      expect(component.find('[data-cvent-id="search-button"]').at(0).props().disabled).toBe(false);
    });

    it('search should be visible when there are related contacts but no related contacts in search result', async () => {
      const component = await mountComponent();
      const textbox = component.find('[data-cvent-id="related-contact-search-textbox"]').at(0);
      textbox.props().onChange('unknown-guest', 'email');
      textbox.simulate('change');
      const searchButton = component.find('[data-cvent-id="search-button"]').at(0);
      searchButton.simulate('click');
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
      await waitWithAct(component);
      expect(component.find('[data-cvent-id="related-contact-search-textbox"]')).not.toHaveLength(0);
      expect(component.find('[data-cvent-id="search-button"]')).not.toHaveLength(0);
    });

    it('no change in regCart when coming from edit link after closing addRelatedContacts popup', async () => {
      const component = await mountComponent({}, stateWithEmptyRelatedContactsList);
      component.find('[data-cvent-id="close"]').hostNodes().simulate('click');
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
      await waitWithAct(component);
      expect(mockStore.getState().registrationForm.regCart).toMatchObject(initialState.registrationForm.regCart);
    });
  });

  describe('test Add Guest Button', () => {
    it('show Add Guest button when related contacts exists', async () => {
      const component = await mountComponent();
      expect(component.find('[data-cvent-id="add-guest-button"]')).not.toHaveLength(0);
    });

    it('hide Add Guest button when no related contacts', async () => {
      const component = await mountComponent({}, stateWithEmptyRelatedContactsList);
      expect(component.find('[data-cvent-id="add-guest-button"]')).toHaveLength(0);
    });
  });
};

describe('RelatedContactsDialog', () => {
  describe('Use GraphQL widget data', () => {
    runTests(GraphQLSiteEditorDataReleases.Development);
  });
  describe('Use Redux widget data', () => {
    runTests(GraphQLSiteEditorDataReleases.Off);
  });
});
