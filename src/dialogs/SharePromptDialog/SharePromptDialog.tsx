import ShareBarWidget from '@cvent/share-bar/lib/ShareBar/ShareBarWidget';
import ShareDialog from '../shared/ShareDialog';
import { resolve } from '@cvent/nucleus-dynamic-css';
import InteractiveElement from 'nucleus-core/containers/InteractiveElement';
import Button from 'nucleus-core/buttons/Button';
import React from 'react';
import { injectTestId } from '@cvent/nucleus-test-automation';

/**
 * Dialog for displaying messaging relating to the share prompt.
 */
export const SharePromptDialog = (props: $TSFixMe): $TSFixMe => {
  /**
   * This function will return the Share Bar Widget.
   */
  const addShareBarWidget = propsIn => {
    const {
      sharePromptData: { shareBarSettings = {}, sharePromptSetting = {}, shareSummaryURL = '', encodedContactStub = '' }
    } = propsIn;
    const customizeWidgetData = shareBarSettings.customizeWidgetData || {};
    const referenceID = sharePromptSetting.referenceIdText || '';
    const refIDParam = referenceID ? `refid=${referenceID}` : '';
    const cnParam = encodedContactStub ? `cn=${encodedContactStub}` : '';

    const propsOut = {
      url: shareSummaryURL,
      shareBarSettings: {
        customizeWidgetData: {
          displayFacebook: sharePromptSetting.facebook,
          displayTwitter: sharePromptSetting.twitter,
          displayLinkedIn: sharePromptSetting.linkedIn,
          twitterPostText: customizeWidgetData.twitterPostText,
          twitterEventHashtag: customizeWidgetData.twitterEventHashtag
        }
      },
      additionalURLParams: {
        facebook: [refIDParam, 'sms=1', cnParam],
        twitter: [refIDParam, 'sms=2', cnParam],
        linkedIn: [refIDParam, 'sms=3', cnParam]
      },
      id: 'shareBarForSharePrompt',
      isDroppableWidget: false,
      hideLinkedInOnIEAndEdge: true,
      styles: {
        wrapper: {
          marginLeft: '10px'
        }
      }
    };

    return <ShareBarWidget {...propsOut} />;
  };

  /**
   * This function will copy the text to the clipboard from the element whose id is passed to it
   */
  const copyToClipboard = containerId => {
    const range = document.createRange();
    range.selectNode(document.getElementById(containerId));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
  };

  /**
   * This function will append the query parameters to the URL which it received in an array.
   * It will also filter/ignore the empyty element of the array, if any.
   */
  const addQueryParamsToURL = (url, additionalURLParams) => {
    if (!additionalURLParams.length) {
      return url;
    }
    const paramString = additionalURLParams.filter(e => e).join('&');
    return url.indexOf('?') === -1 ? `${url}?${paramString}` : `${url}&${paramString}`;
  };

  const {
    translate,
    onClose,
    sharePromptData: { sharePromptSetting = {}, shareSummaryURL = '', encodedContactStub = '' },
    classes,
    style,
    isShareBarVisible
  } = props;

  const referenceID = sharePromptSetting.referenceIdText || '';
  const refIDParam = referenceID ? `refid=${referenceID}` : '';
  const cnParam = encodedContactStub ? `cn=${encodedContactStub}` : '';
  const additionalURLParams = [refIDParam, 'sms=7', cnParam];
  const shareSummaryURLWithParams = addQueryParamsToURL(shareSummaryURL, additionalURLParams);

  return (
    <ShareDialog
      onClose={onClose}
      title={translate(sharePromptSetting.headerText)}
      closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
      classes={classes}
      style={style}
    >
      <div {...resolve({ style, classes }, 'container')}>
        <p {...resolve({ style, classes }, 'insTextURL')}>{translate(sharePromptSetting.url)}</p>
        <div {...resolve(props, 'linkContainer')}>
          <div {...resolve({ style, classes }, 'linkbox')} id="shareURLToCopy">
            {shareSummaryURLWithParams}
          </div>
          <InteractiveElement
            {...resolve({ style, classes }, 'copyTextBox')}
            element="div"
            onClick={() => {
              copyToClipboard('shareURLToCopy');
            }}
          >
            {translate('EventGuestSide_SharePrompt_CopyURLButtonText__resx')}
          </InteractiveElement>
        </div>
        {isShareBarVisible && (
          <div>
            <p {...resolve({ style, classes }, 'insTextShare')} {...injectTestId('insTextShare')}>
              {translate(sharePromptSetting.instructionalText)}
            </p>
            <div {...resolve({ style, classes }, 'shareBarContainer')} {...injectTestId('shareBarContainer')}>
              {addShareBarWidget(props)}
            </div>
          </div>
        )}
        <div {...resolve({ style, classes }, 'cancelButton')}>
          <Button
            classes={classes}
            style={{ ...style, button: style.secondaryButton }}
            kind="secondary"
            onClick={onClose}
          >
            {translate('EventWidgets_GenericText_Cancel__resx')}
          </Button>
        </div>
      </div>
    </ShareDialog>
  );
};
