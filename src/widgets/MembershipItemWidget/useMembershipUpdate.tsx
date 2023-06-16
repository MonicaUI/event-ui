import { useDispatch, useSelector } from 'react-redux';
import { getRegCart } from '../../redux/selectors/shared';
import { getEventRegistrationId } from '../../redux/selectors/currentRegistrant';
import { FetchResult, useMutation } from '@apollo/client';
import { SELECT_MEMBERSHIP, DESELECT_MEMBERSHIP } from './updateMembershipQuery';
import { convertResponse } from '../../clients/RegCartClient';
import {
  UPDATE_REG_CART_MEMBERSHIP_ITEM_SUCCESS,
  UPDATE_REG_CART_MEMBERSHIP_ITEM_FAILURE
} from '../../redux/registrationForm/regCart/actionTypes';
import { populateVisibleProducts } from '../../redux/visibleProducts';
import { RegCart } from '@cvent/flex-event-shared/target/guestside';
import { MembershipItem } from 'event-widgets/lib/MembershipItems/useMembershipItems';

export function useMembershipUpdate(item: MembershipItem): [(() => Promise<FetchResult<unknown>>)?, boolean?] {
  const dispatch = useDispatch();
  const eventRegistrationId: string = useSelector(getEventRegistrationId);
  const regCart: RegCart = useSelector(getRegCart);

  const hasMembershipItem = regCart.eventRegistrations[eventRegistrationId].membershipItemRegistrations[item.id];
  const [mutate, { loading }] = useMutation(hasMembershipItem ? DESELECT_MEMBERSHIP : SELECT_MEMBERSHIP, {
    variables: {
      regCartId: regCart.regCartId,
      membershipItemId: item.membershipItemId,
      productId: item.id,
      eventRegistrationId,
      renewal: item.renewal
    },
    onCompleted(data) {
      const responseData = hasMembershipItem ? data?.deselectMembershipItem : data?.selectMembershipItem;
      const regCartResponse = convertResponse(responseData?.regCart);
      dispatch({
        type: UPDATE_REG_CART_MEMBERSHIP_ITEM_SUCCESS,
        payload: {
          regCart: regCartResponse?.regCart,
          validationMessages: responseData?.regCart?.validationMessages
        }
      });
      dispatch(populateVisibleProducts(eventRegistrationId));
    },
    onError(error) {
      dispatch({ type: UPDATE_REG_CART_MEMBERSHIP_ITEM_FAILURE, payload: { error } });
    }
  });

  return [mutate, loading];
}
