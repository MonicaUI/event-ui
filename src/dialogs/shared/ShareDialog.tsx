import DialogHeader from './DialogHeader';
import React from 'react';
import { resolveTestId } from '@cvent/nucleus-test-automation';
import { resolve } from '@cvent/nucleus-dynamic-css';

type Props = {
  title?: string;
  onClose?: $TSFixMeFunction;
  closeFallbackText?: string;
  style?: $TSFixMe;
  classes?: $TSFixMe;
};

export default class ShareDialog extends React.Component<Props> {
  render(): $TSFixMe {
    const { title, onClose, closeFallbackText, style, classes, children } = this.props;
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
        <div {...resolve(this.props, 'content')}>{children}</div>
      </div>
    );
  }
}
