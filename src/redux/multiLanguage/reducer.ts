import { SET_LOCALE } from 'nucleus-widgets/redux/modules/text';
import { LOAD_LANGUAGE } from './actions';

export default function reducer(state: $TSFixMe, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case SET_LOCALE:
      return {
        ...state,
        locale: action.payload.locale
      };
    case LOAD_LANGUAGE:
      return {
        ...state,
        loadedLanguages: [...state.loadedLanguages, action.payload]
      };
    default:
      return state;
  }
}
