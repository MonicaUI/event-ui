import { merge } from 'lodash';
import getBackground from 'nucleus-widgets/utils/style/getBackground';
import clearImageInTheme from './clearImageInTheme';
import { createSelector } from 'reselect';
export default createSelector(
  state => (state as $TSFixMe).website.theme.global,
  state => (state as $TSFixMe).website.theme.sections,
  (global, sections) => {
    const { dialog: customDialogStyles } = global;
    let customSettings;
    if (customDialogStyles) {
      customSettings = {
        background: {
          ...customDialogStyles.background,
          ...customDialogStyles.body.background
        }
      };
    }
    const style = {
      ...clearImageInTheme(merge({}, global, sections.content1)),
      styleMapping: 'custom',
      customSettings: customSettings || {}
    };
    return getBackground(style, style.customSettings, style.palette);
  }
);
