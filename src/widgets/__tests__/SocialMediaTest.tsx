jest.mock('../../utils/cookieConsentUtils');

import React from 'react';
import SocialMediaWidget from '../SocialMediaWidget';
import { shallow, mount } from 'enzyme';
import { areCookiesAllowedForSocialMedia } from '../../utils/cookieConsentUtils';
import { SocialMediaTypes } from '@cvent/social-media-feed/constants/SocialMedia';

(areCookiesAllowedForSocialMedia as $TSFixMe).mockImplementation(() => true);

const subscribe = jest.fn();

function getState() {
  return {
    event: {
      eventFeatureSetup: {
        eventPromotion: {
          socialMedia: true
        }
      }
    }
  };
}

async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState);
  }
}

const defaultProps = {
  store: { dispatch, getState, subscribe },
  style: {},
  config: {
    title: 'Social Media Feed',
    description: 'Twitter link',
    socialMediaUrl: 'https://twitter.com/cvent',
    socialMediaType: SocialMediaTypes.TWITTER
  },
  hideWidget: false,
  translate: jest.fn()
};

describe('SocialMediaWidget produces props from state', () => {
  test('should match', () => {
    const widget = shallow(<SocialMediaWidget {...defaultProps} />);
    expect(widget.props()).toMatchSnapshot();
  });

  test('cookies allowed for social media, show widget', () => {
    const widget = mount(<SocialMediaWidget {...defaultProps} />);
    expect(widget.find('EmbeddedTwitter').length).toBe(1);
  });

  test('cookies not allowed for social media, hide widget', () => {
    (areCookiesAllowedForSocialMedia as $TSFixMe).mockImplementation(() => false);
    const widget = mount(<SocialMediaWidget {...defaultProps} />);
    expect(widget.find('EmbeddedTwitter').length).toBe(0);
  });
});
