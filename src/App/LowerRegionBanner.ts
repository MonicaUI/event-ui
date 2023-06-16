import { connect } from 'react-redux';
import PageBanner from './PageBanner';
import { injectTestId } from '@cvent/nucleus-test-automation';

const CONFIG = {
  dataCenter: 'us-east-1',
  cluster: 'sg50-cb3-cdkv2',
  bucket: 'data1'
};

/**
 * Lower region banner for more easily retrieving useful information for testing purposes
 */
export default connect((state: $TSFixMe, props: $TSFixMe) => {
  const regCartId =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    state.registrationForm && state.registrationForm.regCart && state.registrationForm.regCart.regCartId;
  const regCartAppSupportUrl =
    'https://appsupport.cvent.net/couchbase-tool/single' +
    `?docId=${props.environment}::event_registration_service::regCart::${regCartId}` +
    `&cluster=${CONFIG.cluster}&bucket=${CONFIG.bucket}&mode=single&dataCenter=${CONFIG.dataCenter}`;

  return {
    ...injectTestId('lower-region'),
    bannerText: 'Reg cart id:',
    bannerLinkText: regCartId,
    bannerLink: regCartAppSupportUrl,
    translate: state.text.translate
  };
})(PageBanner);
