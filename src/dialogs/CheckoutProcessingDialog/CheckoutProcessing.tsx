import React from 'react';
import ProgressBar from 'nucleus-core/progress/ProgressBar';
import ProgressBarStyle from './ProgressBar.less';
import CheckoutStyle from './CheckoutProcessing.less';

const CompletedGreenTick = () => <div className={CheckoutStyle.successCheck} />;

type CheckoutProcessingProps = {
  translate?: $TSFixMeFunction;
  percentComplete?: number;
  isSuccess?: boolean;
  messageOverride?: string;
  headerOverride?: string;
};

/*
 * This component contains a progressbar and a green checkmark and processing messages.
 * As green check mark and a 'processing complete message' show up when the progress bar hits 100%.
 * A 'processing message' shows up otherwise
 */
function CheckoutProcessing({
  translate,
  percentComplete,
  isSuccess,
  messageOverride,
  headerOverride
}: CheckoutProcessingProps): $TSFixMe {
  const processingHeader =
    percentComplete < 100
      ? translate('_checkoutProcessingHeader_resx')
      : translate('_checkoutProcessingCompleteHeader_resx');
  const processingMessage =
    percentComplete < 100
      ? translate('_checkoutProcessingText_resx')
      : translate('_checkoutProcessingCompleteMessage_resx');
  return (
    <div className={CheckoutStyle.dialogContainer}>
      {percentComplete === 100 ? <CompletedGreenTick /> : null}
      <ProgressBar classes={ProgressBarStyle} success={isSuccess} digit={percentComplete} total={100} />
      <div>
        <div className={CheckoutStyle.checkoutProcessingMessage}>
          <h2 className={CheckoutStyle.checkoutProcessingTitle}>{headerOverride || processingHeader}</h2>
          <p className={CheckoutStyle.checkoutProcessingText}>{messageOverride || processingMessage}</p>
        </div>
      </div>
    </div>
  );
}
CheckoutProcessing.displayName = 'CheckoutProcessing';

export default CheckoutProcessing;
