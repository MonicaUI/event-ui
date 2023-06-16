import appointmentsReducer, {
  loadApptEventData,
  LOAD_APPT_EVENT_DATA,
  loadExhibitorsList,
  LOAD_EXHIBITORS,
  getExhibitorCustomFields,
  LOAD_CUSTOM_FIELDS
} from 'event-widgets/redux/modules/appointments';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let store;

describe('Appointments redux', () => {
  beforeEach(() => {
    store = mockStore({
      event: { id: 'testId' },
      appointments: {
        appointmentEvent: { apptEventId: 'testId' },
        exhibitors: undefined
      },
      clients: {
        appointmentsClient: {
          getApptEventDetails: async () => {},
          getGuestExhibitorsList: async () => {},
          getGuestExhibitorCustomFields: async () => {},
          getExhibitorsList: async () => {},
          getExhibitorCustomFields: async () => {}
        }
      }
    });
    store.clearActions();
  });

  it('should create an action to load the appt event data', async () => {
    await store.dispatch(loadApptEventData());
    const action = store.getActions()[0];
    expect(action.type).toEqual(LOAD_APPT_EVENT_DATA);
  });
  it('should create an action to load the list of exhibitors', async () => {
    await store.dispatch(loadExhibitorsList(true));
    const action = store.getActions()[0];
    expect(action.type).toEqual(LOAD_EXHIBITORS);
  });
  it('should create an action to load the list of custom fields', async () => {
    await store.dispatch(getExhibitorCustomFields());
    const action = store.getActions()[0];
    expect(action.type).toEqual(LOAD_CUSTOM_FIELDS);
  });
});

describe('Appointments reducer', () => {
  it('should update appointment event', () => {
    const appointmentEvent = { abc: '123' };
    const state = { state: 'tx' };

    expect(
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ state: string; }' is not assig... Remove this comment to see the full error message
      appointmentsReducer(state, {
        type: LOAD_APPT_EVENT_DATA,
        payload: { appointmentEvent }
      })
    ).toEqual({ ...state, appointmentEvent });

    expect(
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ state: string; }' is not assig... Remove this comment to see the full error message
      appointmentsReducer(state, {
        type: 'OTHER',
        payload: { appointmentEvent }
      })
    ).toEqual(state);
  });

  it('should update appointment exhibitors', () => {
    const exhibitors = [{ id: '123', name: 'Ex Name', exhibitorCustomFields: [] }];
    const state = { state: 'al' };

    expect(
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ state: string; }' is not assig... Remove this comment to see the full error message
      appointmentsReducer(state, {
        type: LOAD_EXHIBITORS,
        payload: { exhibitors }
      }).exhibitors
    ).toEqual([{ ...exhibitors[0], answersMap: {} }]);

    expect(
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ state: string; }' is not assig... Remove this comment to see the full error message
      appointmentsReducer(state, {
        type: 'OTHER',
        payload: { exhibitors }
      })
    ).toEqual(state);
  });

  it('should update appointment exhibitor custom fields', () => {
    const exhibitorCustomFields = [{ question: { id: 'test' } }];
    const state = { state: 'al' };

    expect(
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ state: string; }' is not assig... Remove this comment to see the full error message
      appointmentsReducer(state, {
        type: LOAD_CUSTOM_FIELDS,
        payload: { exhibitorCustomFields }
      }).exhibitorCustomFields
    ).toEqual(exhibitorCustomFields);

    expect(
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ state: string; }' is not assig... Remove this comment to see the full error message
      appointmentsReducer(state, {
        type: 'OTHER',
        payload: { exhibitorCustomFields }
      })
    ).toEqual(state);
  });
});
