import { ServiceError } from '@cvent/event-ui-networking';

export class RegCartClient {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRequestForRegCartPricing(_authToken: $TSFixMe, _regCartId: $TSFixMe, _pricingInfo: $TSFixMe): $TSFixMe {
    return {};
  }
  updateRegCart(): $TSFixMe {
    return Promise.resolve({});
  }
  calculateRegCartPricing(): $TSFixMe {
    return Promise.resolve({});
  }
}

export class RegCartClientWithServiceError {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRequestForRegCartPricing(_authToken: $TSFixMe, _regCartId: $TSFixMe, _pricingInfo: $TSFixMe): $TSFixMe {
    return {};
  }
  updateRegCart(): $TSFixMe {
    throw new ServiceError(
      'reg cart error',
      { status: 422 },
      { headers: { get() {} } },
      {
        validationMessages: [
          {
            severity: 'Error',
            localizationKey: 'REGAPI.INVALID_EXISTING_INVITEES_STATUS_REGISTRATION',
            parametersMap: {
              inviteeStatus: 'Accepted'
            }
          }
        ]
      }
    );
  }
  calculateRegCartPricing(): $TSFixMe {
    return Promise.resolve({});
  }
}
