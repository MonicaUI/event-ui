/* eslint-disable import/unambiguous */
/**
 * Mock css module that resolves look-ups for a css class to the value of the key used for the lookup, e.g. x.y => 'y'
 */
function newCssModule() {
  return new Proxy({}, {
    get: function getter(target, key) {
      if ({}[key]) {
        return {}[key];
      }
      if (key === '__esModule') {
        return false;
      }
      return key;
    }
  });
}

Object.defineProperty(module, 'exports', {
  get() {
    return newCssModule();
  }
});
