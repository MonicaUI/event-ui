import { connect } from 'react-redux';
import CodeWidget from 'event-code-widget/widget';

export default connect((state: $TSFixMe, props: $TSFixMe) => {
  return {
    script: state.text.translateWithDatatags(props.config.script)
  };
})(CodeWidget);
