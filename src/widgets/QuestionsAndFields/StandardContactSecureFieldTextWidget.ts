import { connect } from 'react-redux';
import baseStandardFieldTextWidget from './BaseStandardFieldTextWidget';
import StandardContactFields from 'event-widgets/lib/StandardContactFields/StandardContactFields';
import { shouldSecureContactFieldBePrepopulated } from '../../redux/selectors/currentRegistrant';
import { evaluateQuestionVisibilityLogic } from '../../redux/actions';

export default connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    const widgetType = StandardContactFields[props.config.fieldId].regApiPath[0];
    return {
      secureMode: true,
      isPrepopulated: shouldSecureContactFieldBePrepopulated(state, widgetType)
    };
  },
  { evaluateQuestionVisibilityLogic }
)(baseStandardFieldTextWidget());
