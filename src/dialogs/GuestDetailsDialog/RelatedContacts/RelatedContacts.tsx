import React from 'react';
import ThemeableComponent from 'nucleus-widgets/lib/ThemeableComponent';
import PropTypes from 'prop-types';
import { RelatedContactsDialog } from './RelatedContactsDialog';
import { connect } from 'react-redux';
import { getGuestRegistrationPageWidget } from '../../../redux/website/pageContents';
import { getIn } from 'icepick';
import { merge } from 'lodash';
import {
  clearRelatedContactsSearchData,
  searchRelatedContactsForInvitee,
  setCurrentGuestRegistrationForSelectedRelatedContact,
  toggleRelatedContactsView
} from '../../../redux/addGuestFromRelatedContacts/actions';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { getEventRegistration } from '../../../redux/selectors/currentRegistrant';
import clearImageInTheme from '../../shared/clearImageInTheme';
import { useGuestRegistrationPageVarietyPathQuery } from '../../../apollo/siteEditor/pageVarietyPathQueryHooks';
import { useGraphQLSiteEditorData, GraphQLSiteEditorDataReleases } from '../../../ExperimentHelper';
import gql from 'graphql-tag';
import { useStore } from 'react-redux';

function dialogStyle(style, globalTheme, sections) {
  return {
    ...style,
    ...globalTheme,
    header: globalTheme.dialog ? globalTheme.dialog.header : { styleMapping: 'header3' },
    title: globalTheme.dialog ? globalTheme.dialog.headerText : { styleMapping: 'header2' },
    input: { styleMapping: 'input' },
    button: { styleMapping: 'primaryButton' },
    content2: { ...clearImageInTheme(merge({}, globalTheme, sections.content2)), styleMapping: 'custom' }
  };
}

class RelatedContacts extends ThemeableComponent<$TSFixMe, $TSFixMe> {
  static propTypes = {
    style: PropTypes.object,
    translate: PropTypes.func,
    relatedContactsDialogCustomText: PropTypes.object,
    contactId: PropTypes.string,
    relatedContactsSearchResults: PropTypes.object,
    relatedContacts: PropTypes.array,
    relatedContactsSearchCriteria: PropTypes.string,
    relatedContactsDialogCustomStyles: PropTypes.object
  };

  getElementBackground: $TSFixMe;
  getElementInlineStyle: $TSFixMe;
  props: $TSFixMe;

  getStyleObject() {
    const fieldStyles = this.getElementInlineStyle('modalFieldStyle');
    return {
      ...this.props.style,
      modalHeaderStyle: this.getElementInlineStyle('modalHeaderStyle'),
      modalInstructionalTextStyle: this.getElementInlineStyle('modalValidationTextStyle'),
      modalFieldStyle: fieldStyles,
      modalSearchButtonStyle: this.getElementInlineStyle('modalSearchButtonStyle'),
      modalAddGuestButtonStyle: this.getElementInlineStyle('modalAddGuestButtonStyle'),
      modalBackButtonStyle: this.getElementInlineStyle('modalBackButtonStyle'),
      modalGuestNameStyle: this.getElementInlineStyle('modalGuestNameStyle'),
      modalGuestEmailStyle: this.getElementInlineStyle('modalGuestEmailStyle'),
      modalListNameStyle: this.getElementInlineStyle('modalListNameStyle'),
      modalBodyStyle: this.getElementInlineStyle('modalBodyStyle'),
      dialogHeader: this.getElementInlineStyle('header'),
      title: this.getElementInlineStyle('title'),
      form: {
        textbox: this.getElementInlineStyle('input')
      },
      button: this.getElementInlineStyle('button'),
      dragHandle: this.getElementBackground('content2'),
      iconWrapperStyle: {
        top: fieldStyles.borderWidth + fieldStyles.paddingTop,
        marginLeft: -(fieldStyles.borderWidth + fieldStyles.paddingTop),
        right: fieldStyles.fontSize,
        fontSize: fieldStyles.fontSize
      }
    };
  }

