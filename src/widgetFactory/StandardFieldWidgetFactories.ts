import { getContactField, getContactFieldJsonPath, getContactSubFieldJsonPath } from '../redux/selectors/event';

function name(state, widget) {
  return getContactField(state, widget.id, widget.config.registrationFieldPageType, widget.config.fieldId).fieldName;
}

function displayName(state, config, widgetId) {
  return getContactFieldJsonPath(state, widgetId, config.registrationFieldPageType, config.fieldId, 'displayName').join(
    '.'
  );
}

function display(state, config, widgetId) {
  return getContactFieldJsonPath(state, widgetId, config.registrationFieldPageType, config.fieldId, 'display').join(
    '.'
  );
}

export default (experimentSettings: $TSFixMe): $TSFixMe => [
  {
    metadata: {
      type: 'EventStandardContactFieldText',
      name,
      appDataFieldPaths: {
        displayName,
        display
      },
      minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 2
    },
    creator: () => import('../widgets/QuestionsAndFields').then(m => m.StandardContactFieldTextWidget)
  },
  {
    metadata: {
      type: 'EventStandardContactSecureFieldText',
      name,
      appDataFieldPaths: {
        displayName,
        display
      },
      minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 2
    },
    creator: () => import('../widgets/QuestionsAndFields').then(m => m.StandardContactSecureFieldTextWidget)
  },
  {
    metadata: {
      type: 'EventStandardContactFieldAddress',
      name,
      appDataFieldPaths: {
        sectionHeader: (state, config, widgetId) => {
          return getContactFieldJsonPath(
            state,
            widgetId,
            config.registrationFieldPageType,
            config.fieldId,
            'displayName'
          ).join('.');
        },
        address1: (state, config, widgetId) => {
          return getContactSubFieldJsonPath(
            state,
            widgetId,
            config.registrationFieldPageType,
            config.fieldId,
            'address1'
          ).join('.');
        },
        address2: (state, config, widgetId) => {
          return getContactSubFieldJsonPath(
            state,
            widgetId,
            config.registrationFieldPageType,
            config.fieldId,
            'address2'
          ).join('.');
        },
        address3: (state, config, widgetId) => {
          return getContactSubFieldJsonPath(
            state,
            widgetId,
            config.registrationFieldPageType,
            config.fieldId,
            'address3'
          ).join('.');
        },
        city: (state, config, widgetId) => {
          return getContactSubFieldJsonPath(
            state,
            widgetId,
            config.registrationFieldPageType,
            config.fieldId,
            'city'
          ).join('.');
        },
        state: (state, config, widgetId) => {
          return getContactSubFieldJsonPath(
            state,
            widgetId,
            config.registrationFieldPageType,
            config.fieldId,
            'state'
          ).join('.');
        },
        zip: (state, config, widgetId) => {
          return getContactSubFieldJsonPath(
            state,
            widgetId,
            config.registrationFieldPageType,
            config.fieldId,
            'zip'
          ).join('.');
        },
        country: (state, config, widgetId) => {
          return getContactSubFieldJsonPath(
            state,
            widgetId,
            config.registrationFieldPageType,
            config.fieldId,
            'country'
          ).join('.');
        },
        display: (state, config, widgetId) => {
          return getContactFieldJsonPath(
            state,
            widgetId,
            config.registrationFieldPageType,
            config.fieldId,
            'display'
          ).join('.');
        },
        displayName: (state, config, widgetId) => {
          return getContactFieldJsonPath(
            state,
            widgetId,
            config.registrationFieldPageType,
            config.fieldId,
            'displayName'
          ).join('.');
        },
        defaultCountry: (state, config, widgetId) => {
          return getContactFieldJsonPath(
            state,
            widgetId,
            config.registrationFieldPageType,
            config.fieldId,
            'defaultCountry'
          ).join('.');
        }
      },
      minCellSize: 2
    },
    creator: () => import('../widgets/QuestionsAndFields').then(m => m.StandardContactFieldAddressWidget)
  },
  {
    metadata: {
      type: 'EventStandardContactFieldDateTime',
      name,
      minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 2,
      appDataFieldPaths: {
        displayName,
        display
      }
    },
    creator: () => import('../widgets/QuestionsAndFields').then(m => m.StandardContactFieldDateTimeWidget)
  },
  {
    metadata: {
      type: 'EventStandardContactFieldChoice',
      name,
      minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 2,
      appDataFieldPaths: {
        displayName,
        display
      }
    },
    creator: () => import('../widgets/QuestionsAndFields').then(m => m.StandardContactFieldChoiceWidget)
  },
  {
    metadata: {
      type: 'EventStandardContactFieldImage',
      name,
      minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 2,
      appDataFieldPaths: {
        displayName,
        display
      }
    },
    creator: () => import('../widgets/QuestionsAndFields').then(m => m.StandardContactFieldImageWidget)
  }
];
