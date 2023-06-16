import React from 'react';
import MultiLanguageWidget from '../MultiLanguageWidget';
import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

function getState() {
  return {
    locales: [],
    currentLocale: 'en-US',
    event: {
      eventLocalesSetup: {
        eventLocales: [
          {
            localeId: 1033,
            languageName: 'English',
            cultureCode: 'en-US'
          }
        ]
      }
    }
  };
}

const middlewares = [thunk];

const defaultProps = {
  translate: c => c,
  style: {},
  classes: {},
  multiLanguageLocale: '',
  loadLanguage: c => c,
  metaData: {}
};

describe('MultiLanguageWidget', () => {
  test('should match snapshot', () => {
    const widget = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ store: any; translate: (c: any) => any; st... Remove this comment to see the full error message
      <MultiLanguageWidget {...defaultProps} store={configureMockStore(middlewares)(getState())} />
    );
    expect(widget.props()).toMatchSnapshot();
  });
});
