import React from 'react';
import { ConfirmationDialog } from '../shared/ConfirmationDialog';
import { injectTestId } from '@cvent/nucleus-test-automation';

export const GroupCancelDialog = (props: $TSFixMe): $TSFixMe => {
  const { style, classes } = props;
  return (
    <ConfirmationDialog {...injectTestId('group-cancel-registration')} {...props} style={style} classes={classes} />
  );
};
