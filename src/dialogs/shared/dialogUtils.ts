/**
 * A method that takes in the ID of an HTML element and will scroll
 * to and focus on that HTML Element if it exists.
 */
export const scrollToFieldAndFocus = (fieldId: string): void => {
  const mobile = global.document.getElementById(fieldId);
  if (mobile) {
    setTimeout(() => {
      const { left, top } = mobile.getBoundingClientRect();
      global.scroll(window.pageXOffset + left, window.pageYOffset + top);
      mobile.focus();
    }, 400);
  }
};
