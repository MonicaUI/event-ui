import React from 'react';
import StandardDialog from '../shared/StandardDialog';
import SelectionConflictDialogStyles from './SelectionConflictDialog.less';
import ButtonStyles from 'nucleus-core/less/cv/Button.less';
import ButtonGroupStyles from 'nucleus-core/less/cv/ButtonGroup.less';
import { resolveTestId } from '@cvent/nucleus-test-automation';
import { withStyles, withCancelAndConfirmButtons } from '../ThemedDialog';
export { returnToProcessStart } from './actions';

const Dialog = withStyles(withCancelAndConfirmButtons(StandardDialog));

type OwnProps = {
  title?: string;
  informationalText?: string;
  instructionalText?: string;
  cancelSelectionLabel?: string;
  cancelSelection?: $TSFixMeFunction;
  continueSelectionLabel?: string;
  continueSelection?: $TSFixMeFunction;
  classes?: $TSFixMe;
  styles?: $TSFixMe;
};

type Props = OwnProps & typeof SelectionConflictDialog.defaultProps;

/**
 * A themeable system confirmation dialog to allow user to move forward
 * with their selection causing invalid products to be removed or
 * sticking with their current selection.
 */

export default class SelectionConflictDialog extends React.Component<Props> {
  static defaultProps = {
    classes: {
      ...SelectionConflictDialogStyles,
      button: ButtonStyles,
      buttonGroup: ButtonGroupStyles
    }
  };

  render(): $TSFixMe {
    const {
      title,
      informationalText,
      instructionalText,
      cancelSelectionLabel,
      cancelSelection,
      continueSelectionLabel,
      continueSelection,
      classes
    } = this.props;
    return (
      <Dialog
        {...resolveTestId(this.props)}
        title={title}
        message={title}
        subMessage={informationalText}
        icon="attentionWarning"
        iconModifier="error"
        classes={classes}
        secondaryButtonText={cancelSelectionLabel}
        primaryButtonText={continueSelectionLabel}
        cancel={cancelSelection}
        confirm={continueSelection}
        onClose={cancelSelection || continueSelection}
        content={instructionalText}
      />
    );
  }
}
