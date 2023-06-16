import {
  getPageWithAdmissionItems,
  getPageWithSessions,
  sessionsAppearOnPageBeforeAdmissionItems,
  getPageWithRegistrationSummary
} from '../../website/pageContents';
import {
  getRegistrationPathId,
  isGuestProductSelectionEnabledOnRegPath,
  getRegistrationTypeForGroupMembers,
  isOverlappingSessionsAllowedOnRegPath,
  isGuestRegistrationEnabled,
  getPaymentCreditsEnabled
} from '../currentRegistrationPath';
import { setIn } from 'icepick';
import { CANCELLATION, DECLINE, REGISTRATION, WAITLIST } from '../../website/registrationProcesses';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';

describe('getPageWithAdmissionItems', () => {
  test('Page with admission items', () => {
    const state = createDefaultState();
    const page = getPageWithAdmissionItems(state);
    expect(page.id).toBe('regProcessStep1');
  });

  test('No page with admission items', () => {
    const state = createDefaultState();
    // The widget type is changed to simulate the website without admission items.
    state.website.layoutItems.admissionItemWidgetLayoutItemId.widgetType = 'EventTitle';
    const page = getPageWithAdmissionItems(state);
    expect(page).toBeUndefined();
  });
});

describe('getPageWithSessions', () => {
  test('Page with sessions', () => {
    const state = createDefaultState();
    const page = getPageWithSessions(state);
    expect(page.id).toBe('regProcessStep2');
  });

  test('No page with sessions', () => {
    const state = createDefaultState();
    // The widget type is changed to simulate the website without sessions.
    state.website.layoutItems.sessionWidgetLayoutItemId.widgetType = 'EventTitle';
    const page = getPageWithSessions(state);
    expect(page).toBeUndefined();
  });
});

describe('sessionsAppearOnPageBeforeAdmissionItems', () => {
  test('Sessions appear on page after admission items', () => {
    const state = createDefaultState();
    expect(sessionsAppearOnPageBeforeAdmissionItems(state)).toBeFalsy();
  });

  test('Sessions appear on page before admission items', () => {
    const state = createDefaultState();
    state.website.pluginData.registrationProcessNavigation.registrationPaths.regPathId.pageIds.reverse();
    expect(sessionsAppearOnPageBeforeAdmissionItems(state)).toBeTruthy();
  });

  test('Sessions appear on same page as admission items', () => {
    const state = createDefaultState();
    state.website.layoutItems.regPage1RootLayoutItemId.layout.childIds = [
      'sessionWidgetLayoutItemId',
      'admissionItemWidgetLayoutItemId'
    ];
    state.website.layoutItems.regPage2RootLayoutItemId.layout.childIds = [];
    state.website.layoutItems.sessionWidgetLayoutItemId.layout.parentId = 'regPage1RootLayoutItemId';
    expect(sessionsAppearOnPageBeforeAdmissionItems(state)).toBeFalsy();
  });

  test('Sessions do not exist', () => {
    const state = createDefaultState();
    // The widget type is changed to simulate the website without sessions.
    state.website.layoutItems.sessionWidgetLayoutItemId.widgetType = 'EventTitle';
    expect(sessionsAppearOnPageBeforeAdmissionItems(state)).toBeFalsy();
  });

  test('Admission items do not exist', () => {
    const state = createDefaultState();
    // The widget type is changed to simulate the website without admission items.
    state.website.layoutItems.admissionItemWidgetLayoutItemId.widgetType = 'EventTitle';
    expect(sessionsAppearOnPageBeforeAdmissionItems(state)).toBeFalsy();
  });
});

describe('getPageWithRegistrationSummary', () => {
  test('Page with registration summary', () => {
    const state = createDefaultState();
    const page = getPageWithRegistrationSummary(state);
    expect(page.id).toBe('regProcessStep3');
  });

  test('No page with registration summary', () => {
    const state = createDefaultState();
    // The widget type is changed to simulate the website without admission items.
    state.website.layoutItems.registrationSummaryWidgetLayoutItemId.widgetType = 'EventTitle';
    const page = getPageWithRegistrationSummary(state);
    expect(page).toBeUndefined();
  });
});

