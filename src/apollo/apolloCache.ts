import { InMemoryCache } from '@apollo/client';
import { mapValues } from 'lodash';
import {
  isEditPriceVar,
  isEditRefundVar,
  plannerOverriddenProductFeesVar,
  plannerOverriddenProductRefundsVar
} from '../widgets/PaymentWidget/regCartPricing';
import { eventSnapshotVersionVar, accountSnapshotVersionVar } from '../redux/actions';

export function createCache(store?: $TSFixMe, constants?: $TSFixMe): $TSFixMe {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          ...mapValues(constants, value => ({
            read() {
              return value;
            }
          })),
          pricing: {
            /*
             * Clears pricing field from Apollo cache after each remote request.
             * This overrides Apollo Client's default behavior of keeping unique
             * entries for each permutation of query parameters (i.e. regCart ID,
             * payment info, and lastSavedRegCart). We don't need to reference any
             * cached versions besides the most recent, so don't keep them around.
             */
            merge: (existing, incoming, { cache }) => {
              cache.modify({
                id: 'ROOT_QUERY',
                fields: {
                  pricing: (_ref, { DELETE }) => {
                    return DELETE;
                  }
                }
              });
              return incoming;
            }
          },
          eventSnapshotVersion: {
            read: () => eventSnapshotVersionVar()
          },
          accountSnapshotVersion: {
            read: () => accountSnapshotVersionVar()
          }
        }
      },
      PricingPayload: {
        keyFields: []
      },
      RegCartPricing: {
        keyFields: ['regCartId'],
        fields: {
          isEditPrice() {
            return isEditPriceVar();
          },
          isEditRefund() {
            return isEditRefundVar();
          },
          plannerOverriddenProductFees() {
            return plannerOverriddenProductFeesVar();
          },
          plannerOverriddenProductRefunds() {
            return plannerOverriddenProductRefundsVar();
          }
        }
      }
    }
  });
}

export default createCache;
