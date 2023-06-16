import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { merge } from 'lodash';
import ThemeableComponent from 'nucleus-widgets/lib/ThemeableComponent';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { resolve } from '@cvent/nucleus-dynamic-css';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import DialogHeader from './shared/DialogHeader';
import EventStatusStyles from './EventStatusDialog.less';
import RefundPolicyStyles from './FeeRefundPolicyDialog.less';
import { dateInObjectFormat } from 'event-widgets/utils/feeUtils';
import { withStyles } from './ThemedDialog';

const FeeRefundPolicyDialogStyles = {
  classes: RefundPolicyStyles
};

/**
 * Dialog for displaying Fees Refund Policy.
 */
class FeeRefundPolicyDialog extends ThemeableComponent<$TSFixMe, $TSFixMe> {
  static propTypes = {
    translate: PropTypes.func,
    onClose: PropTypes.func,
    feeRefundData: PropTypes.object,
    eventCurrencyCode: PropTypes.object,
    translateCurrency: PropTypes.object,
    eventTimeZone: PropTypes.object
  };

  getElementBackground: $TSFixMe;
  getElementInlineStyle: $TSFixMe;
  props: $TSFixMe;

  getStyleObject() {
    return {
      dialogHeader: this.getElementInlineStyle('header'),
      dragContainer: this.getElementBackground('content1'),
      dragHandle: this.getElementBackground('content2'),
      text: this.getElementInlineStyle('text'),
      boldText: {
        ...this.getElementInlineStyle('text'),
        fontWeight: 700
      },
      cancelledByHeader: {
        ...this.getElementInlineStyle('text'),
        borderBottom: `1px solid ${this.getElementInlineStyle('text').color}`,
        padding: '0 0.75rem 0.25rem 0.75rem'
      },
      originalPrice: {
        ...this.getElementInlineStyle('text'),
        margin: '0.5rem 0 1.75rem'
      }
    };
  }

  /**
   * Returns 'refund amount' for a refund type and charge policy.
   */
  calculateRefundAmount = (refundPolicy, earlyBirdPrice) => {
    let calculatedRefundAmt;
    const refundType = refundPolicy.refundType;
    const maxRefund = earlyBirdPrice.maximumRefundAmount;
    const refundAmount = refundPolicy.amount;
    const feeAmount = earlyBirdPrice.amount;
    const percentage = refundPolicy.percentage;
    const cancellationAmount = refundPolicy.cancellationAmount;

    switch (refundType) {
      // Refund a fixed amount
      case 1: {
        calculatedRefundAmt = refundAmount;
        break;
      }

      // Charge a cancellation fee and refund the remaining amount paid
      case 3: {
        calculatedRefundAmt = feeAmount - cancellationAmount;
        break;
      }

      // Refund a percentage of the amount paid
      case 4: {
        calculatedRefundAmt = (percentage * feeAmount) / 100;
        break;
      }
      default:
        break;
    }
    if (calculatedRefundAmt < 0) {
      return 0;
    }
    if (maxRefund < calculatedRefundAmt) {
      return maxRefund;
    }
    return calculatedRefundAmt;
  };

  getChargePolicyLabeltext = (sortedChargePolicies, index) => {
    const { translate, eventCurrencyCode, translateCurrency, eventTimeZone } = this.props;
    const style = this.getStyleObject();
    const Styles = {
      ...FeeRefundPolicyDialogStyles,
      style
    };
    let title;
    const pricePaidLabel = (
      <div {...resolve(Styles, 'originalPrice')}>
        <span>
          {translate('EventWidgets_FeeWidget_RefundModal_PricePaid__resx', {
            pricePaid: `${translateCurrency(sortedChargePolicies[index].amount, eventCurrencyCode)}`
          })}
        </span>
      </div>
    );

    if (!sortedChargePolicies || sortedChargePolicies.length < 2) {
      if (sortedChargePolicies.length === 1) {
        return pricePaidLabel;
      }
      return null;
    } else if (sortedChargePolicies && index === sortedChargePolicies.length - 1) {
      const date = dateInObjectFormat(sortedChargePolicies[index - 1].effectiveUntil, eventTimeZone);
      title = (
        <div {...resolve(Styles, 'boldText')}>
          {translate('EventWidgets_FeeWidget_RefundModal_RefundAfterDate__resx', {
            day: translate(date.day),
            month: translate(date.month),
            date: date.date,
            year: date.year
          })}
        </div>
      );
    } else {
      const date = dateInObjectFormat(sortedChargePolicies[index].effectiveUntil, eventTimeZone);
      title = (
        <div {...resolve(Styles, 'boldText')}>
          {translate('EventWidgets_FeeWidget_RefundModal_RefundBeforeDate__resx', {
            day: translate(date.day),
            month: translate(date.month),
            date: date.date,
            year: date.year
          })}
        </div>
      );
    }

    return (
      <div>
        {title}
        {pricePaidLabel}
      </div>
    );
  };

