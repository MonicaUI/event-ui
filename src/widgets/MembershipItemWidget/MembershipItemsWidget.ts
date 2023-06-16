import { connect } from 'react-redux';
import { useMembershipUpdate } from './useMembershipUpdate';
import { widgetWithBehavior } from 'event-widgets/lib/MembershipItems/MembershipItemsWidget';
import { getMembershipItemRegistration, getContactId } from '../../redux/selectors/productSelectors';
import { State } from 'event-widgets/interfaces/store';

const MembershipWidget = widgetWithBehavior({
  useMembershipUpdate,
  getMembershipItemRegistration,
  getContactId
});

export default connect((state: State) => {
  return {
    currency: state.text.resolver.currency
  };
})(MembershipWidget);
