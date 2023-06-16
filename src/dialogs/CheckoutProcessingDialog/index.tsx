import React from 'react';
import { connect } from 'react-redux';
import Dialog from 'nucleus-core/dialog/Dialog';
import CheckoutProcessing from './CheckoutProcessing';
import {
  CHECKING_OUT,
  CHECKED_OUT,
  CHECKED_OUT_PARTIALLY,
  STARTING_REGISTRATION
} from '../../redux/registrationIntents';
import DialogStylesContext from '../DialogStylesContext';

const popupConfig = {
  requestClose: () => {},
  dialogId: 'CheckoutProcessingDialog',
  isModal: true,
  header: <div />,
  isAnimatable: false
};

type Props = {
  isPending: boolean;
};

function CheckoutProcessingDialog({ isPending, ...others }: Props) {
  return (
    <DialogStylesContext.Consumer>
      {dialogStyles => (
        <Dialog
          isOpen={isPending}
          {...popupConfig}
          classes={{
            ...(dialogStyles as $TSFixMe).checkoutProcessing,
            transition: { ...(dialogStyles as $TSFixMe).transitions.up }
          }}
        >
          <CheckoutProcessing {...others} />
        </Dialog>
      )}
    </DialogStylesContext.Consumer>
  );
}

CheckoutProcessingDialog.displayName = 'CheckoutProcessingDialog';

export default connect((state: $TSFixMe) => {
  const {
    regCartStatus: { checkoutProgress, registrationIntent, startProgress },
    registrationForm: {
      regCart: { regDecline }
    }
  } = state;
  if (registrationIntent === STARTING_REGISTRATION && typeof startProgress === 'number') {
    /*
     * Hack to get quick support for async reg mod creation
     * Should get a real UI treatment
     */
    return {
      messageOverride: state.text.translate('EventGuestSide_StartRegModProcessingMessage__resx'),
      translate: state.text.translate,
      percentComplete: startProgress,
      isPending: true,
      isSuccess: false
    };
  }
  return {
    messageOverride: regDecline && state.text.translate('EventGuestSide_DeclineProcessingMessage__resx'),
    headerOverride: regDecline && state.text.translate('EventGuestSide_DeclineProcessingHeader__resx'),
    translate: state.text.translate,
    percentComplete: checkoutProgress,
    isPending: registrationIntent === CHECKING_OUT,
    isSuccess: registrationIntent === CHECKED_OUT || registrationIntent === CHECKED_OUT_PARTIALLY
  };
})(CheckoutProcessingDialog);
