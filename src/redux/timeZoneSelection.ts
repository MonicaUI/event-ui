export const SELECTED_TIMEZONE = 'event-widgets/timezones/SELECTED_TIMEZONE';

const reducer = (state = {}, action: $TSFixMe): $TSFixMe => {
  switch (action.type) {
    case SELECTED_TIMEZONE: {
      return action.payload;
    }
    default:
      return state;
  }
};

export const setSelectedTimeZone = (selectedTimeZone: $TSFixMe) => {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    dispatch({
      type: SELECTED_TIMEZONE,
      payload: {
        ...selectedTimeZone
      }
    });
  };
};

export default reducer;
