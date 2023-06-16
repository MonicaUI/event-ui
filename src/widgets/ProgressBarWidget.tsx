import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withForm from 'nucleus-form/src/components/withForm';
import ProgressBarWidget from 'event-widgets/lib/ProgressBar/ProgressBarWidget';
import {
  saveRegistrationAndRouteToPage,
  withScrollToFirstError
} from './RegistrationNavigator/RegistrationNavigatorWidget';
import { getRegistrationPathIdOrDefault } from '../redux/selectors/currentRegistrationPath';
import { isRegistrationPage } from '../redux/website/registrationProcesses';
import { getCurrentPageId } from '../redux/pathInfo';
import { getIn } from 'icepick';
import { nucleusFormShape } from 'nucleus-form/src/NucleusForm';
import { get } from 'lodash';

const MAX_PROGRESS = 100;
const DEFAULT_PROGRESS = 25;
const CURRENT_PAGE = 'X';
const TOTAL_PAGE = 'Y';

const withContextNucleusForm = () => {
  return () => WrappedComponent => {
    return class WithContextNucleusForm extends React.Component {
      static displayName = 'WithFormProgressBarWidget';
      static contextTypes = {
        nucleusForm: nucleusFormShape
      };

      hasNucleusFormInContext: $TSFixMe;

      constructor(props, context) {
        super(props, context);
        this.hasNucleusFormInContext = Boolean(context.nucleusForm);
      }

      render() {
        if (this.hasNucleusFormInContext) {
          // eslint-disable-next-line react/prop-types
          return <WrappedComponent {...this.props}>{this.props.children}</WrappedComponent>;
        }
        return null;
      }
    };
  };
};

export function getPageNames(state: $TSFixMe, pageIds: $TSFixMe): $TSFixMe {
  const userText = state?.localizedUserText?.currentLocale
    ? get(state.localizedUserText.localizations, state.localizedUserText.currentLocale, null)
    : null;
  return (pageIds || []).map(
    pageId =>
      state.website.pages[pageId] &&
      state.text.translate(get(userText, 'website.pages.' + pageId + '.name', state.website.pages[pageId].name))
  );
}

export default withContextNucleusForm()(
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
  withForm(
    () => ({}),
    formActions => ({ submitForm: formActions.submitForm })
  )
)(
  connect(
    (state: $TSFixMe) => {
      const currentPageId = getCurrentPageId(state);
      const isRegPage = isRegistrationPage(state, currentPageId);
      const currentRegPathId = isRegPage ? getRegistrationPathIdOrDefault(state) : '';
      const pageIds = getIn(state.website, [
        'pluginData',
        'registrationProcessNavigation',
        'registrationPaths',
        currentRegPathId,
        'pageIds'
      ]);
      const currentPageIndex = (pageIds || []).findIndex(id => id === currentPageId);

      return {
        pages: getPageNames(state, pageIds),
        pageIds,
        total: MAX_PROGRESS,
        digit:
          currentPageIndex !== -1 ? Math.ceil((currentPageIndex / pageIds.length) * MAX_PROGRESS) : DEFAULT_PROGRESS,
        currentPage: currentPageIndex !== -1 ? currentPageIndex + 1 : CURRENT_PAGE,
        totalPages: currentPageIndex !== -1 ? pageIds.length : TOTAL_PAGE,
        hideWidget: currentPageIndex === -1
      };
    },
    (dispatch: $TSFixMe, props: $TSFixMe) =>
      bindActionCreators(
        {
          onNavigateRequest: saveRegistrationAndRouteToPage.bind(null, withScrollToFirstError(props.submitForm))
        },
        dispatch
      )
  )(ProgressBarWidget)
);
