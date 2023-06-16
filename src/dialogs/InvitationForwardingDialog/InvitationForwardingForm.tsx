import React from 'react';
import SubstituteRegistrationStyles from '../SubstituteRegistrationDialog/SubstituteRegistration.less';
import DialogHeader from '../shared/DialogHeader';
import { injectTestId } from '@cvent/nucleus-test-automation';
import Transition from 'nucleus-core/containers/Transition';
import InvitationForm from './InvitationForm';
import SlideRightAnimation from '../AlreadyRegisteredAndContactPlanner/SlideRightAnimation.less';
import SlideLeftAnimation from '../AlreadyRegisteredAndContactPlanner/SlideLeftAnimation.less';
import { defaultMemoize } from 'reselect';
import { textEmailAddress, textRequired } from 'nucleus-widgets/utils/nucleusFormValidations';
const TRANSITION_TIME_OUT = 500;
const reverseTransition = false;
const transitionOptions = {
  defaultName: 'invitationForwardingPanel',
  classes: reverseTransition ? SlideRightAnimation : SlideLeftAnimation,
  transitionAppearTimeout: TRANSITION_TIME_OUT,
  transitionEnterTimeout: TRANSITION_TIME_OUT,
  transitionLeaveTimeout: TRANSITION_TIME_OUT
};

type Props = {
  title?: string;
  classes?: $TSFixMe;
  style?: $TSFixMe;
  invitationForwardingSettings?: {
    isCustomMessageEnabled?: boolean;
    invitationForwardingSuccess?: boolean;
    invitationForwardingError?: boolean;
    autoFocus?: boolean;
  };
  resetInvitationForwarding?: $TSFixMeFunction;
  requestClose?: $TSFixMeFunction;
  translate?: $TSFixMeFunction;
  onSubmit?: $TSFixMeFunction;
};

type State = $TSFixMe;

/*
 * Invitation Forwarding Form that renders the UI for the popup ( header + InvitationForm)
 */
export default class InvitationForwardingForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      emailAddress: '',
      comments: ''
    };
  }

  handleClose = (): $TSFixMe => {
    this.props.requestClose();
    this.props.resetInvitationForwarding();
  };

  getEmailAddressValidations = defaultMemoize(translate => {
    return {
      required: textRequired(translate),
      email: textEmailAddress(translate)
    };
  });

  getFirstNameValidations = defaultMemoize(translate => {
    return { required: textRequired(translate) };
  });

  getLastNameValidations = defaultMemoize(translate => {
    return { required: textRequired(translate) };
  });

  onChange = (fieldName: $TSFixMe, fieldValue: $TSFixMe): $TSFixMe => {
    this.setState(prevState => {
      return {
        ...prevState,
        [fieldName]: fieldValue
      };
    });
  };

  render(): $TSFixMe {
    const {
      title,
      invitationForwardingSettings: { isCustomMessageEnabled, autoFocus },
      classes,
      style,
      resetInvitationForwarding,
      translate,
      onSubmit
    } = this.props;
    const { firstName, lastName, emailAddress, comments } = this.state;
    return (
      <div className={SubstituteRegistrationStyles.dialogContainer}>
        <DialogHeader
          {...injectTestId('Dialog-Header')}
          text={translate(title)}
          onClose={this.handleClose}
          closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
          style={style}
          classes={classes}
        />
        <Transition {...transitionOptions}>
          <div key="identity" className={SubstituteRegistrationStyles.panel}>
            <InvitationForm
              onChange={this.onChange}
              classes={classes}
              style={style}
              showAdditionalCommentSection={isCustomMessageEnabled}
              onAddAnother={resetInvitationForwarding}
              onSubmit={() => {
                onSubmit();
                this.handleClose();
              }}
              translate={translate}
              autoFocus={autoFocus}
              formData={{ firstName, lastName, emailAddress, comments }}
              onCancel={this.handleClose}
              validation={{
                emailAddressValidation: this.getEmailAddressValidations,
                firstNameValidation: this.getFirstNameValidations,
                lastNameValidation: this.getLastNameValidations
              }}
            />
          </div>
        </Transition>
      </div>
    );
  }
}
