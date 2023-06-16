import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BaseWidget from 'nucleus-widgets/lib/BaseWidget';
import { REGISTRATION } from '../../redux/website/registrationProcesses';
import { getCurrentPageId } from '../../redux/pathInfo';

/**
 * A wrapper widget that wraps the Planner Email Confirmation and the Navigator widgets
 */
class PlannerEmailConfirmationWrapper extends BaseWidget<$TSFixMe, $TSFixMe> {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    style: PropTypes.any.isRequired,
    classes: PropTypes.any,
    isPlanner: (PropTypes as $TSFixMe).boolean,
    isLastPage: (PropTypes as $TSFixMe).boolean,
    NavigatorWidget: PropTypes.node
  };

  props: $TSFixMe;

  render() {
    const { isPlanner, isLastPage, NavigatorWidget } = this.props;
    const PlannerEmailConfirmationWidget = React.lazy(() => import('./PlannerEmailConfirmationWidget'));
    return (
      <div>
        {isLastPage && isPlanner && (
          <div>
            <Suspense fallback={<div></div>}>
              <PlannerEmailConfirmationWidget {...this.props} />
            </Suspense>
          </div>
        )}
        <NavigatorWidget {...this.props} />
      </div>
    );
  }
}

export default connect((state: $TSFixMe, props: $TSFixMe) => {
  const pageIds = REGISTRATION.forPathContainingWidget(props.id).pageIds(state);
  const currentPageId = getCurrentPageId(state);
  return {
    isPlanner: state.defaultUserSession.isPlanner,
    isLastPage:
      currentPageId.includes('registrationCancellationPage') ||
      currentPageId.includes('registrationDeclinePage') ||
      pageIds.indexOf(currentPageId) === pageIds.length - 1
  };
})(PlannerEmailConfirmationWrapper);
