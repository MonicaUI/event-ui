import React, { useLayoutEffect } from 'react';
import Icon from '@cvent/nucleus-icon';
import { resolve } from '@cvent/nucleus-dynamic-css';

export const DialogContent = (props: $TSFixMe): $TSFixMe => {
  const { message, subMessage, icon, iconModifier, children, skipAutoFocus = false } = props;

  /*
   * We need the message container to claim focus for screen reader support. But, if it grabs focus while the
   * component is being mounted then dialog transitions won't work because the page will "scroll" to the focused
   * element cancelling the transition.
   *
   * The specific transition styles are applied to dialogs opened via the openDialogContainer action provided by nucleus
   * And they can be found here:
   * https://stash.cvent.net/projects/NUKE/repos/nucleus/browse/pkgs/nucleus-guestside-site/src/containers/styles/DialogTransitionUp.less
   */
  useLayoutEffect(() => {
    const elem = document.getElementsByName('messageContainer') && document.getElementsByName('messageContainer')[0];
    if (elem && !skipAutoFocus) {
      setTimeout(() => {
        elem.focus();
      }, 400);
    }
  }, [skipAutoFocus]);

  return (
    <div {...resolve(props, 'messageContainer', 'dialogDefaultFocus')} name="messageContainer" tabIndex="-1">
      {icon && <Icon icon={icon} modifier={resolve(props, 'messageIcon', iconModifier).className} />}
      {message && <div {...resolve(props, 'message')}>{message}</div>}
      {subMessage && <p {...resolve(props, 'subMessage')}>{subMessage}</p>}
      {children}
    </div>
  );
};
