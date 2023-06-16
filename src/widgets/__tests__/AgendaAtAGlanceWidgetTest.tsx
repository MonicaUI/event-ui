import React from 'react';
import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import AgendaAtAGlanceWidget from '../AgendaAtAGlanceWidget';

function getState() {
  return {
    experiments: {
      isFlexAgendaAtAGlanceWidgetEnabled: true
    }
  };
}

const defaultProps = {
  translate: c => c,
  style: {},
  classes: {},
  config: {}
};

describe('AgendaAtAGlanceWidget', () => {
  test('produces props from state', () => {
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ store: any; translate: (c: any) => any; st... Remove this comment to see the full error message
    const widget = shallow(<AgendaAtAGlanceWidget {...defaultProps} store={configureMockStore()(getState())} />);
    expect(widget.props().children.props.isFlexAgendaAtAGlanceWidgetEnabled).toBeTruthy();
  });
});