describe('get Registration Pages using RegistrationPathId', () => {
  test('getRegistrationPathId reads from state.appData.registrationSettings.registrationPaths', () => {
    const state = createDefaultState();
    const registrationPathId = getRegistrationPathId(state);
    expect(registrationPathId).toBe('regPathId');
  });
  test('getRegistrationPathId failed', () => {
    const state = createDefaultState();
    delete state.registrationForm.regCart;
    expect(() => getRegistrationPathId(state)).toThrow();
  });

  test('getRegistrationStartPage select from current registration path', () => {
    const state = createDefaultState();
    const registrationStartPageId = REGISTRATION.forCurrentRegistrant().startPageId(state);
    expect(registrationStartPageId).toBe('regProcessStep1');
  });
  test('getRegistrationPages select from current registration path', () => {
    const state = createDefaultState();
    const registrationPages = REGISTRATION.forCurrentRegistrant().pageIds(state);
    expect(registrationPages).toEqual(['regProcessStep1', 'regProcessStep2', 'regProcessStep3']);
  });
  test('getRegistrationCancellationPageIds select from current registration path', () => {
    const state = createDefaultState();
    const registrationCancellationPageIds = CANCELLATION.forCurrentRegistrant().pageIds(state);
    expect(registrationCancellationPageIds).toEqual(['bogusCancelPageId']);
  });
  test('getRegistrationDeclinePageIds select from current registration path', () => {
    const state = createDefaultState();
    const registrationDeclinePageIds = DECLINE.forCurrentRegistrant().pageIds(state);
    expect(registrationDeclinePageIds).toEqual(['bogusDeclinePageId']);
  });
  test('getRegistrationWaitlistPageIds select from current registration path', () => {
    const state = createDefaultState();
    const registrationWaitlistPageIds = WAITLIST.forCurrentRegistrant().pageIds(state);
    expect(registrationWaitlistPageIds).toEqual(['bogusWaitlistPageId']);
  });
});

describe('getPaymentCredits', () => {
  test('current RegPathID IS NOT added in registrationPathSettings', () => {
    const state = createDefaultState();
    const stateWithSetting = setIn(state, ['appData', 'registrationPathSettings'], []);
    const paymentCreditsEnabled = getPaymentCreditsEnabled(stateWithSetting);
    expect(paymentCreditsEnabled).toBeUndefined();
  });
  test('current RegPathID IS added in registrationPathSettings', () => {
    const state = createDefaultState();
    const paymentCreditsEnabled = getPaymentCreditsEnabled(state);
    expect(paymentCreditsEnabled).toBe(false);
  });
});

describe('isGuestProductSelectionEnabledOnRegPath', () => {
  test('Complex guests disabled on regPath', () => {
    const state = createDefaultState();
    const stateWithSetting = setIn(
      state,
      ['appData', 'registrationSettings', 'registrationPath', 'regPathId', 'isGuestProductSelectionEnabledOnRegPath'],
      false
    );
    const isComplexGuest = isGuestProductSelectionEnabledOnRegPath(stateWithSetting);
    expect(isComplexGuest).toBe(false);
  });

  test('Complex guests enabled on regPath', () => {
    const state = createDefaultState();
    const stateWithSetting = setIn(
      state,
      ['appData', 'registrationSettings', 'registrationPath', 'regPathId', 'isGuestProductSelectionEnabledOnRegPath'],
      true
    );
    const isComplexGuest = isGuestProductSelectionEnabledOnRegPath(stateWithSetting);
    expect(isComplexGuest).toBe(false);
  });

  test('Complex guests setting absent on regPath', () => {
    const state = createDefaultState();
    const isComplexGuest = isGuestProductSelectionEnabledOnRegPath(state);
    expect(isComplexGuest).toBe(false);
  });
});

describe('isOverlappingSessionsAllowedOnRegPath', () => {
  test('allowOverlappingSessions disabled on regPath', () => {
    const state = createDefaultState();
    const stateWithSetting = setIn(
      state,
      ['appData', 'registrationSettings', 'registrationPaths', 'regPathId', 'allowOverlappingSessions'],
      false
    );
    const overlappingSessionsAllowed = isOverlappingSessionsAllowedOnRegPath(stateWithSetting);
    expect(overlappingSessionsAllowed).toBe(false);
  });

  test('allowOverlappingSessions enabled on regPath', () => {
    const state = createDefaultState();
    const stateWithSetting = setIn(
      state,
      ['appData', 'registrationSettings', 'registrationPaths', 'regPathId', 'allowOverlappingSessions'],
      true
    );
    const overlappingSessionsAllowed = isOverlappingSessionsAllowedOnRegPath(stateWithSetting);
    expect(overlappingSessionsAllowed).toBe(true);
  });

  test('allowOverlappingSessions setting absent on regPath', () => {
    const state = createDefaultState();
    const overlappingSessionsAllowed = isOverlappingSessionsAllowedOnRegPath(state);
    expect(overlappingSessionsAllowed).toBe(true);
  });
});

