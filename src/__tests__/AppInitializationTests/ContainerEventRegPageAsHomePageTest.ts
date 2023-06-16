import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import { isWebsiteVarietyPage } from '../../redux/website';
import { getStartPageForCurrentRegPath } from '../../redux/actions';
import { setCurrentPage } from '../../redux/pathInfo';

const mockEventId = '11111111-2222-3333-4444-555555555555';
const eventId = mockEventId;
const fakePath = `/${eventId}/`;

jest.mock('../../redux/pathInfo', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/pathInfo'),
    __esModule: true,
    setCurrentPage: jest.fn()
  };
});
(setCurrentPage as $TSFixMe).mockImplementation(() => {
  return dispatch => {
    dispatch({
      type: '[MOCK]/routeToPage',
      payload: {}
    });
  };
});

const mockedVarietyPageValue = true;
jest.mock('../../redux/website', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/website'),
    __esModule: true,
    isWebsiteVarietyPage: jest.fn()
  };
});
(isWebsiteVarietyPage as $TSFixMe).mockImplementation(() => mockedVarietyPageValue);

const regPageId = 'regProcessStep1';
jest.mock('../../redux/actions', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/actions'),
    getStartPageForCurrentRegPath: jest.fn()
  };
});
(getStartPageForCurrentRegPath as $TSFixMe).mockImplementation(() => () => regPageId);

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('redirects to first reg page when going to a website page', async () => {
  await renderMainApp(
    {
      eventContext: {
        eventId
      },
      eventLaunchWizardSettings: '{}'
    },
    fakePath + 'page1',
    event => ({
      ...event,
      isContainerEvent: true,
      containerFeatures: { isWebsiteEnabled: true, websiteStatus: 'WEBSITE_NOT_LIVE' },
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  const pageIdArgument = (isWebsiteVarietyPage as $TSFixMe).mock.calls[0][1];
  expect(pageIdArgument).toBe('page1');
  expect(setCurrentPage).toHaveBeenCalledWith(regPageId);
});
