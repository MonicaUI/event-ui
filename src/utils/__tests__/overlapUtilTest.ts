import { overlap } from '../overlapUtil';

/* Overlapping Entities*/
const overlappingEntities = [
  {
    id: 1,
    startTime: '2018-08-31T10:00:00.000Z',
    endTime: '2018-08-31T11:00:00.000Z'
  },
  {
    id: 2,
    startTime: '2018-08-31T10:00:00.000Z',
    endTime: '2018-08-31T11:00:00.000Z'
  },
  {
    id: 3,
    startTime: '2018-08-31T13:00:00.000Z',
    endTime: '2018-08-31T14:00:00.000Z'
  }
];

/* Non Overlapping Entities*/
const nonOverlappingEntities = [
  {
    id: 1,
    startTime: '2018-08-31T10:00:00.000Z',
    endTime: '2018-08-31T11:00:00.000Z'
  },
  {
    id: 2,
    startTime: '2018-08-27T10:00:00.000Z',
    endTime: '2018-08-27T11:00:00.000Z'
  },
  {
    id: 3,
    startTime: '2018-08-27T11:00:00.000Z',
    endTime: '2018-08-27T12:00:00.000Z'
  }
];

describe('Test overlap Util', () => {
  test('should exist', () => {
    expect(typeof overlap).toBe('function');
  });
  test('for overlapping entities', () => {
    const result = overlap(overlappingEntities);
    expect(result.overlap).toBe(true);
  });
  test('for non-overlapping entities', () => {
    const result = overlap(nonOverlappingEntities);
    expect(result.overlap).toBe(false);
  });
});
