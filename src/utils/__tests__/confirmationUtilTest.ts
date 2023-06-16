import { getConfirmationPageIdForInvitee, getPostRegPageGroupPagesForInvitee } from '../confirmationUtil';
import * as InviteeStatus from 'event-widgets/utils/InviteeStatus';
jest.mock('../../redux/actions');

const translate = x => x;

const confirmationPageId = 'confirmationPageId';
const otherPostRegPage1 = 'otherPostRegPage1';
const otherPostRegPage2 = 'otherPostRegPage2';
const registrationPendingApprovalPageId = 'registrationPendingApprovalPageId';
const registrationApprovalDeniedPageId = 'registrationApprovalDeniedPageId';
const defaultPageId = 'defaultPageId';

function dispatchWithState(state) {
  async function dispatch(action) {
    if (typeof action === 'function') {
      return await action(dispatch, () => state);
    }
  }
  return dispatch;
}

const initialState = {
  website: {
    pages: {
      confirmationPageId: {
        id: confirmationPageId,
        name: 'Confirmation Page'
      },
      otherPostRegPage1: {
        id: otherPostRegPage1,
        name: 'Other Post Reg Page 1'
      },
      otherPostRegPage2: {
        id: otherPostRegPage2,
        name: 'Other Post Reg Page 2'
      },
      registrationPendingApprovalPageId: {
        id: registrationPendingApprovalPageId,
        name: 'Registration Pending Approval Page'
      },
      registrationApprovalDeniedPageId: {
        id: registrationApprovalDeniedPageId,
        name: 'Registration Approval Denied Page'
      }
    },
    pluginData: {
      registrationProcessNavigation: {
        registrationPaths: {
          regPathId: {
            confirmationPageId: 'confirmationPageId',
            registrationPendingApprovalPageIds: ['registrationPendingApprovalPageId'],
            registrationApprovalDeniedPageIds: ['registrationApprovalDeniedPageId'],
            postRegPageIds: ['confirmationPageId', 'otherPostRegPage1', 'otherPostRegPage2']
          }
        }
      },
      eventWebsiteNavigation: {
        defaultPageId
      }
    }
  },
  appData: {
    registrationSettings: {
      registrationPaths: {
        regPathId: {
          id: 'regPathId',
          isDefault: true
        }
      }
    }
  }
};

describe('Test getConfirmationPageIdForInvitee', () => {
  it('Invitee is pending approval, return pending approval page', async () => {
    const state = {
      ...initialState,
      persona: {
        inviteeStatus: InviteeStatus.PendingApproval
      }
    };
    const pageId = await dispatchWithState(state)(getConfirmationPageIdForInvitee());
    expect(pageId).toBe(registrationPendingApprovalPageId);
  });
  it('Invitee is accepted, return confirmation page', async () => {
    const state = {
      ...initialState,
      persona: {
        inviteeStatus: InviteeStatus.Accepted
      }
    };
    const pageId = await dispatchWithState(state)(getConfirmationPageIdForInvitee());
    expect(pageId).toBe(confirmationPageId);
  });
  it('Invitee is cancelled, return the confirmation page', async () => {
    const state = {
      ...initialState,
      persona: {
        inviteeStatus: InviteeStatus.Cancelled
      }
    };
    const pageId = await dispatchWithState(state)(getConfirmationPageIdForInvitee());
    expect(pageId).toBe(confirmationPageId);
  });
});

describe('Test getPostRegPageGroupPagesForInvitee', () => {
  it('Invitee is pending approval, pending approval page is the only post reg page', () => {
    const state = {
      ...initialState,
      persona: {
        inviteeStatus: InviteeStatus.PendingApproval
      }
    };
    const pages = getPostRegPageGroupPagesForInvitee(state, translate);
    expect(pages.length).toBe(1);
    expect(pages).toMatchSnapshot();
  });
  it('Invitee is approval denied, approval denied page is the only post reg page', () => {
    const state = {
      ...initialState,
      persona: {
        inviteeStatus: InviteeStatus.DeniedApproval
      }
    };
    const pages = getPostRegPageGroupPagesForInvitee(state, translate);
    expect(pages.length).toBe(1);
    expect(pages).toMatchSnapshot();
  });
  it('Invitee is accepted, post reg pages are all present', () => {
    const state = {
      ...initialState,
      persona: {
        inviteeStatus: InviteeStatus.Accepted
      }
    };
    const pages = getPostRegPageGroupPagesForInvitee(state, translate);
    expect(pages.length).toBe(3);
    expect(pages).toMatchSnapshot();
  });
  it('Invitee is accepted, post reg pages are filtered for reg type', () => {
    const state = {
      ...initialState,
      persona: {
        inviteeStatus: InviteeStatus.Accepted
      },
      defaultUserSession: {
        defaultRegistrationTypeId: 'foo'
      }
    };

    (state.website.pluginData.registrationProcessNavigation as $TSFixMe).regTypeVisibility = {
      otherPostRegPage1: {
        regTypeVisibilityEnabled: true,
        regTypeVisibilityList: ['foo']
      },
      otherPostRegPage2: {
        regTypeVisibilityEnabled: false
      },
      otherPostRegPage3: {
        regTypeVisibilityEnabled: true,
        regTypeVisibilityList: ['bar']
      }
    };
    state.website.pluginData.registrationProcessNavigation.registrationPaths.regPathId.postRegPageIds.push(
      'otherPostRegPage3'
    );

    const pages = getPostRegPageGroupPagesForInvitee(state, translate);
    expect(pages.length).toBe(2);
    expect(pages).toMatchSnapshot();
  });
});
