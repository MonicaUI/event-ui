import React from 'react';
import { shallow } from 'enzyme';
import GoToEventButtonWidget from '../GoToEventButtonWidget';

const waxLink = 'http://wax/';
const eventId = 'a-fancy-event-id';
const attendeeId = 'cool-attendee';

const subscribe = jest.fn();

const getStateFunc = (withAttendee?, isVerified?) => {
  return () => {
    return {
      event: { id: eventId },
      attendeeExperience: { url: waxLink },
      registrationForm: withAttendee ? { regCart: { eventRegistrations: { id1: { attendee: { attendeeId } } } } } : {},
      userSession: { verifiedAttendee: isVerified }
    };
  };
};

const dispatch = async action => {
  if (typeof action === 'function') {
    await action(dispatch, getStateFunc());
  }
};

const getDefaultProps = (withAttendee, isVerified) => {
  const getState = getStateFunc(withAttendee, isVerified);
  return {
    store: { dispatch, getState, subscribe },
    style: {},
    config: {},
    translate: jest.fn()
  };
};

describe('GoToEventButtonWidget', () => {
  test('produces the right hyperlink with attendee id (not logged into attendee login)', async () => {
    const widget = shallow(<GoToEventButtonWidget {...getDefaultProps(true, false)} />).dive();
    expect(widget.props().attendeeHubLink).toEqual(`${waxLink}events/${eventId}?inviteeId=${attendeeId}`);
  });

  test('produces the right hyperlink without attendee id if not logged into flex (no attendee id)', async () => {
    const widget = shallow(<GoToEventButtonWidget {...getDefaultProps(false, true)} />).dive();
    expect(widget.props().attendeeHubLink).toEqual(`${waxLink}events/${eventId}`);
  });

  test('produces the right hyperlink without attendee id if isVerified is true (logged in to attendee login)', async () => {
    const widget = shallow(<GoToEventButtonWidget {...getDefaultProps(true, true)} />).dive();
    expect(widget.props().attendeeHubLink).toEqual(`${waxLink}events/${eventId}`);
  });
});
