import { RESTORE_ALL_REG_TYPES_FOR_EVENT } from '../actionTypes';
import { eventSnapshotReducer, EVENT_ACTION_PAYLOAD_KEY } from '../snapshot';

const payloadWithMultipleRegTypes = {
  registrationTypes: {
    '00000000-0000-0000-0000-000000000000': {
      id: '00000000-0000-0000-0000-000000000000',
      name: '',
      code: '',
      isOpenForRegistration: true
    },
    '91f7b293-5d0a-4178-aa97-2c9be1d2837d': {
      id: '91f7b293-5d0a-4178-aa97-2c9be1d2837d',
      name: '22',
      code: '22',
      isOpenForRegistration: true
    },
    '463f1495-5b56-49ab-9af9-23822518761d': {
      id: '463f1495-5b56-49ab-9af9-23822518761d',
      name: '33',
      code: '33',
      isOpenForRegistration: true
    },
    'cd76f0b-2ce8-4626-a43c-896999066bea': {
      id: '4cd76f0b-2ce8-4626-a43c-896999066bea',
      name: '11',
      code: '11',
      isOpenForRegistration: true
    },
    'b5ac31ac-6aa6-4257-ac92-f24abcec5fb9': {
      id: 'b5ac31ac-6aa6-4257-ac92-f24abcec5fb9',
      name: '44',
      code: '44',
      isOpenForRegistration: true
    }
  }
};

describe('the eventSnapshotReducer reducer test', () => {
  it('should add reg types contained in the eventsnapshot to state when dispatch RESTORE_ALL_REG_TYPES_FOR_EVENT', () => {
    let state = {
      registrationTypes: {
        '00000000-0000-0000-0000-000000000000': {
          id: '00000000-0000-0000-0000-000000000000',
          name: '',
          code: '',
          isOpenForRegistration: true
        }
      }
    };
    state = eventSnapshotReducer(
      state,
      { type: RESTORE_ALL_REG_TYPES_FOR_EVENT, payload: payloadWithMultipleRegTypes },
      EVENT_ACTION_PAYLOAD_KEY
    );
    expect(state).toEqual(payloadWithMultipleRegTypes);
  });
});

const payloadWithMultipleRegTypesNoDefault = {
  registrationTypes: {
    '91f7b293-5d0a-4178-aa97-2c9be1d2837d': {
      id: '91f7b293-5d0a-4178-aa97-2c9be1d2837d',
      name: '22',
      code: '22',
      isOpenForRegistration: true
    },
    '463f1495-5b56-49ab-9af9-23822518761d': {
      id: '463f1495-5b56-49ab-9af9-23822518761d',
      name: '33',
      code: '33',
      isOpenForRegistration: true
    },
    'cd76f0b-2ce8-4626-a43c-896999066bea': {
      id: '4cd76f0b-2ce8-4626-a43c-896999066bea',
      name: '11',
      code: '11',
      isOpenForRegistration: true
    },
    'b5ac31ac-6aa6-4257-ac92-f24abcec5fb9': {
      id: 'b5ac31ac-6aa6-4257-ac92-f24abcec5fb9',
      name: '44',
      code: '44',
      isOpenForRegistration: true
    }
  }
};

describe('eventSnapshotReducer reducer merge default state with multiple snapshot types test', () => {
  it('should merge default and reg types contained in the eventsnapshot to state when dispatched RESTORE_ALL_REG_TYPES_FOR_EVENT', () => {
    let state = {
      registrationTypes: {
        '00000000-0000-0000-0000-000000000000': {
          id: '00000000-0000-0000-0000-000000000000',
          name: '',
          code: '',
          isOpenForRegistration: true
        }
      }
    };
    state = eventSnapshotReducer(
      state,
      { type: RESTORE_ALL_REG_TYPES_FOR_EVENT, payload: payloadWithMultipleRegTypesNoDefault },
      EVENT_ACTION_PAYLOAD_KEY
    );
    expect(state).toEqual(payloadWithMultipleRegTypes);
  });
});