  render() {
    return <RelatedContactsDialog {...this.props} style={this.getStyleObject()} />;
  }
}

const boundCloseDialog = () => async (dispatch, getState) => {
  dispatch(toggleRelatedContactsView());
  dispatch(clearRelatedContactsSearchData());
  const {
    dialogContainer: {
      dialog: { requestClose }
    }
  } = getState();
  await requestClose();
};

const onBackButtonClick = props => async dispatch => {
  dispatch(withLoading(toggleRelatedContactsView)(props));
  dispatch(clearRelatedContactsSearchData());
};

export const RelatedContactsWrapper = connect(
  (state, props) => {
    const { sections, global } = (state as $TSFixMe).website.theme;
    const primaryEventRegistration = getEventRegistration(state) || {};
    const contactId = getIn(primaryEventRegistration, ['attendee', 'personalInformation', 'contactId']);
    const relatedContactsData = getIn(state, ['addGuestFromRelatedContacts', contactId]);

    const relatedContacts = getIn(relatedContactsData, ['relatedContacts']);
    const relatedContactsSearchCriteria = getIn(relatedContactsData, ['relatedContactsSearchCriteria']);
    const relatedContactsSearchResults = getIn(relatedContactsData, ['relatedContactsSearchResults']);

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'relatedContactsModalStyles' does not exi... Remove this comment to see the full error message
    const { relatedContactsModalStyles, relatedContactsModalText } = props;

    return {
      style: dialogStyle(relatedContactsModalStyles, global, sections),
      contactId,
      relatedContacts,
      relatedContactsSearchCriteria,
      relatedContactsSearchResults,
      relatedContactsDialogCustomText: relatedContactsModalText
    };
  },
  {
    onBackButtonClick,
    onCancel: boundCloseDialog,
    onSearchButtonClick: withLoading(searchRelatedContactsForInvitee),
    onAddGuestButtonClick: withLoading(setCurrentGuestRegistrationForSelectedRelatedContact)
  }
)(RelatedContacts);

export const RELATED_CONTACTS_FRAGMENT = gql`
  fragment RelatedContacts on PageVarietyPath {
    addGuestFromRelatedContacts {
      style {
        relatedContactsModalStyles
      }
      relatedContactsModalText
    }
  }
`;

export const RelatedContactsWithGraphQL = (props: $TSFixMe): $TSFixMe => {
  const query = useGuestRegistrationPageVarietyPathQuery(RELATED_CONTACTS_FRAGMENT);
  const {
    event: {
      registrationPath: {
        guestRegistration: {
          // @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
          addGuestFromRelatedContacts: { style: { relatedContactsModalStyles } = {}, relatedContactsModalText } = {}
        } = {}
      } = {}
    } = {}
  } = query.data || query.previousData || {};

  return relatedContactsModalStyles || relatedContactsModalText ? (
    <RelatedContactsWrapper
      relatedContactsModalStyles={relatedContactsModalStyles}
      relatedContactsModalText={relatedContactsModalText}
      {...props}
    />
  ) : null;
};

export const RelatedContactsWithRedux = (props: $TSFixMe): $TSFixMe => {
  const store = useStore();
  const widget = getGuestRegistrationPageWidget(store.getState(), 'AddGuestFromRelatedContacts');
  const relatedContactsModalStyles = widget.config.style.relatedContactsModalStyles;
  const relatedContactsModalText = widget.config.relatedContactsModalText;

  return (
    <RelatedContactsWrapper
      relatedContactsModalStyles={relatedContactsModalStyles}
      relatedContactsModalText={relatedContactsModalText}
      {...props}
    />
  );
};

export default function RelatedContactsExperimentWrapper(props: $TSFixMe): $TSFixMe {
  const usingGraphQLWidgetData = useGraphQLSiteEditorData(GraphQLSiteEditorDataReleases.RelatedContactsDialog);
  if (usingGraphQLWidgetData) return <RelatedContactsWithGraphQL {...props} />;
  return <RelatedContactsWithRedux {...props} />;
}
