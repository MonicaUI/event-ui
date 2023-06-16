import { setSelectedValuesForChoices, getQuestionCategory } from '../utils';
import { getContactFieldForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { getLocalizedContactFieldForWidget, convertChoicesToBaseLanguage, setParentQuestionId } from '../utils';
import { OtherChoice, NAChoice } from '@cvent/nucleus-form-validations';

jest.mock('event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation');

describe('setSelectedValuesForChoices tests', () => {
  test('OtherChoice is not filtered from list', () => {
    const localizedChoices = [
      { id: 'choice-id-1', text: 'First Choice' },
      { id: 'choice-id-2', text: 'Second Choice' }
    ];
    const answer = {
      value: {
        selectedValues: ['(Lang1) Second Choice', OtherChoice]
      }
    };
    const baseChoices = [
      { id: 'choice-id-1', text: '(Lang1) First Choice' },
      { id: 'choice-id-2', text: '(Lang1) Second Choice' }
    ];
    const localizedAnswer = setSelectedValuesForChoices(answer, baseChoices, localizedChoices);
    expect(localizedAnswer.value.selectedValues[1]).toEqual(OtherChoice);
  });
  test('OtherChoice and NAChoice are not filtered from previous values', () => {
    const localizedChoices = [
      { id: 'choice-id-1', text: 'First Choice' },
      { id: 'choice-id-2', text: 'Second Choice' }
    ];
    const answer = {
      value: {
        selectedValues: ['(Lang1) Second Choice']
      },
      valueBeforeMod: {
        selectedValues: [OtherChoice, NAChoice]
      }
    };
    const baseChoices = [
      { id: 'choice-id-1', text: '(Lang1) First Choice' },
      { id: 'choice-id-2', text: '(Lang1) Second Choice' }
    ];
    const localizedAnswer = setSelectedValuesForChoices(answer, baseChoices, localizedChoices);
    expect(localizedAnswer.valueBeforeMod.selectedValues[0]).toEqual(OtherChoice);
    expect(localizedAnswer.valueBeforeMod.selectedValues[1]).toEqual(NAChoice);
  });
  test('NAChoice is not filtered from list', () => {
    const localizedChoices = [
      { id: 'choice-id-1', text: 'First Choice' },
      { id: 'choice-id-2', text: 'Second Choice' }
    ];
    const answer = {
      value: {
        selectedValues: ['(Lang1) Second Choice', NAChoice]
      }
    };
    const baseChoices = [
      { id: 'choice-id-1', text: '(Lang1) First Choice' },
      { id: 'choice-id-2', text: '(Lang1) Second Choice' }
    ];
    const localizedAnswer = setSelectedValuesForChoices(answer, baseChoices, localizedChoices);
    expect(localizedAnswer.value.selectedValues[1]).toEqual(NAChoice);
  });
  test('SelectedValues is in base language', () => {
    const localizedChoices = [
      { id: 'choice-id-1', text: 'First Choice' },
      { id: 'choice-id-2', text: 'Second Choice' }
    ];
    const answer = {
      value: {
        selectedValues: ['(Lang1) Second Choice']
      }
    };
    const baseChoices = [
      { id: 'choice-id-1', text: '(Lang1) First Choice' },
      { id: 'choice-id-2', text: '(Lang1) Second Choice' }
    ];
    const localizedAnswer = setSelectedValuesForChoices(answer, baseChoices, localizedChoices);
    expect(localizedAnswer.value.selectedValues[0]).toEqual('Second Choice');
  });
  test('SelectedValues is in display language', () => {
    const localizedChoices = [
      { id: 'choice-id-1', text: 'First Choice' },
      { id: 'choice-id-2', text: 'Second Choice' }
    ];
    const answer = {
      value: {
        selectedValues: ['Second Choice']
      }
    };
    const baseChoices = [
      { id: 'choice-id-1', text: '(Lang1) First Choice' },
      { id: 'choice-id-2', text: '(Lang1) Second Choice' }
    ];
    const localizedAnswer = setSelectedValuesForChoices(answer, baseChoices, localizedChoices);
    expect(localizedAnswer.value.selectedValues[0]).toEqual('Second Choice');
  });
  test('Translates valueBeforeMod for answer', () => {
    const answer = {
      value: {
        selectedValues: ['Second Choice']
      },
      valueBeforeMod: {
        selectedValues: ['First Choice', 'Second Choice']
      }
    };
    const localizedChoices = [
      { id: 'choice-id-1', text: '(Language2) First Choice' },
      { id: 'choice-id-2', text: '(Language2) Second Choice' }
    ];
    const baseChoices = [
      { id: 'choice-id-1', text: 'First Choice' },
      { id: 'choice-id-2', text: 'Second Choice' }
    ];
    const localizedAnswer = setSelectedValuesForChoices(answer, baseChoices, localizedChoices);
    expect(localizedAnswer.valueBeforeMod.selectedValues).toEqual([
      '(Language2) First Choice',
      '(Language2) Second Choice'
    ]);
  });
  test('Selects both answers when only one has translations', () => {
    const answer = {
      valueBeforeMod: {
        selectedValues: [],
        otherText: ''
      },
      value: {
        selectedValues: ['選択 B', '選択 A'],
        otherText: null
      },
      setterAction: {
        type: 'event-guestside-site/regCart/SET_REG_CART_FIELD_VALUE',
        payload: {
          path: [
            'eventRegistrations',
            '00000000-0000-0000-0000-000000000001',
            'attendee',
            'eventAnswers',
            '6c332fca-1387-4023-88d9-1e131219c6c4'
          ]
        }
      },
      isWidgetPlacedOnGuestModal: false
    };
    const baseChoices = [
      {
        id: '53fc8f3a-6858-4d17-a51e-a9bc4c5d0b6c',
        imgName: null,
        text: '選択 A',
        active: true
      },
      {
        id: 'e8d157e0-a139-412a-9cc7-d6d25dbb4c7b',
        imgName: null,
        text: '選択 B',
        active: true
      }
    ];
    const localizedChoices = [
      {
        id: '53fc8f3a-6858-4d17-a51e-a9bc4c5d0b6c',
        imgName: null,
        text: 'English A',
        active: true
      },
      {
        id: 'e8d157e0-a139-412a-9cc7-d6d25dbb4c7b',
        imgName: null,
        text: '選択 B',
        active: true
      }
    ];
    expect(setSelectedValuesForChoices(answer, baseChoices, localizedChoices).value.selectedValues.length).toBe(2);
  });
  test('Both previous answers count when only one has translations', () => {
    const answer = {
      valueBeforeMod: {
        selectedValues: ['選択 B', '選択 A'],
        otherText: null
      },
      value: {
        selectedValues: ['選択 B'],
        otherText: null
      },
      setterAction: {
        type: 'event-guestside-site/regCart/SET_REG_CART_FIELD_VALUE',
        payload: {
          path: [
            'eventRegistrations',
            '00000000-0000-0000-0000-000000000001',
            'attendee',
            'eventAnswers',
            '6c332fca-1387-4023-88d9-1e131219c6c4'
          ]
        }
      },
      isWidgetPlacedOnGuestModal: false
    };
    const baseChoices = [
      {
        id: '53fc8f3a-6858-4d17-a51e-a9bc4c5d0b6c',
        imgName: null,
        text: '選択 A',
        active: true
      },
      {
        id: 'e8d157e0-a139-412a-9cc7-d6d25dbb4c7b',
        imgName: null,
        text: '選択 B',
        active: true
      }
    ];
    const localizedChoices = [
      {
        id: '53fc8f3a-6858-4d17-a51e-a9bc4c5d0b6c',
        imgName: null,
        text: 'English A',
        active: true
      },
      {
        id: 'e8d157e0-a139-412a-9cc7-d6d25dbb4c7b',
        imgName: null,
        text: '選択 B',
        active: true
      }
    ];
    expect(
      setSelectedValuesForChoices(answer, baseChoices, localizedChoices).valueBeforeMod.selectedValues.length
    ).toBe(2);
  });
  test('SelectedValues is in Deleted from site designer', () => {
    const localizedChoices = [
      { id: 'choice-id-1', text: 'First Choice' },
      { id: 'choice-id-2', text: 'Second Choice' }
    ];
    const answer = {
      value: {
        selectedValues: ['(Lang1) Third Choice']
      }
    };
    const baseChoices = [
      { id: 'choice-id-1', text: '(Lang1) First Choice' },
      { id: 'choice-id-2', text: '(Lang1) Second Choice' }
    ];
    const localizedAnswer = setSelectedValuesForChoices(answer, baseChoices, localizedChoices);
    expect(localizedAnswer.value.selectedValues[0]).toEqual('(Lang1) Third Choice');
  });
});

describe('getLocalizedContactFieldForWidget tests', () => {
  test('Gets displayName from config', () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementation' does not exist on ty... Remove this comment to see the full error message
    getContactFieldForWidget.mockImplementation(() => ({
      displayName: 'Base Display Name',
      display: 2
    }));
    const config = {
      appData: {
        displayName: 'Translated Display Name'
      }
    };
    const localizedContactField = getLocalizedContactFieldForWidget({}, config, 'id');
    expect(localizedContactField.displayName).toEqual('Translated Display Name');
    expect(localizedContactField.display).toEqual(2);
  });
});

