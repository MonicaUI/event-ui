import { getEventRegistrationId, isGroupMember } from '../../redux/selectors/currentRegistrant';
import * as eventRegistrationData from '../../utils/eventRegistrationData';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import { defaultMemoize } from 'reselect';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';

export const eventRegistrationStatePath = ['registrationTypeId'];

const getWidgetConfig = defaultMemoize(config => {
  return {
    ...config,
    registrationFieldPageType: config.registrationFieldPageType || registrationFieldPageType.Registration
  };
});

export const getAnswer = (state: $TSFixMe, props: $TSFixMe): $TSFixMe =>
  eventRegistrationData.createAnswer()({
    state,
    widgetConfig: getWidgetConfig(props.config),
    eventRegistrationPath: eventRegistrationStatePath,
    getAnswerFormatter: regTypeId => (regTypeId === defaultRegistrationTypeId ? null : regTypeId)
  });

export function getAttendeeType(state: $TSFixMe, props: $TSFixMe): $TSFixMe {
  const regCartId = getEventRegistrationId(state);
  const groupMember = isGroupMember(state, regCartId);
  const answer = getAnswer(state, props);
  return (answer.isWidgetPlacedOnGuestModal && 'GUEST') || (groupMember && 'GROUP') || null;
}
