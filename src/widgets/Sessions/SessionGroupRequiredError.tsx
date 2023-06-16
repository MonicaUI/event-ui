import ErrorDisplay from 'nucleus-form/src/components/inputs/ErrorDisplay';
import React from 'react';
import { useGuestTranslate } from 'event-widgets/utils/guestText';
import { guestCount } from './util';

import { includes, intersection } from 'lodash';
import buildValidators from 'event-widgets/utils/validation/buildValidators';
import { connect, useSelector } from 'react-redux';
import {
  getCurrentRegistrantAndGuests,
  getPrimaryAndGuestVisibleEventRegistration
} from '../../redux/selectors/productSelectors';
import { isGuestProductSelectionEnabledOnRegPath } from '../../redux/selectors/currentRegistrationPath';

const shouldValidateSessionGroup = (sessionGroup, eventRegistration) => {
  return includes(sessionGroup.visibleEventReg, eventRegistration.eventRegistrationId);
};

const registrationSelectedTheGroup = (sessionGroup, eventRegistration) => {
  const groupSessionIds = Object.keys(sessionGroup.sessions);
  const selectedSessionIds = Object.keys(eventRegistration.sessionRegistrations).filter(
    sessionId => eventRegistration.sessionRegistrations[sessionId].requestedAction === 'REGISTER'
  );
  return intersection(groupSessionIds, selectedSessionIds).length > 0; // or === 1 maybe
};

const getValidationMessage = (translate, sessionGroup, showRegistrantsInValidationMessages) =>
  showRegistrantsInValidationMessages
    ? translate('EventGuest_SessionGroup_SelectOneValidation__resx')
    : translate('RegistrationProcess_SessionWidget_SessionGroupRequired__resx');

export const buildRequiredSessionGroupValidation = buildValidators({
  objectValidatesRegistrant: shouldValidateSessionGroup,
  registrantIsValid: registrationSelectedTheGroup,
  getValidationMessage
});

function SessionGroupRequiredError({
  // eslint-disable-next-line react/prop-types
  sessionGroup,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, react/prop-types
  skipRequiredValidation,
  // eslint-disable-next-line react/prop-types
  showRegistrantsInValidationMessages,
  ...rest
}) {
  const translate = useGuestTranslate();
  const currentRegistrants = useSelector(getCurrentRegistrantAndGuests);
  const visibleEventRegistration = useSelector(getPrimaryAndGuestVisibleEventRegistration);

  const validations = buildRequiredSessionGroupValidation({
    translate,
    currentRegistrants,
    validationObjects: {
      requiredSessionGroup: {
        ...sessionGroup,
        // eslint-disable-next-line react/prop-types
        visibleEventReg: visibleEventRegistration[sessionGroup.id]
          ? // eslint-disable-next-line react/prop-types
            visibleEventRegistration[sessionGroup.id].visibleEventReg
          : undefined
      }
    },
    showRegistrantsInValidationMessages
  });

  return (
    <ErrorDisplay
      {...rest}
      // eslint-disable-next-line react/prop-types
      fieldName={`sessionGroupRequiredError-${sessionGroup.id}`}
      value={sessionGroup}
      validations={validations}
    />
  );
}

export default connect((state: $TSFixMe) => {
  return {
    showRegistrantsInValidationMessages: guestCount(state) > 0 && isGuestProductSelectionEnabledOnRegPath(state)
  };
})(SessionGroupRequiredError);
