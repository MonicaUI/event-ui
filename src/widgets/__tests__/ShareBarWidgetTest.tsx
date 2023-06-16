jest.mock('../../utils/cookieConsentUtils');

import React from 'react';
import ShareBarWidget from '../ShareBarWidget';
import { shallow, mount } from 'enzyme';
import { areCookiesAllowedForSocialMedia } from '../../utils/cookieConsentUtils';

(areCookiesAllowedForSocialMedia as $TSFixMe).mockImplementation(() => true);

const subscribe = jest.fn();

function getState() {
  return {
    event: {
      webLinks: {
        'linkName~Summary': {
          shortUrl: 'https://staging.cvent.me/Egboxv'
        }
      },
      eventFeatureSetup: {
        eventPromotion: {
          socialMedia: true
        }
      }
    },
    appData: {
      shareBarSettings: {
        referenceID: 'EventSite',
        customizeWidgetData: {
          displayLinkedIn: true,
          displayFacebook: true,
          displayTwitter: true,
          eventImage: {
            assetUri: 'http://www.cvent.com/images/image.jpg/'
          },
          postTitle: 'Flex Event',
          postText: 'Flex Event Text',
          twitterPostText: 'Join me for this event: Flex Event',
          twitterEventHashtag: 'CventEvent, Cvent'
        }
      }
    },
    registrationForm: {
      regCart: {
        eventRegistrations: {
          '00000000-0000-0000-0000-000000000001': {
            attendee: {
              personalInformation: {
                contactIdEncoded: 'UW0yb6e4SeWHLA8_WRFJyg'
              }
            }
          }
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
  styles: {},
  isDroppableWidget: false,
  hideLinkedInOnIEAndEdge: true,
  id: 'widget:d9022582-f9aa-4900-9b8e-81674fc3c7fa',
  hideWidget: false
};

describe('ShareBarWidget produces props from state', () => {
  test('should match', () => {
    const widget = shallow(<ShareBarWidget {...defaultProps} />);
    expect(widget.props()).toMatchSnapshot();
  });
});

test('cookies allowed for sharebar show widget', () => {
  const widget = mount(<ShareBarWidget {...defaultProps} />);
  expect(widget.find('FacebookShare').length).toBe(1);
});

test('cookies not allowed for sharebar hide widget', () => {
  (areCookiesAllowedForSocialMedia as $TSFixMe).mockImplementation(() => false);
  const widget = mount(<ShareBarWidget {...defaultProps} />);
  expect(widget.find('FacebookShare').length).toBe(0);
});
