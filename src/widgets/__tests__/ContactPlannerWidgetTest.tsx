import React from 'react';
import renderer from 'react-test-renderer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import dialogContainer, { closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { openContactPlannerDialog } from '../../dialogs';
import { wait } from '../../testUtils';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { Provider } from 'react-redux';

const widgetStyles = {
  contactUsModalStyles: {
    modalFieldStyles: {
      backgroundColor: '#FFFFFF',
      borderColor: '#DDE2E6',
      borderRadius: 6,
      borderStyle: 'solid',
      borderWidth: 2,
      color: '#273F69',
      fontFamily: 'PT Sans, sans-serif',
      fontSize: 18,
      fontStyle: 'normal',
      fontWeight: 400,
      hover: 'css-87ndg2',
      lineHeight: '1.3',
      paddingBottom: 5,
      paddingLeft: 5,
      paddingRight: 5,
      paddingTop: 5,
      textAlign: 'left'
    },
    modalLabelStyles: {
      backgroundColor: 'transparent',
      borderRadius: 0,
      color: '#4287FE',
      fontFamily: 'PT Sans, sans-serif',
      fontSize: 18,
      fontStyle: 'normal',
      fontWeight: 400,
      hover: 'css-87ndb2',
      lineHeight: '1.3',
      paddingBottom: 5,
      paddingLeft: 5,
      paddingRight: 5,
      paddingTop: 5
    },
    modalPlannerNameStyles: {
      backgroundColor: 'transparent',
      borderRadius: 0,
      color: '#FDFDA6',
      fontFamily: 'PT Sans, sans-serif',
      fontSize: 16,
      fontStyle: 'normal',
      fontWeight: 400,
      hover: 'css-87ndg2',
      lineHeight: '1.3',
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0
    },
    modalSendButtonStyles: {
      backgroundColor: '#041532',
      borderRadius: 6,
      borderStyle: 'solid',
      borderWidth: 1,
      color: '#FFFFFF',
      fontFamily: 'PT Sans, sans-serif',
      fontSize: '1.8125rem',
      fontStyle: 'normal',
      fontWeight: 400,
      hover: 'css-87ndg2',
      lineHeight: '1.3',
      paddingBottom: 5,
      paddingLeft: '1.5625rem',
      paddingRight: '1.5625rem',
      paddingTop: 5,
      textAlign: 'center'
    }
  }
};

const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    text: (x = {}) => x,
    website: (x = {}) => x,
    contactForm: (x = {}) => x,
    contactPlanner: (x = {}) => x
  }),
  {
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    },
    website: {
      theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
    },
    contactForm: {
      senderEmailAddress: 'jeff.bezos@amazon.com',
      message: 'Great event Reg, looking forward to the next.',
      autoFocus: false
    },
    contactPlanner: {},
    userSession: {}
  }
);

beforeEach(() => {
  store.dispatch(closeDialogContainer());
});

describe('ContactPlannerDialog', () => {
  it('Renders', async () => {
    const dialogConfig = {
      contactInfo: {
        firstName: 'Reggie',
        lastName: 'Aggarwal',
        displayEmail: 'reg@cvent.com',
        emailAddress: 'reggie.aggarwal@cvent.com',
        phoneNumber: '123-456-789',
        company: 'Cvent'
      }
    };
    await store.dispatch(openContactPlannerDialog(dialogConfig, dialogConfig.contactInfo, widgetStyles));
    await wait(0);

    const dialog = store.getState().dialogContainer.dialog;
    expect(dialog.isOpen).toBeTruthy();
    const dialogComponent = renderer.create(<Provider store={store}>{dialog.children}</Provider>);
    expect(dialogComponent).toMatchSnapshot();
  });
});
