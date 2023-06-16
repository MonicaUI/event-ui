import { connect } from 'react-redux';
import ConcurWidget from 'event-widgets/lib/Concur/ConcurWidget';
import { redirectToConcur } from '../redux/travelCart/workflow';

/**
 * Data wrapper for putting basic and required information
 * for the functioning of the Concur's Widget.
 */
export default connect(
  (state: $TSFixMe) => {
    const {
      registrationForm: {
        regCart: { eventRegistrations }
      },
      eventTravel: {
        airData: { isConcurEnabled }
      }
    } = state;

    return {
      eventRegistrations,
      isConcurEnabled
    };
  },
  {
    onFlightRequest: redirectToConcur
  }
)(ConcurWidget);
