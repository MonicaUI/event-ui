import ContactInfoWidget from 'event-widgets/lib/ContactInfo/ContactInfoWidget';
import { connect } from 'react-redux';

/* Data wrapper for the widget */
export default connect((state: $TSFixMe) => ({
  contactFirstName: state.optOut.inviteeFirstName,
  contactLastName: state.optOut.inviteeLastName,
  contactEmail: state.optOut.inviteeEmailAddress,
  plannerFirstName: state.optOut.plannerFirstName,
  plannerLastName: state.optOut.plannerLastName,
  plannerEmail: state.optOut.plannerEmailAddress,
  translate: state.text.translate
}))(ContactInfoWidget);
