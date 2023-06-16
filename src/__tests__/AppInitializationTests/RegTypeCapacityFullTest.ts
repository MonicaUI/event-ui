import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../../dialogs/__mocks__/documentElementMock';
getMockedMessageContainer();

let mockAvailableCapacity = 0;
jest.mock('../../clients/RegCartClient', () => {
  function MockRegCartClient() {}
  MockRegCartClient.prototype.createRegCart = jest.fn((authToken, regCart) => {
    return Promise.resolve({
      regCart: { ...regCart, regCartId: 'regCartId' },
      validationMessages:
        mockAvailableCapacity === 0
          ? [
              {
                severity: 'Warning',
                unLocalizedInternalMessage:
                  'Failed to acquire capacity for {{entityType}} {{entityId}}. Capacity is full.',
                localizationKey: 'REGAPI.CAPACITY_UNAVAILABLE',
                parametersMap: {
                  entityType: 'ContactType',
                  entityId: '00000000-0000-0000-0000-000000000001'
                },
                subValidationMessageList: []
              }
            ]
          : []
    });
  });
  MockRegCartClient.prototype.updateRegCart = jest.fn((authToken, regCart) => {
    return Promise.resolve({
      regCart,
      validationMessages:
        mockAvailableCapacity === 0
          ? [
              {
                severity: 'Warning',
                unLocalizedInternalMessage:
                  'Failed to acquire capacity for {{entityType}} {{entityId}}. Capacity is full.',
                localizationKey: 'REGAPI.CAPACITY_UNAVAILABLE',
                parametersMap: {
                  entityType: 'ContactType',
                  entityId: '00000000-0000-0000-0000-000000000001'
                },
                subValidationMessageList: []
              }
            ]
          : []
    });
  });
  return MockRegCartClient;
});

const eventId = '11111111-2222-3333-4444-555555555555';
const registrationTypes = {
  '00000000-0000-0000-0000-000000000000': {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Default'
  },
  '00000000-0000-0000-0000-000000000001': {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'First'
  }
};
const fakePath = `/${eventId}/`;
jest.mock('event-widgets/clients/CapacityClient', () => {
  function MockCapacityClient() {}
  MockCapacityClient.prototype.getCapacitySummaries = jest.fn(() => {
    return Promise.resolve([
      {
        '11111111-2222-3333-4444-555555555555::00000000-0000-0000-0000-000000000000': {
          capacityId: '11111111-2222-3333-4444-555555555555::00000000-0000-0000-0000-000000000000',
          totalCapacityAvailable: 2,
          availableCapacity: mockAvailableCapacity,
          active: true
        },
        '11111111-2222-3333-4444-555555555555::31313111-2222-3333-4444-555555555555': {
          capacityId: '11111111-2222-3333-4444-555555555555::31313111-2222-3333-4444-555555555555',
          totalCapacityAvailable: 2,
          availableCapacity: mockAvailableCapacity,
          active: true
        }
      }
    ]);
  });
  return MockCapacityClient;
});

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('Reg type capacity not available, should show event closed modal', async () => {
  mockAvailableCapacity = 0;
  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId,
        registrationTypeId: '00000000-0000-0000-0000-000000000001',
        registrationPathId: 'todoThisShouldBeRegPathId'
      },
      eventLaunchWizardSettings: '{}'
    },
    fakePath + 'regProcessStep1',
    event => ({
      ...event,
      registrationTypes,
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../clients/RegCartClient').prototype.createRegCart).toHaveBeenCalled();
});

test('Reg type capacity not available but no reg type selected, should not show event closed modal', async () => {
  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId,
        registrationTypeId: '00000000-0000-0000-0000-000000000000',
        registrationPathId: 'todoThisShouldBeRegPathId'
      },
      eventLaunchWizardSettings: '{}'
    },
    fakePath + 'regProcessStep1',
    event => ({
      ...event,
      registrationTypes,
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../clients/RegCartClient').prototype.createRegCart).toHaveBeenCalled();
});

test('Reg type capacity available, should not show event closed modal', async () => {
  mockAvailableCapacity = 1;
  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId,
        registrationTypeId: '00000000-0000-0000-0000-000000000001',
        registrationPathId: 'todoThisShouldBeRegPathId'
      },
      eventLaunchWizardSettings: '{}'
    },
    fakePath + 'regProcessStep1',
    event => ({
      ...event,
      registrationTypes,
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../clients/RegCartClient').prototype.createRegCart).toHaveBeenCalled();
});
