import status from './status';
import { combineReducers } from 'redux';

import form from './form';
import currentLogin from './currentLogin';

export default combineReducers({ form, status, currentLogin });
