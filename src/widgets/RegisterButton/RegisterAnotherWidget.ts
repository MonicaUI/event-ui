import { connect } from 'react-redux';
import ButtonWidget from 'nucleus-widgets/lib/Button/ButtonWidget';
import { promptToStartNewRegistration } from './actions';
import { bindActionCreators } from 'redux';
import { getAssociatedRegistrationPathId } from '../../redux/selectors/shared';
import { canWaitlist } from '../../redux/selectors/event';
import { canRegister, canLogin } from '../../redux/selectors/currentRegistrant';

const mapStateToProps = (state: $TSFixMe, props: $TSFixMe) => {
  const mappedProps = {
    disabled:
      !canRegister(state) && !canWaitlist(state, getAssociatedRegistrationPathId(state, state.userSession.regTypeId)),
    kind: 'button',
    startWithDefaultRegPath: true
  };

  if (!canLogin(state)) {
    (mappedProps as $TSFixMe).config = {
      ...props.config
    };
  }
  return mappedProps;
};

const mapDispatchToProps = () => {
  return dispatch => {
    const actions = {
      clickHandler: promptToStartNewRegistration
    };
    return bindActionCreators(actions, dispatch);
  };
};

/**
 * Data wrapper for the event register another widget.
 */
export default connect(mapStateToProps, mapDispatchToProps)(ButtonWidget);
