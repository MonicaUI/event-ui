import React from 'react';
import EventBuildWizardPreviewBanner from '../EventBuildWizardPreviewBanner';
import { shallow, mount } from 'enzyme';

describe('EventBuildWizardPreviewBanner component', () => {
  const props = {
    translate: jest.fn(),
    eventBuildWizardExitUrl: 'https://silo408.app.core.cvent.org/subscribers/login.aspx',
    bannerTexts: {
      header: 'Event Build Wizard Preview',
      launchEvent: 'Launch Event',
      actions: 'Actions',
      designWebsite: 'Design Website',
      manageEvent: 'Manage Event',
      testEvent: 'Test Event'
    },
    isPreventDedupeLogicExperimentOn: true,
    licenseTypeId: 35,
    evtStub: '1234-5678',
    eventLaunchWizardSettings: {
      isMerchantCPS: true,
      showBankAccount: true,
      merchantAccountId: '1234-5678',
      openLaunchWizard: true,
      isSalesForecIdPresent: false
    }
  };
  it('matches snapshot for EventBuildWizardPreviewBanner component', async () => {
    const editor = shallow(<EventBuildWizardPreviewBanner {...props} />);
    expect(editor).toMatchSnapshot();
  });
  it('Verify launch button disabled, if no salesForceId present', async () => {
    const editor = mount(<EventBuildWizardPreviewBanner {...props} />);
    expect(editor).toMatchSnapshot();
    expect(editor.find('[id="previewLaunch"]').at(0).prop('disabled')).toBe(true);
  });

  it('should call window.location.assign with eventBuildWizardExitUrl', async () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { assign: jest.fn() }
    });
    const editor = shallow(<EventBuildWizardPreviewBanner {...props} />);
    const component = editor.instance();
    component.exitWizard();
    expect(window.location.assign).toHaveBeenCalledWith(
      'https://silo408.app.core.cvent.org/subscribers/login.aspx/Overview?evtStub=1234-5678'
    );
  });
  it('should call window.location.assign', async () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { assign: jest.fn() }
    });
    const editor = shallow(<EventBuildWizardPreviewBanner {...props} />);
    const component = editor.instance();
    component.launchEvent();
    expect(window.location.assign).toHaveBeenCalled();
  });
});
