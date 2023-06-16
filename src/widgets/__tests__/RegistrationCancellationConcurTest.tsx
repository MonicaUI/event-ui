import { mount } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import { MockedProvider } from '@apollo/client/testing';
import { QueryResult } from '@apollo/client';
import configureStore from '../../redux/configureStore';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import RegistrationCancellationConcurWidget, {
  RegistrationCancellationConcurWithGraphQL,
  RegistrationCancellationConcurWithRedux
} from '../RegistrationCancellationConcur';
import { currentRegistrantOrGuestsHaveConcurBookings } from '../../redux/travelCart/airActuals';
import { isWidgetOnPath } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { useRegistrationPageVarietyPathQuery } from '../../apollo/siteEditor/pageVarietyPathQueryHooks';
import { GraphQLSiteEditorDataReleases } from '../../ExperimentHelper';

jest.mock('../../apollo/siteEditor/pageVarietyPathQueryHooks');
const mockedUseRegistrationPageVarietyPathQuery = useRegistrationPageVarietyPathQuery as jest.Mock<QueryResult>;

jest.mock('event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation', () => ({
  isWidgetOnPath: jest.fn(),
  getRegistrationPathIdForWidget: jest.fn()
}));
// @ts-expect-error ts-migrate(2339) FIXME: Property 'mockReturnValue' does not exist on type ... Remove this comment to see the full error message
isWidgetOnPath.mockReturnValue(true);

jest.mock('../../redux/travelCart/airActuals', () => ({
  currentRegistrantOrGuestsHaveConcurBookings: jest.fn()
}));
(currentRegistrantOrGuestsHaveConcurBookings as $TSFixMe).mockReturnValue(true);

const defaultProps = {
  classes: {},
  style: {},
  translate: c => c
};

const waitWithAct = async () => {
  // Act is used because the Redux store is updated during wait
  return act(async () => {
    await new Promise(resolve => setTimeout(resolve));
  });
};

function runTests(useGraphQLSiteEditorData) {
  const initialState = isConcurEnabled => ({
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
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    text: {
      translate: jest.fn()
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
    eventTravel: {
      airData: {
        isConcurEnabled
      }
    },
    dialogContainer: {
      dialog: {
        requestClose: jest.fn()
      }
    },
    experiments: {
      useGraphQLSiteEditorData
    }
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const setMocks = (registrantsHaveConcurBookings, isConcurWidgetEnabled) => {
    (currentRegistrantOrGuestsHaveConcurBookings as $TSFixMe).mockReturnValue(registrantsHaveConcurBookings);
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockReturnValue' does not exist on type ... Remove this comment to see the full error message
    isWidgetOnPath.mockReturnValue(isConcurWidgetEnabled);
    mockedUseRegistrationPageVarietyPathQuery.mockReturnValue({
      data: {
        event: {
          registrationPath: {
            registration: {
              concur: {
                enabled: isConcurWidgetEnabled
              }
            }
          }
        }
      }
    } as QueryResult);
  };

  const mountComponent = async (isConcurEnabled, registrantsHaveConcurBookings, isConcurWidgetEnabled) => {
    setMocks(registrantsHaveConcurBookings, isConcurWidgetEnabled);
    const mockStore = configureStore(initialState(isConcurEnabled), {}, {});
    const widget = await mount(
      <Provider store={mockStore}>
        <MockedProvider mocks={[]} addTypename={false}>
          <RegistrationCancellationConcurWidget {...defaultProps} />
        </MockedProvider>
      </Provider>
    );
    await waitWithAct();
    await widget.update();
    return widget;
  };

  it('should render based on experiment wrapper', async () => {
    const component = await mountComponent(true, true, true);
    expect(component.exists(RegistrationCancellationConcurWithGraphQL)).toEqual(!!useGraphQLSiteEditorData);
    expect(component.exists(RegistrationCancellationConcurWithRedux)).toEqual(!useGraphQLSiteEditorData);
  });

  it('should render', async () => {
    const widget = await mountComponent(true, true, true);
    expect(widget.exists('[data-cvent-id="redirect-concur"]')).toBeTruthy();
  });

  it('should not render if concur is not enabled', async () => {
    const widget = await mountComponent(false, true, true);
    expect(widget.isEmptyRender()).toBeTruthy();
  });

  it('should not render if concur widget is not in reg path', async () => {
    const widget = await mountComponent(true, false, true);
    expect(widget.isEmptyRender()).toBeTruthy();
  });

  it('should not render if there are no concur bookings', async () => {
    const widget = await mountComponent(true, true, false);
    expect(widget.isEmptyRender()).toBeTruthy();
  });
}

describe('RegistrationCancellationConcur', () => {
  describe('Use GraphQL widget data', () => {
    runTests(GraphQLSiteEditorDataReleases.Development);
  });
  describe('Use Redux widget data', () => {
    runTests(GraphQLSiteEditorDataReleases.Off);
  });
});