  addForEachEarlyBirdPrice = feeRefundData => {
    const { translate } = this.props;
    const style = this.getStyleObject();
    const Styles = {
      ...FeeRefundPolicyDialogStyles,
      style
    };
    const sortedChargePolicies = Object.values(feeRefundData.chargePolicies).sort((a, b) => {
      // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
      return new Date((a as $TSFixMe).effectiveUntil) - new Date((b as $TSFixMe).effectiveUntil);
    });
    return sortedChargePolicies.map((earlyBirdPrice, index) => {
      const prevEarlyBirdPrice = index > 0 ? sortedChargePolicies[index - 1] : null;
      const refundPolicyComp = this.addRefundPolicyComponent(
        prevEarlyBirdPrice,
        earlyBirdPrice,
        feeRefundData.refundPolicies
      );
      if (!refundPolicyComp || !refundPolicyComp.length) {
        return;
      }
      return (
        <div {...resolve(FeeRefundPolicyDialogStyles, 'feeRefundSection')} key={(earlyBirdPrice as $TSFixMe).id}>
          {this.getChargePolicyLabeltext(sortedChargePolicies, index)}
          <div {...resolve(Styles, 'cancelledByHeader')}>
            <span {...resolve(Styles, 'cancelledByHeaderText', 'text')}>
              {translate('EventWidgets_FeeWidget_RefundModal_CancelledBy__resx')}
            </span>
            <span {...resolve(Styles, 'cancelledByHeaderAmountText', 'text')}>
              {translate('EventWidgets_FeeWidget_RefundModal_AmountRefunded__resx')}
            </span>
          </div>
          <div>{refundPolicyComp}</div>
        </div>
      );
    });
  };

  addRefundPolicyComponent = (prevEarlyBirdPrice, earlyBirdPrice, refundPolicyData) => {
    const { translate, eventCurrencyCode, translateCurrency, eventTimeZone } = this.props;
    const style = this.getStyleObject();
    const Styles = {
      ...FeeRefundPolicyDialogStyles,
      style
    };

    const applicableRefundPolicies = Object.values(refundPolicyData)
      .filter(refundPolicy => {
        return prevEarlyBirdPrice
          ? // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
            new Date((refundPolicy as $TSFixMe).effectiveUntil) - new Date(prevEarlyBirdPrice.effectiveUntil) > 0
          : true;
      })
      .sort((a, b) => {
        // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
        return new Date((a as $TSFixMe).effectiveUntil) - new Date((b as $TSFixMe).effectiveUntil);
      });
    if (!applicableRefundPolicies || !applicableRefundPolicies.length) {
      return null;
    }
    return applicableRefundPolicies.map(refundPolicy => {
      const date = dateInObjectFormat((refundPolicy as $TSFixMe).effectiveUntil, eventTimeZone);
      return (
        <div {...resolve(FeeRefundPolicyDialogStyles, 'dateAmountWrapper')} key={(refundPolicy as $TSFixMe).id}>
          <div {...resolve(Styles, 'cancelledByDate', 'text')}>
            {translate('_dateLabels_day_month_year__resx', {
              day: translate(date.day),
              month: translate(date.month),
              date: date.date,
              year: date.year
            })}
          </div>
          <div {...resolve(Styles, 'amountRefunded', 'text')}>
            {`${translateCurrency(this.calculateRefundAmount(refundPolicy, earlyBirdPrice), eventCurrencyCode)}`}
          </div>
        </div>
      );
    });
  };

  addFeeRefundModelData = () => {
    const { feeRefundData } = this.props;

    return (
      <div {...resolve(FeeRefundPolicyDialogStyles, 'refundPolicyContainer')}>
        {this.addForEachEarlyBirdPrice(feeRefundData)}
      </div>
    );
  };

  render() {
    const {
      onClose,
      translate,
      feeRefundData: { feeName },
      style
    } = this.props;
    const dialogHeaderText = translate('EventWidgets_FeeWidget_RefundPolicyModalHeader__resx', {
      FeeName: translate(feeName)
    });
    return (
      <div>
        <DialogHeader
          text={dialogHeaderText}
          onClose={onClose}
          closeFallbackText="fallbackback"
          style={style}
          classes={EventStatusStyles}
        />
        {this.addFeeRefundModelData()}
      </div>
    );
  }
}

/**
 * Function to get the style object to pass into the share prompt dialog.
 */
function dialogStyle(globalTheme, sections) {
  return {
    ...globalTheme,
    header: { styleMapping: 'header3' },
    text: { styleMapping: 'body1' },
    content1: { ...merge({}, globalTheme, sections.content1), styleMapping: 'custom' },
    content2: { ...merge({}, globalTheme, sections.content2), styleMapping: 'custom' }
  };
}

const FeeRefundPolicyDialogWithStyles = withStyles(FeeRefundPolicyDialog);

/**
 * A connect wrapper around the Fee dialog to inject
 * the appropriate style information into its props.
 */
const ConnectedFeeRefundPolicyDialog = connect((state: $TSFixMe, props: $TSFixMe) => {
  const {
    website: {
      theme: { sections, global }
    },
    customFonts
  } = state;
  const style = merge({}, dialogStyle(global, sections), { customFonts });
  return {
    ...props.dialogConfig,
    style
  };
})(FeeRefundPolicyDialogWithStyles);

/**
 * Helper function to open the Fee refund policy dialog.
 */
export const openFeeRefundPolicyDialog = (feeObject: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const boundCloseDialog = () => dispatch(closeDialogContainer());
    const dialog = (
      <ConnectedFeeRefundPolicyDialog
        onClose={boundCloseDialog}
        translate={feeObject.translate}
        eventCurrencyCode={feeObject.eventCurrencyCode}
        translateCurrency={feeObject.translateCurrency}
        feeRefundData={feeObject.fee}
        eventTimeZone={feeObject.eventTimeZone}
      />
    );
    return dispatch(
      openDialogContainer(dialog, boundCloseDialog, {
        classes: {
          dialogContainer: (FeeRefundPolicyDialogStyles as $TSFixMe).popUpDialogContainer
        },
        style: {
          dragContainer: {
            ...getDialogContainerStyle(getState()),
            height: '50%'
          }
        }
      })
    );
  };
};
