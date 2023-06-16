import React from 'react';
import StandardDialog from '../shared/StandardDialog';
import Button from 'nucleus-core/buttons/Button';
import ButtonGroup from 'nucleus-core/buttons/ButtonGroup';
import { select } from '@cvent/nucleus-dynamic-css';
import { resolveTestId, injectTestId } from '@cvent/nucleus-test-automation';

/**
 * A system confirmation dialog to allow user to move forward/previous
 * with their unsaved travel info in current page causing unsaved travel info to be removed or
 * stay at current page with unsaved info
 */
export const TravelUnsavedInfoWarningDialog = (props: $TSFixMe): $TSFixMe => {
  const {
    title,
    informationalText,
    cancelSelectionLabel,
    cancelSelection,
    continueSelectionLabel,
    continueSelection,
    classes,
    style
  } = props;
  return (
    <StandardDialog
      {...resolveTestId(props)}
      title={title}
      message={title}
      subMessage={informationalText}
      icon="attentionWarning"
      iconModifier="error"
      classes={classes}
      style={style}
    >
      <ButtonGroup {...select({ classes }, 'buttonGroup')} alignment="center">
        {cancelSelection && (
          <Button
            {...select({ classes }, 'button')}
            {...injectTestId('cancel-selection')}
            kind="secondary"
            onClick={cancelSelection}
          >
            {cancelSelectionLabel}
          </Button>
        )}
        <Button
          {...select({ classes }, 'button')}
          {...injectTestId('continue-selection')}
          kind="primary"
          onClick={continueSelection}
        >
          {continueSelectionLabel}
        </Button>
      </ButtonGroup>
    </StandardDialog>
  );
};
