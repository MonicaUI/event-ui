import React from 'react';
import { resolveTestId } from '@cvent/nucleus-test-automation';
import Icon from '@cvent/nucleus-icon';
import InteractiveElement from 'nucleus-core/containers/InteractiveElement';
import Button from 'nucleus-core/buttons/Button';
import ButtonStyles from 'nucleus-core/less/cv/Button.less';
import List from 'nucleus-core/lists/List';
import ListStyles from 'nucleus-core/less/cv/List.less';
import Trigger from 'nucleus-core/containers/Trigger';
import EventBuildWizardPreviewStyles from './EventBuildWizardPreviewBanner.less';
import { injectTestId } from '@cvent/nucleus-test-automation';
import InfoFlyout from 'nucleus-core/flyout/InfoFlyout';
import SlideStyles from 'nucleus-core/less/cv/Flyout.Transition.less';
import FlyoutStyles from 'nucleus-core/less/cv/Flyout.less';

const InfoFlyoutStyles = {
  trigger: SlideStyles,
  flyout: FlyoutStyles
};

const InlineFlyout = {
  trigger: {
    trigger: {
      clear: 'both',
      padding: '0 .15em 0 0'
    }
  }
};

const PAYGO_LICENSE_TYPE_ID = 35;
const PROFESSIONAL_LICENSE_TYPE_ID = 2;

const launchButtonStyles = {
  ...ButtonStyles,
  button: ButtonStyles.button + ' ' + EventBuildWizardPreviewStyles.launchButton
};

const actionsButtonStyles = {
  ...ButtonStyles,
  button: ButtonStyles.button + ' ' + EventBuildWizardPreviewStyles.actionsButton
};

const actionsListStyles = {
  ...ListStyles,
  menu: ListStyles.menu + ' ' + EventBuildWizardPreviewStyles.actionsList
};

type OwnProps = {
  bannerTexts?: $TSFixMe;
  translate: $TSFixMeFunction;
  eventBuildWizardExitUrl?: string;
  evtStub?: string;
  licenseTypeId?: number;
  isFreeTrial?: boolean;
  isPreventDedupeLogicExperimentOn?: boolean;
  freeTrialPurchaseCta?: string;
  eventLaunchWizardSettings?: $TSFixMe;
  recordBuildWizardCloseFact?: $TSFixMeFunction;
  recordLaunchEventClickFact?: $TSFixMeFunction;
  recordManageEventClickFact?: $TSFixMeFunction;
  recordSiteEditorClickFact?: $TSFixMeFunction;
  recordTestEventClickFact?: $TSFixMeFunction;
};

type State = $TSFixMe;

type Props = OwnProps & typeof PageBanner.defaultProps;

/**
 * Page banner for guestside when redirected from Event Build Wizard.
 */
export default class PageBanner extends React.Component<Props, State> {
  static displayName = 'PageBanner';
  static defaultProps = {
    recordBuildWizardCloseFact: (): $TSFixMe => {},
    recordLaunchEventClickFact: (): $TSFixMe => {},
    recordManageEventClickFact: (): $TSFixMe => {},
    recordSiteEditorClickFact: (): $TSFixMe => {},
    recordTestEventClickFact: (): $TSFixMe => {}
  };

  button: $TSFixMe;
  toggleActionsList: $TSFixMe;

  constructor(props: Props) {
    super(props);
    const rootURL = props.eventBuildWizardExitUrl;
    const evtStubParam = `evtStub=${props.evtStub}`;
    const overview = '1';
    const { isMerchantCPS, showBankAccount, merchantAccountId, remittanceType } = props.eventLaunchWizardSettings;
    // td - KeeptestData, mpf - merchantProcessingFlag, fp - fromPage, sba - showBankAccount, mid - merchantAccountId
    const launchEventUrl = props.eventLaunchWizardSettings.openLaunchWizard
      ? `${rootURL}/Details/EventLaunchWizard?${evtStubParam}&td=False&mpf=${isMerchantCPS}&` +
        `fp=${overview}&sba=${showBankAccount}&mid=${merchantAccountId}&remittanceType=${remittanceType}`
      : `${rootURL}/Overview/OverviewEventLaunchProcessingPage?${evtStubParam}&redirectController=Overview`;
    this.state = {
      redirectURLs: {
        overview: `${rootURL}/Overview?${evtStubParam}`,
        launchEvent: launchEventUrl,
        siteEditor:
          `${rootURL}/EventWebsite/EditWebsite/Index/View?${evtStubParam}&startSection=Website&` +
          `parentUrl=/Subscribers/Events2/Overview?${evtStubParam}`,
        testEvent: `${rootURL}/Details/EventTest?${evtStubParam}&returnPage=Overview`
      }
    };
  }

  exitWizard = (): $TSFixMe => {
    this.props.recordBuildWizardCloseFact();
    window.location.assign(this.state.redirectURLs.overview);
  };

