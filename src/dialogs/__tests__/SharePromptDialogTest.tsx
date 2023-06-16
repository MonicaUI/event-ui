import React from 'react';
import { mount } from 'enzyme';
import { SharePromptDialog } from '../SharePromptDialog/SharePromptDialog';
import StandardDialogStyles from '../styles/StandardDialog.less';
import SharedPromptDialogStyle from '../SharePromptDialog/SharePromptDialog.less';

const defaultProps = {
  style: {},
  translate: jest.fn(),
  isShareBarVisible: true,
  onClose: jest.fn(),
  sharePromptData: {
    sharePromptSetting: {
      twitter: true,
      instructionalText: 'EventGuestSide_SharePrompt_DefaultSocialMediaInstructionalText__resx',
      linkedIn: true,
      headerText: 'EventGuestSide_SharePrompt_DefaultHeaderlabel__resx',
      url: 'EventGuestSide_SharePrompt_DefaultURLInstructionalText__resx',
      facebook: true
    },
    shareSummaryURL: '',
    encodedContactStub: '',
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
  classes: {
    ...StandardDialogStyles,
    ...SharedPromptDialogStyle
  }
};

describe('SharePromptDialog produces props from state', () => {
  test('Cookies allowed, share bar renders in prompt', () => {
    const prompt = mount(<SharePromptDialog {...defaultProps} />);
    expect(prompt.find('[data-cvent-id="insTextShare"]').length).toBe(1);
    expect(prompt.find('[data-cvent-id="shareBarContainer"]').length).toBe(1);
  });

  test('Cookies not allowed, share bar does not render in prompt', () => {
    const testProps = {
      ...defaultProps,
      isShareBarVisible: false
    };
    const prompt = mount(<SharePromptDialog {...testProps} />);
    expect(prompt.find('[data-cvent-id="insTextShare"]').length).toBe(0);
    expect(prompt.find('[data-cvent-id="shareBarContainer"]').length).toBe(0);
  });
});
