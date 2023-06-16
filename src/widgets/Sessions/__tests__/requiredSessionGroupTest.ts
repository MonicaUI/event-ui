import { buildRequiredSessionGroupValidation } from '../SessionGroupRequiredError';

const getCurrentRegistrants = () => [
  {
    eventRegistrationId: 'primary',
    sessionRegistrations: {},
    attendee: {
      personalInformation: {
        firstName: 'primary',
        lastName: 'a'
      }
    }
  },
  {
    eventRegistrationId: 'guest1',
    sessionRegistrations: {},
    attendee: {
      personalInformation: {
        firstName: 'guest',
        lastName: '1'
      }
    }
  },
  {
    eventRegistrationId: 'guest2',
    sessionRegistrations: {},
    attendee: {
      personalInformation: {
        firstName: 'guest',
        lastName: '2'
      }
    }
  },
  {
    eventRegistrationId: 'guest3',
    sessionRegistrations: {},
    attendee: {
      personalInformation: {
        firstName: 'guest',
        lastName: '3'
      }
    }
  },
  {
    eventRegistrationId: 'guest4',
    sessionRegistrations: {},
    attendee: {
      personalInformation: {
        firstName: 'guest',
        lastName: '4'
      }
    }
  }
];

const getSessionGroup = () => ({
  visibleEventReg: ['primary', 'guest1', 'guest2', 'guest4'],
  sessions: {
    sessionA: {},
    sessionB: {}
  }
});

const fakeTranslate = jest.fn((key, tokens) => `[${key}: ${JSON.stringify(tokens)}]`);

const getValidation = ({
  currentRegistrants = getCurrentRegistrants(),
  sessionGroup = getSessionGroup(),
  translate = fakeTranslate,
  showRegistrantsInValidationMessages = false
}) =>
  buildRequiredSessionGroupValidation({
    currentRegistrants,
    validationObjects: {
      requiredSessionGroup: sessionGroup
    },
    translate,
    showRegistrantsInValidationMessages
  });

describe('validator()', () => {
  it('should pass validation', () => {
    const currentRegistrants = getCurrentRegistrants();
    currentRegistrants[0].sessionRegistrations = {
      sessionB: {
        requestedAction: 'REGISTER'
      }
    };

    const sessionGroup = {
      ...getSessionGroup(),
      visibleEventReg: ['primary']
    };

    const validation = getValidation({
      currentRegistrants,
      sessionGroup
    });

    expect(validation.requiredSessionGroup.validator()).toBeTruthy();
  });

  it('should fail validation', () => {
    const validation = getValidation({});

    expect(validation.requiredSessionGroup.validator()).toBeFalsy();
  });
});

describe('errorMessage()', () => {
  it('should show generic message', () => {
    const validation = getValidation({});

    expect(validation.requiredSessionGroup.errorMessage()).toMatchSnapshot();
  });

  it('should list the registrants', () => {
    const validation = getValidation({ showRegistrantsInValidationMessages: true });

    expect(validation.requiredSessionGroup.errorMessage()).toMatchSnapshot();
  });
});
