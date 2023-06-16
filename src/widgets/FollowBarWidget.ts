import { connect } from 'react-redux';
import FollowBarWidget from '@cvent/follow-bar/lib/FollowBar/FollowBarWidget';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import { get } from 'lodash';

function updateFollowBarSettingsWithLocalizedText(userText, followBarSettings, translate) {
  const _followBarSettings = followBarSettings || {};
  return {
    followBarSettings: {
      ..._followBarSettings,
      followLabel: translate(get(userText, 'appData.followBarSettings.followLabel') || _followBarSettings.followLabel),
      facebookLink: get(userText, 'appData.followBarSettings.facebookLink') || _followBarSettings.facebookLink,
      linkedInLink: get(userText, 'appData.followBarSettings.linkedInLink') || _followBarSettings.linkedInLink,
      twitterLink: get(userText, 'appData.followBarSettings.twitterLink') || _followBarSettings.twitterLink,
      youTubeLink: get(userText, 'appData.followBarSettings.youTubeLink') || _followBarSettings.youTubeLink,
      instagramLink: get(userText, 'appData.followBarSettings.instagramLink') || _followBarSettings.instagramLink
    }
  };
}

/**
 * Data wrapper for the Follow Bar Widget.
 */
export default connect(
  withMemoizedFunctions({ updateFollowBarSettingsWithLocalizedText })(memoized => (state: $TSFixMe) => {
    const translate = state.text.translate;
    const userText = state?.localizedUserText?.currentLocale
      ? get(state.localizedUserText.localizations, state.localizedUserText.currentLocale, null)
      : null;
    return memoized.updateFollowBarSettingsWithLocalizedText(userText, state.appData.followBarSettings, translate);
  })
)(FollowBarWidget);
