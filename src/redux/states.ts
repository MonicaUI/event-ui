import { hideLoadingDialog, showLoadingDialog } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { loadState } from 'event-widgets/redux/modules/state';
import { registerTranslation } from 'nucleus-widgets/redux/modules/text';
import Logger from '@cvent/nucleus-logging';

const LOG = new Logger('redux/states');

export function loadCountryStates(countryCode: $TSFixMe) {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    dispatch(showLoadingDialog());
    LOG.debug('loadState', countryCode);
    await dispatch(loadState(registerTranslation, countryCode));
    LOG.debug('loadState success');
    dispatch(hideLoadingDialog());
  };
}
