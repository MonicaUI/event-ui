import { connect } from 'react-redux';
import EventBuildWizardPreviewBanner from './EventBuildWizardPreviewBanner';
import { injectTestId } from '@cvent/nucleus-test-automation';
import {
  recordBuildWizardCloseFact,
  recordLaunchEventClickFact,
  recordManageEventClickFact,
  recordSiteEditorClickFact,
  recordTestEventClickFact
} from '../../redux/analytics/recordEventBuildWizardFacts';

/**
 * Preview banner when directed from Event Build Wizard
 */
export default connect(
  (state: $TSFixMe) => {
    return {
      ...injectTestId('preview'),
      bannerTexts: {
        header: 'EventGuestSide_BannerText_EventBuildWizardPreview__resx',
        launchEvent: 'EventGuestSide_LaunchEventText_EventBuildWizardPreview__resx',
        actions: 'EventGuestSide_ActionsText_EventBuildWizardPreview__resx',
        designWebsite: 'EventGuestSide_DesignWebsiteText_EventBuildWizardPreview__resx',
        manageEvent: 'EventGuestSide_ManageEventText_EventBuildWizardPreview__resx',
        testEvent: 'EventGuestSide_TestEventText_EventBuildWizardPreview__resx',
        hoverText: 'EventGuestSide_HoverLaunchButtonText_EventBuildWizardPreview__resx',
        flyoutStubLabel: 'EventGuestSide_HoverLaunchButtonLabelText_EventBuildWizardPreview__resx',
        clickHereLabel: 'EventGuestSide_ClickHereButtonLabelText_EventBuildWizardPreview__resx'
      },
      translate: state.text.translate,
      eventBuildWizardExitUrl: state.defaultUserSession.eventBuildWizardExitUrl,
      evtStub: state.event.id,
      licenseTypeId: state.defaultUserSession.licenseTypeId,
      isFreeTrial: state.defaultUserSession.isFreeTrial,
      freeTrialPurchaseCta: state.defaultUserSession.freeTrialPurchaseCta,
      eventLaunchWizardSettings: state.eventLaunchWizardSettings,
      isPreventDedupeLogicExperimentOn: state.experiments.preventDedupeLogic
    };
  },
  {
    recordBuildWizardCloseFact,
    recordLaunchEventClickFact,
    recordManageEventClickFact,
    recordSiteEditorClickFact,
    recordTestEventClickFact
  }
)(EventBuildWizardPreviewBanner);
