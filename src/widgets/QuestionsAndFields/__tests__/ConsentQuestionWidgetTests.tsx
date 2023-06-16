import React from 'react';
import ConsentQuestionWidget from '../ConsentQuestionWidget';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from '../../../redux/configureStore';
import WidgetFactory from '../../../widgetFactory';
import Grid from 'nucleus-core/layout/flexbox/Grid';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';

const consentQuestions = {
  consentQuestion: {
    question: {
      code: 'code',
      questionTypeInfo: {
        questionType: 'MultiChoice',
        isConsent: true,
        exports: [],
        displayType: 'Horizontal',
        answerPlacement: 'Below',
        choiceSortOrder: 'AToZ'
      },
      choice: {
        optIn: {
          id: 'I agree',
          text: 'I agree'
        },
        optInRequired: true
      },
      id: 'consentQuestion',
      questionText: 'Consent Question',
      html: 'Consent Question html'
    }
  }
};

const initialState = () => {
  const registrationQuestions = {
    ...consentQuestions
  };
  return {
    website: {
      siteInfo: {
        sharedConfigs: {}
      }
    },
    widgetFactory: new WidgetFactory(),
    appData: {
      registrationSettings: {
        registrationQuestions,
        productQuestions: {}
      }
    },
    registrationForm: {
      currentEventRegistrationId: 'eventRegistration1',
      regCart: {
        eventRegistrations: {
          eventRegistration1: {
            productRegistrations: [
              {
                productId: 'admissionItemAId',
                productType: 'AdmissionItem',
                quantity: 1,
                requestedAction: 'REGISTER'
              }
            ],
            sessionRegistrations: {
              sessionId: {
                productId: 'sessionId',
                requestedAction: 'REGISTER'
              }
            },
            registrationPathId: 'regPathId'
          }
        }
      }
    }
  };
};

const defaultProps = {
  translate: (resx, opts) => (opts ? `${resx}:${JSON.stringify(opts)}` : resx),
  style: {},
  classes: {}
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('consent question renders and allows you to check checkbox', async () => {
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
  const store = configureStore(initialState(false));
  const component = mount(
    <Provider store={store}>
      <Grid>
        <ConsentQuestionWidget {...defaultProps} config={{ id: 'consentQuestion' }} type="ConsentQuestion" />
      </Grid>
    </Provider>
  );

  // unanswered view
  expect(component).toMatchSnapshot();

  // check the consent checkbox
  component
    .find('[data-cvent-id="option-consentQuestion_0"] input[type="checkbox"]')
    .simulate('change', { target: { checked: true } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();

  // uncheck the consent checkbox
  component
    .find('[data-cvent-id="option-consentQuestion_0"] input[type="checkbox"]')
    .simulate('change', { target: { checked: false } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
});

test('consent question renders and allows invitee to check checkbox for guest', async () => {
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
  const store = configureStore(initialState(false));
  const component = mount(
    <Provider store={store}>
      <Grid>
        <ConsentQuestionWidget
          {...defaultProps}
          config={{
            id: 'consentQuestion',
            registrationFieldPageType: registrationFieldPageType.GuestRegistration
          }}
          type="ConsentQuestion"
        />
      </Grid>
    </Provider>
  );

  // unanswered view
  expect(component).toMatchSnapshot();

  // check the consent checkbox
  component
    .find('[data-cvent-id="option-consentQuestion_0"] input[type="checkbox"]')
    .simulate('change', { target: { checked: true } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.currentGuestEventRegistration.attendee).toMatchSnapshot();

  // uncheck the consent checkbox
  component
    .find('[data-cvent-id="option-consentQuestion_0"] input[type="checkbox"]')
    .simulate('change', { target: { checked: false } });
  await wait(0);
  expect(component).toMatchSnapshot();
  expect(store.getState().registrationForm.regCart.eventRegistrations.eventRegistration1.attendee).toMatchSnapshot();
});
