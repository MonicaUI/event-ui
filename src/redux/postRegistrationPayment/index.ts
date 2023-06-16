import { lazyLoadAction } from '../../utils/lazyLoad';

export const startPostRegistrationPaymentPage = lazyLoadAction(() =>
  import(/* webpackChunkName: "registration" */ './workflow').then(m => m.startPostRegistrationPaymentPage)
);

export const finalizePostRegistrationPayment = lazyLoadAction(() =>
  import(/* webpackChunkName: "registration" */ './workflow').then(m => m.finalizePostRegistrationPayment)
);

export const continuePostRegistrationPaymentAfterServiceFeesConfirmation = lazyLoadAction(() =>
  import(/* webpackChunkName: "registration" */ './workflow').then(
    m => m.continuePostRegistrationPaymentAfterServiceFeesConfirmation
  )
);
