import { setIn } from 'icepick';

/**
 * Method to clear the image in theme object
 */
export default function clearImageInTheme(theme: $TSFixMe): $TSFixMe {
  return setIn(theme, ['background', 'image'], {});
}
