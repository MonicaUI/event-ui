import { connect } from 'react-redux';
import AgendaAtAGlanceWidget from 'event-widgets/lib/AgendaAtAGlance/AgendaAtAGlanceWidget';

/**
 * Data wrapper for the Agenda At A Glance widget
 */
export default connect((state: $TSFixMe) => {
  const {
    experiments: { isFlexAgendaAtAGlanceWidgetEnabled }
  } = state;
  return {
    isFlexAgendaAtAGlanceWidgetEnabled
  };
})(AgendaAtAGlanceWidget);
