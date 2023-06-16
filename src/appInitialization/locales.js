export default {
  'bg-BG': resolve => require.ensure(['../../resources/locales/bg-BG.json',
    'nucleus-guestside-site/resources/locales/bg-BG.json',
    '@cvent/social-media-feed/resources/locales/bg-BG.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/bg-BG.json'),
      require('nucleus-guestside-site/resources/locales/bg-BG.json'),
      require('../../resources/locales/bg-BG.json')
    ));
  }
  ),
  'cs-CZ': resolve => require.ensure(['../../resources/locales/cs-CZ.json',
    'nucleus-guestside-site/resources/locales/cs-CZ.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/cs-CZ.json'),
      require('nucleus-guestside-site/resources/locales/cs-CZ.json'),
      require('../../resources/locales/cs-CZ.json')
    ));
  }
  ),
  'da-DK': resolve => require.ensure(['../../resources/locales/da-DK.json',
    'nucleus-guestside-site/resources/locales/da-DK.json',
    '@cvent/social-media-feed/resources/locales/da-dk.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/da-dk.json'),
      require('nucleus-guestside-site/resources/locales/da-DK.json'),
      require('../../resources/locales/da-DK.json')
    ));
  }
  ),
  'de-DE': resolve => require.ensure(['../../resources/locales/de-DE.json',
    'nucleus-guestside-site/resources/locales/de-DE.json',
    '@cvent/social-media-feed/resources/locales/de-DE.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/de-DE.json'),
      require('nucleus-guestside-site/resources/locales/de-DE.json'),
      require('../../resources/locales/de-DE.json')
    ));
  }
  ),
  'el-GR': resolve => require.ensure(['../../resources/locales/el-GR.json',
    'nucleus-guestside-site/resources/locales/el-GR.json',
    '@cvent/social-media-feed/resources/locales/el-GR.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/el-GR.json'),
      require('nucleus-guestside-site/resources/locales/el-GR.json'),
      require('../../resources/locales/el-GR.json')
    ));
  }
  ),
  'en-US': resolve => require.ensure(['../../resources/locales/en-US.json',
    'nucleus-guestside-site/resources/locales/en-US.json',
    '@cvent/social-media-feed/resources/locales/en-US.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/en-US.json'),
      require('nucleus-guestside-site/resources/locales/en-US.json'),
      require('../../resources/locales/en-US.json')
    ));
  }
  ),
  'es-ES': resolve => require.ensure(['../../resources/locales/es-ES.json',
    'nucleus-guestside-site/resources/locales/es-ES.json',
    '@cvent/social-media-feed/resources/locales/es-ES.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/es-ES.json'),
      require('nucleus-guestside-site/resources/locales/es-ES.json'),
      require('../../resources/locales/es-ES.json')
    ));
  }
  ),
  'fi-FI': resolve => require.ensure(['../../resources/locales/fi-FI.json',
    'nucleus-guestside-site/resources/locales/fi-FI.json',
    '@cvent/social-media-feed/resources/locales/fi-FI.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/fi-FI.json'),
      require('nucleus-guestside-site/resources/locales/fi-FI.json'),
      require('../../resources/locales/fi-FI.json')
    ));
  }
  ),
  'fr-CA': resolve => require.ensure(['../../resources/locales/fr-CA.json',
    'nucleus-guestside-site/resources/locales/fr-CA.json',
    '@cvent/social-media-feed/resources/locales/fr-CA.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/fr-CA.json'),
      require('nucleus-guestside-site/resources/locales/fr-CA.json'),
      require('../../resources/locales/fr-CA.json')
    ));
  }
  ),
  'fr-FR': resolve => require.ensure(['../../resources/locales/fr-FR.json',
    'nucleus-guestside-site/resources/locales/fr-FR.json',
    '@cvent/social-media-feed/resources/locales/fr-FR.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/fr-FR.json'),
      require('nucleus-guestside-site/resources/locales/fr-FR.json'),
      require('../../resources/locales/fr-FR.json')
    ));
  }
  ),
  'hr-HR': resolve => require.ensure(['../../resources/locales/hr-HR.json',
    'nucleus-guestside-site/resources/locales/hr-HR.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/hr-HR.json'),
      require('nucleus-guestside-site/resources/locales/hr-HR.json'),
      require('../../resources/locales/hr-HR.json')
    ));
  }
  ),
  'hu-HU': resolve => require.ensure(['../../resources/locales/hu-HU.json',
    'nucleus-guestside-site/resources/locales/hu-HU.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/hu-HU.json'),
      require('nucleus-guestside-site/resources/locales/hu-HU.json'),
      require('../../resources/locales/hu-HU.json')
    ));
  }
  ),
  'it-IT': resolve => require.ensure(['../../resources/locales/it-IT.json',
    'nucleus-guestside-site/resources/locales/it-IT.json',
    '@cvent/social-media-feed/resources/locales/it-IT.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/it-IT.json'),
      require('nucleus-guestside-site/resources/locales/it-IT.json'),
      require('../../resources/locales/it-IT.json')
    ));
  }
  ),
  'ja-JP': resolve => require.ensure(['../../resources/locales/ja-JP.json',
    'nucleus-guestside-site/resources/locales/ja-JP.json',
    '@cvent/social-media-feed/resources/locales/ja-JP.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/ja-JP.json'),
      require('nucleus-guestside-site/resources/locales/ja-JP.json'),
      require('../../resources/locales/ja-JP.json')
    ));
  }
  ),
  'ko-KR': resolve => require.ensure(['../../resources/locales/ko-KR.json',
    'nucleus-guestside-site/resources/locales/ko-KR.json',
    '@cvent/social-media-feed/resources/locales/ko-KR.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/ko-KR.json'),
      require('nucleus-guestside-site/resources/locales/ko-KR.json'),
      require('../../resources/locales/ko-KR.json')
    ));
  }
  ),
  'nb-NO': resolve => require.ensure(['../../resources/locales/nb-NO.json',
    'nucleus-guestside-site/resources/locales/nb-NO.json',
    '@cvent/social-media-feed/resources/locales/nb-NO.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/nb-NO.json'),
      require('nucleus-guestside-site/resources/locales/nb-NO.json'),
      require('../../resources/locales/nb-NO.json')
    ));
  }
  ),
  'nl-NL': resolve => require.ensure(['../../resources/locales/nl-NL.json',
    'nucleus-guestside-site/resources/locales/nl-NL.json',
    '@cvent/social-media-feed/resources/locales/nl-NL.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/nl-NL.json'),
      require('nucleus-guestside-site/resources/locales/nl-NL.json'),
      require('../../resources/locales/nl-NL.json')
    ));
  }
  ),
  'pl-PL': resolve => require.ensure(['../../resources/locales/pl-PL.json',
    'nucleus-guestside-site/resources/locales/pl-PL.json',
    '@cvent/social-media-feed/resources/locales/pl-PL.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/pl-PL.json'),
      require('nucleus-guestside-site/resources/locales/pl-PL.json'),
      require('../../resources/locales/pl-PL.json')
    ));
  }
  ),
  'pt-BR': resolve => require.ensure(['../../resources/locales/pt-BR.json',
    'nucleus-guestside-site/resources/locales/pt-BR.json',
    '@cvent/social-media-feed/resources/locales/pt-BR.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/pt-BR.json'),
      require('nucleus-guestside-site/resources/locales/pt-BR.json'),
      require('../../resources/locales/pt-BR.json')
    ));
  }
  ),
  'pt-PT': resolve => require.ensure(['../../resources/locales/pt-PT.json',
    'nucleus-guestside-site/resources/locales/pt-PT.json',
    '@cvent/social-media-feed/resources/locales/pt-PT.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/pt-PT.json'),
      require('nucleus-guestside-site/resources/locales/pt-PT.json'),
      require('../../resources/locales/pt-PT.json')
    ));
  }
  ),
  'ro-RO': resolve => require.ensure(['../../resources/locales/ro-RO.json',
    'nucleus-guestside-site/resources/locales/ro-RO.json',
    '@cvent/social-media-feed/resources/locales/ro-RO.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/ro-RO.json'),
      require('nucleus-guestside-site/resources/locales/ro-RO.json'),
      require('../../resources/locales/ro-RO.json')
    ));
  }
  ),
  'ru-RU': resolve => require.ensure(['../../resources/locales/ru-RU.json',
    'nucleus-guestside-site/resources/locales/ru-RU.json',
    '@cvent/social-media-feed/resources/locales/ru-RU.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/ru-RU.json'),
      require('nucleus-guestside-site/resources/locales/ru-RU.json'),
      require('../../resources/locales/ru-RU.json')
    ));
  }
  ),
  'sk-SK': resolve => require.ensure(['../../resources/locales/sk-SK.json',
    'nucleus-guestside-site/resources/locales/sk-SK.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/sk-SK.json'),
      require('nucleus-guestside-site/resources/locales/sk-SK.json'),
      require('../../resources/locales/sk-SK.json')
    ));
  }
  ),
  'sl-SI': resolve => require.ensure(['../../resources/locales/sl-SI.json',
    'nucleus-guestside-site/resources/locales/sl-SI.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/sl-SI.json'),
      require('nucleus-guestside-site/resources/locales/sl-SI.json'),
      require('../../resources/locales/sl-SI.json')
    ));
  }
  ),
  'sr-RS': resolve => require.ensure(['../../resources/locales/sr-RS.json',
    'nucleus-guestside-site/resources/locales/sr-RS.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/sr-RS.json'),
      require('nucleus-guestside-site/resources/locales/sr-RS.json'),
      require('../../resources/locales/sr-RS.json')
    ));
  }
  ),
  'sv-SE': resolve => require.ensure(['../../resources/locales/sv-SE.json',
    'nucleus-guestside-site/resources/locales/sv-SE.json',
    '@cvent/social-media-feed/resources/locales/sv-SE.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/sv-SE.json'),
      require('nucleus-guestside-site/resources/locales/sv-SE.json'),
      require('../../resources/locales/sv-SE.json')
    ));
  }
  ),
  'th-TH': resolve => require.ensure(['../../resources/locales/th-TH.json',
    'nucleus-guestside-site/resources/locales/th-TH.json',
    '@cvent/social-media-feed/resources/locales/th-TH.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/th-TH.json'),
      require('nucleus-guestside-site/resources/locales/th-TH.json'),
      require('../../resources/locales/th-TH.json')
    ));
  }
  ),
  'tr-TR': resolve => require.ensure(['../../resources/locales/tr-TR.json',
    'nucleus-guestside-site/resources/locales/tr-TR.json',
    '@cvent/social-media-feed/resources/locales/tr-TR.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/tr-TR.json'),
      require('nucleus-guestside-site/resources/locales/tr-TR.json'),
      require('../../resources/locales/tr-TR.json')
    ));
  }
  ),
  'uk-UA': resolve => require.ensure(['../../resources/locales/uk-UA.json',
    'nucleus-guestside-site/resources/locales/uk-UA.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/uk-UA.json'),
      require('nucleus-guestside-site/resources/locales/uk-UA.json'),
      require('../../resources/locales/uk-UA.json')
    ));
  }
  ),
  'vi-VN': resolve => require.ensure(['../../resources/locales/vi-VN.json',
    'nucleus-guestside-site/resources/locales/vi-VN.json',
    '@cvent/social-media-feed/resources/locales/vi-VN.json'],
  require => {
    return resolve(Object.assign({},
      require('@cvent/social-media-feed/resources/locales/vi-VN.json'),
      require('nucleus-guestside-site/resources/locales/vi-VN.json'),
      require('../../resources/locales/vi-VN.json')
    ));
  }
  ),
  'zh-CHT': resolve => require.ensure(['../../resources/locales/zh-Hant.json',
    'nucleus-guestside-site/resources/locales/zh-Hant.json'],
  require => {
    return resolve(Object.assign({},
      require('nucleus-guestside-site/resources/locales/zh-Hant.json'),
      require('../../resources/locales/zh-Hant.json')
    ));
  }
  ),
  'zh-CN': resolve => require.ensure(['../../resources/locales/zh-Hans.json',
    'nucleus-guestside-site/resources/locales/zh-Hans.json'],
  require => {
    return resolve(Object.assign({},
      require('nucleus-guestside-site/resources/locales/zh-Hans.json'),
      require('../../resources/locales/zh-Hans.json')
    ));
  }
  )
  // Hello person trying to insert languages at the end instead of alphabetically. Please insert them alphabetically.
};
