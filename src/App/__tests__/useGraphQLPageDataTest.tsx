import React from 'react';
import { mount } from 'enzyme';
import { useQuery } from '@apollo/client';
import { act } from 'react-dom/test-utils';
import { getRegistrationPathIdOrNull } from '../../redux/selectors/currentRegistrationPath';
import { isWebsiteVarietyPage } from '../../redux/website';
import { getRegistrationTypeId } from '../../redux/selectors/currentRegistrant';
import { useSelector, useDispatch } from 'react-redux';
import useGraphQLPageData, { mapGraphQLTypeToPage, GraphQLPage } from '../useGraphQLPageData';

const mockData = {
  data: {
    event: {
      page: {
        layoutItems: [
          {
            id: 'layout'
          }
        ]
      }
    }
  }
};
const mockMappedPage = {
  layoutItems: {
    layout: {
      id: 'layout'
    }
  }
};
jest.mock('@apollo/client');
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
mockUseQuery.mockReturnValue(mockData as never);

const mockDispatch = jest.fn();
jest.mock('react-redux');
const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;
mockUseSelector.mockImplementation(jest.fn(s => s({})));
const mockUseDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>;
mockUseDispatch.mockReturnValue(mockDispatch);

const mockRegistrationTypeId = '0000';
jest.mock('../../redux/selectors/currentRegistrant');
const mockGetRegistrationTypeId = getRegistrationTypeId as jest.MockedFunction<typeof getRegistrationTypeId>;
mockGetRegistrationTypeId.mockReturnValue(mockRegistrationTypeId);

const mockIsWebsitePage = true;
jest.mock('../../redux/website');
const mockGetIsWebsitePage = isWebsiteVarietyPage as jest.MockedFunction<typeof isWebsiteVarietyPage>;
mockGetIsWebsitePage.mockReturnValue(mockIsWebsitePage);

const mockRegistrationPathId = '1234';
jest.mock('../../redux/selectors/currentRegistrationPath');
const mockGetRegistrationPathId = getRegistrationPathIdOrNull as jest.MockedFunction<
  typeof getRegistrationPathIdOrNull
>;
mockGetRegistrationPathId.mockReturnValue(mockRegistrationPathId);

const testPageId = 'page1';

const waitWithAct = async () => {
  // Act is used because the Redux store is updated during wait
  return act(async () => {
    await new Promise(resolve => setTimeout(resolve));
  });
};

const PageComponent = () => {
  const page = useGraphQLPageData(testPageId);
  return <div>{JSON.stringify(page || {})}</div>;
};

describe('useGraphQLPageData', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });
  it('maps array of layout items for UI', () => {
    const mappedPage = mapGraphQLTypeToPage(mockData.data.event.page as GraphQLPage);
    expect(mappedPage).toEqual(mockMappedPage);
  });
  it('calls Apollo useQuery with correct variables', async () => {
    const component = mount(<PageComponent />);
    expect(mockUseQuery.mock.calls[0][1]).toMatchObject({
      variables: {
        currentPageId: testPageId,
        pageId: testPageId,
        registrationTypeId: mockRegistrationTypeId,
        registrationPathId: mockRegistrationPathId
      }
    });
    await waitWithAct();
    await component.update();
    expect(component.text()).toEqual(JSON.stringify(mockMappedPage));
  });
});
