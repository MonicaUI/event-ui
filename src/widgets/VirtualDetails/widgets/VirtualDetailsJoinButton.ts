import { connect } from 'react-redux';
import ButtonWidget from 'nucleus-widgets/lib/Button/ButtonWidget';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { joinWebcastSession, EVENT, SESSION } from '../redux';

/**
 * Data wrapper for the Virtual details page button widget.
 */
export default connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    let buttonText;
    if (state.virtualDetails?.isPassed) {
      buttonText = props.config?.joinBtnTextForRecording;
    } else if (state.virtualDetails?.type === SESSION) {
      buttonText = props.config?.joinBtnTextForSession;
    } else if (state.virtualDetails?.type === EVENT) {
      buttonText = props.config?.joinBtnTextForEvent;
    }
    return {
      config: {
        ...props.config,
        text: buttonText
      }
    };
  },
  {
    clickHandler: withLoading(joinWebcastSession)
  }
)(ButtonWidget);
