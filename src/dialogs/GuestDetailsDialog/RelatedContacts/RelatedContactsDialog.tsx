import React, { useState } from 'react';
import RelatedContactsStyle from './RelatedContacts.less';
import { resolve } from '@cvent/nucleus-dynamic-css';
import Textbox from 'nucleus-core/forms/elements/Textbox';
import Icon from '@cvent/nucleus-icon';
import Button from 'nucleus-core/buttons/Button';
import { injectTestId } from '@cvent/nucleus-test-automation';
import RelatedContactsList from './RelatedContactsList';
import DialogHeader from '../../shared/DialogHeader';
import { getSortedGroupsForRelatedContacts, hasMinLengthForRelatedContactsSearch } from './RelatedContactsUtil';

export function RelatedContactsDialog(props: $TSFixMe): $TSFixMe {
  const {
    style,
    translate,
    contactId,
    relatedContacts,
    relatedContactsSearchCriteria,
    relatedContactsSearchResults,
    onBackButtonClick,
    onCancel,
    onSearchButtonClick,
    relatedContactsDialogCustomText,
    onAddGuestButtonClick
  } = props;

  const [searchText, setSearchText] = useState();
  const [selectedRelatedContactStub, setSelectedRelatedContactStub] = useState();

  /**
   * This dispatches the action "LOAD_RELATED_CONTACTS_SEARCH_RESULTS" post search button click
   * @returns {Promise<void>}
   */
  const onRelatedContactsSearchButtonClick = async () => {
    setSelectedRelatedContactStub(undefined);
    await onSearchButtonClick(contactId, searchText);
  };

  /**
   * This is used to dispatch action when enter key is pressed for searching
   * @param event: The key press event
   */
  const handleEnter = event => {
    if (hasMinLengthForRelatedContactsSearch(searchText) && event.key === 'Enter') {
      void onRelatedContactsSearchButtonClick();
    }
  };

  const getRelatedContactsView = () => {
    return relatedContactsSearchResults || relatedContacts;
  };

  const relatedContactsView = getRelatedContactsView();
  const shouldDisableSearchButton = hasMinLengthForRelatedContactsSearch(searchText) === false;

  const onRelatedContactsAddGuestButtonClick = async () => {
    const relatedContactDetails = relatedContactsView.find(rc => rc.relatedContactStub === selectedRelatedContactStub);
    await onAddGuestButtonClick(relatedContactDetails);
  };

  return (
    <div>
      <DialogHeader
        text={translate(relatedContactsDialogCustomText.headerText)}
        onClose={onCancel}
        closeFallbackText="fallback"
        style={{ ...style, title: style.modalHeaderStyle }}
        classes={RelatedContactsStyle}
      />
      <div {...resolve(props, 'modalBodyStyle')}>
        {relatedContacts && relatedContacts.length > 0 && (
          <div className={RelatedContactsStyle.formElement}>
            <Textbox
              {...injectTestId('related-contact-search-textbox')}
              fieldName="relatedContactSearch"
              value={searchText}
              onChange={(fieldName, text) => setSearchText(text)}
              classes={RelatedContactsStyle}
              style={{ textbox: style.modalFieldStyle }}
              placeholder={translate('EventWidgets_AddGuestFromRelatedContacts_RelatedContactsSearch__resx')}
              onKeyPress={handleEnter}
            />
            <span className={RelatedContactsStyle.iconWrapper} style={style.iconWrapperStyle}>
              <Icon icon="search" fallbackText={translate(relatedContactsDialogCustomText.searchButtonText)} />
            </span>
            <span className={RelatedContactsStyle.searchButtonWrapper}>
              <Button
                classes={RelatedContactsStyle}
                style={{ button: style.modalSearchButtonStyle }}
                onClick={onRelatedContactsSearchButtonClick}
                kind="primaryButton"
                title={translate(relatedContactsDialogCustomText.searchButtonText)}
                disabled={shouldDisableSearchButton}
                {...injectTestId('search-button')}
              />
            </span>
          </div>
        )}
        <RelatedContactsList
          classes={RelatedContactsStyle}
          style={style}
          translate={translate}
          relatedContactsGroup={
            relatedContactsView && relatedContactsView.length > 0
              ? getSortedGroupsForRelatedContacts(relatedContactsView)
              : []
          }
          relatedContactsSearchCriteria={relatedContactsSearchCriteria}
          selectedRelatedContactStub={selectedRelatedContactStub}
          onSelectRelatedContact={contactStub => setSelectedRelatedContactStub(contactStub)}
          onAddRelatedContact={props.onAddRelatedContact}
        />
        <div className={RelatedContactsStyle.buttonPanel}>
          <Button
            classes={RelatedContactsStyle}
            style={{ button: style.modalBackButtonStyle }}
            title={translate(relatedContactsDialogCustomText.backButtonText)}
            onClick={onBackButtonClick}
            kind="secondaryButton"
            {...injectTestId('back-button')}
          />
          {relatedContacts && relatedContacts.length > 0 && (
            <Button
              classes={RelatedContactsStyle}
              style={{ button: style.modalAddGuestButtonStyle }}
              onClick={onRelatedContactsAddGuestButtonClick}
              kind="primaryButton"
              title={translate(relatedContactsDialogCustomText.addGuestButtonText)}
              disabled={!selectedRelatedContactStub}
              {...injectTestId('add-guest-button')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
