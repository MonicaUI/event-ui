import React from 'react';
import { connect } from 'react-redux';
import { getCurrentPageId, routeToPage, setNavigationDialogConfig } from '../../redux/pathInfo';
import WebsiteNavigatorWidget from 'nucleus-widgets/lib/WebsiteNavigator/WebsiteNavigatorWidget';
import ContainerlessImageWidget from './ContainerlessImageWidget';
import ContainerlessRegisterNowWidget from './ContainerlessRegisterNowWidget';
import LogoutButtonWidget from './LogoutButtonWidget';
import {
  getWebsiteDisabledPageIds,
  getWebsiteChildIds,
  getWebsiteNavigationGroups,
  getWebsiteWebLinkOnlyPageIds
} from '../../redux/website';
import { isPlannerRegistration } from '../../redux/defaultUserSession';
import ImageClassNames from 'nucleus-widgets/lib/Image/Image.less';
import ImageContainerClassNames from './ContainerlessImage.less';
import WebsiteNavigatorWidgetClassNames from './WebsiteNavigatorWidget.less';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import { isLoggedIn } from '../../redux/selectors/currentRegistrant';
import { getPostRegPageGroupPagesForInvitee } from '../../utils/confirmationUtil';
import { hasAccessToWebsitePages } from '../../redux/selectors/event';
import { POST_REGISTRATION, REGISTRATION, GUEST_REGISTRATION } from '../../redux/website/registrationProcesses';
import { get, some } from 'lodash';
import { isRegistrationAsAFeatureOff } from 'event-widgets/redux/selectors/event';

const ContainerlessImageClasses = {
  ...ImageClassNames,
  ...ImageContainerClassNames
};

const pagesWithoutRegisterNowWidget = {
  UNSUBSCRIBE_SUBSCRIBE: 'unsubscribeSubscribe',
  OPT_IN_OUT: 'optInOut'
};

function openNavigatorDialog(content, style) {
  return dispatch => {
    dispatch(
      setNavigationDialogConfig({
        isOpen: true,
        content,
        style
      })
    );
  };
}
function closeNavigatorDialog() {
  return dispatch => {
    dispatch(
      setNavigationDialogConfig({
        isOpen: false
      })
    );
  };
}
/**
 * Data wrapper for the website navigator widget.
 */
