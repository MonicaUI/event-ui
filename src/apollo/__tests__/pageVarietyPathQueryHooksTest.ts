import { ApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import {
  createPageVarietyPathManualQuery,
  createPageVarietyPathQuery,
  createPageVarietyPathQueryHook,
  useRegistrationPageVarietyPathQuery
} from '../siteEditor/pageVarietyPathQueryHooks';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const apollo = require('@apollo/client');
const mockUseQuery = jest.spyOn(apollo, 'useQuery').mockImplementation(jest.fn());
jest.mock('react-redux', () => ({
  useSelector: jest.fn().mockReturnValue('')
}));

import { getRegistrationPathIdOrNull } from '../../redux/selectors/currentRegistrationPath';
import { getRegistrationTypeIdFromUserSession } from '../../redux/userSession';
import { getCurrentPageId } from '../../redux/pathInfo';
jest.mock('../../redux/selectors/currentRegistrationPath');
jest.mock('../../redux/userSession');
jest.mock('../../redux/pathInfo');
(getRegistrationPathIdOrNull as $TSFixMe).mockReturnValue('');
(getRegistrationTypeIdFromUserSession as $TSFixMe).mockReturnValue('');
(getCurrentPageId as $TSFixMe).mockReturnValue('');

const fragment = gql`
  fragment TestFragment on Type {
    test
  }
`;
const testPageVarietyQuery = createPageVarietyPathQuery('testPageVariety', 'TestFragment', fragment);
const registrationPageVarietyQuery = createPageVarietyPathQuery('registration', 'TestFragment', fragment);

const mockVariables = {
  variables: {
    currentPageId: '',
    registrationPathId: '',
    registrationTypeId: ''
  }
};

const testPageVarietyHook = createPageVarietyPathQueryHook('testPageVariety');

const apolloClient = { query: jest.fn() } as unknown as ApolloClient<unknown>;
const mockQuery = jest.spyOn(apolloClient, 'query').mockImplementation(jest.fn());

describe('Query with custom fragment', () => {
  it('Creates a valid GraphQL document with fragment', () => {
    expect(testPageVarietyQuery.kind).toStrictEqual('Document');
    expect(testPageVarietyQuery.definitions.find(def => def.kind === 'FragmentDefinition')).toHaveProperty(
      'name.value',
      'TestFragment'
    );
  });
});

describe('Create custom hook', () => {
  it('Creates custom hook with page variety', () => {
    const hook = testPageVarietyHook(fragment);
    expect(typeof hook).toEqual(typeof apollo.QueryResult);
    expect(mockUseQuery).toBeCalledWith(testPageVarietyQuery, mockVariables);
  });
  it('Calls useQuery with fragment in query', () => {
    const hook = useRegistrationPageVarietyPathQuery(fragment);
    expect(typeof hook).toEqual(typeof apollo.QueryResult);
    expect(mockUseQuery).toBeCalledWith(registrationPageVarietyQuery, mockVariables);
  });
});

describe('Create custom query method', () => {
  it('Creates custom query method with page variety', async () => {
    const query = await createPageVarietyPathManualQuery('registration', fragment, {} as $TSFixMe, apolloClient);
    expect(typeof query).toEqual(typeof apollo.QueryResult);
    expect(mockQuery).toBeCalledWith({ query: registrationPageVarietyQuery, ...mockVariables });
  });
});
