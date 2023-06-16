import React from 'react';
import { resolve } from '@cvent/nucleus-dynamic-css';
import PaymentAmountServiceFeeInfo from './PaymentAmountServiceFeeInfo';
import PaymentStyles from '../PaymentAmountServiceFeeConfirmationDialog/PaymentAmountServiceFeeConfirmationDialog.less';
import { map } from 'lodash';

const Styles = {
  classes: PaymentStyles
};

type Props = {
  serviceFeesInfo?: $TSFixMe;
  totalDue?: string;
  translateCurrency: $TSFixMeFunction;
  translate: $TSFixMeFunction;
  separatorColor?: $TSFixMe;
};

export default class ServiceFeePopUpInfo extends React.PureComponent<Props> {
  static displayName = 'PaymentAmountServiceFee';

  // method renders each service fee that is applicable to current registration
  renderPaymentAmountServiceFeeInfo = (
    serviceFeesInfo: $TSFixMe,
    translateCurrency: $TSFixMe,
    translate: $TSFixMe
  ): $TSFixMe => {
    return map(serviceFeesInfo, serviceFeeInfo => {
      const serviceFeeTextToDisplay = serviceFeeInfo.serviceFees.serviceFeeName;
      const serviceFeeAmount = serviceFeeInfo.serviceFees.serviceFeeAmount;
      const serviceFeeId = serviceFeeInfo.serviceFees.serviceFeeId;
      return (
        <PaymentAmountServiceFeeInfo
          serviceFeeTextToDisplay={serviceFeeTextToDisplay}
          serviceFeeAmount={serviceFeeAmount}
          translateCurrency={translateCurrency}
          serviceFeeId={serviceFeeId}
          translate={translate}
        />
      );
    });
  };

  render(): $TSFixMe {
    const { serviceFeesInfo, totalDue, translateCurrency, translate, separatorColor } = this.props;

    // renders the service fee pop up with header, service fees, total with and without service fees
    return (
      <div {...resolve(this.props, 'container')}>
        <div {...resolve(Styles, 'leftLineItemStyle')}>
          <span {...resolve(Styles, 'instructionalText')}>
            {translate('ServiceFees_PaymentInstructionPostReg__resx')}
          </span>
        </div>
        {this.renderPaymentAmountServiceFeeInfo(serviceFeesInfo, translateCurrency, translate)}
        <hr {...resolve(this.props, 'separator')} style={separatorColor} />
        <div {...resolve(Styles, 'rightLineItemStyle')}>
          <span {...resolve(Styles, 'totalAmountDue')}>
            {translate('EventWidgets_PaymentWidget_TotalDue__resx', {
              totalDue: translateCurrency(totalDue)
            })}
          </span>
        </div>
      </div>
    );
  }
}