describe('isGuestRegistrationEnabled', () => {
  test('should return true if guest registration is enabled', () => {
    const state = createDefaultState();
    const stateWithSetting = setIn(
      state,
      [
        'appData',
        'registrationSettings',
        'registrationPaths',
        'regPathId',
        'guestRegistrationSettings',
        'isGuestRegistrationEnabled'
      ],
      true
    );
    expect(isGuestRegistrationEnabled(stateWithSetting)).toBe(true);
  });

  test('should return true if guestregistration is disabled', () => {
    const state = createDefaultState();
    const stateWithSetting = setIn(
      state,
      [
        'appData',
        'registrationSettings',
        'registrationPaths',
        'regPathId',
        'guestRegistrationSettings',
        'isGuestRegistrationEnabled'
      ],
      false
    );
    expect(isGuestRegistrationEnabled(stateWithSetting)).toBe(false);
  });

  test('should return false if guest registration is undefined', () => {
    const state = createDefaultState();
    expect(isGuestRegistrationEnabled(state)).toBe(false);
  });
});

describe('registration type for group members', () => {
  test('empty group settings should return empty array', () => {
    const state = createDefaultState();
    const registrationTypes = getRegistrationTypeForGroupMembers(state);
    expect(registrationTypes).toEqual([]);
  });
  test('should return regtype1', () => {
    const state = {
      registrationForm: {
        currentEventRegistrationId: 'member',
        regCart: {
          groupRegistration: true,
          eventRegistrations: {
            leader: {
              attendeeType: 'GROUP_LEADER',
              registrationPathId: 'regPathId'
            },
            member: {
              attendeeType: 'ATTENDEE',
              registrationPathId: 'regPathId',
              primaryRegistrationId: 'leader'
            }
          }
        }
      },
      event: {
        registrationTypes: {
          rt1: {
            id: 'rt1',
            name: 'regType1',
            isOpenForRegistration: true
          }
        }
      },
      website: createDefaultWebsite(),
      appData: {
        registrationSettings: {
          registrationPaths: {
            regPathId: {
              id: 'regPathId',
              groupRegistrationSettings: {
                registrationTypeSettings: {
                  limitVisibility: true,
                  categorizedRegistrationTypes: ['rt1', 'rt2']
                }
              }
            }
          }
        }
      }
    };
    const registrationTypes = getRegistrationTypeForGroupMembers(state);
    expect(registrationTypes).toEqual([{ id: 'rt1', text: 'regType1', attendingFormat: AttendingFormat.INPERSON }]);
  });
  test('should return all reg types', () => {
    const state = {
      registrationForm: {
        currentEventRegistrationId: 'member',
        regCart: {
          groupRegistration: true,
          eventRegistrations: {
            leader: {
              attendeeType: 'GROUP_LEADER',
              registrationPathId: 'regPathId'
            },
            member: {
              attendeeType: 'ATTENDEE',
              registrationPathId: 'regPathId',
              primaryRegistrationId: 'leader'
            }
          }
        }
      },
      event: {
        registrationTypes: {
          rt1: {
            id: 'rt1',
            name: 'regType1',
            isOpenForRegistration: false
          },
          rt2: {
            id: 'rt2',
            name: 'regType2',
            isOpenForRegistration: true
          },
          '00000000-0000-0000-0000-000000000000': {
            id: '00000000-0000-0000-0000-000000000000',
            name: '',
            isOpenForRegistration: true
          }
        }
      },
      website: createDefaultWebsite(),
      appData: {
        registrationSettings: {
          registrationPaths: {
            regPathId: {
              id: 'regPathId',
              groupRegistrationSettings: {
                registrationTypeSettings: {
                  limitVisibility: false,
                  categorizedRegistrationTypes: []
                }
              }
            }
          }
        }
      }
    };
    const registrationTypes = getRegistrationTypeForGroupMembers(state);
    expect(registrationTypes).toEqual([{ id: 'rt2', text: 'regType2', attendingFormat: AttendingFormat.INPERSON }]);
  });
  test('should return closed reg types also for reg mod', () => {
    const state = {
      registrationForm: {
        currentEventRegistrationId: 'member',
        regCart: {
          groupRegistration: true,
          eventRegistrations: {
            leader: {
              attendeeType: 'GROUP_LEADER',
              registrationPathId: 'regPathId'
            },
            member: {
              attendeeType: 'ATTENDEE',
              registrationPathId: 'regPathId',
              primaryRegistrationId: 'leader',
              registrationStatus: 'REGISTERED'
            }
          }
        }
      },
      event: {
        registrationTypes: {
          rt1: {
            id: 'rt1',
            name: 'regType1',
            isOpenForRegistration: false
          },
          rt2: {
            id: 'rt2',
            name: 'regType2',
            isOpenForRegistration: true
          },
          '00000000-0000-0000-0000-000000000000': {
            id: '00000000-0000-0000-0000-000000000000',
            name: '',
            isOpenForRegistration: true
          }
        }
      },
      website: createDefaultWebsite(),
      appData: {
        registrationSettings: {
          registrationPaths: {
            regPathId: {
              id: 'regPathId',
              groupRegistrationSettings: {
                registrationTypeSettings: {
                  limitVisibility: false,
                  categorizedRegistrationTypes: []
                }
              }
            }
          }
        }
      }
    };
    const registrationTypes = getRegistrationTypeForGroupMembers(state);
    expect(registrationTypes).toEqual([
      { id: 'rt1', text: 'regType1', attendingFormat: AttendingFormat.INPERSON },
      { id: 'rt2', text: 'regType2', attendingFormat: AttendingFormat.INPERSON }
    ]);
  });
  test('should return reg types on leaders reg path', () => {
    const state = {
      registrationForm: {
        currentEventRegistrationId: 'member',
        regCart: {
          groupRegistration: true,
          eventRegistrations: {
            leader: {
              attendeeType: 'GROUP_LEADER',
              registrationPathId: 'leaderRegPathId'
            },
            member: {
              attendeeType: 'ATTENDEE',
              registrationPathId: 'memberRegPathId',
              primaryRegistrationId: 'leader'
            }
          }
        }
      },
      event: {
        registrationTypes: {
          rt1: {
            id: 'rt1',
            name: 'regType1',
            isOpenForRegistration: true
          },
          rt2: {
            id: 'rt2',
            name: 'regType2',
            isOpenForRegistration: true
          },
          '00000000-0000-0000-0000-000000000000': {
            id: '00000000-0000-0000-0000-000000000000',
            name: '',
            isOpenForRegistration: true
          }
        }
      },
      website: createDefaultWebsite(),
      appData: {
        registrationSettings: {
          registrationPaths: {
            leaderRegPathId: {
              id: 'leaderRegPathId',
              allowGroupRegistration: true,
              groupRegistrationSettings: {
                registrationTypeSettings: {
                  limitVisibility: true,
                  categorizedRegistrationTypes: ['rt1']
                }
              }
            },
            memberRegPathId: {
              id: 'memberRegPathId',
              allowGroupRegistration: true,
              groupRegistrationSettings: {
                registrationTypeSettings: {
                  limitVisibility: true,
                  categorizedRegistrationTypes: ['rt2']
                }
              }
            }
          }
        }
      }
    };
    const registrationTypes = getRegistrationTypeForGroupMembers(state);
    expect(registrationTypes).toEqual([{ id: 'rt1', text: 'regType1', attendingFormat: AttendingFormat.INPERSON }]);
  });
});

