/* eslint-env jest */
import CancelRegistrationWidget from '../CancelRegistrationWidget';

import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow } from 'enzyme';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import pageContainerWidgetFixture from '../../testUtils/pageContainingWidgetFixture';

const middlewares = [thunk];
const mockStore = (cancellationPageId?) => ({
  event: {
    status: eventStatus.CLOSED // can cancel after registration has closed but before event is complete
  },
  website: {
    pluginData: {
      registrationProcessNavigation: {
        registrationPaths: {
          dummyRegPath: {
            id: 'dummyRegPath',
            cancellation: new Date().valueOf() + 100000000000,
            postRegPageIds: ['confirmation'],
            registrationCancellationPageIds: cancellationPageId && [cancellationPageId]
          }
        }
      }
    },
    ...pageContainerWidgetFixture('confirmation', 'cancellationWidget')
  },
  appData: {
    registrationSettings: {
      registrationPaths: {
        dummyRegPath: {
          cancellation: 1505336943175
        }
      }
    }
  },
  registrationForm: { regCart: {} }
});

describe('CancelRegistraionWidget', () => {
  it('exists', () => {
    expect(CancelRegistrationWidget).toBeDefined();
  });
  describe('on events with cancellation page', () => {
    it('renders with right props', () => {
      const mockPageID = 'mock-page-ID';
      const widget = shallow(
        <CancelRegistrationWidget
          store={configureMockStore(middlewares)(mockStore(mockPageID))}
          id="cancellationWidget"
        />
      );
      expect(widget.getElements()).toMatchSnapshot();
    });
  });
  describe('on events with NO cancellation page', () => {
    it('renders with right props', () => {
      const widget = shallow(
        <CancelRegistrationWidget store={configureMockStore(middlewares)(mockStore())} id="cancellationWidget" />
      );
      expect(widget.getElements()).toMatchSnapshot();
      expect(widget.getElement().props.registrationCancellationPageId).toBeUndefined();
    });
  });
});
