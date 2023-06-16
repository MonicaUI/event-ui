import { connect } from 'react-redux';
import ButtonWidget from 'nucleus-widgets/lib/Button/ButtonWidget';
import { defaultMemoize } from 'reselect/lib/index';
import { bindActionCreators } from 'redux';
import { getAssociatedRegistrationPathId } from '../../redux/selectors/shared';
import { canRegister } from '../../redux/selectors/currentRegistrant';
import { canWaitlist } from '../../redux/selectors/event';
import { promptToStartNewRegistration } from './actions';
import ClassNames from 'nucleus-widgets/lib/Button/Button.less';
import ButtonStyles from 'nucleus-widgets/lib/Button/Button.less';
import { createLinkClickHandler, isAlreadyRegisteredLinkDisabled } from './util';

export function mapStateToProps(state: $TSFixMe, props: $TSFixMe): $TSFixMe {
  const {
    defaultUserSession: { isPlanner, isPreview },
    event: { isArchived }
  } = state;
  const buttonDisabled =
    (isArchived ||
      (!canRegister(state) &&
        !canWaitlist(state, getAssociatedRegistrationPathId(state, state.userSession.regTypeId)))) &&
    !isPlanner &&
    !isPreview;
  const linkDisabled = isAlreadyRegisteredLinkDisabled(state);

  const mappedProps = {
    disabled: buttonDisabled,
    kind: 'button'
  };

  if (buttonDisabled) {
    (mappedProps as $TSFixMe).classes = {
      ...ClassNames,
      button: {
        ...ButtonStyles,
        disabled: ClassNames.disabled
      }
    };
  }

  if (linkDisabled) {
    (mappedProps as $TSFixMe).config = {
      ...props.config,
      link: {
        enabled: false,
        text: ''
      }
    };
  }
  return mappedProps;
}
export const mapDispatchToProps = (): $TSFixMe => {
  const memoizedCreateLinkClickHandler = defaultMemoize(createLinkClickHandler);
  return (dispatch, props) => {
    const registerNowText = props.config.text.htmlContent
      ? props.config.text.htmlContent.replace(/<[^>]*>/g, '')
      : props.config.text;
    const actions = {
      clickHandler: promptToStartNewRegistration,
      linkClickHandler: memoizedCreateLinkClickHandler(
        'EventGuestSide_ExistingInvitee_AlreadyRegistered_Header__resx',
        registerNowText
      )
    };
    return bindActionCreators(actions, dispatch);
  };
};

/**
 * Data wrapper for the event register now widget.
 */
export default connect(mapStateToProps, mapDispatchToProps)(ButtonWidget);
