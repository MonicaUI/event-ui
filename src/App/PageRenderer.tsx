import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import Content from './Content';
import PlannerBanner from './PlannerBanner';
import TestModeBanner from './TestModeBanner';
import PreviewBanner from './PreviewBanner';
import PasskeyBanner from './passkeyBanner/PasskeyBanner';
import EventBuildWizardPreviewBanner from '../dialogs/EventBuildWizardPreviewBanner';
import 'nucleus-guestside-site/src/containers/ResponsiveFontPage.less';
import WebsitePasswordDialogStyles from '../dialogs/WebsitePasswordDialog/WebsitePasswordDialog.less';
import { TEMPLATE_TOP_BOTTOM } from 'nucleus-widgets/renderers/shared/pageTypes';
import { openSharePromptDialog } from '../dialogs/SharePromptDialog/index';
import { getRegistrationPathIdOrDefault } from '../redux/selectors/currentRegistrationPath';
import { getConfirmationNumber } from '../redux/selectors/currentRegistrant';
import { getIn } from 'icepick';
import { isPostRegistrationPage } from '../redux/website/registrationProcesses';
import { openWebsitePasswordDialog } from '../dialogs/WebsitePasswordDialog';
import { checkEventPasscodeProtected } from '../utils/securityUtils';
import { getCurrentPageId } from '../redux/pathInfo';
import { defaultMemoize } from 'reselect';
import { injectTestId } from '@cvent/nucleus-test-automation';
import { Page } from '@cvent/flex-event-shared/target/guestside';
import { MappedPage } from './useGraphQLPageData';
import { RootState } from '../redux/reducer';

const LowerRegionBanner = React.lazy(() => import('./LowerRegionBanner'));

const isMappedPage = (page: Page | MappedPage): page is MappedPage => {
  return 'templateHeaderRootLayoutItemId' in page || 'templateFooterRootLayoutItemId' in page;
};

type PageRendererProps = {
  page: Page | MappedPage;
  templatePage?: Page | MappedPage;
  isTestMode?: boolean;
  isPlanner?: boolean;
  isPreview?: boolean;
  showEventBuildWizardBanner?: boolean;
  isConfirmationPage?: boolean;
  confirmationNumber?: string;
  openShareDialog?: (translate: unknown, sharePromptData: unknown) => void;
  translate?: RootState['text']['translate'];
  sharePromptData?: {
    allowSharePrompt: boolean;
  };
  globalThemeStyle?: unknown;
  isPasswordSuccessfullyValidated?: boolean;
  openPasswordDialog?: () => void;
  closeDialog?: () => void;
  shouldPasswordModalBeDisplayed?: () => boolean;
  environment?: string;
  isLowerRegion?: (region: string) => boolean;
  hideHeaderFooter?: boolean;
};

/**
 * Custom page renderer implementation for the event guestside site.
 */
class PageRenderer extends React.Component<PageRendererProps> {
  static displayName = 'PageRenderer';

  constructor(props: PageRendererProps) {
    super(props);
  }

  componentDidMount() {
    const {
      isConfirmationPage,
      confirmationNumber,
      openShareDialog,
      translate,
      sharePromptData,
      shouldPasswordModalBeDisplayed,
      isPasswordSuccessfullyValidated,
      openPasswordDialog
    } = this.props;

    if (
      isConfirmationPage &&
      sharePromptData.allowSharePrompt &&
      !localStorage.getItem(`sharePromptFor${confirmationNumber}`)
    ) {
      localStorage.setItem(`sharePromptFor${confirmationNumber}`, '1');
      openShareDialog(translate, sharePromptData);
    }
    if (shouldPasswordModalBeDisplayed() && !isPasswordSuccessfullyValidated) {
      openPasswordDialog();
    }
  }

  renderPage() {
    const { page, templatePage, hideHeaderFooter } = this.props;
    const isGraphQLTemplatePage = isMappedPage(page);
    if (!hideHeaderFooter && (templatePage?.type === TEMPLATE_TOP_BOTTOM || isGraphQLTemplatePage)) {
      const headerRootLayoutItemId = isMappedPage(page)
        ? page.templateHeaderRootLayoutItemId
        : templatePage.rootLayoutItemIds[0];
      const footerRootLayoutItemId = isMappedPage(page)
        ? page.templateFooterRootLayoutItemId
        : templatePage.rootLayoutItemIds[1];
      return (
        <div>
          <div role="banner">
            <Content
              rootLayoutItemId={headerRootLayoutItemId}
              page={isGraphQLTemplatePage ? page : templatePage}
              {...injectTestId('header')}
            />
          </div>
          <div role="main" id="main" tabIndex={-1}>
            <Content rootLayoutItemId={page.rootLayoutItemIds[0]} page={page} />
          </div>
          <Content
            rootLayoutItemId={footerRootLayoutItemId}
            page={isGraphQLTemplatePage ? page : templatePage}
            {...injectTestId('footer')}
          />
        </div>
      );
    }
    return (
      <div role="main" id="main" tabIndex={-1}>
        <Content rootLayoutItemId={page.rootLayoutItemIds[0]} page={page} />
      </div>
    );
  }

