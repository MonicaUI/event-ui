import { recordSpeakerFileDownloadActivity } from '../Speakers/SpeakersWidget';
import { RECORD_FACT } from 'nucleus-widgets/utils/analytics/actions';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';

const mockStore = configureMockStore([thunk]);
const mockPublishAttendeeActivityFact = jest.fn();
const store = {
  getState() {
    return {
      clients: {
        eventGuestClient: {
          publishAttendeeActivityFact: mockPublishAttendeeActivityFact
        }
      },
      event: {
        id: '00000000-0000-0000-0000-00000000',
        speakerInfoSnapshot: {
          categoryOrder: {
            '04a78fdc-833a-4362-b016-43f30011bc39': 1,
            '4392b7bf-9619-4729-b7c6-0c74de1f2761': 3,
            'beace295-2b18-4149-a8be-23729681dac1': 4
          },
          speakers: {
            '6ea3bc8d-c556-42f1-a351-53c720a4adfd': {
              id: '6ea3bc8d-c556-42f1-a351-53c720a4adfd',
              categoryId: '4392b7bf-9619-4729-b7c6-0c74de1f2761',
              firstName: 'First',
              lastName: 'Last',
              prefix: 'Mr',
              company: 'comp',
              title: 'title goes here',
              code: 'FirstLast',
              biography: 'Bio goes here',
              designation: 'Designation goes here.',
              displayOnWebsite: true,
              internalNote: 'internal note goes here.',
              facebookUrl: 'http://www.fb.com',
              twitterUrl: 'http://www.twitter.com',
              linkedInUrl: 'http://www.linkedin.com',
              emailAddress: 'Test@test.com',
              order: 1,
              profileImageFileName: 'sample.png',
              profileImageUri: 'https://silo408-custom.core.cvent.org/DBE7C534/files/event/396f58a2a3c.png',
              documents: {
                '0fe53ba6-a2bc-4282-9f2d-8ee4131c07f5': {
                  id: '0fe53ba6-a2bc-4282-9f2d-8ee4131c07f5',
                  name: 'bio',
                  extension: 'pdf',
                  speakerId: '6ea3bc8d-c556-42f1-a351-53c720a4adfd',
                  isDisplay: true
                }
              },
              websites: {
                'fef6dca2-ab53-4d6d-bfc8-cdb669e69e8e': {
                  id: 'fef6dca2-ab53-4d6d-bfc8-cdb669e69e8e',
                  relatedUrl: 'http://www.google.com',
                  isDisplay: true,
                  relatedUrlName: 'Website',
                  relatedUrlCategoryId: '59f80ad9-72bc-4b36-ad7c-6e1c0f7d1ab7',
                  speakerId: '6ea3bc8d-c556-42f1-a351-53c720a4adfd'
                }
              }
            },
            '68cca2fc-85da-4d23-8f1b-c1baa254b9f5': {
              id: '68cca2fc-85da-4d23-8f1b-c1baa254b9f5',
              categoryId: '04a78fdc-833a-4362-b016-43f30011bc39',
              firstName: 'Second',
              lastName: 'Last',
              prefix: '',
              company: '',
              title: '',
              code: 'SecondLast',
              biography: '',
              designation: '',
              displayOnWebsite: true,
              internalNote: '',
              facebookUrl: '',
              twitterUrl: '',
              linkedInUrl: '',
              order: 2,
              documents: {
                '444a0357-a379-4ef8-8cd7-b3b8f665e107': {
                  id: '444a0357-a379-4ef8-8cd7-b3b8f665e107',
                  speakerId: '68cca2fc-85da-4d23-8f1b-c1baa254b9f5',
                  isDisplay: false
                },
                '0fe53ba6-a2bc-4282-9f2d-8ee4131c07f5': {
                  id: '0fe53ba6-a2bc-4282-9f2d-8ee4131c07f5',
                  speakerId: '68cca2fc-85da-4d23-8f1b-c1baa254b9f5',
                  isDisplay: true
                }
              },
              websites: {
                '367ac8d6-3ba0-4ce4-b5e9-90b7a715b000': {
                  id: '367ac8d6-3ba0-4ce4-b5e9-90b7a715b000',
                  relatedUrl: 'http://yahoo.com',
                  isDisplay: false,
                  relatedUrlName: 'Yahoo',
                  relatedUrlCategoryId: '59f80ad9-72bc-4b36-ad7c-6e1c0f7d1ab7',
                  speakerId: '68cca2fc-85da-4d23-8f1b-c1baa254b9f5'
                },
                'fff10411-0ad1-4945-877e-9a1eabcf0e8f': {
                  id: 'fff10411-0ad1-4945-877e-9a1eabcf0e8f',
                  relatedUrl: 'http://ms.com',
                  isDisplay: true,
                  relatedUrlName: 'Microsoft',
                  relatedUrlCategoryId: '59f80ad9-72bc-4b36-ad7c-6e1c0f7d1ab7',
                  speakerId: '68cca2fc-85da-4d23-8f1b-c1baa254b9f5'
                }
              }
            },
            'de8d4863-c93f-49ab-a932-3661a1528fa0': {
              id: 'de8d4863-c93f-49ab-a932-3661a1528fa0',
              categoryId: 'beace295-2b18-4149-a8be-23729681dac1',
              firstName: 'asfd',
              lastName: 'asf',
              prefix: '',
              company: '',
              title: '',
              code: 'asfdasf',
              biography: '',
              designation: '',
              displayOnWebsite: true,
              internalNote: '',
              facebookUrl: '',
              twitterUrl: '',
              linkedInUrl: '',
              order: 3,
              documents: {},
              websites: {}
            },
            'de8d4863-c93f-49ab-a932-3661a1528fa1': {
              id: 'de8d4863-c93f-49ab-a932-3661a1528fa1',
              categoryId: 'beace295-2b18-4149-a8be-23729681dac1',
              firstName: 'asfd',
              lastName: 'asf',
              prefix: '',
              company: '',
              title: '',
              code: 'asfdasf',
              biography: '',
              designation: '',
              displayOnWebsite: false,
              internalNote: '',
              facebookUrl: '',
              twitterUrl: '',
              linkedInUrl: '',
              order: 4,
              documents: {},
              websites: {}
            }
          }
        }
      },
      registrationForm: {
        regCart: {
          eventRegistrations: {
            '00000000-0000-0000-0000-00000000': {
              attendee: {
                attendeeId: '00000000-0000-0000-0000-00000000'
              }
            }
          }
        }
      },
      account: {
        speakerCategories: {
          '9f2f7ace-ca67-42d5-a95c-28ad43dc32af': {
            id: '9f2f7ace-ca67-42d5-a95c-28ad43dc32af',
            name: 'Hosts',
            isActive: true
          },
          '04a78fdc-833a-4362-b016-43f30011bc39': {
            id: '04a78fdc-833a-4362-b016-43f30011bc39',
            name: 'Panelists',
            isActive: true
          },
          'e09bad65-e9b1-4505-b84e-4d94b5295fe7': {
            id: 'e09bad65-e9b1-4505-b84e-4d94b5295fe7',
            name: 'Moderators',
            isActive: true
          },
          '578c4968-e81a-4bd4-835f-5900e0ad291a': {
            id: '578c4968-e81a-4bd4-835f-5900e0ad291a',
            name: 'Presenters',
            isActive: true
          },
          '4392b7bf-9619-4729-b7c6-0c74de1f2761': {
            id: '4392b7bf-9619-4729-b7c6-0c74de1f2761',
            name: 'Speakers',
            isActive: true
          },
          'ee7d9d95-7af3-4991-bd96-e47899556120': {
            id: 'ee7d9d95-7af3-4991-bd96-e47899556120',
            name: 'Keynote Speaker',
            isActive: true
          },
          '8029afb9-e705-4d7a-8ee1-c1a771b7f910': {
            id: '8029afb9-e705-4d7a-8ee1-c1a771b7f910',
            name: 'Place Holder',
            isActive: true
          },
          '1deb9994-712a-4eb9-b05f-a877d3548a6c': {
            id: '1deb9994-712a-4eb9-b05f-a877d3548a6c',
            name: 'test',
            isActive: true
          },
          '3061dae5-30a0-4fce-a2c8-ea14c0622f7c': {
            id: '3061dae5-30a0-4fce-a2c8-ea14c0622f7c',
            name: 'trigger',
            isActive: true
          },
          'beace295-2b18-4149-a8be-23729681dac1': {
            id: 'beace295-2b18-4149-a8be-23729681dac1',
            name: 'Trigger 2',
            isActive: true
          },
          '1c97070e-9e3c-45d1-bd46-68466086b6a2': {
            id: '1c97070e-9e3c-45d1-bd46-68466086b6a2',
            name: 'Trigger 31',
            isActive: true
          }
        }
      },
      website: {
        theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
      },
      accessToken: 'token'
    };
  },
  subscribe() {},
  dispatch() {}
};

test('publishes activity fact for speaker document for unknown user', async () => {
  const s = mockStore({
    ...store.getState(),
    registrationForm: {
      regCart: {
        eventRegistrations: {
          '00000000-0000-0000-0000-00000000': {}
        }
      }
    }
  });
  await s.dispatch(
    recordSpeakerFileDownloadActivity(
      '6ea3bc8d-c556-42f1-a351-53c720a4adfd',
      store.getState().event.speakerInfoSnapshot.speakers['6ea3bc8d-c556-42f1-a351-53c720a4adfd'].documents[
        '0fe53ba6-a2bc-4282-9f2d-8ee4131c07f5'
      ]
    )
  );
  expect(mockPublishAttendeeActivityFact).not.toHaveBeenCalled();

  expect(s.getActions()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        type: RECORD_FACT
      })
    ])
  );
});
