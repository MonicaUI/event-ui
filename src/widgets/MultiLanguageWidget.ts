import { connect } from 'react-redux';
import MultiLanguageWidget from 'event-widgets/lib/MultiLanguage/MultiLanguageWidget';
import { loadLanguage } from '../redux/multiLanguage/actions';

/**
 * Data wrapper for the multi language widget
 */
export default connect(
  (state: $TSFixMe) => {
    return {
      locales: state.event.eventLocalesSetup.eventLocales,
      hideWhenOneLanguage: true
    };
  },
  { loadLanguage }
)(MultiLanguageWidget);
