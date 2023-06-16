import baseStandardFieldTextWidget from './BaseStandardFieldTextWidget';
import { connect } from 'react-redux';
import { evaluateQuestionVisibilityLogic } from '../../redux/actions';

export default connect(null, { evaluateQuestionVisibilityLogic })(baseStandardFieldTextWidget());
