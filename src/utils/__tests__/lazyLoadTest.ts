import { lazyLoadAction } from '../lazyLoad';

describe('Test lazyLoad Util', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dialogContainer = require('nucleus-guestside-site/src/redux/modules/dialogContainer');
  jest.spyOn(dialogContainer, 'withLoading');

  test('should exist', () => {
    expect(typeof lazyLoadAction()).toBe('function');
  });
  test('for withPageTransition true', () => {
    lazyLoadAction(() => {}, true);
    expect(dialogContainer.withLoading).toHaveBeenCalledWith(expect.any(Function), true);
  });
  test('for withPageTransition false', () => {
    lazyLoadAction(() => {}, false);
    expect(dialogContainer.withLoading).toHaveBeenCalledWith(expect.any(Function), false);
  });
  test('for default case', () => {
    lazyLoadAction(() => {});
    expect(dialogContainer.withLoading).toHaveBeenCalledWith(expect.any(Function), false);
  });
});