  launchEvent = (): $TSFixMe => {
    const { licenseTypeId } = this.props;
    if (licenseTypeId === PAYGO_LICENSE_TYPE_ID) {
      this.props.recordLaunchEventClickFact();
      window.location.assign(this.state.redirectURLs.launchEvent);
    }
  };

  designWebsite = (): $TSFixMe => {
    this.props.recordSiteEditorClickFact();
    window.location.assign(this.state.redirectURLs.siteEditor);
  };

  onKeyDown(e: $TSFixMe): $TSFixMe {
    if (e.keyCode === 27 && this.button) {
      this.button.focus();
    }
  }

  render(): $TSFixMe {
    const {
      bannerTexts,
      translate,
      licenseTypeId,
      isFreeTrial,
      recordManageEventClickFact,
      recordTestEventClickFact,
      isPreventDedupeLogicExperimentOn
    } = this.props;
    const { openLaunchWizard, isSalesForceIdPresent } = this.props.eventLaunchWizardSettings;
    const isPaygoLicense = licenseTypeId === PAYGO_LICENSE_TYPE_ID;
    const isProfessionalFreeTrial = licenseTypeId === PROFESSIONAL_LICENSE_TYPE_ID && isFreeTrial;
    const disableLaunchEventButton =
      isProfessionalFreeTrial || (isPreventDedupeLogicExperimentOn && !isSalesForceIdPresent);
    const disabledEventLaunchButtonTitle = disableLaunchEventButton && translate('event_launch_error__resx');
    const launchButton = (
      <Button
        classes={launchButtonStyles}
        id="previewLaunch"
        onClick={this.launchEvent}
        title={disabledEventLaunchButtonTitle}
        disabled={disableLaunchEventButton}
      >
        {translate(bannerTexts.launchEvent)}
      </Button>
    );
    return (
      <div className={EventBuildWizardPreviewStyles.banner} {...resolveTestId(this.props, '-page-banner')}>
        <div className={EventBuildWizardPreviewStyles.bannerContent}>
          <span {...injectTestId('preview-banner-header')}>{translate(bannerTexts.header)}</span>
          <div id="bannerActionsContainer" className={EventBuildWizardPreviewStyles.bannerActionsContainer}>
            <div id="buttonContainer" className={EventBuildWizardPreviewStyles.buttonContainer}>
              <Button classes={launchButtonStyles} id="previewDesign" onClick={this.designWebsite}>
                {translate(bannerTexts.designWebsite)}
              </Button>
              {isPaygoLicense && openLaunchWizard && launchButton}
              {isProfessionalFreeTrial && (
                <InfoFlyout
                  classes={InfoFlyoutStyles}
                  style={InlineFlyout}
                  flyoutDirection="vertical"
                  forceDirection={{ horz: 'center' }}
                  allowMouse
                  isTriggerFocusable
                >
                  {launchButton}
                  <div className={EventBuildWizardPreviewStyles.flyoutStub}>
                    <div className={EventBuildWizardPreviewStyles.flyoutStubLablel}>
                      {translate(bannerTexts.flyoutStubLabel)}
                    </div>
                    <div className={EventBuildWizardPreviewStyles.flyoutStubText}>
                      <a href={this.props.freeTrialPurchaseCta}>{translate(bannerTexts.clickHereLabel)}</a>
                      &nbsp;
                      {translate(bannerTexts.hoverText)}
                    </div>
                  </div>
                </InfoFlyout>
              )}
              <div className={EventBuildWizardPreviewStyles.actionsContainer}>
                <Trigger allowMouse={false} onKeyDown={this.onKeyDown} {...injectTestId('action-list-trigger')}>
                  <Button id="previewActions" classes={actionsButtonStyles} onClick={this.toggleActionsList}>
                    {translate(bannerTexts.actions)}
                    <Icon icon="down" modifier={EventBuildWizardPreviewStyles.downIcon} />
                  </Button>
                  <List classes={actionsListStyles} type="menu">
                    <a id="previewManage" onClick={recordManageEventClickFact} href={this.state.redirectURLs.overview}>
                      {translate(bannerTexts.manageEvent)}
                    </a>
                    <a id="previewTest" onClick={recordTestEventClickFact} href={this.state.redirectURLs.testEvent}>
                      {translate(bannerTexts.testEvent)}
                    </a>
                  </List>
                </Trigger>
              </div>
            </div>
            <InteractiveElement
              className={EventBuildWizardPreviewStyles.actionExit}
              onClick={this.exitWizard}
              id="previewClose"
            >
              <Icon
                icon="closeDeleteFilled"
                modifier={EventBuildWizardPreviewStyles.exitIcon}
                fallbackText={translate('_close__resx')}
              />
            </InteractiveElement>
          </div>
        </div>
      </div>
    );
  }
}
