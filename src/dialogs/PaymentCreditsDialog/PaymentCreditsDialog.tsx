import StandardDialog from '../shared/StandardDialog';
import React from 'react';
import { resolve } from '@cvent/nucleus-dynamic-css';
import PaymentCreditsDialogStyles from './PaymentCreditsDialog.less';
import { formatAttendeeNameFromResource } from 'event-widgets/utils/formatAttendeeName';

const renderAttendeeCreditsInfo = (attendee, paymentCreditsInfo = {}, translateCurrency, translate) => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'creditsCharge' does not exist on type '{... Remove this comment to see the full error message
  const { creditsCharge: creditsDeducted = 0 } = paymentCreditsInfo;

  if (creditsDeducted === 0 || !attendee) {
    // do not show info if credits are not applied for this attendee, or if attendee not present
    return null;
  }
  const attendeeFullName = formatAttendeeNameFromResource(attendee, translate);
  /*
   * use the total of pendingPaymentCredits and availablePaymentCredits as the effective credits available
   * to an attendee; pendingPaymentCredits is null when the event does not require planner approval and
   *  when a new registration is being done that does require planner approval, so we default it to zero
   *  in those cases.
   */
  const pendingPaymentCredits = attendee.pendingPaymentCredits || 0;
  const creditsRemaining = (attendee.availablePaymentCredits || 0) + pendingPaymentCredits - creditsDeducted;
  const remainingBalanceMessage = `(${translate(
    'EventWidgets_PaymentWidget_PaymentCreditsRemainingBalance__resx'
  )} ${translateCurrency(creditsRemaining)})`;
  return (
    <div className={PaymentCreditsDialogStyles.attendeeInfoContainer}>
      <div>
        <span className={PaymentCreditsDialogStyles.attendeeName}>{attendeeFullName}</span>
        <span className={PaymentCreditsDialogStyles.attendeeCreditsDeducted}>
          {translateCurrency(0 - creditsDeducted)}
        </span>
      </div>
      <div className={PaymentCreditsDialogStyles.attendeeCreditsRemaining}>{remainingBalanceMessage}</div>
    </div>
  );
};

// render popup info for every paymentCredits charge  PaymentCreditsDialog
const renderPopupInfo = (translate, translateCurrency, attendees, paymentCreditsForEventReg = {}, props) => {
  return (
    <div {...resolve(props, 'body')}>
      <div className={PaymentCreditsDialogStyles.paymentCreditsNote}>
        <span>{translate('EventWidgets_PaymentWidget_PaymentCreditsNoteOnModal__resx')}</span>
      </div>
      <div>
        {Object.values(paymentCreditsForEventReg).map(paymentCreditsInfo => {
          const attendee = attendees.find(a => a.eventRegistrationId === (paymentCreditsInfo as $TSFixMe).eventRegId);
          return renderAttendeeCreditsInfo(attendee, paymentCreditsInfo, translateCurrency, translate);
        })}
      </div>
    </div>
  );
};

export const PaymentCreditsDialog = (props: $TSFixMe): $TSFixMe => {
  const {
    title,
    onClose,
    style,
    classes,
    translateCurrency,
    translate,
    attendees = [],
    paymentCreditsForEventReg
  } = props;

  return (
    <StandardDialog {...props} title={title} onClose={onClose} style={style} classes={classes}>
      {renderPopupInfo(translate, translateCurrency, attendees, paymentCreditsForEventReg, props)}
    </StandardDialog>
  );
};
