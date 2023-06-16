import {
  getSubQuestionParentQuestionIdJsonPath,
  getEventQuestionJsonPath,
  getQuestionAssociationsJsonPath,
  getSubQuestionLogicChoicesJsonPath
} from 'event-widgets/redux/selectors/appData';

const appDataFieldPaths = {
  question: (state, config) => {
    const questionId = config.id;
    return getEventQuestionJsonPath(state.appData, questionId);
  },
  questionAssociations: (state, config) => {
    const questionId = config.id;
    return getQuestionAssociationsJsonPath(state.appData, questionId);
  },
  parentQuestionId: (state, config) => {
    const questionId = config.id;
    return getSubQuestionParentQuestionIdJsonPath(state.appData, questionId);
  },
  subQuestionLogicChoices: (state, config) => {
    const questionId = config.id;
    return getSubQuestionLogicChoicesJsonPath(state.appData, questionId);
  }
};

export default (experimentSettings: $TSFixMe): $TSFixMe => [
  {
    metadata: {
      type: 'OpenEndedTextQuestion',
      name: '_widgetName_openEndedTextQuestion__resx',
      minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 2,
      appDataFieldPaths
    },
    creator: () => import('../widgets/QuestionsAndFields').then(m => m.TextQuestionWidget)
  },
  {
    metadata: {
      type: 'ChoiceQuestion',
      name: '_widgetName_multipleChoice__resx',
      minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 2,
      appDataFieldPaths
    },
    creator: () => import('../widgets/QuestionsAndFields').then(m => m.ChoiceQuestionWidget)
  },
  {
    metadata: {
      type: 'DateTimeQuestion',
      name: 'NucleusSiteEditor_QuestionWidget_WidgetName_DateTimeQuestion__resx',
      minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 2,
      appDataFieldPaths
    },
    creator: () => import('../widgets/QuestionsAndFields').then(m => m.DateTimeQuestionWidget)
  },
  {
    metadata: {
      type: 'ConsentQuestion',
      name: 'NucleusSiteEditor_QuestionWidget_WidgetName_ConsentQuestion__resx',
      minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 2,
      appDataFieldPaths
    },
    creator: () => import('../widgets/QuestionsAndFields').then(m => m.ConsentQuestionWidget)
  },
  {
    metadata: {
      type: 'FileUploadQuestion',
      name: 'EventWidgets_QuestionWidget_WidgetName_FileUploadQuestion__resx',
      minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 2,
      appDataFieldPaths
    },
    creator: () => import('../widgets/QuestionsAndFields').then(m => m.FileUploadQuestionWidget)
  }
];
