import React from 'react';
import { throttle } from 'lodash';
import PageBannerStyles from './StickyPageBanner.less';
import { resolveTestId } from '@cvent/nucleus-test-automation';

type State = $TSFixMe;

/**
 * Sticky Page Banner for guestside sites
 */
export default class StickyPageBanner extends React.Component<Record<string, never>, State> {
  static displayName = 'StickyPageBanner';

  setBannerHeight = throttle(() => {
    const theBanner = window.document.getElementsByClassName('sticky-page-banner');
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (theBanner && theBanner.length) {
      this.setState({ height: theBanner[0].scrollHeight });
    }
  }, 200);

  componentDidMount(): $TSFixMe {
    this.setBannerHeight();
    window.addEventListener('resize', this.setBannerHeight);
  }

  componentWillUnmount(): $TSFixMe {
    window.removeEventListener('resize', this.setBannerHeight);
  }

  render(): $TSFixMe {
    const { children } = this.props;
    const placeHolderStyle = {
      height: this.state ? this.state.height : null
    };
    if (children) {
      return (
        <div>
          <div style={placeHolderStyle} />
          <div
            className={`${PageBannerStyles.banner} sticky-page-banner`}
            {...resolveTestId(this.props, '-sticky-page-banner')}
          >
            {children}
          </div>
        </div>
      );
    }
  }
}