describe('convertChoicesToBaseLanguage tests', () => {
  test('When choices is not in localizedLanguages, it returns the choice as is', () => {
    const choices = ['Choice 1'];
    const choicesInCurrentLanguage = [{ id: 'random-id', text: 'Choice Random' }];
    expect(convertChoicesToBaseLanguage(choices, choicesInCurrentLanguage, [])).toEqual([
      { choice: 'Choice 1', answerType: 'Choice' }
    ]);
  });
  test('When', () => {
    const choices = ['(Lang 1) Choice 2'];
    const choicesInCurrentLanguage = [
      { id: '1', text: '(Lang 1) Choice 1' },
      { id: '2', text: '(Lang 1) Choice 2' }
    ];
    const choicesInBaseLanguage = [
      { id: '1', text: '(Lang base) Choice 1' },
      { id: '2', text: '(Lang base) Choice 2' }
    ];
    expect(convertChoicesToBaseLanguage(choices, choicesInCurrentLanguage, choicesInBaseLanguage)).toEqual([
      { choice: '(Lang base) Choice 2', answerType: 'Choice' }
    ]);
  });
});

describe('setParentQuestionId tests', () => {
  test('It sets parentQuestionId', () => {
    const appData = {
      registrationSettings: {
        registrationQuestions: {
          'sub-id-1': {
            parentQuestionId: 'parent-id-1'
          }
        },
        productQuestions: {},
        travelQuestions: {}
      }
    };
    const config = {
      appData: {}
    };
    const questionId = 'sub-id-1';
    const updatedConfig = setParentQuestionId(appData, config, questionId);
    expect(updatedConfig.appData.parentQuestionId).toEqual('parent-id-1');
  });
  test('It sets product question parentQuestionId', () => {
    const appData = {
      registrationSettings: {
        registrationQuestions: {},
        productQuestions: {
          'sub-id-1': {
            parentQuestionId: 'parent-id-1'
          }
        },
        travelQuestions: {}
      }
    };
    const config = {
      appData: {}
    };
    const questionId = 'sub-id-1';
    const updatedConfig = setParentQuestionId(appData, config, questionId);
    expect(updatedConfig.appData.parentQuestionId).toEqual('parent-id-1');
  });
  test('It sets travel question parentQuestionId', () => {
    const appData = {
      registrationSettings: {
        registrationQuestions: {},
        productQuestions: {},
        travelQuestions: {
          'sub-id-1': {
            parentQuestionId: 'parent-id-1'
          }
        }
      }
    };
    const config = {
      appData: {}
    };
    const questionId = 'sub-id-1';
    const updatedConfig = setParentQuestionId(appData, config, questionId);
    expect(updatedConfig.appData.parentQuestionId).toEqual('parent-id-1');
  });
});

describe('getQuestionCategory', () => {
  it('returns product question', () => {
    const question = { isProductQuestion: true };
    const questionCategory = getQuestionCategory(question);
    expect(questionCategory).toBe('productQuestions');
  });
  it('returns travel question', () => {
    const question = { isTravelQuestion: true };
    const questionCategory = getQuestionCategory(question);
    expect(questionCategory).toBe('travelQuestions');
  });
  it('defaults to registration question', () => {
    const question = {};
    const questionCategory = getQuestionCategory(question);
    expect(questionCategory).toBe('registrationQuestions');
  });
});
