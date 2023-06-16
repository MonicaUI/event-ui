import DragHandle from 'nucleus-core/containers/DragHandle';
import Icon from '@cvent/nucleus-icon';
import InteractiveElement from 'nucleus-core/containers/InteractiveElement';
import React from 'react';
import { resolve } from '@cvent/nucleus-dynamic-css';
import { tapOrClick } from 'nucleus-core/touchEventHandlers';
import { resolveTestId, injectTestId } from '@cvent/nucleus-test-automation';

type Props = {
  text?: string;
  onClose?: $TSFixMeFunction;
  closeFallbackText?: string;
  classes?: $TSFixMe;
  style?: $TSFixMe;
};

export default class DialogHeader extends React.Component<Props> {
  selectItem: $TSFixMe;
  handleClose = (event: $TSFixMe): $TSFixMe => {
    event.preventDefault();
    const { onClose } = this.props;
    if (onClose) {
      onClose();
    }
  };
  render(): $TSFixMe {
    const { text, onClose, closeFallbackText, classes, style } = this.props;
    return (
      <DragHandle classes={classes} style={style} aria-describedby="dialogHeader">
        <div {...resolve(this.props, 'dialogHeader')} {...resolveTestId(this.props)} id="dialogHeader">
          <h2 {...resolve(this.props, 'title')}>
            {onClose && (
              <InteractiveElement
                {...resolve(this.props, 'closeDialog')}
                {...injectTestId('close')}
                onClick={this.handleClose}
                {...tapOrClick(this.selectItem)}
              >
                <Icon icon="closeDeleteFilled" fallbackText={closeFallbackText} />
              </InteractiveElement>
            )}
            {text}
          </h2>
        </div>
      </DragHandle>
    );
  }
}
