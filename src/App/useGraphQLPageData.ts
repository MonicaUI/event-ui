import React from 'react';
import { useSelector } from 'react-redux';
import { gql } from '@apollo/client';
import { useQueryWithLoading } from 'event-widgets/utils/apolloClientUtils';
import { getRegistrationPathIdOrNull } from '../redux/selectors/currentRegistrationPath';
import { isWebsiteVarietyPage } from '../redux/website';
import { getRegistrationTypeId } from '../redux/selectors/currentRegistrant';
import { showLoadingDialog, hideLoadingDialog } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { LayoutItem } from '@cvent/flex-event-shared';
import { Page } from '@cvent/flex-event-shared/target/guestside';
import { Dictionary, keyBy } from 'lodash';
import { Dispatch } from 'redux';

export interface MappedPage extends Page {
  layoutItems: Dictionary<LayoutItem>;
  templateHeaderRootLayoutItemId?: string;
  templateFooterRootLayoutItemId?: string;
}

export interface GraphQLPage extends Page {
  layoutItems: LayoutItem[];
}

type GraphQLRegistrationPageResponse = {
  event: {
    registrationPath: {
      registration: {
        currentPage: GraphQLPage;
      };
    };
  };
};

type GraphQLPageResponse = {
  event: {
    page: GraphQLPage;
  };
};

const REGISTRATION_PAGE_QUERY = gql`
  query Page(
    $registrationPathId: ID
    $registrationTypeId: ID!
    $currentPageId: ID!
    $eventId: ID!
    $eventSnapshotVersion: String!
    $environment: String!
  ) {
    eventId @client @export(as: "eventId")
    eventSnapshotVersion @client @export(as: "eventSnapshotVersion")
    environment @client @export(as: "environment")
    event(input: { eventId: $eventId, eventSnapshotVersion: $eventSnapshotVersion, environment: $environment }) {
      id
      registrationPath(registrationPathId: $registrationPathId) {
        id
        registration(registrationTypeId: $registrationTypeId, currentPageId: $currentPageId) {
          id
          currentPage {
            id
            name
            rootLayoutItemIds
            layoutItems {
              ...LayoutItemFields
            }
            templateHeaderRootLayoutItemId
            templateFooterRootLayoutItemId
          }
        }
      }
    }
  }

  fragment LayoutItemFields on LayoutItem {
    id
    config
    layout {
      colspan
      type
      cellSize
      parentId
      childIds
    }
    widgetType
    widget {
      ... on RegistrationField {
        registrationField {
          fieldId
          displayName
          display
          isCustomField
        }
      }
    }
  }
`;

const PAGE_QUERY = gql`
  query Page($currentPageId: ID!, $eventId: ID!, $eventSnapshotVersion: String!, $environment: String!) {
    eventId @client @export(as: "eventId")
    eventSnapshotVersion @client @export(as: "eventSnapshotVersion")
    environment @client @export(as: "environment")
    event(input: { eventId: $eventId, eventSnapshotVersion: $eventSnapshotVersion, environment: $environment }) {
      id
      page(pageId: $currentPageId) {
        id
        name
        rootLayoutItemIds
        layoutItems {
          ...LayoutItemFields
        }
        templateHeaderRootLayoutItemId
        templateFooterRootLayoutItemId
      }
    }
  }

  fragment LayoutItemFields on LayoutItem {
    id
    config
    layout {
      colspan
      type
      cellSize
      parentId
      childIds
    }
    widgetType
    widget {
      ... on RegistrationField {
        registrationField {
          fieldId
          displayName
          display
          isCustomField
        }
      }
    }
  }
`;

export const onLoading = (dispatch: Dispatch, isLoading: boolean): Promise<void> => {
  return isLoading ? dispatch(showLoadingDialog()) : dispatch(hideLoadingDialog());
};

export const mapGraphQLTypeToPage = (page: GraphQLPage): MappedPage => {
  return page
    ? {
        ...page,
        layoutItems: keyBy(page.layoutItems, 'id')
      }
    : null;
};

const useGraphQLPageData = (pageId: string): MappedPage => {
  const isWebsitePage = useSelector(state => isWebsiteVarietyPage(state, pageId));

  const [page, setPage] = React.useState<MappedPage>(null);
  const registrationPathId = useSelector(getRegistrationPathIdOrNull);
  const registrationTypeId = useSelector(getRegistrationTypeId);

  const { data } = useQueryWithLoading<GraphQLRegistrationPageResponse & GraphQLPageResponse>(
    isWebsitePage ? PAGE_QUERY : REGISTRATION_PAGE_QUERY,
    {
      variables: { currentPageId: pageId, pageId, registrationTypeId, registrationPathId },
      onLoading,
      fetchPolicy: pageId ? 'cache-first' : 'cache-only'
    }
  );

  React.useEffect(() => {
    if (data) {
      const pageData = data.event?.page || data.event?.registrationPath?.registration?.currentPage;
      setPage(mapGraphQLTypeToPage(pageData));
    }
  }, [data]);

  return page;
};

export default useGraphQLPageData;
