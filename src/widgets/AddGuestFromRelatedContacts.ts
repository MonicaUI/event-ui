import { connect } from 'react-redux';
import { toggleRelatedContactsView } from '../redux/addGuestFromRelatedContacts/actions';
import {
  getEventRegistration,
  isArriveFromPublicWeblink,
  isPopulateKnownInviteeInformation
} from '../redux/selectors/currentRegistrant';
import { getIn } from 'icepick';
import { getRegistrationPath } from 'event-widgets/redux/selectors/appData';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import AddGuestFromRelatedContactsWidget from 'event-widgets/lib/AddGuestFromRelatedContacts/AddGuestFromRelatedContactsWidget';

export default connect(
  (state: $TSFixMe) => {
    const primaryEventRegistration = getEventRegistration(state) || {};
    const registrationPathId = getIn(primaryEventRegistration, ['registrationPathId']);
    const contactId = getIn(primaryEventRegistration, ['attendee', 'personalInformation', 'contactId']);
    const canAddGuestFromRelatedContactEnabled = !!getIn(getRegistrationPath(state.appData, registrationPathId), [
      'guestRegistrationSettings',
      'canAddGuestFromRelatedContact'
    ]);
    const isPlanner = getIn(state, ['defaultUserSession', 'isPlanner']);
    const canWidgetBeShown = !(
      !isPlanner &&
      !isPopulateKnownInviteeInformation(state, registrationPathId) &&
      isArriveFromPublicWeblink(state)
    );

    return {
      isSiteEditorPreview: false,
      canAddGuestFromRelatedContactEnabled,
      contactId,
      canWidgetBeShown
    };
  },
  {
    clickHandler: withLoading(toggleRelatedContactsView)
  }
)(AddGuestFromRelatedContactsWidget);
