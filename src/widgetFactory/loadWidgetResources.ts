import { get, isEmpty } from 'lodash';
import {
  loadAvailableCapacityCounts,
  loadAvailableEventRegistrationCapacityCounts,
  loadAvailableSessionCapacityCountsForAgendaWidget
} from '../redux/capacity';
import { loadEventWebAppStatus } from '../redux/attendeeExperience';
import { createLoadCountry } from 'event-widgets/redux/modules/country';
import { registerTranslation } from 'nucleus-guestside-site/src/redux/modules/text';
import { loadState } from 'event-widgets/redux/modules/state';
import getJSONValue from 'nucleus-widgets/utils/fields/getJSONValue';
import { getContactFieldJsonPath as getContactFieldJsonPathSelector } from '../redux/selectors/event';
import { loadGroupFlightCapacities, loadHotelsRoomsCapacities } from 'event-widgets/redux/modules/eventTravel';
import { loadAllCurrencies } from '../redux/currencies';
import {
  populateAllProducts,
  populateAllProductsByRegistrationType,
  populateVisibleProducts,
  populateRegCartVisibleProducts
} from '../redux/visibleProducts';
import { updateAppDataForRoommateSettings } from '../redux/appData';
import { loadApptEventData, loadApptEventStatus } from 'event-widgets/redux/modules/appointments';
import { loadEventFees } from '../redux/eventFee';
import { getRegistrationTypeId } from '../redux/selectors/currentRegistrant';
import { loadAccountLimits } from '../redux/limits';
import { getIn } from 'icepick';
import { isGraphQLForEventCapacitiesVariantON } from '../ExperimentHelper';

const loadCountry = () => {
  return async dispatch => {
    await dispatch(createLoadCountry(registerTranslation));
  };
};

function getVisibleProductsLoaderForWidget(state) {
  if (state.registrationForm.regCart.regMod) {
    return () => populateRegCartVisibleProducts();
  }
  return () => populateVisibleProducts();
}

