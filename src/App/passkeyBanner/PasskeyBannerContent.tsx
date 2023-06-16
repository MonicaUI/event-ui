import React from 'react';
import PageBannerStyles from './PasskeyBanner.less';
import Icon from '@cvent/nucleus-icon';
import { injectTestId } from '@cvent/nucleus-test-automation';
import PropTypes from 'prop-types';
import { tapOrClick } from 'nucleus-core/touchEventHandlers';
import ThemeableComponent from 'nucleus-widgets/lib/ThemeableComponent';
import { resolve } from '@cvent/nucleus-dynamic-css';
import Button from 'nucleus-core/buttons/Button';

/**
 * passkey banner's content
 */
export default class PasskeyBannerContent extends ThemeableComponent<$TSFixMe, $TSFixMe> {
  static displayName = 'PasskeyBannerContent';

  static propTypes = {
    style: PropTypes.object,
    translate: PropTypes.func.isRequired,
    icon: PropTypes.string,
    title: PropTypes.string,
    contentDetails: PropTypes.object,
    passkeyBookings: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired
      })
    ).isRequired,
    actionButtons: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        callback: PropTypes.func,
        isPrimary: PropTypes.bool
      })
    )
  };

  static defaultProps = {
    classes: { ...PageBannerStyles }
  };

  getElementInlineStyle: $TSFixMe;
  props: $TSFixMe;

  getStyleObject(): $TSFixMe {
    return {
      colorPalette: this.props.style.palette,
      header: this.getElementInlineStyle('header'),
      content: this.getElementInlineStyle('content'),
      primaryButton: this.getElementInlineStyle('primaryButton'),
      secondaryButton: this.getElementInlineStyle('secondaryButton')
    };
  }

  render(): $TSFixMe {
    const { title, classes, icon, contentDetails, translate, actionButtons, passkeyBookings } = this.props;
    const style = this.getStyleObject();
    return (
      <div className={PageBannerStyles.wrapper} style={{ backgroundColor: style.colorPalette.primary }}>
        <div className={PageBannerStyles.iconWrapper} style={{ color: style.header.color }}>
          <Icon modifier={PageBannerStyles.icon} fallbackText={translate('_attention__resx')} icon={icon} />
        </div>
        <div className={PageBannerStyles.contentWrapper}>
          <h4 {...resolve({ style, classes }, 'header')}>{translate(title)}</h4>
          <div {...resolve({ style, classes }, 'content')}>{translate(contentDetails)}</div>
          {passkeyBookings.map(booking => (
            <div key={booking.hotelReservationDetailId} className={PageBannerStyles.actionBar}>
              {actionButtons.map(b => {
                return (
                  <Button
                    key={b.name}
                    style={{ ...style, button: b.isPrimary ? style.primaryButton : style.secondaryButton }}
                    {...injectTestId(`passkey-banner-button-${b.name}`)}
                    {...tapOrClick(() => b.callback(booking.hotelReservationDetailId))}
                    title={translate(b.text)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
