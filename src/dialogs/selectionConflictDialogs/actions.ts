import { closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { routeToPage } from '../../redux/pathInfo';
import { REGISTRATION } from '../../redux/website/registrationProcesses';

export function returnToProcessStart() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    dispatch(closeDialogContainer());
    await dispatch(routeToPage(REGISTRATION.forCurrentRegistrant().startPageId(getState())));
  };
}
