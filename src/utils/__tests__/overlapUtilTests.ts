import { overlap } from '../overlapUtil';

const testData = [
  { id: 1, startTime: '2018-08-19T13:00:00.000Z', endTime: '2018-08-19T23:00:00.000Z' },
  { id: 2, startTime: '2018-07-19T13:00:00.000Z', endTime: '2018-07-19T23:00:00.000Z' },
  { id: 3, startTime: '2018-08-19T13:00:00.000Z', endTime: '2018-08-19T23:00:00.000Z' },
  { id: 4, startTime: '2018-07-19T13:00:00.000Z', endTime: '2018-07-19T23:00:00.000Z' },
  { id: 5, startTime: '2020-07-19T13:00:00.000Z', endTime: '2020-07-19T23:00:00.000Z' },
  { id: 6, startTime: '2019-07-19T13:00:00.000Z', endTime: '2019-07-19T23:00:00.000Z' }
];

test('overlapUtil matches snapshot', () => {
  expect(overlap(testData)).toMatchSnapshot();
});
