import { connect } from 'react-redux';
import AlreadyRegisteredWidget from 'event-widgets/lib/AlreadyRegistered/AlreadyRegisteredWidget';
import { defaultMemoize } from 'reselect/lib/index';
import { bindActionCreators } from 'redux';
import { createLinkClickHandler, isAlreadyRegisteredLinkDisabled, isEventCancelled } from './RegisterButton/util';
import { isRegistrationModification } from '../redux/selectors/currentRegistrant';

export function mapStateToProps(state: $TSFixMe, props: $TSFixMe): $TSFixMe {
  const isRegMod = isRegistrationModification(state);
  const isPlanner = state.defaultUserSession.isPlanner;
  const linkDisabled = isAlreadyRegisteredLinkDisabled(state) || isEventCancelled(state) || isPlanner || isRegMod;
  return {
    translate: state.text.translate,
    config: {
      ...props.config,
      linkDisabled
    }
  };
}
export const mapDispatchToProps = (): $TSFixMe => {
  const memoizedCreateLinkClickHandler = defaultMemoize(createLinkClickHandler);
  return dispatch => {
    const actions = {
      linkClickHandler: memoizedCreateLinkClickHandler(
        'EventGuestSide_ExistingInvitee_AlreadyRegistered_Header__resx',
        ''
      )
    };
    return bindActionCreators(actions, dispatch);
  };
};

/**
 * Data wrapper for already registered widget
 */
export default connect(mapStateToProps, mapDispatchToProps)(AlreadyRegisteredWidget);
