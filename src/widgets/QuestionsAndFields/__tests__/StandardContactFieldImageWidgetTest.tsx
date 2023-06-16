import React from 'react';
import StandardContactFieldImageWidget from '../StandardContactFieldImageWidget';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from '../../../redux/configureStore';
import WidgetFactory from '../../../widgetFactory';
import Grid from 'nucleus-core/layout/flexbox/Grid';
import { REQUIRED } from 'cvent-question-widgets/lib/DisplayType';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import pageContainingWidgetFixture from '../../../testUtils/pageContainingWidgetFixture';

const deleteFileMock = jest.fn();
deleteFileMock.mockReturnValue(Promise.resolve());
const getFileUploadUrlMock = jest.fn();
getFileUploadUrlMock.mockReturnValue('uploadurl');

const initialState = {
  website: {
    ...pageContainingWidgetFixture('pageId', 'widgetId'),
    pluginData: {
      registrationProcessNavigation: {
        registrationPaths: {
          regPathId: {
            id: 'regPathId',
            pageIds: ['pageId']
          }
        }
      }
    },
    siteInfo: {
      sharedConfigs: {}
    }
  },
  widgetFactory: new WidgetFactory(),
  appData: {
    registrationSettings: {
      registrationPaths: {
        regPathId: {
          registrationPageFields: {
            [registrationFieldPageType.Registration]: {
              registrationFieldPageType: registrationFieldPageType.Registration,
              registrationFields: {
                '52844a85-1896-42b6-9cef-78c0629ed1d7': {
                  fieldName: 'Profile Image',
                  fieldId: '52844a85-1896-42b6-9cef-78c0629ed1d7',
                  displayName: 'Profile Image',
                  display: REQUIRED,
                  isCustomField: false
                }
              }
            }
          }
        }
      }
    }
  },
  registrationForm: {
    currentEventRegistrationId: 'eventRegistration1',
    regCart: {
      eventRegistrations: {
        eventRegistration1: {
          registrationPathId: 'regPathId'
        }
      }
    }
  },
  clients: {
    flexFileClient: {
      deleteFile: deleteFileMock,
      getFileUploadUrl: getFileUploadUrlMock
    }
  }
};

const defaultProps = {
  translate: (resx, opts) => (opts ? `${resx}:${JSON.stringify(opts)}` : resx),
  style: {},
  classes: {},
  id: 'widgetId'
};

test('StandardContactFieldImage renders', async () => {
  const store = configureStore(initialState);
  const component = mount(
    <Provider store={store}>
      <Grid>
        <StandardContactFieldImageWidget
          {...defaultProps}
          config={{
            fieldId: '52844a85-1896-42b6-9cef-78c0629ed1d7',
            registrationFieldPageType: registrationFieldPageType.Registration
          }}
          type="EventStandardContactFieldImage"
        />
      </Grid>
    </Provider>
  );
  expect(component).toMatchSnapshot();
});
