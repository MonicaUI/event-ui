import { connect } from 'react-redux';
import React from 'react';
import { getRegCart, isOAuthOnInAccount } from '../../redux/selectors/shared';
import { getIn } from 'icepick';
import {
  getEventRegistration as getEventRegistrationFromRegCart,
  getAdminPersonalInformation
} from '../../redux/registrationForm/regCart/selectors';
import StandardContactFields from 'event-widgets/lib/StandardContactFields/StandardContactFields';
import StandardContactFieldTextWidget from 'event-widgets/lib/StandardContactFields/StandardContactFieldTextWidget';
import { READ_ONLY, NOT_REQUIRED } from 'cvent-question-widgets/lib/DisplayType';
import { getLocalizedContactFieldForWidget } from './utils';
import * as eventRegistrationData from '../../utils/eventRegistrationData';
import {
  getEventRegistrationId,
  isGroupLeader,
  isGroupRegistration,
  getRegistrationPathId,
  isAttendeeRegistered,
  getTemporaryGuestEventRegistrationId,
  isViewingGuest,
  isNewRegistration
} from '../../redux/selectors/currentRegistrant';
import {
  getIdConfirmationReadOnlySetting,
  getPersonalInformationModificationSetting,
  isExternalAuthOnInEvent,
  isOAuthOnInEvent
} from '../../redux/selectors/event';
import { isHTTPPostOrSSOOnInAccount } from '../../redux/selectors/shared';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import { IdConfirmationFields } from 'event-widgets/utils/standardContactField';
import fields from '@cvent/event-fields/RegistrationOptionFields.json';

const readOnlyFieldsForEmailDupMatch = [fields.sourceId.id, fields.emailAddress.id];
const readOnlyFieldsForEmailLastFirstDupMatch = [
  fields.firstName.id,
  fields.lastName.id,
  fields.sourceId.id,
  fields.emailAddress.id
];
const SPECIFIC_REGISTRATION_PATH_AUTH_LOCATION = 2;

function checkExternalAuth(event, account, regPathId) {
  if (isExternalAuthOnInEvent(event) && isHTTPPostOrSSOOnInAccount(account)) {
    if (event.eventSecuritySetupSnapshot.authenticationLocation === SPECIFIC_REGISTRATION_PATH_AUTH_LOCATION) {
      return event.eventSecuritySetupSnapshot.authenticatedRegistrationPaths.includes(regPathId);
    }
    return true;
  }
  return false;
}

// To check if the invitee is redirected to guest side after Oauth Authentication
function isInviteeFromOAuth(account, event, regPathId) {
  if (isOAuthOnInAccount(account) && isOAuthOnInEvent(event)) {
    if (event.eventSecuritySetupSnapshot.authenticationLocation === SPECIFIC_REGISTRATION_PATH_AUTH_LOCATION) {
      return event.eventSecuritySetupSnapshot.authenticatedRegistrationPaths.includes(regPathId);
    }
    return true;
  }
  return false;
}

// Fetch isSkipIdEnabled setting from event snapshot.
function isSkipIdEnabled(state) {
  try {
    const registrationPathId = getRegistrationPathId(state);
    return getIdConfirmationReadOnlySetting(state, registrationPathId);
  } catch (ex) {
    return null;
  }
}

// To check if the fields need to be marked as read only
function shouldFieldBeMarkedReadOnly(fieldId, state) {
  let isFieldReadOnly = false;
  if (isInviteeFromOAuth(state.account, state.event, getRegistrationPathId(state))) {
    if (state.account.settings.dupMatchKeyType === 'EMAIL_LAST_FIRST_NAME') {
      isFieldReadOnly = readOnlyFieldsForEmailLastFirstDupMatch.includes(fieldId);
    } else {
      isFieldReadOnly = readOnlyFieldsForEmailDupMatch.includes(fieldId);
    }
  }
  if (!isFieldReadOnly && isSkipIdEnabled(state) && isNewRegistration(state)) {
    isFieldReadOnly = IdConfirmationFields.includes(fieldId);
  }
  return isFieldReadOnly;
}

