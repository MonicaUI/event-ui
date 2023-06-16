/* eslint-env jest */
import pageContainingWidgetFixture from '../../../testUtils/pageContainingWidgetFixture';
import { expect } from '@jest/globals';
// eslint-disable-next-line jest/no-mocks-import
import { getRegistrationTypeResults } from '../__mocks__/apolloClient';
import { cloneDeep, set } from 'lodash';
import { getAnswer, getAttendeeType } from '../regTypeUtils';

// eslint-disable-next-line jest/no-export
export const genericRegistrationTypeData = [...getRegistrationTypeResults];

const baseState = {
  text: {
    locale: 'en'
  },
  event: {
    registrationTypes: {},
    eventFeatureSetup: {
      registrationProcess: {
        multipleRegistrationTypes: true
      },
      agendaItems: {
        admissionItems: false
      }
    },
    id: 'EVENT_ID',
    version: 'VERSION'
  },
  website: {
    ...pageContainingWidgetFixture('pageId', 'widgetId'),
    pluginData: {
      registrationProcessNavigation: {
        registrationPaths: {
          regPathId: {
            id: 'regPathId',
            pageIds: ['pageId']
          }
        }
      }
    }
  },
  appData: {
    registrationSettings: {
      registrationPaths: {
        regPathId: {
          registrationTypeSettings: {
            limitVisibility: false
          },
          guestRegistrationSettings: {
            registrationTypeSettings: {
              limitVisibility: false
            }
          },
          accessRules: {
            invitationListAccess: {
              isEmailOnlyInvite: false
            }
          }
        }
      }
    }
  },
  userSession: {
    regCartId: 'REG_CART_ID'
  },
  defaultUserSession: {
    isPreview: false
  },
  registrationForm: {
    regCart: {
      eventRegistrations: {
        eventRegId: {
          registrationPathId: 'regPathId'
        }
      },
      regCartId: 'REG_CART_ID'
    }
  },
  limits: {
    perEventLimits: {
      maxNumberOfGuests: {
        limit: 10
      }
    }
  },
  experiments: {
    graphQLForEventCapacitiesVariant: 1
  },
  environment: 'TEST'
};

const cloneState = state => {
  const clonedState = cloneDeep(state);
  set(
    clonedState,
    ['widgetFactory', 'loadMetaData'],
    jest.fn(() => {
      return {};
    })
  );
  return clonedState;
};

describe('Utils registration types -', () => {
  test('utils answers', () => {
    const initialState = cloneState(baseState);
    const props = {
      config: {
        registrationFieldPageType: 'TEST'
      }
    };
    const answer = getAnswer(initialState, props);
    expect(answer?.setterAction?.payload?.path?.length).toEqual(3);
  });
  test('utils attendee types', () => {
    const initialState = cloneState(baseState);
    const props = {
      config: {
        registrationFieldPageType: 4
      }
    };
    const attendeeType = getAttendeeType(initialState, props);
    expect(attendeeType).toEqual('GUEST');
  });
});