function getContactFieldJsonPath(state, widgetId, config, fieldName) {
  return getContactFieldJsonPathSelector(state, widgetId, config.registrationFieldPageType, config.fieldId, fieldName);
}
export default (widgets: $TSFixMe) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const resourceLoaders = {};
    /*
     * This function is called once per page and there could be more than one widget of same type in widgets array.
     * Since we only want to load resources once per page, we are only setting resourceLoaders once per
     * widget types that requires it. This allows us to dispatch resource loading functions once
     * (ex. loadAvailableCapacityCounts)
     */
    // eslint-disable-next-line complexity
    widgets.forEach(widget => {
      switch (widget.widgetType) {
        case 'RegistrationSummary':
          (resourceLoaders as $TSFixMe).currencies = loadAllCurrencies;
          (resourceLoaders as $TSFixMe).country = loadCountry;
          (resourceLoaders as $TSFixMe).productWidgets = () => populateAllProducts('Widget');
          (resourceLoaders as $TSFixMe).registrationSummaryCapacity = loadAvailableEventRegistrationCapacityCounts;
          break;
        case 'Payment':
          (resourceLoaders as $TSFixMe).country = loadCountry;
          (resourceLoaders as $TSFixMe).productWidgets = () => populateAllProducts('Widget');
          break;
        case 'RegistrationCancellationRefund':
          (resourceLoaders as $TSFixMe).productWidgets = () => populateAllProducts('Widget');
          break;
        case 'EventStandardContactFieldChoice':
        case 'LocationMap':
        case 'EventLocation': {
          (resourceLoaders as $TSFixMe).country = loadCountry;
          break;
        }
        case 'EventStandardContactFieldAddress': {
          (resourceLoaders as $TSFixMe).country = loadCountry;

          // Get the states for the default country defined in the widget.
          const defaultCountryLocation = getContactFieldJsonPath(
            getState(),
            widget.id,
            widget.config,
            'defaultCountry'
          );
          const defaultCountry = getJSONValue(getState().appData, defaultCountryLocation);
          /*
           * In case there are multiple widgets and they have different default countries we will scope the loading to
           * the specific country.
           */
          resourceLoaders[`state-${defaultCountry}`] = () => loadState(registerTranslation, defaultCountry.value);
          break;
        }

        case 'RegistrationType':
          (resourceLoaders as $TSFixMe).capacity = loadAvailableCapacityCounts;
          if (!getState().registrationForm.regCart.regMod) {
            (resourceLoaders as $TSFixMe).widget = () => populateVisibleProducts();
          }
          break;
        case 'Sessions':
          (resourceLoaders as $TSFixMe).capacity = loadAvailableCapacityCounts;
          (resourceLoaders as $TSFixMe).widget = getVisibleProductsLoaderForWidget(getState());
          break;
        case 'AdmissionItems':
          if (!isGraphQLForEventCapacitiesVariantON(getState())) {
            (resourceLoaders as $TSFixMe).capacity = loadAvailableCapacityCounts;
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            if (widget.config.display && widget.config.display.limitByRegistrationType) {
              (resourceLoaders as $TSFixMe).productWidgetsByRegType = () =>
                populateAllProductsByRegistrationType('Widget');
            } else {
              (resourceLoaders as $TSFixMe).productWidgets = () => populateAllProducts('Widget');
            }
          }
          break;
        case 'Agenda':
          (resourceLoaders as $TSFixMe).sessionCapacity = loadAvailableSessionCapacityCountsForAgendaWidget;
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          if (widget.config.display && widget.config.display.limitByRegistrationType) {
            resourceLoaders[`Agenda:${widget.id}`] = () => populateAllProductsByRegistrationType('Agenda', widget.id);
          } else {
            resourceLoaders[`Agenda:${widget.id}`] = () => populateAllProducts('Agenda', widget.id);
          }
          break;
        case 'HotelRequest': {
          const isPasskeyEnabled = getIn(getState(), ['eventTravel', 'hotelsData', 'isPasskeyEnabled']);
          if (!isPasskeyEnabled) {
            (resourceLoaders as $TSFixMe).newHotelData = () =>
              loadHotelsRoomsCapacities(getState().experiments?.featureRelease, getRegistrationTypeId(getState()));
            (resourceLoaders as $TSFixMe).roommateMatchingSettings = () =>
              updateAppDataForRoommateSettings(widget.config.roommateSetupSettings);
          }
          break;
        }
        case 'AirActual':
        case 'AirActualSummary':
        case 'FlightItinerarySummary':
          (resourceLoaders as $TSFixMe).currencies = loadAllCurrencies;
          break;
        case 'GroupFlight':
          (resourceLoaders as $TSFixMe).groupFlightCapacity = loadGroupFlightCapacities;
          break;
        case 'InviteeAgenda':
          resourceLoaders[`InviteeAgenda:${widget.id}`] = () => populateAllProducts('InviteeAgenda', widget.id);
          break;
        case 'ApptsAvailability':
          (resourceLoaders as $TSFixMe).productWidgets = () => populateAllProducts('Widget');
          (resourceLoaders as $TSFixMe).appointments = loadApptEventData;
          break;
        case 'QuantityItems':
          (resourceLoaders as $TSFixMe).optionalItemWidgets = getVisibleProductsLoaderForWidget(getState());
          (resourceLoaders as $TSFixMe).capacity = loadAvailableCapacityCounts;
          break;
        case 'DonationItems':
          (resourceLoaders as $TSFixMe).optionalItemWidgets = getVisibleProductsLoaderForWidget(getState());
          break;
        case 'Fees': {
          const regTypeToggleOn = widget.config.showFeeOnForContactType;
          const regTypeId = regTypeToggleOn ? getRegistrationTypeId(getState()) : null;
          const eventSnapshotVersion = getState().eventSnapshotVersion;
          (resourceLoaders as $TSFixMe).feesWidget = () => loadEventFees(regTypeId, eventSnapshotVersion);
          break;
        }
        case 'ApptsMeetingInterest': {
          (resourceLoaders as $TSFixMe).appointments = () => loadApptEventData();
          (resourceLoaders as $TSFixMe).country = loadCountry;
          break;
        }
        case 'GuestRegistration':
          if (!isEmpty(get(getState().appData, ['registrationSettings', 'productQuestions']))) {
            (resourceLoaders as $TSFixMe).productWidgets = () => populateAllProducts('Widget');
          }
          if (getState().defaultUserSession.isPlanner) {
            (resourceLoaders as $TSFixMe).limits = loadAccountLimits;
          }
          break;
        case 'GoToEventButton':
          (resourceLoaders as $TSFixMe).goToEvent = () => loadEventWebAppStatus();
          break;
        case 'Appointments': {
          (resourceLoaders as $TSFixMe).appointments = () => loadApptEventStatus();
          break;
        }
        default:
        // Nothing to do for widgets that don't require resources to be loaded.
      }
    });
    // @ts-expect-error ts-migrate(2349) FIXME: This expression is not callable.
    const resourceLoaderPromises = Object.values(resourceLoaders).map(resourceLoader => dispatch(resourceLoader()));
    await Promise.all(resourceLoaderPromises);
  };
};
