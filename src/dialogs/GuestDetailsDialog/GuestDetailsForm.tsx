import React from 'react';
import StandardDialog from '../shared/StandardDialog';
import dialogStyles from '../styles/Dialog.less';
import dialogHeaderStyles from '../styles/DialogHeader.less';
import { injectTestId } from '@cvent/nucleus-test-automation';
import Form from 'nucleus-form/src/components/Form';
import DefaultPageRenderer from 'nucleus-guestside-site/src/containers/ResponsiveFontPage';
import RelatedContacts from './RelatedContacts/RelatedContacts';
import { getIn } from 'icepick';
import { connect } from 'react-redux';

function getRelatedContactsViewVisibility(state) {
  return getIn(state, ['addGuestFromRelatedContacts', 'showRelatedContactsView']);
}

export function GuestDetailsForm(props: $TSFixMe): $TSFixMe {
  const { dialogConfig, guestDetailsPage, showRelatedContactsView, translate } = props;

  return (
    <StandardDialog
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      dialogConfig={dialogConfig}
      classes={{ ...dialogStyles, ...dialogHeaderStyles }}
      {...injectTestId('guest-details-dialog')}
    >
      {!showRelatedContactsView && (
        <Form>
          <DefaultPageRenderer page={guestDetailsPage} />
        </Form>
      )}
      {showRelatedContactsView && <RelatedContacts translate={translate} dialogConfig={dialogConfig} />}
    </StandardDialog>
  );
}

export default connect((state: $TSFixMe) => {
  return {
    showRelatedContactsView: getRelatedContactsViewVisibility(state)
  };
})(GuestDetailsForm);
