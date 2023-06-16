import React from 'react';
import { connect, useSelector } from 'react-redux';
import AppStyles from './App.less';
import AppContainer from 'nucleus-guestside-site/src/containers/AppContainer';
import PageRenderer from './PageRenderer';
import { getContentImages } from 'nucleus-themes/getImages';
import CheckoutProcessingDialog from '../dialogs/CheckoutProcessingDialog';
import NavigationDialog from './NavigationDialog';
import baseDialogStyle from '../dialogs/styles/Dialog.less';
import checkoutDialogStyles from '../dialogs/CheckoutProcessingDialog/CheckoutProcessingDialog.less';
import dialogTransitionUpStyle from 'event-widgets/shared-styles/DialogTransitionUp.less';
import Form from 'nucleus-form/src/components/Form';
import ThemeImagesContext from 'nucleus-widgets/context/ThemeImagesContext';
import DialogStylesContext from '../dialogs/DialogStylesContext';
import {
  CANCELLATION,
  DECLINE,
  GUEST_REGISTRATION,
  POST_REGISTRATION_PAYMENT,
  REGISTRATION,
  WAITLIST
} from '../redux/website/registrationProcesses';
import { useGraphQLSiteEditorData, GraphQLSiteEditorDataReleases } from '../ExperimentHelper';
import { RootState } from '../redux/reducer';
import { createSelector } from 'reselect';
import { Page } from '@cvent/flex-event-shared/target/guestside';
import { isEmpty } from 'lodash';
import useGraphQLPageData from './useGraphQLPageData';

/** Props for the App component */
export type AppProps = {
  assetRoot?: string;
  pageId?: string;
  page?: Page;
  templatePage?: Page;
  registrationPathId?: string;
  theme?: unknown;
  isPageUnderForm?: boolean;
  imageLookup?: unknown;
  browserFeatures?: {
    supportsWebp?: boolean;
  };
};

type AppState = {
  assetRoot?: string;
  themeImages?: unknown;
  dialogStyles?: {
    base: unknown;
    checkoutProcessing: unknown;
    transitions: {
      up: unknown;
    };
  };
  isPasswordModalOpen?: boolean;
};

/** Main app component to provide theme and dialog contexts and render guestside pages */
export class App extends React.Component<AppProps, AppState> {
  static displayName = 'App';

  constructor(props: AppProps) {
    super(props);
    this.state = {
      themeImages: {
        ...getContentImages(this.props.assetRoot)
      },
      dialogStyles: {
        base: baseDialogStyle,
        checkoutProcessing: checkoutDialogStyles,
        transitions: {
          up: dialogTransitionUpStyle
        }
      }
    };
  }

  static getDerivedStateFromProps(props: AppProps, state: AppState): AppState | null {
    if (props.assetRoot !== state.assetRoot) {
      return {
        assetRoot: props.assetRoot,
        themeImages: {
          ...getContentImages(props.assetRoot)
        }
      };
    }
    return null;
  }

  renderGuestPage(): JSX.Element {
    const { page, theme, isPageUnderForm, imageLookup, browserFeatures } = this.props;
    if (!page) {
      return null;
    }
    return (
      <AppContainer theme={theme} imageLookup={imageLookup} browserFeatures={browserFeatures}>
        {isPageUnderForm ? (
          <Form>
            <PageRenderer page={page} isPasswordModalOpen={this.state.isPasswordModalOpen} />
          </Form>
        ) : (
          <PageRenderer page={page} isPasswordModalOpen={this.state.isPasswordModalOpen} />
        )}
      </AppContainer>
    );
  }

  render(): JSX.Element {
    return (
      <ThemeImagesContext.Provider value={this.state.themeImages}>
        <DialogStylesContext.Provider value={this.state.dialogStyles}>
          <div className={AppStyles.wrapper}>
            {this.renderGuestPage()}
            <CheckoutProcessingDialog />
            {/* @ts-expect-error ts-migrate(2741) FIXME: Property 'isOpen' is missing in type '{}' but requ... Remove this comment to see the full error message */}
            <NavigationDialog />
          </div>
        </DialogStylesContext.Provider>
      </ThemeImagesContext.Provider>
    );
  }
}

/**
 * Create main application component, including page renderer, with a specific asset root URL
 */
export const createApp = (assetRoot: string): React.FunctionComponent<AppProps> => {
  return props => <AppExperimentWrapper {...props} assetRoot={assetRoot} />;
};

const EMPTY_OBJECT = Object.freeze({});
const selectImageLookup = createSelector(
  state => (state as RootState).imageLookup,
  imageLookup => {
    return isEmpty(imageLookup) ? EMPTY_OBJECT : imageLookup;
  }
);

const ConnectedApp = connect((state: RootState, props: AppProps) => {
  const { pageId } = props;
  return {
    theme: state.website.theme,
    isPasswordModalOpen: state.isPasswordModalOpen,
    isPageUnderForm:
      REGISTRATION.isTypeOfPage(state, pageId) ||
      GUEST_REGISTRATION.isTypeOfPage(state, pageId) ||
      CANCELLATION.isTypeOfPage(state, pageId) ||
      DECLINE.isTypeOfPage(state, pageId) ||
      WAITLIST.isTypeOfPage(state, pageId) ||
      POST_REGISTRATION_PAYMENT.isTypeOfPage(state, pageId),
    imageLookup: selectImageLookup(state),
    browserFeatures: state.browserFeatures
  };
})(App);

/** Wrapper component to pass down the current page from the Redux store */
export const AppWithRedux: React.FunctionComponent<AppProps> = (props: AppProps) => {
  const { pageId } = props;
  const pages = useSelector(state => (state as RootState).website.pages);
  const page = pages ? pages[pageId] : null;
  return <ConnectedApp {...props} page={page} />;
};

/** Wrapper component to pass down the current page from a GraphQL query */
export const AppWithGraphQL: React.FunctionComponent<AppProps> = (props: AppProps) => {
  const { pageId } = props;
  const page = useGraphQLPageData(pageId);
  return <ConnectedApp {...props} page={page} pageId={page?.id} />;
};

const AppExperimentWrapper: React.FunctionComponent<AppProps> = (props: AppProps) => {
  const shouldUseGraphQLSiteEditorData = useGraphQLSiteEditorData(GraphQLSiteEditorDataReleases.SiteEditorPageData);
  if (shouldUseGraphQLSiteEditorData) return <AppWithGraphQL {...props} />;
  return <AppWithRedux {...props} />;
};