function createDefaultState() {
  return {
    registrationForm: {
      regCart: {
        eventRegistrations: {
          eventRegId: {
            registrationPathId: 'regPathId'
          }
        }
      }
    },
    website: createDefaultWebsite(),
    appData: {
      registrationPathSettings: {
        regPathId: {
          applyPaymentCredits: false
        }
      },
      registrationSettings: {
        registrationPaths: {
          regPathId: {
            id: 'regPathId'
          }
        }
      }
    }
  };
}

function createDefaultWebsite() {
  return {
    siteInfo: {
      sharedConfigs: {
        Payment: {},
        RegistrationType: {}
      }
    },
    pluginData: {
      registrationProcessNavigation: {
        registrationPaths: {
          regPathId: {
            pageIds: ['regProcessStep1', 'regProcessStep2', 'regProcessStep3'],
            id: 'regPathId',
            confirmationPageId: 'confirmation',
            postRegPageIds: ['confirmation'],
            registrationDeclinePageIds: ['bogusDeclinePageId'],
            registrationCancellationPageIds: ['bogusCancelPageId'],
            eventWaitlistPageIds: ['bogusWaitlistPageId'],
            guestRegistrationPageIds: ['guestRegistrationPageId']
          }
        }
      },
      eventVersion: 1,
      templateNavigation: {
        defaultTemplateId: 'template:a61a64b8-ecd4-464b-848e-c0ebe08026e4',
        templateIds: ['template:a61a64b8-ecd4-464b-848e-c0ebe08026e4']
      }
    },
    pages: {
      regProcessStep1: {
        id: 'regProcessStep1',
        name: '_defaultPageTitle_regProcessStep1__resx',
        title: '_defaultPageTitle_regProcessStep1__resx',
        version: 1,
        rootLayoutItemIds: ['regPage1RootLayoutItemId'],
        type: 'PAGE',
        templateId: 'template:a61a64b8-ecd4-464b-848e-c0ebe08026e4'
      },
      regProcessStep2: {
        id: 'regProcessStep2',
        name: '_defaultPageTitle_regProcessStep1__resx',
        title: '_defaultPageTitle_regProcessStep1__resx',
        version: 1,
        rootLayoutItemIds: ['regPage2RootLayoutItemId'],
        type: 'PAGE',
        templateId: 'template:a61a64b8-ecd4-464b-848e-c0ebe08026e4'
      },
      regProcessStep3: {
        id: 'regProcessStep3',
        name: '_defaultPageTitle_regProcessStep2__resx',
        title: '_defaultPageTitle_regProcessStep2__resx',
        version: 1,
        rootLayoutItemIds: ['regPage3RootLayoutItemId'],
        type: 'PAGE',
        templateId: 'template:a61a64b8-ecd4-464b-848e-c0ebe08026e4'
      },
      guestRegistrationPageId: {
        id: 'guestRegistrationPageId',
        name: 'guest page',
        title: 'guest!',
        version: 1,
        rootLayoutItemIds: ['guestRegistrationRootLayoutItemId'],
        type: 'PAGE',
        templateId: 'template:a61a64b8-ecd4-464b-848e-c0ebe08026e4'
      },
      confirmation: {
        id: 'confirmation',
        name: '_defaultPageTitle_confirmation__resx',
        title: '_defaultPageTitle_confirmation__resx',
        version: 1,
        rootLayoutItemIds: ['temp-1469646842471'],
        type: 'PAGE',
        templateId: 'template:a61a64b8-ecd4-464b-848e-c0ebe08026e4'
      }
    },
    layoutItems: {
      regPage1RootLayoutItemId: {
        id: 'regPage1RootLayoutItemId',
        layout: {
          type: 'container',
          cellSize: 4,
          colspan: 12,
          parentId: null,
          childIds: ['admissionItemWidgetLayoutItemId']
        },
        config: {
          style: {}
        }
      },
      regPage2RootLayoutItemId: {
        id: 'regPage2RootLayoutItemId',
        layout: {
          type: 'container',
          cellSize: 4,
          colspan: 12,
          parentId: null,
          childIds: ['sessionWidgetLayoutItemId']
        },
        config: {
          style: {}
        }
      },
      regPage3RootLayoutItemId: {
        id: 'regPage3RootLayoutItemId',
        layout: {
          type: 'container',
          cellSize: 4,
          colspan: 12,
          parentId: null,
          childIds: ['registrationSummaryWidgetLayoutItemId']
        },
        config: {
          style: {}
        }
      },
      guestRegistrationRootLayoutItemId: {
        id: 'guestRegistrationRootLayoutItemId',
        layout: {
          type: 'container',
          cellSize: 4,
          colspan: 12,
          parentId: null,
          childIds: []
        },
        config: {
          style: {}
        }
      },
      admissionItemWidgetLayoutItemId: {
        id: 'admissionItemWidgetLayoutItemId',
        widgetType: 'AdmissionItems',
        config: {},
        layout: {
          colspan: 12,
          type: 'widget',
          cellSize: 4,
          parentId: 'regPage1RootLayoutItemId',
          childIds: []
        }
      },
      sessionWidgetLayoutItemId: {
        id: 'sessionWidgetLayoutItemId',
        widgetType: 'Sessions',
        config: {},
        layout: {
          colspan: 12,
          type: 'widget',
          cellSize: 4,
          parentId: 'regPage2RootLayoutItemId',
          childIds: []
        }
      },
      registrationSummaryWidgetLayoutItemId: {
        id: 'registrationSummaryWidgetLayoutItemId',
        widgetType: 'RegistrationSummary',
        config: {},
        layout: {
          colspan: 12,
          type: 'widget',
          cellSize: 4,
          parentId: 'regPage3RootLayoutItemId',
          childIds: []
        }
      }
    }
  };
}
