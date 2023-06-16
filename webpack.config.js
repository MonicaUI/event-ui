/* eslint-disable no-console, import/unambiguous, @typescript-eslint/no-var-requires */
'use strict';
const webpack = require('webpack');
const path = require('path');
const url = require('url');
const name = 'event-guestside-site';

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const AssetBundlePlugin = require('asset-bundle-plugin').default;
const AutoPrefixer = require('autoprefixer');
const SslProxyWebpackPlugin = require('ssl-proxy-webpack-plugin');
const determineCventDevIp = require('determine-cvent-dev-ip');
const { watchFileDependencies, simpleSyncOnFileChange } = require('nucleus-build-dependency-scripts');
const { CventMockDeploymentPlugin, getCventMockDeploymentWebpackProxySettings } =
  require('@cvent/mock-deployment-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { stats, plugins, jsRules, fontRule, imageRule } = require('@cvent/event-ui-webpack');

const PROD = process.env.NODE_ENV === 'production';
const IS_FAST_DEV = process.env.NODE_ENV === 'fastdev';
const BUILD_PIPELINE_VERSION = 11; // build pipeline version, tweak after making pure build changes.
const marker = `${PROD ? 'prod' : 'debug'}.${process.env.BRANCH_NAME || process.env.USER || ''}_v${BUILD_PIPELINE_VERSION}`;

const echo = new Proxy({}, {
  get: (target, property) => {
    if (!target.hasOwnProperty(property)) {
      return `{{ errorInformation.${property} }}`;
    }
  }
});

const silosWithGuestsideService = new Set(['412', '414', '437', '446', '608']);
function readRegionSetting() {
  const environment = (process.env.DEV_SILO || process.env.DEV_SILO_ENVIRONMENT || '608')
    .replace(/^S(\d\d\d)$/, '$1');
  if (silosWithGuestsideService.has(environment)) {
    return {
      ENVIRONMENT: `S${environment}`,
      EVENT_GUESTSIDE_URL: (process.env.DEV_SERVICE_URL || `https://web-s${environment}.cvent.com`)
        .replace(/\/event_guest\/?$/, ''), // backwards compat. with old way of starting process
      WEB_CVENT_COM_URL: `https://web-s${environment}.cvent.com`,
      PLANNERSIDE_URL: process.env.DEV_BACKEND || `silo${environment}-app.core.cvent.org`
    };
  }
  return {
    ENVIRONMENT: /^\d\d\d$/.test(environment) ? `S${environment}` : 'T2',
    EVENT_GUESTSIDE_URL: (process.env.DEV_SERVICE_URL || 'https://web-staging.cvent.com')
      .replace(/\/event_guest\/?$/, ''), // backwards compat. with old way of starting process
    WEB_CVENT_COM_URL: 'https://web-staging.cvent.com',
    PLANNERSIDE_URL: process.env.DEV_BACKEND || (
      /^\d\d\d$/.test(environment) ? `silo${environment}-app.core.cvent.org` : 'app.t2.cvent.com')
  };
}

const { ENVIRONMENT, EVENT_GUESTSIDE_URL, WEB_CVENT_COM_URL, PLANNERSIDE_URL } = readRegionSetting();
const IS_DEV_MODE = process.env.IS_DEV_MODE || false;
const IS_DEBUG = process.env.IS_DEBUG || IS_DEV_MODE;
const DEV_IP = process.env.DEV_IP || (IS_DEV_MODE ? determineCventDevIp() : null);

const DEV_PORT = process.env.DEV_PORT || '8081';
const DEV_HTTPS_PORT = process.env.DEV_HTTPS_PORT || '8083';
const DEV_APOLLO_SERVER = process.env.DEV_APOLLO_SERVER;

const DEV_SOURCE_MAPS = IS_FAST_DEV ? 'cheap-module-eval-source-map' : 'inline-source-map';

if (DEV_IP) {
  console.log(`IS_DEBUG=${IS_DEBUG}`);
  console.log(`DEV_SILO=${ENVIRONMENT}`);
  console.log(`DEV_IP=${DEV_IP}`);
  console.log(`DEV_PORT=${DEV_PORT}`);
  console.log(`DEV_HTTPS_PORT=${DEV_HTTPS_PORT}`);
  console.log(`*** Visit guest-side at https://${DEV_IP}:${DEV_HTTPS_PORT}/event/{eventId} ***\n`);
  console.log(`*** Login for planner reg at https://${DEV_IP}:${DEV_HTTPS_PORT}/Subscribers/Login.aspx ***\n`);
} else if (IS_DEV_MODE) {
  console.warn('*** Using local FIXTURE data');
  console.log('Provide DEV_IP environment variable to enable silo development ***');
  console.log('*** See README for more information                                ***\n');
}

// new relic snippet.
const fs = require('fs');
const NR = fs.readFileSync('./NR.js');
const { version } = JSON.parse(fs.readFileSync('./package.json'));
const PENDO_ANALYTICS = fs.readFileSync('./pendo_analytics.html');

if (IS_DEV_MODE) {
  watchFileDependencies(simpleSyncOnFileChange);
}

function apolloServerRewrite() {
  return {
    target: DEV_APOLLO_SERVER || WEB_CVENT_COM_URL,
    changeOrigin: true,
    pathRewrite: (pathname, _req) => {
      return DEV_APOLLO_SERVER ? pathname.replace('/event/', '/api/') : pathname;
    }
  };
}

function plannerSideBackendProxy() {
  return {
    target: `https://${PLANNERSIDE_URL}`,
    pathRewrite: (_path, req) => {
      const parsedUrl = url.parse(req.url, true);
      const query = Object.assign(parsedUrl.query, { devHttps: `http://${DEV_IP}:${DEV_PORT}` });
      const pathname = parsedUrl.pathname;
      // eslint-disable-next-line no-param-reassign
      req.url = url.format({ pathname, query });
      // eslint-disable-next-line no-param-reassign
      req.headers.host = PLANNERSIDE_URL;
      return req.url;
    }
  };
}

function guestSideRewrite({ target = WEB_CVENT_COM_URL, addDevHttps = false } = {}) {
  return {
    changeOrigin: true,
    target,
    bypass: req => {
      if (req.url.startsWith(`/${name}/versions`)) {
        return req.url;
      }
      if (req.url.startsWith(`/${name}/tags`)) {
        return req.url;
      }
    },
    pathRewrite: (_path, req) => {
      // no op on the stupid
      if (req.url.startsWith(`/${name}/`)) {
        return req.url;
      }
      const { pathname, query } = url.parse(req.url, true);
      if (addDevHttps && DEV_IP) {
        query.devHttps = `http://${DEV_IP}:${DEV_PORT}`;
      }
      query.environment = query.environment || ENVIRONMENT;
      /*
        * Rewrite path to allow local instances of event-guestside-service. handles the following cases:
        * - /embedded-registration by sending to /event_guest/v1/embedded-registration
        * - /events and /event by sending to /event_guest/v1/event
        */
      const convertedPathname = pathname.includes('/embedded-registration/')
        ? pathname.replace(/^\/embedded-registration\//, '/event_guest/v1/embedded-registration/')
        : pathname.replace(/^\/events?\//, '/event_guest/v1/event/');
      /* eslint-disable no-param-reassign */
      req.url = url.format({
        pathname: convertedPathname,
        query
      });
      /* eslint-enable no-param-reassign */
      return req.url;
    }
  };
}

const config = {
  mode: PROD ? 'production' : 'development',
  name: 'event-guestside-site',
  target: 'web',
  bail: PROD,
  resolve: {
    alias: {
      moment: path.resolve(__dirname, require.resolve('moment/min/moment.min.js')),
      lodash$: path.resolve(__dirname, require.resolve('lodash-es')),
      lodash: path.dirname(path.resolve(__dirname, require.resolve('lodash-es')))
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json']
  },
  devServer: {
    disableHostCheck: true,
    host: '0.0.0.0',
    port: DEV_PORT,
    historyApiFallback: true,
    watchOptions: {
      ignored: /node_modules\/(?!event-widgets)/
    },
    proxy: Object.assign({}, getCventMockDeploymentWebpackProxySettings(), {
      '/event/graphql': apolloServerRewrite(),
      '/event_guest/*': guestSideRewrite({ target: EVENT_GUESTSIDE_URL }),
      '/event-guestside-attendee/*': guestSideRewrite(),
      '/events/*': guestSideRewrite({ target: EVENT_GUESTSIDE_URL, addDevHttps: true }),
      '/event/*': guestSideRewrite({ target: EVENT_GUESTSIDE_URL, addDevHttps: true }),
      '/embedded-registration/*': guestSideRewrite({ target: EVENT_GUESTSIDE_URL, addDevHttps: true }),
      '/subscribers/*': plannerSideBackendProxy(),
      '/Subscribers/*': plannerSideBackendProxy(),
      '/a/*': plannerSideBackendProxy(),
      '/g/*': plannerSideBackendProxy()
    })
  },
  devtool: IS_DEV_MODE ? DEV_SOURCE_MAPS : 'source-map',
  output: {
    path: path.join(__dirname, 'dist/'),
    filename: `[name].${marker}.js`,
    chunkFilename: `[id].${marker}.js`,
    crossOriginLoading: 'anonymous'
  },
  stats,
  entry: {
    main: './src/assetLoaders.ts',
    error: './src/errorMain.ts',
    'not-found': './src/notFoundMain.ts',
    'archive-page': './src/archivePage/assetLoaders.ts'
  },
  module: {
    rules: [
      ...jsRules({ appDirectory: __dirname, localSourceDirs: ['src'] }),
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
              hmr: process.env.NODE_ENV === 'development'
            }
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]___[hash:base64:5]',
                context: path.resolve(__dirname)
              },
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [AutoPrefixer]
            }
          },
          'less-loader'
        ]
      },
      {
        test: /\.min\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          },
          'css-loader'
        ]
      },
      imageRule,
      fontRule,
      {
        test: /\.(graphql|gql)$/,
        include: [/src/],
        use: 'graphql-tag/loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: `"${process.env.NODE_ENV}"` }
    }),
    new MiniCssExtractPlugin({
      filename: `css/[name].${marker}.[contenthash].css`,
      ignoreOrder: true
    }),
    new LodashModuleReplacementPlugin({
      caching: false,
      chaining: false,
      cloning: false,
      coercions: false,
      collections: true,
      currying: true,
      deburring: false,
      exotics: false,
      flattening: true,
      guards: false,
      memoizing: true,
      metadata: false,
      paths: true,
      placeholders: true,
      shorthands: true,
      unicode: false
    }),
    new AssetBundlePlugin({
      bundle: ['main'],
      nonce: true,
      templates: [
        {
          vars: {
            lang: '{{lang}}',
            newRelic: IS_DEV_MODE ? '' : `<script nonce="{{{nonce}}}">${NR}</script>`,
            title: '{{appTitle}}',
            nonce: '{{{nonce}}}',
            viewRoot: '{{viewRoot}}',
            analyticsUrl: IS_DEV_MODE ? null : '{{analyticsUrl}}',
            analyticsUrlPath: IS_DEV_MODE ? null : '{{analyticsUrlPath}}',
            attendeeExperienceUrl: '{{attendeeExperienceUrl}}',
            webPaymentsSettings: '{{{webPaymentsSettings}}}',
            assetRoot: IS_DEV_MODE ? '/' : '{{cdnRoot}}', // inject CDN value here or template value.
            isDebug: IS_DEV_MODE ? IS_DEBUG : '{{isDebug}}',
            environment: IS_DEV_MODE ? ENVIRONMENT : '{{environment}}',
            eventContext: '{{{eventContext}}}',
            accessToken: '{{accessToken}}',
            logToServer: IS_DEV_MODE ? false : '{{logToServer}}',
            version,
            serviceBaseUrl: IS_DEV_MODE ? '/event_guest' : '{{serviceBaseUrl}}',
            googleApiKey: '{{googleApiKey}}',
            onPlannerRegExitUrl: '{{{onPlannerRegExitUrl}}}',
            plannerApolloServerBaseUrl: '{{{plannerApolloServerBaseUrl}}}',
            onPlannerRegSuccessUrl: '{{{onPlannerRegSuccessUrl}}}',
            plannerSendEmail: '{{plannerSendEmail}}',
            faviconPath: '{{faviconPath}}',
            canonicalUrl: '{{canonicalUrl}}',
            accountName: '{{accountName}}',
            createdBy: '{{createdBy}}',
            eventId: '{{eventId}}',
            eventTitle: '{{eventTitle}}',
            meta: '{{{meta}}}',
            modificationRequest: '{{{modificationRequest}}}',
            eventLaunchWizardSettings: '{{{eventLaunchWizardSettings}}}',
            initializationCodeSnippets:
              '{{#initializationCodeSnippetsList}}' +
              '{{{.}}}' +
              '{{/initializationCodeSnippetsList}}',
            triggerBasedCodeSnippets:
              '{{#triggerBasedCodeSnippetsList}}    ' +
              'window.CVENT.addTriggerHandlers(\'{{event}}\', function() { {{{triggerHandler}}} });\n' +
              '{{/triggerBasedCodeSnippetsList}}',
            cultureCode: '{{cultureCode}}',
            eventTimezoneId: '{{eventTimezoneId}}',
            capacityIds: '{{{capacityIds}}}',
            isTravelEnabled: '{{isTravelEnabled}}',
            accountSnapshotVersion: '{{accountSnapshotVersion}}',
            eventSnapshotVersion: '{{eventSnapshotVersion}}',
            travelSnapshotVersion: '{{travelSnapshotVersion}}',
            googleAnalyticsScript: '{{{googleAnalyticsScript}}}',
            experiments: '{{{experiments}}}',
            appleMapToken: '{{appleMapToken}}',
            appointmentsUrl: '{{appointmentsUrl}}',
            hasMultipleLanguages: '{{hasMultipleLanguages}}',
            pendoAnalytics: IS_DEV_MODE ? '' : PENDO_ANALYTICS,
            deemUrl: '{{deemUrl}}'
          },
          src: './resources/templates/index.mustache',
          dest: 'event_guestside_site.[contenthash].mustache'
        },
        {
          bundle: ['archive-page'],
          vars: {
            lang: '{{lang}}',
            newRelic: IS_DEV_MODE ? '' : `<script nonce="{{{nonce}}}">${NR}</script>`,
            title: '{{appTitle}}',
            nonce: IS_DEV_MODE ? '2726c7f26c' : '{{{nonce}}}',
            viewRoot: '{{viewRoot}}',
            assetRoot: IS_DEV_MODE ? '/' : '{{cdnRoot}}', // inject CDN value here or template value.
            environment: IS_DEV_MODE ? ENVIRONMENT : '{{environment}}',
            version,
            serviceBaseUrl: IS_DEV_MODE ? '/event_guest' : '{{serviceBaseUrl}}',
            faviconPath: '{{faviconPath}}',
            canonicalUrl: '{{canonicalUrl}}',
            accountName: '{{accountName}}',
            createdBy: '{{createdBy}}',
            eventId: '{{eventId}}',
            eventTitle: '{{eventTitle}}',
            meta: '{{{meta}}}',
            cultureCode: '{{cultureCode}}',
            eventTimezoneId: '{{eventTimezoneId}}',
            eventSnapshotVersion: '{{eventSnapshotVersion}}',
            initializationCodeSnippets:
              '{{#initializationCodeSnippetsList}}' +
              '{{{.}}}' +
              '{{/initializationCodeSnippetsList}}',
            triggerBasedCodeSnippets:
              '{{#triggerBasedCodeSnippetsList}}    ' +
              'window.CVENT.addTriggerHandlers(\'{{event}}\', function() { {{{triggerHandler}}} });\n' +
              '{{/triggerBasedCodeSnippetsList}}',
            eventContext: '{{{eventContext}}}',
            verifiedWebsitePassword: '{{verifiedWebsitePassword}}',
            experiments: '{{{experiments}}}'
          },
          src: './resources/templates/archive-page.mustache',
          dest: 'archive_page.[contenthash].mustache'
        },
        {
          bundle: ['error'],
          vars: {
            nonce: '{{{nonce}}}',
            assetRoot: '{{cdnRoot}}',
            errorInformation: echo
          },
          src: './resources/templates/error.mustache',
          dest: 'error.[contenthash].mustache'
        },
        {
          vars: {
            title: '{{title}}',
            message: '{{message}}',
            postBody: '{{{postBody}}}',
            postURL: '{{postURL}}'
          },
          src: './resources/templates/redirect-concur.mustache',
          dest: 'redirect-concur.[contenthash].mustache'
        },
        {
          bundle: ['error'],
          excludeFromManifest: true,
          devNonce: '2726c7f26c',
          vars: {
            assetRoot: '/',
            nonce: '{{{nonce}}}',
            errorInformation: {
              sessionIdLabel: 'Session ID',
              instanceIdLabel: 'Instance ID',
              timeLabel: 'Time',
              details: 'If you\'re still having difficulty, contact ' +
              'Cvent\'s Support Team with your Instance and Session ID.',
              goBackLabel: 'Go Back',
              mainMessage: 'Your request couldn\'t be completed at the moment.',
              message: 'We suggest returning to the page and trying again.',
              mainTitleMessage: 'Oops...we goofed.',
              customerCareCenter: 'Customer Care Center',
              httpLogRequestId: '5cbeebf7-bbbe-4477-b09a-f04bd203586c',
              pageLoadIdLabel: 'Session ID',
              httpLogPageLoadId: 'bbfe24a8-4a81-4884-9c66-f48e6c949d11',
              errorDateTime: 'Thu Mar 09 2017 12:34:18 GMT-0500 (EST)',
              lang: 'en',
              pageTitle: 'Cvent Error Page',
              logToServer: false
            }
          },
          src: './resources/templates/error.mustache',
          dest: 'error.html'
        },
        {
          bundle: ['not-found'],
          vars: {
            nonce: '{{{nonce}}}',
            assetRoot: '{{cdnRoot}}',
            errorInformation: echo
          },
          src: './resources/templates/not-found.mustache',
          dest: 'not-found.[contenthash].mustache'
        },
        {
          bundle: ['not-found'],
          excludeFromManifest: true,
          devNonce: '2726c7f26c',
          vars: {
            assetRoot: '/',
            nonce: '{{{nonce}}}',
            errorInformation: {
              title: 'Hmm...',
              message: 'It does\'t look like we have a record of that event. Try back again later!',
              eventManagementSoftware: 'Event Management Software', // _cventFooter_eventManagementSoftware__resx
              surveySoftware: 'Web Survey Software', // _cventFooter_surveySoftware__resx
              eventVenues: 'Event Venue Selection', // _cventFooter_eventVenues__resx
              privacyPolicy: 'Privacy Policy' // _cventFooter_privacyPolicy__resx
            }
          },
          src: './resources/templates/not-found.mustache',
          dest: 'not-found.html'
        }
      ],
      files: [
        { src: require.resolve('nucleus-widgets/resources/images/favicon.v2.ico'), dest: 'images/favicon.v2.ico' },
        { src: './resources/images/cvent-logo-150x30.v1.png', dest: 'images/cvent-logo.v1.png' },
        { src: './resources/images/ie-error.v1.svg', dest: 'images/ie-error.v1.svg' },
        { src: './resources/internet-explorer-is-dead.v2.js', dest: 'internet-explorer-is-dead.v2.js' }
      ],
      manifestFile: 'manifest.json'
    }),
    new SslProxyWebpackPlugin(DEV_HTTPS_PORT, `http://0.0.0.0:${DEV_PORT}`),
    new CventMockDeploymentPlugin(),
    ...plugins()
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
        extractComments: false,
        terserOptions: {
          compress: {
            warnings: false
          },
          comments: false,
          minimize: true
        }
      })
    ],
    runtimeChunk: 'single'
  }
};

module.exports = config;
