import { connect } from 'react-redux';
import ButtonWidget from 'nucleus-widgets/lib/Button/ButtonWidget';
import { optOutAction } from '../redux';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';

/**
 * Data wrapper for the opt in and opt out button widget.
 */
export default connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const optOutStatus = state.optOut && state.optOut.optOutStatus;
    return {
      optOutStatus,
      config: {
        ...props.config,
        text: optOutStatus ? props.config.text : props.config.alternateText
      }
    };
  },
  {
    clickHandler: withLoading(mergedProps => dispatch => dispatch(optOutAction(!mergedProps.optOutStatus, true)))
  }
)(ButtonWidget);
