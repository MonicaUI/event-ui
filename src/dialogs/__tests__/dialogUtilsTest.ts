import { scrollToFieldAndFocus } from '../shared/dialogUtils';
import Fields from '@cvent/event-fields/RegistrationOptionFields.json';

describe('scrollToFieldAndFocus tests -', () => {
  test('mobile field not found', () => {
    jest.useFakeTimers();

    const newElement = document.createElement('input');
    newElement.setAttribute('id', null);
    global.document.body.appendChild(newElement);
    newElement.focus = jest.fn();

    scrollToFieldAndFocus(Fields.mobile.id);
    jest.runAllTimers();
    expect(newElement.focus).not.toBeCalled();
  });
  test('mobile field found', () => {
    jest.useFakeTimers();

    const newInput = document.createElement('input');
    newInput.setAttribute('id', Fields.mobile.id);
    global.document.body.appendChild(newInput);
    newInput.focus = jest.fn();

    scrollToFieldAndFocus(Fields.mobile.id);
    jest.runAllTimers();
    expect(newInput.focus).toBeCalled();
  });
});
