import React from 'react';
import { shallow } from 'enzyme';
import FollowBarWidget from '../FollowBarWidget';
import renderer from 'react-test-renderer';

const store = {
  getState() {
    return {
      appData: {
        followBarSettings: {
          followLabel: 'FollowBarWidget_EditorPanel_DefaultLabel__resx',
          displayFacebook: true,
          facebookLink: 'FACEBOOKLINK',
          displayTwitter: true,
          twitterLink: '',
          displayLinkedIn: true,
          linkedInLink: '',
          displayYouTube: false,
          youTubeLink: '',
          displayInstagram: false,
          instagramLink: ''
        }
      },
      text: {
        translate: x => {
          switch (x) {
            case 'FollowBarWidget_EditorPanel_DefaultLabel__resx':
              return 'Follow us on(Translate):';
            default:
              return x;
          }
        }
      }
    };
  },
  subscribe() {},
  dispatch() {}
};

const storeWithUserText = {
  getState() {
    return {
      appData: {
        followBarSettings: {
          followLabel: 'FollowBarWidget_EditorPanel_DefaultLabel__resx',
          displayFacebook: true,
          facebookLink: 'FACEBOOKLINK',
          displayTwitter: true,
          twitterLink: 'TWITTERLINK',
          displayLinkedIn: true,
          linkedInLink: '',
          displayYouTube: false,
          youTubeLink: '',
          displayInstagram: false,
          instagramLink: ''
        }
      },
      text: {
        translate: x => {
          switch (x) {
            case 'FollowBarWidget_EditorPanel_DefaultLabel__resx':
              return 'Follow us on(Translate):';
            default:
              return x;
          }
        }
      },
      localizedUserText: {
        currentLocale: 'de-DE',
        localizations: {
          'de-DE': {
            'appData.followBarSettings.followLabel': 'Translated Follow us on:',
            'appData.followBarSettings.facebookLink': 'TRANSLATED FACEBOOKLINK'
          }
        }
      }
    };
  },
  subscribe() {},
  dispatch() {}
};

const storeWithNullUserText = {
  getState() {
    return {
      appData: {
        followBarSettings: {
          followLabel: 'FollowBarWidget_EditorPanel_DefaultLabel__resx',
          displayFacebook: true,
          facebookLink: 'FACEBOOKLINK',
          displayTwitter: true,
          twitterLink: 'TWITTERLINK',
          displayLinkedIn: true,
          linkedInLink: '',
          displayYouTube: false,
          youTubeLink: '',
          displayInstagram: false,
          instagramLink: ''
        }
      },
      text: {
        translate: x => {
          switch (x) {
            case 'FollowBarWidget_EditorPanel_DefaultLabel__resx':
              return 'Follow us on(Translate):';
            default:
              return x;
          }
        }
      },
      localizedUserText: {}
    };
  },
  subscribe() {},
  dispatch() {}
};

const storeWithEmptyFollowBarSettings = {
  getState() {
    return {
      appData: {},
      text: { translate: x => x }
    };
  },
  subscribe() {},
  dispatch() {}
};

const defaultProps = {
  style: {
    palette: {}
  },
  hideWidget: false
};

describe('FollowBarWidget', () => {
  test('renders', async () => {
    const customProps = {
      store
    };
    const wrapper = shallow(<FollowBarWidget {...customProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  test('translate FollowLabel using default Label', async () => {
    const customProps = {
      ...defaultProps,
      store
    };
    const component = renderer.create(<FollowBarWidget {...customProps} />);
    const tree = component.toJSON();
    expect(tree.children[0].children[0]).toBe('Follow us on(Translate):');
    expect(tree.children[1].children[0].props.href).toBe('FACEBOOKLINK');
  });

  test('translate FollowLabel using default Label when userText is null', async () => {
    const customProps = {
      ...defaultProps,
      store: storeWithNullUserText
    };
    const component = renderer.create(<FollowBarWidget {...customProps} />);
    const tree = component.toJSON();
    expect(tree.children[0].children[0]).toBe('Follow us on(Translate):');
    expect(tree.children[1].children[0].props.href).toBe('FACEBOOKLINK');
  });

  test('when appData.followBarSettings is not defined', async () => {
    const customProps = {
      ...defaultProps,
      store: storeWithEmptyFollowBarSettings
    };
    const component = renderer.create(<FollowBarWidget {...customProps} />);
    const tree = component.toJSON();
    expect(tree.type).toBe('div');
  });

  test('translate FollowLabel using UserText', async () => {
    const customProps = {
      ...defaultProps,
      store: storeWithUserText
    };
    const component = renderer.create(<FollowBarWidget {...customProps} />);
    const tree = component.toJSON();
    expect(tree.children[0].children[0]).toBe('Translated Follow us on:');
    expect(tree.children[1].children[0].props.href).toBe('TRANSLATED FACEBOOKLINK');
    expect(tree.children[2].children[0].props.href).toBe('TWITTERLINK');
  });
});
