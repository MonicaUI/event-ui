import { gql, useQuery } from '@apollo/client';

export const MOCK_GET_REG_CART_PRICING = gql`
  query Pricing($regCartId: String!, $paymentInfo: String!, $lastSavedRegCart: String!, $travelCart: String!) {
    pricing(
      regCartId: $regCartId
      paymentInfo: $paymentInfo
      lastSavedRegCart: $lastSavedRegCart
      travelCart: $travelCart
    ) {
      regCartPricing
    }
  }
`;

export default function useCachedRegCartPricing(): $TSFixMe {
  const query = useQuery(MOCK_GET_REG_CART_PRICING, {
    variables: {
      regCartId: '',
      paymentInfo: JSON.stringify({}),
      lastSavedRegCart: JSON.stringify({}),
      travelCart: JSON.stringify({})
    }
  });
  return query;
}
