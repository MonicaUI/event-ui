import { connect } from 'react-redux';
import ShareBarWidget from '@cvent/share-bar/lib/ShareBar/ShareBarWidget';
import { getIn } from 'icepick';
import { areCookiesAllowedForSocialMedia } from '../utils/cookieConsentUtils';

/**
 * Data wrapper for the Share Bar Widget.
 */
export default connect((state: $TSFixMe, props: $TSFixMe) => {
  const url = getIn(state, ['event', 'webLinks', 'linkName~Summary', 'shortUrl']) || '';
  const shareBarSettings = getIn(state, ['appData', 'shareBarSettings']) || {};
  const referenceID = shareBarSettings.referenceID || '';
  const refIDParam = referenceID ? `refid=${referenceID}` : '';
  const hideWidget =
    !getIn(state, ['event', 'eventFeatureSetup', 'eventPromotion', 'socialMedia']) ||
    !areCookiesAllowedForSocialMedia(state);

  // To fetch the contact stub from reg cart and base64 encode it to send it as a query param
  const eventRegs = getIn(state, ['registrationForm', 'regCart', 'eventRegistrations']);
  const eventReg = eventRegs ? eventRegs[Object.keys(eventRegs)[0]] : {};
  const encodedContactStub = getIn(eventReg, ['attendee', 'personalInformation', 'contactIdEncoded']);
  const cnParam = encodedContactStub ? `cn=${encodedContactStub}` : '';

  return {
    ...props,
    url,
    shareBarSettings,
    additionalURLParams: {
      facebook: [refIDParam, 'sms=1', cnParam],
      twitter: [refIDParam, 'sms=2', cnParam],
      linkedIn: [refIDParam, 'sms=3', cnParam]
    },
    hideWidget,
    hideLinkedInOnIEAndEdge: true
  };
})(ShareBarWidget);
