import { DialogContent } from './DialogContent';
import DialogHeader from './DialogHeader';
import React from 'react';
import { resolveTestId } from '@cvent/nucleus-test-automation';

type Props = {
  title?: string;
  onClose?: $TSFixMeFunction;
  closeFallbackText?: string;
  message?: string;
  subMessage?: string;
  icon?: string;
  iconModifier?: string;
  style?: $TSFixMe;
  classes?: $TSFixMe;
  skipAutoFocus?: boolean;
};

export default class StandardDialog extends React.Component<Props> {
  render(): $TSFixMe {
    const {
      title,
      onClose,
      closeFallbackText,
      message,
      subMessage,
      icon,
      iconModifier,
      style,
      classes,
      children,
      skipAutoFocus
    } = this.props;
    return (
      <div {...resolveTestId(this.props)}>
        {(title || onClose) && (
          <DialogHeader
            text={title}
            onClose={onClose}
            closeFallbackText={closeFallbackText}
            style={style}
            classes={classes}
          />
        )}
        <DialogContent
          message={message}
          subMessage={subMessage}
          icon={icon}
          iconModifier={iconModifier}
          style={style}
          classes={classes}
          skipAutoFocus={skipAutoFocus}
        >
          {children}
        </DialogContent>
      </div>
    );
  }
}
