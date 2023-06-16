import React from 'react';
import StartNewRegistration from './StartNewRegistration';
import ConfirmationStyles from '../shared/Confirmation.less';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { forceTabToActive } from '../../initializeMultiTabTracking';
import { routeToPage } from '../../redux/pathInfo';
import { loadRegistrationContent, loadGuestRegistrationContent } from '../../redux/actions';
import { REGISTRATION } from '../../redux/website/registrationProcesses';
import { getRegistrationPathIdOrDefault } from '../../redux/selectors/currentRegistrationPath';
import { getRegPackIdFromRegCart } from '../../redux/selectors/shared';
import { getRegistrationTypeId } from '../../redux/selectors/currentRegistrant';
import { filterEventSnapshot } from '../../redux/actions';
import { getIn } from 'icepick';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { injectTestId } from '@cvent/nucleus-test-automation';

const openStartNewRegistrationDialog = (openDialogConfig, requestClose) => {
  return (dispatch, getState) => {
    const boundCloseHandler = () => dispatch(requestClose());
    const dialog = (
      <StartNewRegistration
        {...injectTestId('start-new-registration')}
        dialogConfig={openDialogConfig}
        requestClose={boundCloseHandler}
      />
    );
    return dispatch(
      openDialogContainer(dialog, boundCloseHandler, {
        classes: {
          dialogContainer: ConfirmationStyles.dialogContainer
        },
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};

export const openStartNewRegistrationDialogFromPageLanding = (
  openDialogConfig: $TSFixMe,
  startNewRegistration?: $TSFixMe
): $TSFixMe =>
  openStartNewRegistrationDialog(
    openDialogConfig,
    withLoading(() => async (dispatch, getState) => {
      // Chose don't start new registration while landing on registration process, restore the existing registration
      dispatch(closeDialogContainer());
      // PROD-79071: reload app data when registrant restore existing registration.
      const registrationPathId = getRegistrationPathIdOrDefault(getState());
      const registrationSettings = getIn(getState(), [
        'appData',
        'registrationSettings',
        'registrationPaths',
        registrationPathId
      ]);
      const registrationPathSettings = getIn(getState(), ['appData', 'registrationPathSettings', registrationPathId]);

      const regPackId = getRegPackIdFromRegCart(getState());
      if (!!regPackId || !registrationSettings || !registrationPathSettings) {
        const registrationTypeId = getRegistrationTypeId(getState());
        await dispatch(filterEventSnapshot(getState().eventSnapshotVersion, registrationTypeId, registrationPathId));
      }
      await dispatch(loadRegistrationContent(REGISTRATION, registrationPathId));
      await dispatch(loadGuestRegistrationContent(registrationPathId));
      const routeToPageId = REGISTRATION.forCurrentRegistrant().startPageId(getState());
      // here we are answering 'no, continue my existing registration'. so we mark the tab as active.
      dispatch(forceTabToActive(routeToPageId));
      dispatch(routeToPage(routeToPageId));
    }),
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 3.
    startNewRegistration
  );

export const openStartNewRegistrationDialogDuringRegistration = (openDialogConfig?: $TSFixMe): $TSFixMe =>
  openStartNewRegistrationDialog(
    openDialogConfig,
    // Chose don't start new registration while in middle of registering, just close the dialog
    closeDialogContainer
  );

export { startNewRegistrationAndNavigateToRegistration } from './StartNewRegistration';
