import ButtonWidget from 'nucleus-widgets/lib/Button/ButtonWidget';
import { connect } from 'react-redux';
import { routeToPage } from '../redux/pathInfo';
import { getTotals } from '../redux/postRegistrationPayment/reducer';

export default connect(
  (state: $TSFixMe) => {
    const totals = getTotals(state.orders);
    return {
      disabled: totals.total <= 0
    };
  },
  {
    // can change this to something else if needed
    clickHandler: () => routeToPage('PostRegistrationPayment')
  }
)(ButtonWidget);
