import { connect } from 'react-redux';
import ButtonWidget from 'nucleus-widgets/lib/Button/ButtonWidget';
import { unsubscribeAction } from '../redux';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';

/**
 * Data wrapper for the unsubscribe and subscribe page button widget.
 */
export default connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const unsubscribeStatus = state.unsubscribe && state.unsubscribe.unsubscribeStatus;
    return {
      unsubscribeStatus,
      config: {
        ...props.config,
        text: unsubscribeStatus ? props.config.text : props.config.alternateText
      }
    };
  },
  {
    clickHandler: withLoading(mergedProps => dispatch => dispatch(unsubscribeAction(!mergedProps.unsubscribeStatus)))
  }
)(ButtonWidget);
