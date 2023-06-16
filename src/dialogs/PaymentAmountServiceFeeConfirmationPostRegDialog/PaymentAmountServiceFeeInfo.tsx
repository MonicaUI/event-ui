import React from 'react';
import PaymentStyles from '../PaymentAmountServiceFeeConfirmationDialog/PaymentAmountServiceFeeConfirmationDialog.less';
import { resolve } from '@cvent/nucleus-dynamic-css';

const Styles = {
  classes: PaymentStyles
};

type Props = {
  serviceFeeTextToDisplay?: string;
  serviceFeeAmount?: string;
  translateCurrency: $TSFixMeFunction;
  serviceFeeId?: string;
  translate?: $TSFixMeFunction;
};

export default class PaymentAmountServiceFeeInfo extends React.PureComponent<Props> {
  static displayName = 'PaymentAmountServiceFee';

  render(): $TSFixMe {
    const { serviceFeeTextToDisplay, serviceFeeAmount, translateCurrency, serviceFeeId, translate } = this.props;

    // returns JSX for all the service fee(s) which are applicable to attendees as part of current reg
    return (
      <div {...resolve(this.props, 'additionalItems', 'orderSummaryRow')} key={serviceFeeId}>
        <div {...resolve(Styles, 'oneLineItemStyle')}>
          <span {...resolve(Styles, 'additionalItemsText')}>{translate(serviceFeeTextToDisplay)}</span>
          <span {...resolve(Styles, 'totalAmount')}>{translateCurrency(serviceFeeAmount)}</span>
        </div>
      </div>
    );
  }
}
