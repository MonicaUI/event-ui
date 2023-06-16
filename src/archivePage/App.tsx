import React from 'react';
import { connect } from 'react-redux';
import AppStyles from '../App/App.less';
import AppContainer from 'nucleus-guestside-site/src/containers/AppContainer';
import PageRenderer from '../App/PageRenderer';
import { getContentImages } from 'nucleus-themes/getImages';
import baseDialogStyle from '../dialogs/styles/Dialog.less';
import dialogTransitionUpStyle from 'event-widgets/shared-styles/DialogTransitionUp.less';
import ThemeImagesContext from 'nucleus-widgets/context/ThemeImagesContext';
import DialogStylesContext from '../dialogs/DialogStylesContext';

type AppProps = {
  assetRoot: string;
  pageId: string;
  pages?: $TSFixMe;
  theme?: $TSFixMe;
};

type AppState = $TSFixMe;

class App extends React.Component<AppProps, AppState> {
  static displayName = 'App';

  constructor(props: AppProps) {
    super(props);
    this.state = {
      themeImages: {
        ...getContentImages(this.props.assetRoot)
      },
      dialogStyles: {
        base: baseDialogStyle,
        transitions: {
          up: dialogTransitionUpStyle
        }
      }
    };
  }

  static getDerivedStateFromProps(props, state) {
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

  renderGuestPage() {
    const { pageId, pages, theme } = this.props;
    return (
      <AppContainer theme={theme}>
        <PageRenderer page={pages[pageId]} />
      </AppContainer>
    );
  }

  render() {
    return (
      <ThemeImagesContext.Provider value={this.state.themeImages}>
        <DialogStylesContext.Provider value={this.state.dialogStyles}>
          <div className={AppStyles.wrapper}>{this.renderGuestPage()}</div>
        </DialogStylesContext.Provider>
      </ThemeImagesContext.Provider>
    );
  }
}

export const createApp = (assetRoot: $TSFixMe): $TSFixMe => {
  return connect((state: $TSFixMe) => {
    const { defaultPageId } = state.website.pluginData.eventArchivePageNavigation;
    return {
      assetRoot,
      pageId: defaultPageId,
      pages: state.website.pages,
      theme: state.website.theme
    };
  })(App);
};
