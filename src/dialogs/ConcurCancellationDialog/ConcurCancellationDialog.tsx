import React from 'react';
import StandardDialog from '../shared/StandardDialog';
import Button from 'nucleus-core/buttons/Button';
import ButtonGroup from 'nucleus-core/buttons/ButtonGroup';
import { resolve, select } from '@cvent/nucleus-dynamic-css';
import { resolveTestId, injectTestId } from '@cvent/nucleus-test-automation';
import { closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { connect } from 'react-redux';
import { routeToPage } from '../../redux/pathInfo';

const routeToCancellationPage = () => {
  return async dispatch => {
    dispatch(routeToPage('cancelRegistration'));
    dispatch(closeDialogContainer());
  };
};

type ConcurCancellationDialogProps = {
  classes?: $TSFixMe;
  styles?: $TSFixMe;
  translate?: $TSFixMeFunction;
  continueSelection?: $TSFixMeFunction;
};

/**
 * Confirmation dialog to show warning for existing concur bookings for invitee and its guests
 * to explicitly cancel them independent of reg cancellation
 */
class ConcurCancellationDialog extends React.Component<ConcurCancellationDialogProps> {
  render() {
    const { translate, classes, continueSelection } = this.props;
    return (
      <StandardDialog
        {...resolveTestId(this.props)}
        message={translate('EventGuestSide_HotelShoulderDateWarning_Title__resx')}
        subMessage={translate('EventWidgets_ConcurCancellationWarning_MessageFirstLine__resx')}
        icon="error"
        iconModifier="error"
        classes={classes}
      >
        <p {...resolve(this.props, 'subMessage')}>
          {translate('EventWidgets_ConcurCancellationWarning_MessageSecondLine__resx')}
        </p>
        <ButtonGroup {...select({ classes }, 'buttonGroup')} alignment="center">
          <Button
            {...select({ classes }, 'button')}
            {...injectTestId('continue-selection')}
            kind="primary"
            onClick={continueSelection}
          >
            {translate('EventWidgets_ConcurCancellationWarning_ContinueButtonText__resx')}
          </Button>
        </ButtonGroup>
      </StandardDialog>
    );
  }
}

export default connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    const {
      translate,
      dialogConfig: { classes, styles }
    } = props;
    return {
      classes,
      styles,
      translate
    };
  },
  { continueSelection: routeToCancellationPage }
)(ConcurCancellationDialog);
