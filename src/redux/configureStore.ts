import analyticsConfig from './analytics';
import reducer from './reducer';

// using require instead of import for conditional compilation;
let createStoreWithMiddleware;
if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  createStoreWithMiddleware = require('nucleus-guestside-site/src/redux/prodCreateStoreWithMiddleware').default;
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  createStoreWithMiddleware = require('nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware').default;
}

export default function configureStore(
  initialState: $TSFixMe,
  baseAnalyticsConfig = {},
  thunkExtraArgument?: $TSFixMe
): $TSFixMe {
  return createStoreWithMiddleware(reducer, initialState, {
    analyticsConfig: analyticsConfig(initialState, baseAnalyticsConfig),
    thunkExtraArgument
  });
}
