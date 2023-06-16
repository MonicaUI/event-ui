import reducer, { getUserType } from '../defaultUserSession';

test('Verify initial state', () => {
  expect(reducer(undefined, {})).toMatchSnapshot();
});

test('getUserType', () => {
  expect(getUserType({ isPlanner: true })).toBe('planner');
  expect(getUserType({ isPreview: true })).toBe('preview');
  expect(getUserType({})).toBe('standard');
  expect(getUserType()).toBe('standard');
});