// Fetch allowPersonalInformationModification setting from event snapshot.
function getAllowPersonalInformationModification(state) {
  const registrationPathId = getRegistrationPathId(state);
  return getPersonalInformationModificationSetting(state, registrationPathId);
}

export class StandardContactFieldTextWrapper extends React.Component {
  componentDidMount(): $TSFixMe {
    // eslint-disable-next-line react/prop-types
    if ((this.props as $TSFixMe).registrationField.display === READ_ONLY && (this.props as $TSFixMe).isRegTypeChanged) {
      // eslint-disable-next-line react/prop-types
      if ((this.props as $TSFixMe).lastSavedValue) {
        // eslint-disable-next-line react/prop-types
        (this.props as $TSFixMe).onTextChange((this.props as $TSFixMe).lastSavedValue);
      } else {
        // eslint-disable-next-line react/prop-types
        (this.props as $TSFixMe).onTextChange(null);
      }
    }
  }
  render(): $TSFixMe {
    return <StandardContactFieldTextWidget {...this.props} />;
  }
}

/**
 * returns true if its group member reg
 * @param state
 * @param config
 * @returns {*}
 */
function isGroupMemberReg(state, config) {
  const value = eventRegistrationData.answer({
    state,
    widgetConfig: config
  }).value;

  return getIn(value, ['attendee', 'isGroupMember']);
}

/*
 * Respect allowPersonalInformationModification setting if the following conditions are met
 * 1. cart is not for new/initial registration
 * 2. cart is not in progress or attendee is already registered
 * 3. attendee is not a guest
 * 4. field is one of the id confirmation fields
 * Note, if an attendee is not already registered and it is not new reg, that means it is a new group member.
 */
export function getSettingBasedRegistrationField(
  state: $TSFixMe,
  regCart: $TSFixMe,
  isNewReg: $TSFixMe,
  isGuestMode: $TSFixMe,
  registrationField: $TSFixMe
): $TSFixMe {
  const isAttendeeAlreadyRegistered = isAttendeeRegistered(state, getEventRegistrationId(state));
  const isRegCartInprogress = regCart && regCart.status === 'INPROGRESS';
  if (
    !isNewReg &&
    (!isRegCartInprogress || isAttendeeAlreadyRegistered) &&
    !isGuestMode &&
    IdConfirmationFields.includes(registrationField.fieldId)
  ) {
    const allowPersonalInformationModification = getAllowPersonalInformationModification(state);
    return (
      !allowPersonalInformationModification && {
        ...registrationField,
        display: READ_ONLY
      }
    );
  }
  return false;
}

