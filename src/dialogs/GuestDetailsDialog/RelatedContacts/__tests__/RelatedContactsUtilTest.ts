import { getSortedGroupsForRelatedContacts } from '../RelatedContactsUtil';

const relatedContacts = [
  {
    firstName: 'firstName1',
    lastName: 'lastName1',
    emailAddress: 'emailAddress1',
    relatedContactStub: 'relatedContactStub1'
  },
  {
    firstName: 'firstName2',
    lastName: 'lastName2',
    emailAddress: 'emailAddress2',
    relatedContactStub: 'relatedContactStub2'
  },
  {
    firstName: 'zfirstName3',
    lastName: 'lastName3',
    emailAddress: 'emailAddress3',
    relatedContactStub: 'relatedContactStub3'
  },
  {
    firstName: 'zfirstName4',
    lastName: 'lastName4',
    emailAddress: 'emailAddress4',
    relatedContactStub: 'relatedContactStub4'
  }
];

const groupedContacts = [
  {
    groupName: 'F',
    relatedContacts: [
      {
        firstName: 'firstName1',
        lastName: 'lastName1',
        emailAddress: 'emailAddress1',
        relatedContactStub: 'relatedContactStub1'
      },
      {
        firstName: 'firstName2',
        lastName: 'lastName2',
        emailAddress: 'emailAddress2',
        relatedContactStub: 'relatedContactStub2'
      }
    ]
  },
  {
    groupName: 'Z',
    relatedContacts: [
      {
        firstName: 'zfirstName3',
        lastName: 'lastName3',
        emailAddress: 'emailAddress3',
        relatedContactStub: 'relatedContactStub3'
      },
      {
        firstName: 'zfirstName4',
        lastName: 'lastName4',
        emailAddress: 'emailAddress4',
        relatedContactStub: 'relatedContactStub4'
      }
    ]
  }
];

const relatedContactsWithEmptyFirstNameElement = [
  {
    firstName: '',
    lastName: 'lastName1',
    emailAddress: 'emailAddress1',
    relatedContactStub: 'relatedContactStub1'
  },
  {
    firstName: 'firstName2',
    lastName: 'lastName2',
    emailAddress: 'emailAddress2',
    relatedContactStub: 'relatedContactStub2'
  }
];

const groupedContactsWithEmptyFirstNameElement = [
  {
    groupName: '',
    relatedContacts: [
      {
        firstName: '',
        lastName: 'lastName1',
        emailAddress: 'emailAddress1',
        relatedContactStub: 'relatedContactStub1'
      }
    ]
  },
  {
    groupName: 'F',
    relatedContacts: [
      {
        firstName: 'firstName2',
        lastName: 'lastName2',
        emailAddress: 'emailAddress2',
        relatedContactStub: 'relatedContactStub2'
      }
    ]
  }
];

it('Related Contacts are correctly grouped with sorting', () => {
  const groupedRelatedContacts = getSortedGroupsForRelatedContacts(relatedContacts);
  expect(groupedRelatedContacts).toEqual(groupedContacts);
});

it('Related Contacts are correctly grouped with empty firstNames', () => {
  const groupedRelatedContacts = getSortedGroupsForRelatedContacts(relatedContactsWithEmptyFirstNameElement);
  expect(groupedRelatedContacts).toEqual(groupedContactsWithEmptyFirstNameElement);
});
