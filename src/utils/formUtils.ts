import FormElementClasses from 'nucleus-core/forms/FormElement.less';

/**
 * Adds a short delay to allow time for the errors to render in order
 * to determine where to scroll.
 */
export const delayedScrollToFirstFormError = (): $TSFixMe => setTimeout(scrollToFirstFormError, 0);
export const delayedScrollToFirstWidgetError = (id: $TSFixMe): $TSFixMe =>
  setTimeout(() => scrollToFirstWidgetError(id), 0);

function scrollToFirstFormError() {
  const errors = global.document.getElementsByClassName(FormElementClasses.formElementWithErrors);
  scrollToFirstError(errors);
}

function scrollToFirstWidgetError(className) {
  const widgets = global.document.getElementsByClassName(className);
  if (widgets.length > 0) {
    const errors = widgets[0].getElementsByClassName(FormElementClasses.formElementWithErrors);
    scrollToFirstError(errors);
  }
}

function scrollToFirstError(errors) {
  if (errors.length > 0) {
    const { left, top } = errors[0].getBoundingClientRect();
    global.scroll(window.pageXOffset + left, window.pageYOffset + top);
    const inputs = errors[0].getElementsByTagName('input');
    if (inputs.length > 0) {
      inputs[0].focus();
    }
  }
}
