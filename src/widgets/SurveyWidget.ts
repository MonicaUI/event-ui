import { connect } from 'react-redux';
import { unescape } from 'lodash';
import SurveyWidget from 'event-widgets/lib/Survey/SurveyWidget';
import { getIn } from 'icepick';

/**
 * Data wrapper for the Survey widget.
 */
export default connect((state: $TSFixMe, props: $TSFixMe) => {
  const translateWithDatatags = state.text.translateWithDatatags;
  const link = props.config.link;
  const eventFeaturesRegistrationProcess = getIn(state, ['event', 'eventFeatureSetup', 'registrationProcess']);
  return {
    translate: state.text.translate,
    enableHyperlink: true,
    config: {
      ...props.config,
      link: unescape(translateWithDatatags(link))
    },
    display:
      eventFeaturesRegistrationProcess.inquisiumFeedbackSurvey ||
      eventFeaturesRegistrationProcess.InquisiumFeedbackSurvey
  };
})(SurveyWidget);
