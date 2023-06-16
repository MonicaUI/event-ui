import React from 'react';
import { mount } from 'enzyme';
import ContactForm from '../ContactForm';
import ContactPlannerForm from '../ContactPlannerForm';

let props = {
  translate: () => {},
  onChange: () => {},
  onSubmit: () => {},
  contactInfo: {},
  classes: {},
  style: {},
  senderEmailAddress: '',
  message: ''
};

describe('contactFormDialog', () => {
  test('handleEnter method call', () => {
    const contactForm = mount(<ContactForm {...props} />);
    const event = { key: 'Enter' };
    const formInstance = contactForm.instance();
    formInstance.formRef.current = {
      nucleusForm: {
        actions: {
          submitForm: jest.fn(() => ({ catch: () => {} }))
        }
      }
    };

    // handle enter method triggered
    formInstance.handleEnter(event);
    const contactFormRef = formInstance.formRef.current;
    expect(contactFormRef.nucleusForm.actions.submitForm).toHaveBeenCalledWith(props.onSubmit, {
      validateBeforeSubmit: true
    });
  });
  test('Should close popup on clicking close button', () => {
    props = {
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ title: string; senderEmailAddress: string;... Remove this comment to see the full error message
      title: 'Dummy title',
      senderEmailAddress: '',
      message: '',
      requestClose: jest.fn(),
      translate: jest.fn(),
      onChange: jest.fn(),
      onSubmit: jest.fn(),
      contactInfo: {
        firstName: 'Reetika',
        lastName: 'Raj',
        emailAddress: 'r.raj@cvent.com'
      },
      resetContactForm: jest.fn(),
      contactPlannerSuccess: false,
      contactPlannerError: false,
      resetContactPlanner: jest.fn(),
      autoFocus: true,
      classes: {},
      style: {}
    };
    // @ts-expect-error ts-migrate(2739) FIXME: Type '{ translate: () => void; onChange: () => voi... Remove this comment to see the full error message
    const wrapper = mount(<ContactPlannerForm {...props} />);
    wrapper.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    expect((props as $TSFixMe).requestClose).toHaveBeenCalled();
    expect((props as $TSFixMe).resetContactForm).toHaveBeenCalled();
    expect((props as $TSFixMe).resetContactPlanner).toHaveBeenCalled();
  });
});
