import { connect } from 'react-redux';
import QuantityItemsWidget from 'event-widgets/lib/QuantityItems/QuantityItemsWidget';
import { getEventTimezone } from '../redux/reducer';
import {
  getPrimarySortedVisibleQuantityItems,
  getEventRegistrationForPrimaryRegistrant,
  getQuantityItemInfoForPrimary
} from '../redux/selectors/productSelectors';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { updateQuantity, updateLocalQuantity } from '../redux/registrationForm/regCart/quantityItems';
import { getAdvancedQuantityItemRules } from '../redux/selectors/event';
import {
  getEventRegistrationId,
  isRegistrationModification,
  modificationStart,
  getRegistrationTypeId,
  getSelectedAdmissionItemDefinition,
  isRegApprovalRequired
} from '../redux/selectors/currentRegistrant';
import { SAVING_REGISTRATION } from '../redux/registrationIntents';
import {
  optionalItemIsVisibleForRegistrationType,
  optionalItemIsVisibleForAdmissionItem,
  areRegistrationActionsDisabled
} from '../redux/selectors/shared';

/**
 * Data wrapper for the QuantityItems widget.
 */
export default connect(
  (state: $TSFixMe) => {
    const {
      text: {
        resolver: { currency }
      },
      capacity
    } = state;
    const { getRegisteredQuantityItems } = modificationStart;
    const quantityItems = getPrimarySortedVisibleQuantityItems(state);
    const eventRegistrationId = getEventRegistrationId(state);
    const registeredQuantityItems = getRegisteredQuantityItems(state);
    const isSelectDisabled =
      (state.regCartStatus && state.regCartStatus.registrationIntent === SAVING_REGISTRATION) ||
      areRegistrationActionsDisabled(state);

    const selectedAdmissionItem = getSelectedAdmissionItemDefinition(state);
    const registrationTypeId = getRegistrationTypeId(state);
    const quantityItemsVisibleToPrimary =
      quantityItems &&
      Object.values(quantityItems)
        .filter(quantityItem => {
          return (
            optionalItemIsVisibleForRegistrationType(registrationTypeId, quantityItem) &&
            optionalItemIsVisibleForAdmissionItem(selectedAdmissionItem, quantityItem)
          );
        })
        .map(quantityItem => (quantityItem as $TSFixMe).id);
    return {
      eventRegistrationId,
      quantityItems,
      capacity,
      currency,
      eventTimezone: getEventTimezone(state),
      currentPrimaryRegistrant: getEventRegistrationForPrimaryRegistrant(state),
      defaultQuantityLimit: 32000,
      advancedQuantityItemRules: getAdvancedQuantityItemRules(state),
      primaryQuantityItemInfo: getQuantityItemInfoForPrimary(state),
      overrideFullCapacity: state.defaultUserSession.isPlanner,
      isRegMod: isRegistrationModification(state),
      registeredQuantityItems,
      isSelectDisabled,
      visibleToPrimary: quantityItemsVisibleToPrimary,
      isRegApprovalRequired: isRegApprovalRequired(state),
      isPreview: state.defaultUserSession.isPreview
    };
  },
  {
    updateQuantity: withLoading(updateQuantity),
    updateLocalQuantity: withLoading(updateLocalQuantity)
  },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      updateQuantity: dispatchProps.updateQuantity.bind(null, stateProps.eventRegistrationId),
      updateLocalQuantity: dispatchProps.updateLocalQuantity.bind(null, stateProps.eventRegistrationId)
    };
  }
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof QuantityItemsWidget' is n... Remove this comment to see the full error message
)(QuantityItemsWidget);
