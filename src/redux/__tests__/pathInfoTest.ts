import { redirectToExternalAuth, redirectToOAuth, redirectToPage, retryLoadPage } from '../pathInfo';

const event = {
  id: 'eventId',
  eventSecuritySetupSnapshot: {
    authenticationUrl: 'www.cvent.com'
  }
};

const account = {
  settings: {
    accountSecuritySettings: {}
  }
};

Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    replace: jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => {
          return {};
        }
      })
    )
  }
});

global.window = Object.create(window);
const url = 'http://dummy.com';
Object.defineProperty(window, 'location', {
  value: {
    href: url,
    replace: jest.fn()
  }
});

describe('Test Redirect To ExternalAuth', () => {
  it('redirect to an external Auth when HTTP Post is on', async () => {
    redirectToExternalAuth(event, account);
    expect(global.location.replace).toHaveBeenCalledWith('www.cvent.com?e=eventId&TARGET=http%3A%2F%2Fdummy.com');
  });

  it('redirect to an external Auth when SSO is on', async () => {
    const newAccount = {
      settings: {
        accountSecuritySettings: {
          allowSSOLogin: true,
          allowSecureHTTPPost: true
        },
        customTargetParam: 'RelayState'
      }
    };
    redirectToExternalAuth(event, newAccount);
    expect(global.location.replace).toHaveBeenCalledWith('www.cvent.com?e=eventId&RelayState=http%3A%2F%2Fdummy.com');
  });

  it('redirect to an external Auth when SSO is on and url have mutliple query param', async () => {
    const newEvent = {
      id: 'eventId',
      eventSecuritySetupSnapshot: {
        authenticationUrl: 'www.cvent.com?queryParam=ddfsfg'
      }
    };

    const newAccount = {
      settings: {
        accountSecuritySettings: {
          allowSSOLogin: true,
          allowSecureHTTPPost: true
        },
        customTargetParam: 'RelayState'
      }
    };
    redirectToExternalAuth(newEvent, newAccount);
    expect(global.location.replace).toHaveBeenCalledWith(
      'www.cvent.com?queryParam=ddfsfg&e=eventId&RelayState=http%3A%2F%2Fdummy.com'
    );
  });
});

describe('Test Redirect and retry load page', () => {
  it('redirect to summary page', async () => {
    redirectToPage('summary');
    expect(global.location.replace).toHaveBeenCalled();
  });
  it('replaceurl with passed param', async () => {
    retryLoadPage();
    expect(global.location.replace).toHaveBeenCalled();
  });
});

