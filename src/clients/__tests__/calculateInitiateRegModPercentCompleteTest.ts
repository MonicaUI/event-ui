import calculateInitiateRegModPercentComplete from '../calculateInitiateRegModPercentComplete';

test('calculates percentage', () => {
  expect(calculateInitiateRegModPercentComplete(150, 30)).toBe(80);
});

test('handles initial position of zero', () => {
  expect(calculateInitiateRegModPercentComplete(0, 30)).toBe(100);
});
