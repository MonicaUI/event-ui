import { lazyLoadAction } from '../../utils/lazyLoad';

export const selectAdmissionItem = lazyLoadAction(() =>
  import(/* webpackChunkName: "admissionItems" */ './regCart/admissionItems').then(m => m.selectAdmissionItem)
);

export const unSelectAdmissionItem = lazyLoadAction(() =>
  import(/* webpackChunkName: "admissionItems" */ './regCart/admissionItems').then(m => m.unSelectAdmissionItem)
);