describe('Test Redirect To OAuth', () => {
  it('redirect to oauth URL when OAuth is on', async () => {
    window.location.search = '';
    const newAccount = {
      settings: {
        accountSecuritySettings: {
          allowSSOLogin: false,
          allowSecureHTTPPost: false,
          allowOAuth: true
        }
      }
    };
    const newEvent = {
      id: 'eventId',
      eventSecuritySetupSnapshot: {
        authenticationType: 3,
        oAuthUrl:
          'https://sso-staging.cvent.com/oauth2/v1/authorize?response_type=id_token&scope=openid+profile+email+address+phone&response_mode=form_post&client_id=0oar223rarjSmrRjX0h7&redirect_uri=https%3A%2F%2Fevent-external-authentication-service-dev.us-east-1.lb.cvent.com%2FS437%2Fevent-external-authentication%2Fv1%2Foauth-redirect%3Fenvironment%3DS437&nonce=1275ed85-0db6-4f65-a77c-45ac8dbede23&state=%7B%22accountId%22%3A801483244%2C%22eventStub%22%3A%22290bc66c-2de7-4fbb-9461-d598ce783916%22%7D&idp=0oar23s4fmIutvOHy0h7'
      }
    };
    redirectToOAuth(newEvent, newAccount);
    expect(global.location.replace).toHaveBeenCalledWith(
      'https://sso-staging.cvent.com/oauth2/v1/authorize?response_type=id_token&scope=openid%20profile%20email%20address%20phone&response_mode=form_post&client_id=0oar223rarjSmrRjX0h7&redirect_uri=https%3A%2F%2Fevent-external-authentication-service-dev.us-east-1.lb.cvent.com%2FS437%2Fevent-external-authentication%2Fv1%2Foauth-redirect%3Fenvironment%3DS437&nonce=1275ed85-0db6-4f65-a77c-45ac8dbede23&state=%7B%22accountId%22%3A801483244%2C%22eventStub%22%3A%22290bc66c-2de7-4fbb-9461-d598ce783916%22%7D&idp=0oar23s4fmIutvOHy0h7'
    );
  });

  it('redirect to oauth URL with no query param', async () => {
    window.location.search = '';
    const newAccount = {
      settings: {
        accountSecuritySettings: {
          allowSSOLogin: false,
          allowSecureHTTPPost: false,
          allowOAuth: true
        }
      }
    };
    const newEvent = {
      id: 'eventId',
      eventSecuritySetupSnapshot: {
        authenticationType: 3,
        oAuthUrl:
          'https://sso-staging.cvent.com/oauth2/v1/authorize?response_type=id_token&scope=openid+profile+email+address+phone&response_mode=form_post&client_id=0oar223rarjSmrRjX0h7&redirect_uri=https%3A%2F%2Fevent-external-authentication-service-dev.us-east-1.lb.cvent.com%2FS437%2Fevent-external-authentication%2Fv1%2Foauth-redirect%3Fenvironment%3DS437&nonce=1275ed85-0db6-4f65-a77c-45ac8dbede23&state=%7B%22accountId%22%3A801483244%2C%22eventStub%22%3A%22290bc66c-2de7-4fbb-9461-d598ce783916%22%2C%22regType%22%3A%2200000000-0000-0000-0000-000000000000%22%7D&idp=0oar23s4fmIutvOHy0h7'
      }
    };
    redirectToOAuth(newEvent, newAccount, 'dummyRegType', 'dummyRegPath');
    expect(global.location.replace).toHaveBeenCalledWith(
      'https://sso-staging.cvent.com/oauth2/v1/authorize?response_type=id_token&scope=openid%20profile%20email%20address%20phone&response_mode=form_post&client_id=0oar223rarjSmrRjX0h7&redirect_uri=https%3A%2F%2Fevent-external-authentication-service-dev.us-east-1.lb.cvent.com%2FS437%2Fevent-external-authentication%2Fv1%2Foauth-redirect%3Fenvironment%3DS437&nonce=1275ed85-0db6-4f65-a77c-45ac8dbede23&state=%7B%22accountId%22%3A801483244%2C%22eventStub%22%3A%22290bc66c-2de7-4fbb-9461-d598ce783916%22%2C%22regType%22%3A%22dummyRegType%22%7D&idp=0oar23s4fmIutvOHy0h7'
    );
  });

  it('redirect to oauth URL with referenceId present in query params', async () => {
    window.location.search = '?refId=Oauth123';
    const newAccount = {
      settings: {
        accountSecuritySettings: {
          allowSSOLogin: false,
          allowSecureHTTPPost: false,
          allowOAuth: true
        }
      }
    };
    const newEvent = {
      id: 'eventId',
      eventSecuritySetupSnapshot: {
        authenticationType: 3,
        oAuthUrl:
          'https://sso-staging.cvent.com/oauth2/v1/authorize?response_type=id_token&scope=openid+profile+email+address+phone&response_mode=form_post&client_id=0oar223rarjSmrRjX0h7&redirect_uri=https%3A%2F%2Fevent-external-authentication-service-dev.us-east-1.lb.cvent.com%2FS437%2Fevent-external-authentication%2Fv1%2Foauth-redirect%3Fenvironment%3DS437&nonce=1275ed85-0db6-4f65-a77c-45ac8dbede23&state=%7B%22accountId%22%3A801483244%2C%22eventStub%22%3A%22290bc66c-2de7-4fbb-9461-d598ce783916%22%2C%22regType%22%3A%2200000000-0000-0000-0000-000000000000%22%7D&idp=0oar23s4fmIutvOHy0h7'
      }
    };
    redirectToOAuth(newEvent, newAccount, '00000000-0000-0000-0000-000000000000');
    expect(global.location.replace).toHaveBeenCalledWith(
      'https://sso-staging.cvent.com/oauth2/v1/authorize?response_type=id_token&scope=openid%20profile%20email%20address%20phone&response_mode=form_post&client_id=0oar223rarjSmrRjX0h7&redirect_uri=https%3A%2F%2Fevent-external-authentication-service-dev.us-east-1.lb.cvent.com%2FS437%2Fevent-external-authentication%2Fv1%2Foauth-redirect%3Fenvironment%3DS437&nonce=1275ed85-0db6-4f65-a77c-45ac8dbede23&state=%7B%22accountId%22%3A801483244%2C%22eventStub%22%3A%22290bc66c-2de7-4fbb-9461-d598ce783916%22%2C%22regType%22%3A%2200000000-0000-0000-0000-000000000000%22%2C%22guestsideQueryParams%22%3A%22refId%3DOauth123%22%7D&idp=0oar23s4fmIutvOHy0h7'
    );
  });

  it('redirect to oauth URL with reg type, reg path present in query param only', async () => {
    window.location.search = '?rt=9PU8dB5RHUaMvFTIlL9Xjg&rp=fa7524b2-b866-11e8-96f8-529269fb1459';
    const newAccount = {
      settings: {
        accountSecuritySettings: {
          allowSSOLogin: false,
          allowSecureHTTPPost: false,
          allowOAuth: true
        }
      }
    };
    const newEvent = {
      id: 'eventId',
      eventSecuritySetupSnapshot: {
        authenticationType: 3,
        oAuthUrl:
          'https://sso-staging.cvent.com/oauth2/v1/authorize?response_type=id_token&scope=openid+profile+email+address+phone&response_mode=form_post&client_id=0oar223rarjSmrRjX0h7&redirect_uri=https%3A%2F%2Fevent-external-authentication-service-dev.us-east-1.lb.cvent.com%2FS437%2Fevent-external-authentication%2Fv1%2Foauth-redirect%3Fenvironment%3DS437&nonce=1275ed85-0db6-4f65-a77c-45ac8dbede23&state=%7B%22accountId%22%3A801483244%2C%22eventStub%22%3A%22290bc66c-2de7-4fbb-9461-d598ce783916%22%2C%22regType%22%3A%2200000000-0000-0000-0000-000000000000%22%7D&idp=0oar23s4fmIutvOHy0h7'
      }
    };
    redirectToOAuth(newEvent, newAccount, '00000000-0000-0000-0000-000000000000');
    expect(global.location.replace).toHaveBeenCalledWith(
      'https://sso-staging.cvent.com/oauth2/v1/authorize?response_type=id_token&scope=openid%20profile%20email%20address%20phone&response_mode=form_post&client_id=0oar223rarjSmrRjX0h7&redirect_uri=https%3A%2F%2Fevent-external-authentication-service-dev.us-east-1.lb.cvent.com%2FS437%2Fevent-external-authentication%2Fv1%2Foauth-redirect%3Fenvironment%3DS437&nonce=1275ed85-0db6-4f65-a77c-45ac8dbede23&state=%7B%22accountId%22%3A801483244%2C%22eventStub%22%3A%22290bc66c-2de7-4fbb-9461-d598ce783916%22%2C%22regType%22%3A%2200000000-0000-0000-0000-000000000000%22%2C%22guestsideQueryParams%22%3A%22rt%3D9PU8dB5RHUaMvFTIlL9Xjg%26rp%3Dfa7524b2-b866-11e8-96f8-529269fb1459%22%7D&idp=0oar23s4fmIutvOHy0h7'
    );
  });

  it('redirect to oauth URL with empty reg type but valid reg path', async () => {
    window.location.search = '?rt=9PU8dB5RHUaMvFTIlL9Xjg&rp=fa7524b2-b866-11e8-96f8-529269fb1459';
    const newAccount = {
      settings: {
        accountSecuritySettings: {
          allowSSOLogin: false,
          allowSecureHTTPPost: false,
          allowOAuth: true
        }
      }
    };
    const newEvent = {
      id: 'eventId',
      eventSecuritySetupSnapshot: {
        authenticationType: 3,
        oAuthUrl:
          'https://sso-staging.cvent.com/oauth2/v1/authorize?response_type=id_token&scope=openid+profile+email+address+phone&response_mode=form_post&client_id=0oar223rarjSmrRjX0h7&redirect_uri=https%3A%2F%2Fevent-external-authentication-service-dev.us-east-1.lb.cvent.com%2FS437%2Fevent-external-authentication%2Fv1%2Foauth-redirect%3Fenvironment%3DS437&nonce=1275ed85-0db6-4f65-a77c-45ac8dbede23&state=%7B%22accountId%22%3A801483244%2C%22eventStub%22%3A%22290bc66c-2de7-4fbb-9461-d598ce783916%22%2C%22regType%22%3A%2200000000-0000-0000-0000-000000000000%22%7D&idp=0oar23s4fmIutvOHy0h7'
      }
    };
    redirectToOAuth(newEvent, newAccount, '00000000-0000-0000-0000-000000000000', 'dummyRegPath');
    expect(global.location.replace).toHaveBeenCalledWith(
      'https://sso-staging.cvent.com/oauth2/v1/authorize?response_type=id_token&scope=openid%20profile%20email%20address%20phone&response_mode=form_post&client_id=0oar223rarjSmrRjX0h7&redirect_uri=https%3A%2F%2Fevent-external-authentication-service-dev.us-east-1.lb.cvent.com%2FS437%2Fevent-external-authentication%2Fv1%2Foauth-redirect%3Fenvironment%3DS437&nonce=1275ed85-0db6-4f65-a77c-45ac8dbede23&state=%7B%22accountId%22%3A801483244%2C%22eventStub%22%3A%22290bc66c-2de7-4fbb-9461-d598ce783916%22%2C%22regType%22%3A%2200000000-0000-0000-0000-000000000000%22%2C%22regPath%22%3A%22dummyRegPath%22%2C%22guestsideQueryParams%22%3A%22rt%3D9PU8dB5RHUaMvFTIlL9Xjg%26rp%3Dfa7524b2-b866-11e8-96f8-529269fb1459%22%7D&idp=0oar23s4fmIutvOHy0h7'
    );
  });

  it('redirect to oauth URL with reg type, reg path present in query param and passed to redirectToOAuth as well', async () => {
    window.location.search = '?rt=9PU8dB5RHUaMvFTIlL9Xjg&rp=fa7524b2-b866-11e8-96f8-529269fb1459';
    const newAccount = {
      settings: {
        accountSecuritySettings: {
          allowSSOLogin: false,
          allowSecureHTTPPost: false,
          allowOAuth: true
        }
      }
    };
    const newEvent = {
      id: 'eventId',
      eventSecuritySetupSnapshot: {
        authenticationType: 3,
        oAuthUrl:
          'https://sso-staging.cvent.com/oauth2/v1/authorize?response_type=id_token&scope=openid+profile+email+address+phone&response_mode=form_post&client_id=0oar223rarjSmrRjX0h7&redirect_uri=https%3A%2F%2Fevent-external-authentication-service-dev.us-east-1.lb.cvent.com%2FS437%2Fevent-external-authentication%2Fv1%2Foauth-redirect%3Fenvironment%3DS437&nonce=1275ed85-0db6-4f65-a77c-45ac8dbede23&state=%7B%22accountId%22%3A801483244%2C%22eventStub%22%3A%22290bc66c-2de7-4fbb-9461-d598ce783916%22%2C%22regType%22%3A%2200000000-0000-0000-0000-000000000000%22%7D&idp=0oar23s4fmIutvOHy0h7'
      }
    };
    redirectToOAuth(newEvent, newAccount, 'dummyRegType', 'dummyRegPath');
    expect(global.location.replace).toHaveBeenCalledWith(
      'https://sso-staging.cvent.com/oauth2/v1/authorize?response_type=id_token&scope=openid%20profile%20email%20address%20phone&response_mode=form_post&client_id=0oar223rarjSmrRjX0h7&redirect_uri=https%3A%2F%2Fevent-external-authentication-service-dev.us-east-1.lb.cvent.com%2FS437%2Fevent-external-authentication%2Fv1%2Foauth-redirect%3Fenvironment%3DS437&nonce=1275ed85-0db6-4f65-a77c-45ac8dbede23&state=%7B%22accountId%22%3A801483244%2C%22eventStub%22%3A%22290bc66c-2de7-4fbb-9461-d598ce783916%22%2C%22regType%22%3A%22dummyRegType%22%2C%22guestsideQueryParams%22%3A%22rt%3D9PU8dB5RHUaMvFTIlL9Xjg%26rp%3Dfa7524b2-b866-11e8-96f8-529269fb1459%22%7D&idp=0oar23s4fmIutvOHy0h7'
    );
  });
});