// eslint-disable-next-line complexity
export default withMappedWidgetConfig(
  connect(
    (state: $TSFixMe, props: $TSFixMe) => {
      const {
        website,
        defaultUserSession: { isPlanner, isPreview },
        event: { isArchived }
      } = state;
      const { pages } = website;
      const { config } = props;
      const isRegistrationFeatureOff = isRegistrationAsAFeatureOff(state.event);
      const areWebsitePagesAccessible = hasAccessToWebsitePages(state);
      const userText = state?.localizedUserText?.currentLocale
        ? get(state.localizedUserText.localizations, state.localizedUserText.currentLocale, null)
        : null;

      // Determine the page data for the widget to display.
      let pageData;
      if (isArchived && !isPlanner && !isPreview) {
        pageData = [];
      } else {
        const disabledPageIds = getWebsiteDisabledPageIds(state);
        const navigationGroups = getWebsiteNavigationGroups(state);
        const webLinkOnlyPageIds = getWebsiteWebLinkOnlyPageIds(state);
        pageData = getWebsiteChildIds(state)
          .filter(
            id =>
              !disabledPageIds.includes(id) && (pages[id] || navigationGroups[id]) && !webLinkOnlyPageIds.includes(id)
          )
          .map(id => {
            if (pages[id]) {
              return {
                ...pages[id],
                name: props.translate(get(userText, 'website.pages.' + id + '.name', pages[id].name)),
                title: props.translate(get(userText, 'website.pages.' + id + '.title', pages[id].title))
              };
            } else if (navigationGroups[id]) {
              return {
                ...navigationGroups[id],
                name: props.translate(
                  get(
                    userText,
                    'website.pluginData.eventWebsiteNavigation.navigationGroups.' + id + '.name',
                    navigationGroups[id].name
                  )
                )
              };
            }
          });
        pageData.forEach(item => {
          if (item.childIds) {
            // eslint-disable-next-line no-param-reassign
            item.childPages = item.childIds
              .filter(id => !disabledPageIds.includes(id) && !webLinkOnlyPageIds.includes(id))
              .map(id => {
                return {
                  ...pages[id],
                  name: props.translate(get(userText, 'website.pages.' + id + '.name', pages[id].name))
                };
              });
          }
        });
      }

      // If website pages are not accessible, then we'll only show the post reg pages
      if (!areWebsitePagesAccessible) {
        pageData = pageData.filter(item => item.id === 'postRegPages');
      }

      // Only show post reg page data if the user is registered and required content has been loaded.
      const loggedIn = isLoggedIn(state);
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      const postRegPageGroup = pageData && pageData.find(item => item.id === 'postRegPages');
      if (loggedIn && postRegPageGroup) {
        postRegPageGroup.childPages = getPostRegPageGroupPagesForInvitee(state, props.translate, userText);
      }

      // Only populate left content if there is a logo defined.
      let leftContent;
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (config.shared.logo && config.shared.logo.asset && config.shared.logo.asset.assetUri) {
        leftContent = (
          <ContainerlessImageWidget {...props} classes={ContainerlessImageClasses} config={config.shared.logo} />
        );
      }

      // Populate the right content.
      const currentPageId = getCurrentPageId(state);
      let rightContent;
      if ((isArchived && !isPlanner && !isPreview) || isRegistrationFeatureOff) {
        rightContent = null;
      } else if (
        config.shared.registerButton.display &&
        !loggedIn &&
        !REGISTRATION.isTypeOfCurrentPage(state) &&
        !GUEST_REGISTRATION.isTypeOfCurrentPage(state) &&
        !POST_REGISTRATION.isTypeOfCurrentPage(state) &&
        !(
          state.defaultUserSession.isTestMode &&
          some(Object.values(pagesWithoutRegisterNowWidget), pageId => pageId === currentPageId)
        )
      ) {
        /*
         * Display the register now widget if not on a post reg page.
         * TODO: apply already registered link settings.
         */
        rightContent = (
          <ContainerlessRegisterNowWidget
            {...props}
            config={{
              text: config.shared.registerButton.text,
              link: {
                enabled: config.shared.registerButton.alreadyRegisteredLink.display,
                text: config.shared.registerButton.alreadyRegisteredLink.text
              }
            }}
          />
        );
      } else if (config.shared.logoutButton.display && loggedIn) {
        // Display the logout button if on a post reg page.
        rightContent = <LogoutButtonWidget {...props} config={{ text: config.shared.logoutButton.text }} />;
      }

      const hideNavigationMenu =
        !pageData?.length ||
        (pageData.length === 1 && !pageData[0].childIds?.length && !pageData[0].childPages?.length);

      return {
        selectedPage: {
          id: currentPageId,
          name:
            pages[currentPageId] &&
            props.translate(get(userText, 'website.pages.' + currentPageId + '.name', pages[currentPageId].name))
        },
        pageData,
        hideNavigationMenu,
        leftContent,
        rightContent,
        isPlanner: isPlannerRegistration(state)
      };
    },
    {
      navigateToPage: routeToPage,
      openNavigatorDialog,
      closeNavigatorDialog
    }
  )(WebsiteNavigator)
);

function WebsiteNavigator(props) {
  // eslint-disable-next-line react/prop-types
  const { isPlanner, style, translate } = props;
  return isPlanner ? (
    <div />
  ) : (
    <div style={{ minHeight: '1px' }} role="navigation">
      <a
        className={WebsiteNavigatorWidgetClassNames.skipNav}
        style={{
          // eslint-disable-next-line react/prop-types
          borderColor: style.palette.textAccent,
          // eslint-disable-next-line react/prop-types
          color: style.palette.text,
          // eslint-disable-next-line react/prop-types
          backgroundColor: style.palette.accent
        }}
        href="#main"
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'number'.
        tabIndex="0"
      >
        {translate('WebsiteNavigatorWidget_SkipNavigationText_default__resx')}
      </a>
      <WebsiteNavigatorWidget {...props} />
    </div>
  );
}
