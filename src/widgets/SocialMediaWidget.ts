import { connect } from 'react-redux';
import SocialMediaWidget from '@cvent/social-media-feed/lib/SocialMedia/SocialMediaWidget';
import { getIn } from 'icepick';
import { areCookiesAllowedForSocialMedia } from '../utils/cookieConsentUtils';

/**
 * Data wrapper for the Social Media Feed Widget.
 */
export default connect((state: $TSFixMe, props: $TSFixMe) => {
  const hideWidget =
    !getIn(state, ['event', 'eventFeatureSetup', 'eventPromotion', 'socialMedia']) ||
    !areCookiesAllowedForSocialMedia(state);

  return {
    ...props,
    hideWidget
  };
})(SocialMediaWidget);
