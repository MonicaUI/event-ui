import { connect } from 'react-redux';
import TermsConditionsWidget from 'event-widgets/lib/TermsConditions/TermsConditionsWidget';
import { setEventRegistrationFieldValue } from '../redux/registrationForm/regCart/actions';
import {
  isRegistrationModification,
  getAttendeeRegistrationStatus,
  getEventRegistrationId,
  isTermsConditionsAccepted
} from '../redux/selectors/currentRegistrant';
import { getRegCart } from '../redux/selectors/shared';

export function setTermsAndConditionsAcceptance(eventRegistrationId: $TSFixMe, value: $TSFixMe): $TSFixMe {
  return setEventRegistrationFieldValue(eventRegistrationId, ['attendee', 'termsAndConditionsAccepted'], value);
}

/**
 * Data wrapper for the Terms & Conditions widget.
 */
export default connect(
  (state: $TSFixMe) => {
    const eventRegistrationId = getEventRegistrationId(state);
    const termsConditionsAcceptance = isTermsConditionsAccepted(state, eventRegistrationId);
    const isRegMod = isRegistrationModification(state);
    const isRegistered = getAttendeeRegistrationStatus(state, eventRegistrationId) != null;
    const isRegCartRegModThenTransient =
      (getRegCart(state) || {}).status === 'TRANSIENT' && state.regCartStatus?.lastSavedRegCart?.regMod;
    const hidden = (isRegMod && isRegistered) || isRegCartRegModThenTransient;

    return {
      required: !hidden,
      hidden,
      termsConditionsAcceptance,
      eventRegistrationId
    };
  },
  { onSetTermsAndConditionsAcceptance: setTermsAndConditionsAcceptance },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      onSetTermsAndConditionsAcceptance: dispatchProps.onSetTermsAndConditionsAcceptance.bind(
        null,
        stateProps.eventRegistrationId
      )
    };
  }
)(TermsConditionsWidget);