  renderFooter() {
    const { hideHeaderFooter } = this.props;
    if (hideHeaderFooter) {
      return null;
    }

    return (
      <div role="contentinfo">
        <Content rootLayoutItemId="CventFooterContainer" />
      </div>
    );
  }

  pageBlurClass = () => {
    const { shouldPasswordModalBeDisplayed, isPasswordSuccessfullyValidated } = this.props;
    return shouldPasswordModalBeDisplayed() && !isPasswordSuccessfullyValidated
      ? WebsitePasswordDialogStyles.blurred
      : undefined;
  };

  render() {
    const { isTestMode, isPlanner, isPreview, showEventBuildWizardBanner, environment, isLowerRegion } = this.props;

    const pageAndFooter = (
      <div className={this.pageBlurClass()}>
        {this.renderPage()}
        {this.renderFooter()}
      </div>
    );

    return (
      <div>
        <PasskeyBanner />
        {!isPlanner && isTestMode && <TestModeBanner />}
        {isPlanner && <PlannerBanner />}
        {isPreview && showEventBuildWizardBanner && <EventBuildWizardPreviewBanner />}
        {isPreview && !showEventBuildWizardBanner && <PreviewBanner />}
        {isLowerRegion(environment) && (
          <Suspense fallback={<div>Loading...</div>}>
            <LowerRegionBanner environment={environment} />
          </Suspense>
        )}
        {pageAndFooter}
      </div>
    );
  }
}

const isLowerRegion = defaultMemoize(environment => {
  return /^(S\d\d\d|T2)$/.test(environment);
});

const mapStateToProps = (state: $TSFixMe, props: $TSFixMe) => {
  const {
    event: {
      eventSecuritySetupSnapshot: { authenticationType, authenticationLocation, authenticatedRegistrationPaths }
    },
    defaultUserSession: { isPlanner }
  } = state;
  const { page } = props;
  const regPathId = getRegistrationPathIdOrDefault(state);
  const sharePromptSetting = getIn(state, [
    'appData',
    'registrationSettings',
    'registrationPaths',
    regPathId,
    'sharePromptSetting'
  ]);
  const allowSharePrompt = getIn(state, [
    'appData',
    'registrationSettings',
    'registrationPaths',
    regPathId,
    'allowSharePrompt'
  ]);

  // To fetch the contact stub from reg cart and base64 encode it so as to send it as a query param in Share Bar
  const eventRegs = getIn(state, ['registrationForm', 'regCart', 'eventRegistrations']);
  const eventReg = eventRegs ? eventRegs[Object.keys(eventRegs)[0]] : {};
  const encodedContactStub = getIn(eventReg, ['attendee', 'personalInformation', 'contactIdEncoded']);

  const currentPageId = getCurrentPageId(state);
  const shouldPasswordModalBeDisplayed = () => {
    return (
      !isPlanner &&
      checkEventPasscodeProtected(
        authenticationType,
        authenticationLocation,
        currentPageId,
        { appData: state.appData, website: state.website },
        authenticatedRegistrationPaths,
        state.userSession.verifiedWebsitePassword
      )
    );
  };

  const silo =
    window && (window as $TSFixMe).version && (window as $TSFixMe).version.includes('devsilo')
      ? 'S' + (window as $TSFixMe).version.split('devsilo')[1].substring(0, 3)
      : null;
  const env = !state.environment ? silo : state.environment;

  const hasGraphQLTemplatePage = page.templateHeaderRootLayoutItemId || page.templateFooterRootLayoutItemId;
  return {
    templatePage: hasGraphQLTemplatePage ? null : state.website.pages[page.templateId],
    isTestMode: state.defaultUserSession.isTestMode,
    isPlanner: state.defaultUserSession.isPlanner,
    isPreview: state.defaultUserSession.isPreview,
    showEventBuildWizardBanner: state.defaultUserSession.showEventBuildWizardBanner,
    globalThemeStyle: state.website.theme.global,
    isConfirmationPage: isPostRegistrationPage(state, page.id),
    confirmationNumber: getConfirmationNumber(state),
    translate: state.text.translate,
    sharePromptData: {
      allowSharePrompt,
      sharePromptSetting,
      shareBarSettings: state.appData.shareBarSettings,
      shareSummaryURL: getIn(state, ['event', 'webLinks', 'linkName~Summary', 'shortUrl']),
      encodedContactStub
    },
    isPasswordSuccessfullyValidated: state.userSession.verifiedWebsitePassword,
    shouldPasswordModalBeDisplayed,
    environment: env,
    isLowerRegion,
    hideHeaderFooter: state.isEmbeddedRegistration && state.pathInfo?.queryParams?.hideHeaderFooter === 'true'
  };
};

const mapDispatchToProps = { openShareDialog: openSharePromptDialog, openPasswordDialog: openWebsitePasswordDialog };

export default connect(mapStateToProps, mapDispatchToProps)(PageRenderer);
