import { getContactFieldJsonPath } from '../redux/selectors/event';

function name(state, widget) {
  const field = state.account.contactCustomFields[widget.config.fieldId];
  return field.question.text;
}

const appDataFieldPaths = {
  display(state, config, widgetId) {
    return getContactFieldJsonPath(state, widgetId, config.registrationFieldPageType, config.fieldId, 'display');
  }
};

export default (experimentSettings: $TSFixMe): $TSFixMe => [
  {
    metadata: {
      type: 'EventCustomContactFieldText',
      name,
      appDataFieldPaths,
      minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 2
    },
    creator: () => import('../widgets/QuestionsAndFields').then(m => m.CustomContactFieldTextWidget)
  },
  {
    metadata: {
      type: 'EventCustomContactFieldDateTime',
      name,
      appDataFieldPaths,
      minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 2
    },
    creator: () => import('../widgets/QuestionsAndFields').then(m => m.CustomContactFieldDateTimeWidget)
  },
  {
    metadata: {
      type: 'EventCustomContactFieldSingleChoice',
      name,
      appDataFieldPaths,
      minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 2
    },
    creator: () => import('../widgets/QuestionsAndFields').then(m => m.CustomContactFieldSingleChoiceWidget)
  },
  {
    metadata: {
      type: 'EventCustomContactFieldMultiChoice',
      name,
      appDataFieldPaths,
      minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 2
    },
    creator: () => import('../widgets/QuestionsAndFields').then(m => m.CustomContactFieldMultiChoiceWidget)
  }
];
