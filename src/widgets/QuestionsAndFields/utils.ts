import { getIn } from 'icepick';
import getJSONValue from 'nucleus-widgets/utils/fields/getJSONValue';
import { getContactFieldForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { getSubQuestionParentQuestionIdJsonPath } from 'event-widgets/redux/selectors/appData';
import { NAChoice, OtherChoice } from '@cvent/nucleus-form-validations';

const DEFAULT_QUESTION_CHOICES = Object.freeze([]);

export function getConfigWithDisplay(config: $TSFixMe, display: $TSFixMe): $TSFixMe {
  return {
    ...config,
    appData: {
      ...config.appData,
      display
    }
  };
}

export function convertChoicesToBaseLanguage(
  choices: $TSFixMe,
  choicesInCurrentLanguage: $TSFixMe,
  choicesInBaseLanguage: $TSFixMe
): $TSFixMe {
  return choices
    .map(choice => {
      const localizedChoice = choicesInCurrentLanguage.find(c => c.text === choice);
      if (localizedChoice) {
        const baseLangChoice = choicesInBaseLanguage.find(c => c.id === localizedChoice.id);
        if (baseLangChoice) {
          return {
            choice: baseLangChoice.text,
            answerType: 'Choice'
          };
        }
      } else {
        return {
          choice,
          answerType: 'Choice'
        };
      }
    })
    .filter(Boolean);
}

const emptyOrNaOrOther = value => !value || value === NAChoice || value === OtherChoice;

const needsTranslation = (baseChoices, localizedChoices, text) =>
  !localizedChoices.find(c => c.text === text) && baseChoices.find(c => c.text === text);

export function setSelectedValuesForChoices(
  answer: $TSFixMe,
  baseChoices: $TSFixMe,
  localizedChoices: $TSFixMe
): $TSFixMe {
  const translateEachIfNecessary = selectedValues =>
    selectedValues
      .filter(value => !emptyOrNaOrOther(value))
      .map(text =>
        needsTranslation(baseChoices, localizedChoices, text)
          ? updateSelectedValues(text, baseChoices, localizedChoices)
          : text
      );
  const selectedValues = translateEachIfNecessary(answer.value.selectedValues || []);
  const selectedPrevValues = translateEachIfNecessary(getIn(answer, ['valueBeforeMod', 'selectedValues']) || []);

  addMissingChoicesToLocaledAnswer(selectedValues, selectedPrevValues, answer);

  return {
    ...answer,
    value: {
      ...answer.value,
      selectedValues: selectedValues.length ? selectedValues : answer.value.selectedValues || []
    },
    valueBeforeMod: {
      ...answer.valueBeforeMod,
      selectedValues: selectedPrevValues.length
        ? selectedPrevValues
        : getIn(answer, ['valueBeforeMod', 'selectedValues']) || []
    }
  };
}

function addOtherOrNAChoiceToLocalizedAnswer(selectedValues, answerSelectedValues, otherOrNAChoice) {
  if (selectedValues.length && answerSelectedValues.includes(otherOrNAChoice)) {
    selectedValues.push(otherOrNAChoice);
  }
}

function addMissingChoicesToLocaledAnswer(selectedValues, selectedPrevValues, answer) {
  const answerSelectedValues = getIn(answer, ['value', 'selectedValues']) || [];
  const answerSelectedPrevValues = getIn(answer, ['valueBeforeMod', 'selectedValues']) || [];
  addOtherOrNAChoiceToLocalizedAnswer(selectedValues, answerSelectedValues, NAChoice);
  addOtherOrNAChoiceToLocalizedAnswer(selectedPrevValues, answerSelectedPrevValues, NAChoice);
  addOtherOrNAChoiceToLocalizedAnswer(selectedValues, answerSelectedValues, OtherChoice);
  addOtherOrNAChoiceToLocalizedAnswer(selectedPrevValues, answerSelectedPrevValues, OtherChoice);
}

function updateSelectedValues(choiceText, baseChoices, localizedChoices) {
  const choice = baseChoices.find(c => c.text === choiceText);
  if (choice) {
    const updatedChoice = localizedChoices.find(c => c.id === choice.id);
    if (updatedChoice) {
      return updatedChoice.text;
    }
  }
}

export function getLocalizedContactFieldForWidget(state: $TSFixMe, config: $TSFixMe, id: $TSFixMe): $TSFixMe {
  const registrationField = getContactFieldForWidget(state, config.registrationFieldPageType, config.fieldId, id);
  return {
    ...registrationField,
    displayName: getIn(config, ['appData', 'displayName']) || registrationField.displayName
  };
}

export function modifyFieldDefinitionForMultiLanguage(fieldDefinition: $TSFixMe): $TSFixMe {
  const modifiedFieldDefinition = {
    ...fieldDefinition,
    question: {
      ...fieldDefinition.question,
      questionTypeInfo: {
        ...fieldDefinition.question.questionTypeInfo,
        choices: fieldDefinition.question.questionTypeInfo.choices.map(choice => {
          return { id: choice.text.slice(choice.text.indexOf('.') + 1), text: choice.text };
        })
      }
    }
  };
  return modifiedFieldDefinition;
}

export function setParentQuestionId(appData: $TSFixMe, config: $TSFixMe, questionId: $TSFixMe): $TSFixMe {
  return {
    ...config,
    appData: {
      ...config.appData,
      parentQuestionId: getJSONValue(appData, getSubQuestionParentQuestionIdJsonPath(appData, questionId))
    }
  };
}

export function getQuestionCategory(question: $TSFixMe): $TSFixMe {
  if (question.isProductQuestion) {
    return 'productQuestions';
  }
  if (question.isTravelQuestion) {
    return 'travelQuestions';
  }
  return 'registrationQuestions';
}

export function setDefaultChoicesPreSelected(
  appData: $TSFixMe,
  questionCategory: $TSFixMe,
  questionId: $TSFixMe,
  answer: $TSFixMe,
  baseChoices: $TSFixMe
): $TSFixMe {
  const questionDefaultChoices = getIn(
    appData,
    ['registrationSettings', questionCategory, questionId, 'question', 'questionTypeInfo', 'defaultChoice'],
    DEFAULT_QUESTION_CHOICES
  );
  let filteredChoices = DEFAULT_QUESTION_CHOICES;
  if (questionDefaultChoices && questionDefaultChoices.length > 0) {
    if (!Array.isArray(questionDefaultChoices)) {
      filteredChoices = baseChoices.filter(c => c.id === questionDefaultChoices).map(choice => choice.text);
    } else {
      filteredChoices = baseChoices.map(choice => {
        const matchIndex = questionDefaultChoices.findIndex(defaultChoice => defaultChoice.id === choice.id);
        if (matchIndex !== -1) {
          return choice.text;
        }
      });
    }
    filteredChoices = filteredChoices.filter(x => x !== undefined);
    return {
      ...answer,
      value: {
        ...answer.value,
        selectedValues: filteredChoices
      },
      valueBeforeMod: {
        ...answer.valueBeforeMod,
        selectedValues: filteredChoices
      }
    };
  }
  return {
    ...answer,
    value: {
      ...answer.value,
      useDefaultChoices: false // answer = undefined and Question does not have defautl choices
    }
  };
}
