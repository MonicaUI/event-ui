import { ApolloClient } from '@apollo/client';
import { MockLink } from '@apollo/client/testing';
import apolloCache from '../../../apollo/apolloCache';
import { getNextPage, NEXT_PAGE } from '../navigation';

describe('navigation getNextPage', () => {
  it('should return next page id', async () => {
    const CURRENT_PAGE_ID = 'page1';
    const NEXT_PAGE_ID = 'page2';
    const REG_PATH_ID = 'regPathId';
    const REG_TYPE_ID = '00000000-0000-0000-0000-000000000000';
    const mockedResponse = {
      request: {
        query: NEXT_PAGE,
        variables: {
          currentPageId: CURRENT_PAGE_ID,
          registrationPathId: REG_PATH_ID,
          registrationTypeId: REG_TYPE_ID,
          eventId: '',
          environment: '',
          eventSnapshotVersion: ''
        }
      },
      result: {
        data: {
          event: {
            registrationPath: {
              registration: {
                currentPage: {
                  nextPage: {
                    id: NEXT_PAGE_ID
                  }
                }
              }
            }
          }
        }
      }
    };
    const apolloClient = new ApolloClient({
      link: new MockLink([mockedResponse]),
      cache: apolloCache(
        {},
        {
          eventId: '',
          environment: '',
          eventSnapshotVersion: ''
        }
      )
    });

    const response = await getNextPage(CURRENT_PAGE_ID, REG_PATH_ID, REG_TYPE_ID, apolloClient);
    expect(response).toMatchObject({ id: NEXT_PAGE_ID });
  });
});
