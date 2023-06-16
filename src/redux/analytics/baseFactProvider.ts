import { defaultFactProvider } from 'nucleus-analytics-middleware';
/**
 * Gets the base fact information we want applied to all facts that get
 * recorded for event-build-wizard.
 */
export default function baseFactProvider(_prevState: $TSFixMe, _action: $TSFixMe, _nextState: $TSFixMe): $TSFixMe {
  const defaults = defaultFactProvider(_prevState, _action, _nextState);
  if (!_action.type) {
    return null;
  }
  return {
    ...defaults,
    accountName: _nextState.account.name,
    app_name: 'event-guestside-site'
  };
}