export default (): $TSFixMe =>
  withMappedWidgetConfig(
    connect(
      withMemoizedFunctions({ getLocalizedContactFieldForWidget })(memoized =>
        // eslint-disable-next-line complexity
        (state: $TSFixMe, props: $TSFixMe) => {
          const registrationField = memoized.getLocalizedContactFieldForWidget(state, props.config, props.id);
          const fieldConfig = StandardContactFields[props.config.fieldId];
          const eventRegistrationPath = eventRegistrationData.buildEventRegistrationPath(fieldConfig.regApiPath);
          const isRegTypeChanged = state.regCartStatus.regTypeChanged;
          const isNewReg = isNewRegistration(state);
          const regCart = getRegCart(state);

          const hardcodedPrepopulatedValue = '905-00-1234';

          let answer = eventRegistrationData.answer({
            state,
            widgetConfig: props.config,
            eventRegistrationPath
          });

          if (props.isPrepopulated) {
            answer = eventRegistrationData.answer({
              state,
              widgetConfig: props.config,
              eventRegistrationPath
            });
            answer.value = hardcodedPrepopulatedValue;
          }

          const isGuestMode = getTemporaryGuestEventRegistrationId(state) !== undefined;
          let isGroupMember = isGroupMemberReg(state, props.config);
          /*
           * For email invitee and toggle isIdConfirmationReadOnly = true or
           * Invitee ariving after authenticating from OAuth
           * and new reg, not a new group member or guest, then disable editing of
           * IDFields[firstname, lastname, email, sourceId]
           */
          const isReadOnlyIdField =
            !isGuestMode &&
            !isGroupMember &&
            state.userSession.inviteeId &&
            shouldFieldBeMarkedReadOnly(registrationField.fieldId, state);

          const readOnlyRegField = isReadOnlyIdField && {
            ...registrationField,
            display: READ_ONLY
          };

          if (registrationField.fieldId === fields.emailAddress.id) {
            const value = eventRegistrationData.answer({
              state,
              widgetConfig: props.config
            }).value;

            const registrationPathId = value ? value.registrationPathId : null;
            if (checkExternalAuth(state.event, state.account, registrationPathId)) {
              // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
              isGroupMember = value && value.attendee.isGroupMember;
              const admin = getAdminPersonalInformation(regCart);
              // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
              const isAdmin = admin && admin.selectedValue;
              // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
              const emailAddressDomain = value && value.attendee.personalInformation.emailAddressDomain;
              // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
              const emailAddressValue = value && value.attendee.personalInformation.emailAddress;
              const isPreview = state.defaultUserSession.isPreview;
              if (
                !isGroupMember &&
                !isGuestMode &&
                !isPreview &&
                !(emailAddressValue || emailAddressDomain) &&
                !isAdmin
              ) {
                registrationField.display = NOT_REQUIRED;
              }
            }
          }

          const settingBasedRegistrationField = getSettingBasedRegistrationField(
            state,
            regCart,
            isNewReg,
            isGuestMode,
            registrationField
          );

          const secureAnswer = eventRegistrationData.answer({
            state,
            widgetConfig: props.config,
            eventRegistrationPath
          });

          const alwaysEnforceRequiredValidation = fieldConfig.alwaysEnforceRequiredValidation;
          const currentEventRegistrationId = getEventRegistrationId(state);
          const isPrimaryRegistrant = isGroupLeader(state, currentEventRegistrationId) || !isGroupRegistration(state);
          const shouldDisableFieldForPlannerReg =
            state.defaultUserSession.isPlanner &&
            fieldConfig.plannerRegistrationReadOnly &&
            !answer.isWidgetPlacedOnGuestModal;

          const {
            regCartStatus: { lastSavedRegCart }
          } = state;
          const currentEventRegistrant = getEventRegistrationFromRegCart(lastSavedRegCart, currentEventRegistrationId);
          // we are keeping the lastsaved value for read only fields
          const lastSavedValue = getIn(currentEventRegistrant, [
            'attendee',
            'personalInformation',
            fieldConfig.regApiPath[0]
          ]);

          return {
            registrationField: readOnlyRegField || settingBasedRegistrationField || registrationField,
            skipRequiredValidation: state.defaultUserSession.isPlanner && !alwaysEnforceRequiredValidation,
            plannerRegistrationReadOnly: isPrimaryRegistrant ? shouldDisableFieldForPlannerReg : false,
            value: answer.value,
            setterAction: answer.setterAction,
            secureSetterAction: secureAnswer.setterAction,
            secureMode: !!props.secureMode,
            isViewingGuest: isViewingGuest(state),
            experimentSettings: state.experiments,
            hardcodedPrepopulatedValue,
            isRegTypeChanged,
            lastSavedValue
          };
        }
      ),
      { setAnswer: eventRegistrationData.setAnswerAction },
      (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
        return {
          ...ownProps,
          ...stateProps,
          ...dispatchProps,
          onTextChange: value => dispatchProps.setAnswer(stateProps.setterAction, value),
          updateSecureContactField: value => dispatchProps.setAnswer(stateProps.secureSetterAction, value)
        };
      }
    )(StandardContactFieldTextWrapper)
  );
