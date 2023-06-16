import ErrorDisplay from 'nucleus-form/src/components/inputs/ErrorDisplay';
import React from 'react';
import sessionMinMaxRulesValidators from 'event-widgets/lib/Sessions/validations/sessionMinMax';
import sessionAdvancedRulesValidators from 'event-widgets/lib/Sessions/validations/advancedRules';
import { filter, merge } from 'lodash';
import { connect } from 'react-redux';
import { getAdmissionItems } from 'event-widgets/redux/selectors/event';
import {
  getCurrentRegistrantAndGuests,
  getSkipSessionValidationAttendees
} from '../../redux/selectors/productSelectors';
import { getAdvancedSessionRules } from '../../redux/selectors/event';
import { guestCount } from './util';
import { isGuestProductSelectionEnabledOnRegPath } from '../../redux/selectors/currentRegistrationPath';
import { refPreserving } from '@cvent/ref-preserving-function';

function SessionsErrorDisplay(props) {
  const {
    // eslint-disable-next-line react/prop-types
    advancedSessionRules = [],
    // eslint-disable-next-line react/prop-types
    currentRegistrants,
    // eslint-disable-next-line react/prop-types
    eventAdmissionItems,
    // eslint-disable-next-line react/prop-types
    attendeesToSkipSessionValidations = {},
    // eslint-disable-next-line react/prop-types
    translate
  } = props;
  const { attendeesToSkipMinMaxValidation = [], attendeesToSkipAdvancedRulesValidation = [] } =
    attendeesToSkipSessionValidations;

  let allValidations = {};
  let updatedRegistrants = filter(
    currentRegistrants,
    registrant => registrant && !attendeesToSkipMinMaxValidation.includes(registrant.eventRegistrationId)
  );
  // preventing min/max validation during reg mod for existing registered sessions
  allValidations = sessionMinMaxRulesValidators({
    translate,
    currentRegistrants: updatedRegistrants,
    validationObjects: eventAdmissionItems,
    // eslint-disable-next-line react/prop-types
    showRegistrantsInValidationMessages: props.showRegistrantsInValidationMessages
  });
  // preventing advanced rules validation during reg mod for existing registered sessions
  updatedRegistrants = filter(
    currentRegistrants,
    registrant => registrant && !attendeesToSkipAdvancedRulesValidation.includes(registrant.eventRegistrationId)
  );
  allValidations = merge(
    allValidations,
    sessionAdvancedRulesValidators({
      translate,
      currentRegistrants: updatedRegistrants,
      advancedSessionRules,
      // eslint-disable-next-line react/prop-types
      showRegistrantsInValidationMessages: props.showRegistrantsInValidationMessages
    })
  );
  return (
    <ErrorDisplay
      // eslint-disable-next-line react/prop-types
      classes={props.classes}
      // eslint-disable-next-line react/prop-types
      style={props.style}
      fieldName="sessionSelection"
      validations={allValidations}
    />
  );
}

export default connect(() => {
  const getSkipSessionValidationAttendeesMemoized = refPreserving(getSkipSessionValidationAttendees);
  return (state: $TSFixMe) => {
    return {
      advancedSessionRules: getAdvancedSessionRules(state),
      currentRegistrants: getCurrentRegistrantAndGuests(state),
      eventAdmissionItems: getAdmissionItems(state),
      attendeesToSkipSessionValidations: getSkipSessionValidationAttendeesMemoized(state),
      showRegistrantsInValidationMessages: guestCount(state) > 0 && isGuestProductSelectionEnabledOnRegPath(state)
    };
  };
})(SessionsErrorDisplay);
