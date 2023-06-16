import { connect } from 'react-redux';
import EventIdentityConfirmationWidget from 'event-widgets/lib/IdentityConfirmation/IdentityConfirmationWidget';
import { updateAdmin } from '../../redux/registrationForm/regCart/actions';
import { isLinkedInviteeRegistration } from '../../redux/userSession';
import { isPlannerRegistration } from '../../redux/defaultUserSession';
import { CLOSED } from 'event-widgets/clients/EventStatus';
import {
  getEventRegistrationId,
  isRegistrationModification,
  isGroupMember,
  getAdminPersonalInformation,
  isGroupRegistration,
  isOnPrivateRegPathOrWithLimitedTargetList,
  isOnEmailInviteOnlyRegPath
} from '../../redux/selectors/currentRegistrant';
import {
  isAdministratorRegistrationEnabled,
  shouldMakeAdminFieldReadOnly,
  isSsoInviteeFlow,
  isHTTPPostOrSSOOnInAccount,
  isOAuthOnInAccount,
  areRegistrationActionsDisabled
} from '../../redux/selectors/shared';
import { getRegistrationPathIdForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { clearFields } from './actions';
import { isExternalAuthOnInEvent, isOAuthOnInEvent } from '../../redux/selectors/event';

const isOAuthOn = (account, event) => {
  return isOAuthOnInAccount(account) && isOAuthOnInEvent(event);
};

/**
 * Data wrapper for the event identity confirmation widget.
 */
export default connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    const eventRegistrationId = getEventRegistrationId(state);
    const isRegMod = isRegistrationModification(state);
    const groupMember = isGroupMember(state, eventRegistrationId);
    const regPathId = getRegistrationPathIdForWidget(state, props.id);
    return {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getConfig' does not exist on type 'typeo... Remove this comment to see the full error message
      config: EventIdentityConfirmationWidget.getConfig(state, props.config, 'EventIdentityConfirmation', props.id),
      shouldMakeAdminFieldReadOnly: shouldMakeAdminFieldReadOnly(state),
      showAdminRegCheckbox:
        isAdministratorRegistrationEnabled(state, regPathId) &&
        !isRegMod &&
        !groupMember &&
        !isSsoInviteeFlow(state, regPathId),
      isExternalAuthEnabled: isHTTPPostOrSSOOnInAccount(state.account) && isExternalAuthOnInEvent(state.event),
      isOAuthEnabled: isOAuthOn(state.account, state.event),
      admin: getAdminPersonalInformation(state) || { selectedValue: false },
      hideClearButton:
        isGroupRegistration(state) ||
        !isLinkedInviteeRegistration(state) ||
        isPlannerRegistration(state) ||
        isRegMod ||
        state.event.status === CLOSED ||
        (isOnPrivateRegPathOrWithLimitedTargetList(state) && isOnEmailInviteOnlyRegPath(state)) ||
        areRegistrationActionsDisabled(state),
      isSiteEditor: false
    };
  },
  {
    onClear: clearFields,
    onAdminUpdate: updateAdmin
  },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    onClear: stateProps.hideClearButton ? undefined : dispatchProps.onClear,
    onAdminUpdate: dispatchProps.onAdminUpdate,
    hideClearButton: undefined
  })
)(EventIdentityConfirmationWidget);
