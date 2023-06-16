import React from 'react';
import { GuestDetailsForm } from '../GuestDetailsForm';
import { shallow } from 'enzyme';

const getGuestDetailsPage = () => {
  return <div>Dummy Page</div>;
};

describe('test GuestDetailsForm', () => {
  it('to render guest details page', async () => {
    const dialog = shallow(
      <GuestDetailsForm
        dialogConfig={{}}
        guestDetailsPage={getGuestDetailsPage()}
        showRelatedContactsView={false}
        translate={text => text}
      />
    );
    let dialogElement = dialog.find('StandardDialog').dive();
    expect(dialogElement).toHaveLength(1);
    dialogElement = dialogElement.find('Form');
    expect(dialogElement).toHaveLength(1);
  });

  it('to not render guest details page', async () => {
    const dialog = shallow(
      <GuestDetailsForm
        dialogConfig={{}}
        guestDetailsPage={getGuestDetailsPage()}
        showRelatedContactsView
        translate={text => text}
      />
    );
    let dialogElement = dialog.find('StandardDialog').dive();
    expect(dialogElement).toHaveLength(1);
    dialogElement = dialogElement.find('Form');
    expect(dialogElement).toHaveLength(0);
  });
});
