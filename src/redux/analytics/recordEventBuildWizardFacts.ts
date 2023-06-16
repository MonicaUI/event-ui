import { recordFact } from 'nucleus-widgets/utils/analytics/actions';

/**
 * A fact that indicates that Build Wizard is closed on Website Preview Page.
 */
export function recordBuildWizardCloseFact() {
  return (dispatch: $TSFixMe): $TSFixMe => {
    dispatch(
      recordFact({
        type: 'ebw_preview_close'
      })
    );
  };
}

/**
 * A fact that indicates that Launch Event is clicked on Website Preview Page.
 */
export function recordLaunchEventClickFact() {
  return (dispatch: $TSFixMe): $TSFixMe => {
    dispatch(
      recordFact({
        type: 'ebw_preview_launch'
      })
    );
  };
}

/**
 * A fact that indicates that Manage Event is clicked on Website Preview Page.
 */
export function recordManageEventClickFact() {
  return (dispatch: $TSFixMe): $TSFixMe => {
    dispatch(
      recordFact({
        type: 'ebw_preview_manage'
      })
    );
  };
}

/**
 * A fact that indicates that Site Editor is clicked on Website Preview Page.
 */
export function recordSiteEditorClickFact() {
  return (dispatch: $TSFixMe): $TSFixMe => {
    dispatch(
      recordFact({
        type: 'ebw_preview_site_editor'
      })
    );
  };
}

/**
 * A fact that indicates that Test Event is clicked on Website Preview Page.
 */
export function recordTestEventClickFact() {
  return (dispatch: $TSFixMe): $TSFixMe => {
    dispatch(
      recordFact({
        type: 'ebw_preview_test'
      })
    );
  };
}
