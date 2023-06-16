import { createChoiceSelectors } from '../customFieldSelectors';
import * as mockAccount from 'event-widgets/redux/selectors/account';

test('useChoiceIds true when account and event languages differ', () => {
  const { filterChoicesByLinkLogic } = createChoiceSelectors();
  const eventRegistrationId = '1ca81b9d-4469-4f36-a97f-e215c9f08ad1';
  const state = {
    event: {
      eventLocalesSetup: {
        eventLocales: ['ja-JP']
      }
    },
    account: {
      settings: {
        defaultCultureCode: 'en-US'
      }
    },
    registrationForm: {
      regCart: {
        eventRegistrationId
      }
    }
  };
  const contactCustomField = {
    question: {
      questionTypeInfo: {
        linkLogic: {
          linkRules: [
            {
              parentChoice: 'd',
              childChoices: ['e067d996-fc79-4063-911e-ff0e9a9a2564.c']
            }
          ]
        },
        choices: [
          { text: 'fa0f63f3-9cd5-427d-82a4-7a2d312eb1e7.a' },
          { text: '091898da-b6b1-44b1-8bb9-baa9a4f67b0e.b' },
          { text: 'e067d996-fc79-4063-911e-ff0e9a9a2564.c' }
        ]
      }
    }
  };
  jest.spyOn(mockAccount, 'filterFieldChoicesByLinkLogic');
  filterChoicesByLinkLogic(state, contactCustomField, false);
  expect(mockAccount.filterFieldChoicesByLinkLogic).toHaveBeenCalledWith(contactCustomField, [], true);
});

test('useChoiceIds true when multiple languages', () => {
  const { filterChoicesByLinkLogic } = createChoiceSelectors();
  const eventRegistrationId = '1ca81b9d-4469-4f36-a97f-e215c9f08ad1';
  const state = {
    event: {
      eventFeaturesSetup: {
        website: {
          multipleLanguages: true
        }
      },
      eventLocalesSetup: {
        eventLocales: ['en-US', 'ja-JP']
      }
    },
    account: {
      settings: {
        defaultCultureCode: 'en-US'
      }
    },
    registrationForm: {
      regCart: {
        eventRegistrationId
      }
    }
  };
  const contactCustomField = {
    question: {
      questionTypeInfo: {
        linkLogic: {
          linkRules: [
            {
              parentChoice: 'd',
              childChoices: ['e067d996-fc79-4063-911e-ff0e9a9a2564.c']
            }
          ]
        },
        choices: [
          { text: 'fa0f63f3-9cd5-427d-82a4-7a2d312eb1e7.a' },
          { text: '091898da-b6b1-44b1-8bb9-baa9a4f67b0e.b' },
          { text: 'e067d996-fc79-4063-911e-ff0e9a9a2564.c' }
        ]
      }
    }
  };
  jest.spyOn(mockAccount, 'filterFieldChoicesByLinkLogic');
  filterChoicesByLinkLogic(state, contactCustomField, false);
  expect(mockAccount.filterFieldChoicesByLinkLogic).toHaveBeenCalledWith(contactCustomField, [], true);
});

test('useChoiceIds false when multipleLanguages is false', () => {
  const { filterChoicesByLinkLogic } = createChoiceSelectors();
  const eventRegistrationId = '1ca81b9d-4469-4f36-a97f-e215c9f08ad1';
  const state = {
    event: {
      eventFeaturesSetup: {
        website: {
          multipleLanguages: false
        }
      },
      eventLocalesSetup: {
        eventLocales: ['en-US']
      }
    },
    account: {
      settings: {
        defaultCultureCode: 'en-US'
      }
    },
    registrationForm: {
      regCart: {
        eventRegistrationId
      }
    }
  };
  const contactCustomField = {
    question: {
      questionTypeInfo: {
        linkLogic: {
          linkRules: [
            {
              parentChoice: 'd',
              childChoices: ['e067d996-fc79-4063-911e-ff0e9a9a2564.c']
            }
          ]
        },
        choices: [
          { text: 'fa0f63f3-9cd5-427d-82a4-7a2d312eb1e7.a' },
          { text: '091898da-b6b1-44b1-8bb9-baa9a4f67b0e.b' },
          { text: 'e067d996-fc79-4063-911e-ff0e9a9a2564.c' }
        ]
      }
    }
  };
  jest.spyOn(mockAccount, 'filterFieldChoicesByLinkLogic');
  filterChoicesByLinkLogic(state, contactCustomField, false);
  expect(mockAccount.filterFieldChoicesByLinkLogic).toHaveBeenCalledWith(contactCustomField, [], false);
});
