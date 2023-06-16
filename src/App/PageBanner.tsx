import React from 'react';
import PageBannerStyles from './PageBanner.less';
import { resolveTestId } from '@cvent/nucleus-test-automation';
import { injectTestId } from '@cvent/nucleus-test-automation';
import { tapOrClick } from 'nucleus-core/touchEventHandlers';
import Icon from '@cvent/nucleus-icon';
import LinkButton from 'nucleus-widgets/lib/LinkButton/LinkButton';

type Props = {
  bannerText?: string;
  bannerHelpText?: string;
  translate: $TSFixMeFunction;
  closeBannerHandler?: $TSFixMeFunction;
  regType?: string;
  regPath?: string;
  isDefaultRegPath?: boolean;
  bannerLink?: string;
  bannerLinkText?: string;
};

/**
 * Page banner for guestside sites.
 * NOTE: This component sits in event-guestside-site while evolving. Eventually moving to nucleus-core for reusing
 */
export default class PageBanner extends React.Component<Props> {
  static displayName = 'PageBanner';

  render(): $TSFixMe {
    const {
      bannerText,
      bannerHelpText,
      translate,
      closeBannerHandler,
      regType,
      regPath,
      isDefaultRegPath,
      bannerLink,
      bannerLinkText
    } = this.props;
    const regTypeInfo = regType && (
      <div>
        {translate('EventGuestSide_PageBanner_RegistrationType__resx', { regType })}
        <br />
      </div>
    );
    const regPathInfo = regPath && (
      <div>
        {translate('EventGuestSide_PageBanner_RegistrationPath__resx', { regPath })}
        &nbsp;
        {isDefaultRegPath && translate('EventGuestSide_PageBanner_Default__resx')}
      </div>
    );
    const aside = (
      <div className={PageBannerStyles.aside}>
        {regTypeInfo}
        {regPathInfo}
      </div>
    );

    return (
      <div className={PageBannerStyles.banner} {...resolveTestId(this.props, '-page-banner')}>
        <span>{translate(bannerText)}</span>
        {bannerLink && bannerLinkText && <LinkButton text={bannerLinkText} url={bannerLink} linkTarget="_blank" />}
        {bannerHelpText && (
          <div className={PageBannerStyles.bannerHelp}>
            <span>{translate(bannerHelpText)}</span>
          </div>
        )}
        <div className={PageBannerStyles.actionSection}>
          {aside}
          {closeBannerHandler && (
            <ul className={PageBannerStyles.actionList}>
              <li key="close" className={PageBannerStyles.actionExit}>
                <button
                  {...injectTestId('page-banner-close-button')}
                  aria-label={translate('_close__resx')}
                  {...tapOrClick(closeBannerHandler)}
                  className={PageBannerStyles.exitEditor}
                  type="button"
                >
                  <Icon
                    modifier={PageBannerStyles.exitIcon}
                    fallbackText={translate('_close__resx')}
                    icon="closeDeleteFilled"
                  />
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    );
  }
}
