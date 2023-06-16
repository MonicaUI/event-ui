// TestMode Params allow the app to act as if user logged in.
const getTestModeLoginParams = queryParams =>
  queryParams.cn && queryParams.em && queryParams.i
    ? {
        confirmationNumber: queryParams.cn,
        emailAddress: queryParams.em,
        inviteeId: queryParams.i
      }
    : undefined;

const getEventContextLoginInfo = eventContext => {
  return eventContext &&
    !eventContext.regCartId &&
    eventContext.emailAddress &&
    eventContext.confirmationNumber &&
    eventContext.inviteeId
    ? {
        confirmationNumber: eventContext.confirmationNumber,
        emailAddress: eventContext.emailAddress,
        inviteeId: eventContext.inviteeId
      }
    : undefined;
};

export default function (queryParams: $TSFixMe, eventContext: $TSFixMe): $TSFixMe {
  return getTestModeLoginParams(queryParams) || getEventContextLoginInfo(eventContext);
}
