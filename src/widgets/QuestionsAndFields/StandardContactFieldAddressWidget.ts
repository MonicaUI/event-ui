import { connect } from 'react-redux';
import StandardContactFieldAddressWidget from 'event-widgets/lib/StandardContactFields/StandardContactFieldAddressWidget';
import StandardContactFields from 'event-widgets/lib/StandardContactFields/StandardContactFields';
import { loadCountryStates } from '../../redux/states';
import { getLocalizedContactFieldForWidget } from './utils';
import { getCountries, getCountryCodesJsonPath } from '../../redux/selectors/shared';
import { getEventRegistrationId } from '../../redux/selectors/currentRegistrant';
import * as eventRegistrationData from '../../utils/eventRegistrationData';
import { defaultMemoize } from 'reselect';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import { getIn } from 'icepick';
import { evaluateQuestionVisibilityLogic } from '../../redux/actions';
import { COUNTRY_LIST_RELEASE_VARIANT } from '@cvent/event-ui-experiments';
import getJSONValue from 'nucleus-widgets/utils/fields/getJSONValue';

const EMPTY_OBJECT = Object.freeze({});

export function getFilteredCountries(state: $TSFixMe, widgetId: $TSFixMe, config: $TSFixMe): $TSFixMe {
  const filteredCountries = {};
  const countryListPath = getCountryCodesJsonPath(
    state,
    widgetId,
    config.registrationFieldPageType,
    config.fieldId,
    'countryCodes'
  );
  const countryList = getJSONValue(state.appData, countryListPath);
  const defaultCountries = getCountries(state);

  if (countryList?.length > 0) {
    Object.keys(defaultCountries)
      .filter(code => code === '' || countryList.includes(code))
      .forEach(code => (filteredCountries[code] = defaultCountries[code]));
    return filteredCountries;
  }
  return defaultCountries;
}

const setDefaultCountry = (countryCode, defaultCountryCode, onAddressChange) => {
  return () => {
    if (!countryCode && defaultCountryCode) {
      if (onAddressChange) {
        onAddressChange('countryCode', defaultCountryCode);
      }
    }
  };
};

function getRegistrationField(state, config, id) {
  const registrationField = getLocalizedContactFieldForWidget(state, config, id);
  return {
    ...registrationField,
    subFieldDisplayNames: {
      address1: getIn(config, ['appData', 'address1']) || registrationField.subFieldDisplayNames.address1,
      address2: getIn(config, ['appData', 'address2']) || registrationField.subFieldDisplayNames.address2,
      address3: getIn(config, ['appData', 'address3']) || registrationField.subFieldDisplayNames.address3,
      city: getIn(config, ['appData', 'city']) || registrationField.subFieldDisplayNames.city,
      country: getIn(config, ['appData', 'country']) || registrationField.subFieldDisplayNames.country,
      state: getIn(config, ['appData', 'state']) || registrationField.subFieldDisplayNames.state,
      zip: getIn(config, ['appData', 'zip']) || registrationField.subFieldDisplayNames.zip
    }
  };
}

/**
 * Data wrapper for the event standard contact field address widget.
 */
export default withMappedWidgetConfig(
  connect(
    () => {
      const buildEventRegistrationPath = defaultMemoize(fieldPath => {
        return eventRegistrationData.buildEventRegistrationPath(fieldPath);
      });

      const getAnswer = eventRegistrationData.createAnswer();
      const memoized = {
        getRegistrationField: defaultMemoize(getRegistrationField)
      };

      return (state: $TSFixMe, props: $TSFixMe) => {
        const registrationField = memoized.getRegistrationField(state, props.config, props.id);

        const fieldPath = StandardContactFields[props.config.fieldId].regApiPath;

        const answer = getAnswer({
          state,
          widgetConfig: props.config,
          eventRegistrationPath: buildEventRegistrationPath(fieldPath),
          getAnswerFormatter: v => v || EMPTY_OBJECT
        });

        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        const isWidgetPlacedOnGuestModal = (answer && answer.isWidgetPlacedOnGuestModal) || false;

        return {
          values: answer.value,
          setterAction: answer.setterAction,
          registrationField,
          countries:
            state.experiments?.featureRelease >= COUNTRY_LIST_RELEASE_VARIANT
              ? getFilteredCountries(state, props.id, props.config)
              : getCountries(state),
          selectedCountryStates: state.states,
          defaultCountryCode: registrationField.defaultCountry.value,
          eventRegistrationId: getEventRegistrationId(state),
          skipRequiredValidation: state.defaultUserSession.isPlanner,
          isWidgetPlacedOnGuestModal
        };
      };
    },
    {
      loadCountryStates,
      setAnswerAction: eventRegistrationData.setAnswerAction,
      setDefaultCountry,
      evaluateQuestionVisibilityLogic
    },
    (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
      return {
        ...ownProps,
        ...stateProps,
        ...dispatchProps,
        onAddressChange: (fieldName, value) => {
          const modifiedField = fieldName.split('.')[0] || fieldName;
          let updatedValue = value;
          if (fieldName.startsWith('countryCode')) {
            updatedValue = value || stateProps.defaultCountryCode;
            const updatedCountry = updatedValue ? stateProps.countries[updatedValue].name : '';
            dispatchProps.setAnswerAction(stateProps.setterAction, updatedCountry, 'country');
          } else if (fieldName.startsWith('stateCode')) {
            const selectedCountry = stateProps?.values?.countryCode;
            const states = stateProps?.selectedCountryStates?.[selectedCountry]?.states;
            if (selectedCountry && states) {
              const selectedState = states?.[updatedValue]?.name;
              const updatedState = selectedState || '';
              dispatchProps.setAnswerAction(stateProps.setterAction, updatedState, 'state');
            }
          }
          if (
            stateProps.defaultCountryCode &&
            !stateProps.values?.countryCode &&
            !stateProps.values?.country &&
            !fieldName.startsWith('country')
          ) {
            // if for whatever reason (e.g. after "clear fields") the country in the store is blank,
            // also reset it to default country
            dispatchProps.setAnswerAction(stateProps.setterAction, stateProps.defaultCountryCode, 'countryCode');
            dispatchProps.setAnswerAction(
              stateProps.setterAction,
              stateProps.countries[stateProps.defaultCountryCode]?.name,
              'country'
            );
            loadCountryStates(stateProps.defaultCountryCode);
          }
          dispatchProps.setAnswerAction(stateProps.setterAction, updatedValue, modifiedField);
        }
      };
    }
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof StandardContactFieldAddre... Remove this comment to see the full error message
  )(StandardContactFieldAddressWidget)
);
