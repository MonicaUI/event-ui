import ContactInfoWidget from 'event-widgets/lib/ContactInfo/ContactInfoWidget';
import { connect } from 'react-redux';

/* Data wrapper for the widget */
export default connect((state: $TSFixMe) => ({
  contactFirstName: state.unsubscribe.inviteeFirstName,
  contactLastName: state.unsubscribe.inviteeLastName,
  contactEmail: state.unsubscribe.inviteeEmailAddress,
  plannerFirstName: state.unsubscribe.plannerFirstName,
  plannerLastName: state.unsubscribe.plannerLastName,
  plannerEmail: state.unsubscribe.plannerEmailAddress,
  translate: state.text.translate
}))(ContactInfoWidget);
