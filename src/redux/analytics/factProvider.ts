import { RECORD_FACT } from 'nucleus-widgets/utils/analytics/actions';
/**
 * Generates a fact from the given state and action if necessary.
 */
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export default function factProvider(prevState: $TSFixMe, action: $TSFixMe, _nextState: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case RECORD_FACT:
      return action.payload.fact;
    default:
      return null;
  }
}
