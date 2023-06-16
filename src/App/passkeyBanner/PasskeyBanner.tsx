import React from 'react';
import { connect } from 'react-redux';
import StickyPageBanner from '../StickyPageBanner';
import PasskeyBannerContent from './PasskeyBannerContent';
import { getActivePasskeyBookings } from '../../redux/selectors/currentRegistrant';
import { getCurrentPageId } from '../../redux/pathInfo';
import { modifyPasskeyRequest } from '../../redux/travelCart/passkeyHotelRequest';
import { CANCELLATION } from '../../redux/website/registrationProcesses';

// eslint-disable-next-line react/prop-types
const PasskeyBanner = ({ translate, isCancellationPage, passkeyBookings, onCancelRequest, style }) => {
  // eslint-disable-next-line react/prop-types
  const showPasskeyBanner = isCancellationPage && passkeyBookings.length > 0;
  return showPasskeyBanner ? (
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    <StickyPageBanner>
      <PasskeyBannerContent
        translate={translate}
        passkeyBookings={passkeyBookings}
        actionButtons={[
          {
            name: 'cancel',
            text: 'EventWidgets_Passkey_RegCancelStickyCancelButton__resx',
            callback: onCancelRequest,
            isPrimary: true
          }
        ]}
        icon="attentionWarning"
        contentDetails={<span>{translate('EventWidgets_Passkey_RegCancelStickyFirstLine__resx')}</span>}
        style={style}
        title="EventWidgets_Passkey_RegCancelStickyHeader__resx"
      />
    </StickyPageBanner>
  ) : null;
};

const getBannerStyle = globalTheme => {
  return {
    ...globalTheme,
    header: { styleMapping: 'text1' },
    content: { styleMapping: 'body1' },
    primaryButton: { styleMapping: 'primaryButton' },
    secondaryButton: { styleMapping: 'secondaryButton' }
  };
};

const mapStateToProps = (state: $TSFixMe) => {
  const { global } = state.website.theme;
  return {
    translate: state.text.translate,
    passkeyBookings: getActivePasskeyBookings(state),
    isCancellationPage: CANCELLATION.isTypeOfPage(state, getCurrentPageId(state)),
    style: getBannerStyle(global)
  };
};

const mapDispatchToProps = {
  onCancelRequest: modifyPasskeyRequest
};

export default connect(mapStateToProps, mapDispatchToProps)(PasskeyBanner);
