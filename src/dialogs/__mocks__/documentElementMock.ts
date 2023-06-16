export const getMockedMessageContainer = (): $TSFixMe => {
  // Mock a DOM to play around
  document.body.innerHTML = `
    <div>
    <div name="messageContainer" tabIndex=-1>message container</div>
    </div>
  `;
  const mockMessageContainerFocus = jest.fn();
  const mockMessageContainer = document.getElementsByName('messageContainer')[0];
  mockMessageContainer.focus = mockMessageContainerFocus;
  return mockMessageContainer;
};

export const getMockedFieldInputs = (fieldNames: $TSFixMe): $TSFixMe => {
  // Mock a DOM to play around
  document.body.innerHTML = `
    <div>
    ${fieldNames.map(fieldName => `<input name=${fieldName}>input-${fieldName}</input>`)}
    </div>
  `;
  const mockInputFocus = jest.fn();
  const mockInputContainers = [];
  fieldNames.forEach(fieldName => {
    const mockInputContainer = document.getElementsByName(fieldName)[0];
    mockInputContainer.focus = mockInputFocus;
    mockInputContainers.push(mockInputContainer);
  });
  return mockInputContainers;
};
