import {
  getRegistrationPathIdOrNull,
  getRegistrationPathIdOrDefault
} from '../redux/selectors/currentRegistrationPath';
import { isInviteePendingApproval, isInviteeApprovalDenied } from '../redux/persona';
import { APPROVAL_DENIED, PENDING_APPROVAL, POST_REGISTRATION } from '../redux/website/registrationProcesses';
import { loadRegistrationContent } from '../redux/actions';
import { getIn } from 'icepick';
import { getRegistrationTypeId } from '../redux/selectors/currentRegistrant';
import { getRegistrationPagesRegTypeVisibility } from '../redux/selectors/shared';
import { get } from 'lodash';

function getConfirmationPageId(state) {
  return getIn(state, [
    'website',
    'pluginData',
    'registrationProcessNavigation',
    'registrationPaths',
    getRegistrationPathIdOrDefault(state),
    'confirmationPageId'
  ]);
}

export function isValidPageForRegType(pageId: $TSFixMe, regTypeId: $TSFixMe, regTypeVisibility: $TSFixMe): $TSFixMe {
  if (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    regTypeVisibility &&
    regTypeVisibility[pageId] &&
    regTypeVisibility[pageId].regTypeVisibilityEnabled === true &&
    regTypeVisibility[pageId].regTypeVisibilityList.length
  ) {
    return regTypeVisibility[pageId].regTypeVisibilityList.indexOf(regTypeId) >= 0;
  }
  return true;
}

export const getConfirmationPageIdForInvitee = () => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    let pageId;
    if (isInviteePendingApproval(getState())) {
      await dispatch(loadRegistrationContent(PENDING_APPROVAL, getRegistrationPathIdOrNull(getState())));
      pageId = PENDING_APPROVAL.forCurrentRegistrant().startPageId(getState());
    } else if (isInviteeApprovalDenied(getState())) {
      await dispatch(loadRegistrationContent(APPROVAL_DENIED, getRegistrationPathIdOrNull(getState())));
      pageId = APPROVAL_DENIED.forCurrentRegistrant().startPageId(getState());
    } else {
      await dispatch(loadRegistrationContent(POST_REGISTRATION, getRegistrationPathIdOrNull(getState())));
      pageId = getConfirmationPageId(getState());
    }
    return pageId;
  };
};

export const getPostRegPageGroupPagesForInvitee = (
  state: $TSFixMe,
  translate: $TSFixMe,
  userText?: $TSFixMe
): $TSFixMe => {
  const {
    website: { pages }
  } = state;
  const regTypeId = getRegistrationTypeId(state);
  const regTypeVisibility = getRegistrationPagesRegTypeVisibility(state);

  const pageIds = [];
  if (isInviteePendingApproval(state)) {
    const id = PENDING_APPROVAL.forCurrentRegistrant().startPageId(state);
    if (id) {
      pageIds.push(id);
    }
  } else if (isInviteeApprovalDenied(state)) {
    const id = APPROVAL_DENIED.forCurrentRegistrant().startPageId(state);
    if (id) {
      pageIds.push(id);
    }
  } else {
    pageIds.push(...POST_REGISTRATION.forCurrentRegistrant().pageIds(state));
  }
  return pageIds
    .filter(id => {
      return isValidPageForRegType(id, regTypeId, regTypeVisibility);
    })
    .map(id => {
      return {
        ...pages[id],
        name:
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          pages[id] && pages[id].name ? translate(get(userText, 'website.pages.' + id + '.name', pages[id].name)) : ''
      };
    });
};
