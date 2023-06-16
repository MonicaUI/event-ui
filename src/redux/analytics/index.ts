import baseFactProvider from './baseFactProvider';
import factProvider from './factProvider';
import { lazyLoadAction } from '../../utils/lazyLoad';

export type UnknownFact = {
  eventId: string;
  env: string;
  speakerId?: string;
  documentId?: string;
  fileName?: string;
  fileType?: string;
  pageName?: string;
};

export default function analyticsConfig(initialState: $TSFixMe, baseConfig: $TSFixMe): $TSFixMe {
  return {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    enabled: !!(initialState.account && initialState.account.name && baseConfig.baseUrl),
    endpoint: baseConfig.endpoint,
    appId: 'event-guestside-site',
    baseFactProvider,
    factProvider,
    ...baseConfig
  };
}

export const initializePendoAnalytics = lazyLoadAction(() =>
  import(/* webpackChunkName: "pendo analyics" */ './pendo').then(m => m.initializePendoAnalytics)
);
