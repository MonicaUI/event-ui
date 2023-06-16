/* eslint-env jest */
import { buildClients } from '../assetLoaders';
import EventSnapshotClient from '../clients/EventSnapshotClient';
import ProductVisibilityClient from '../clients/ProductVisibilityClient';

const getAppSettings = () => {
  return {
    eventContext: {
      eventId: '123'
    },
    experiments: {}
  };
};
test('when useProductVisibilityService is not passed', () => {
  const appSettings = getAppSettings();
  const clients = buildClients(appSettings);
  expect(clients).toBeTruthy();
  expect(clients.productVisibilityClient).toBeInstanceOf(EventSnapshotClient);
});
test('when useProductVisibilityService is false', () => {
  const appSettings = getAppSettings();
  (appSettings.experiments as $TSFixMe).useProductVisibilityService = false;
  const clients = buildClients(appSettings);
  expect(clients).toBeTruthy();
  expect(clients.productVisibilityClient).toBeInstanceOf(EventSnapshotClient);
});
test('when useProductVisibilityService is false 1', () => {
  const appSettings = getAppSettings();
  (appSettings.experiments as $TSFixMe).useProductVisibilityService = true;
  const clients = buildClients(appSettings);
  expect(clients).toBeTruthy();
  expect(clients.productVisibilityClient).toBeInstanceOf(ProductVisibilityClient);
});
