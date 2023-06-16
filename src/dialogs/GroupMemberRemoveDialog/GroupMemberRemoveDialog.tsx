import React from 'react';
import { ConfirmationDialog } from '../shared/ConfirmationDialog';
import { injectTestId } from '@cvent/nucleus-test-automation';

export const GroupMemberRemoveDialog = (props: $TSFixMe): $TSFixMe => {
  const { style, classes } = props;
  return (
    <ConfirmationDialog {...injectTestId('group-member-remove-dialog')} {...props} style={style} classes={classes} />
  );
};
