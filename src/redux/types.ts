export type RegCart = Record<string, unknown>;
export type SessionRegistration = {
  productId: string;
  requestedAction: string;
  registrationSourceType: string;
};
export type SessionRegistrations = Record<string, SessionRegistration>;
export type ValidationMessage = {
  localizationKey: string;
  parametersMap: {
    [parameter: string]: string;
  };
};
export type Error = {
  responseBody: {
    validationMessages: ValidationMessage[];
  };
};
export type EventContext = {
  isPlanner?: boolean;
  regCartId?: string;
  emailAddress?: string;
  confirmationNumber?: string;
  inviteeId?: string;
};
