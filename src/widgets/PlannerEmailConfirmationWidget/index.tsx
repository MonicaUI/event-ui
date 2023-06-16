import React from 'react';

export function withPlannerEmailConfirmation(navigatorWidget: $TSFixMe, WrapperWidget: $TSFixMe) {
  return (props: $TSFixMe): $TSFixMe => <WrapperWidget {...props} NavigatorWidget={navigatorWidget} />;
}
