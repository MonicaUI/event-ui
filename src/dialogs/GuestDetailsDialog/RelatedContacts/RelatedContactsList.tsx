import React from 'react';
import { resolve } from '@cvent/nucleus-dynamic-css';
import InteractiveElement from 'nucleus-core/containers/InteractiveElement';
import { injectTestId } from '@cvent/nucleus-test-automation';
import formatAttendeeName from 'event-widgets/utils/formatAttendeeName';

/**
 * Renders each individual list item
 */
function ListItemsForEachSubGroup(props) {
  const { itemsArr, onSelectRelatedContact } = props;

  return (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    itemsArr &&
    itemsArr.map((item, index) => {
      const { relatedContactStub, emailAddress } = item;
      const fullName = formatAttendeeName({ firstName: item.firstName, lastName: item.lastName });
      return (
        <InteractiveElement
          key={`lookuprelatedcontact-${relatedContactStub}-${index}`}
          onClick={() => onSelectRelatedContact(relatedContactStub)}
          {...resolve(props, 'listitem')}
        >
          <div {...resolve(props, 'modalGuestNameStyle')}>
            <span
              {...resolve(
                props,
                props.selectedRelatedContactStub === relatedContactStub ? 'selected' : '',
                'modalGuestName'
              )}
            >
              {fullName}
            </span>
          </div>
          <div {...resolve(props, 'modalGuestEmailStyle')}>
            <span {...resolve(props, props.selectedRelatedContactStub === relatedContactStub ? 'selected' : '')}>
              {emailAddress}
            </span>
          </div>
        </InteractiveElement>
      );
    })
  );
}

/**
 * Component for displaying related contact modal list items
 */
function RelatedContactsList(props: $TSFixMe): $TSFixMe {
  const { classes, style } = props;
  const popUpMessage = props.relatedContactsSearchCriteria
    ? 'EventWidgets_AddGuestFromRelatedContacts_NoRelatedContactFound__resx'
    : 'EventWidgets_AddGuestFromRelatedContacts_NoRelatedContactExist__resx';

  return (
    <div {...resolve({ classes, style }, 'listRelatedContacts')} style={style}>
      {props.relatedContactsGroup.length > 0 ? (
        props.relatedContactsGroup.map((group, index) => {
          return (
            <div
              {...resolve({ classes, style: { tableContent: style.tableContent } }, 'tableContent')}
              key={`lookuprelatedcontact-${group.groupName}-${index}`}
            >
              <div {...resolve(props, 'contentRow')}>
                <div {...resolve(props, 'tabelInfo')}>
                  <div {...resolve(props, 'modalListNameStyle')}>{group.groupName}</div>
                  <ListItemsForEachSubGroup
                    itemsArr={group.relatedContacts}
                    classes={classes}
                    style={style}
                    selectedRelatedContactStub={props.selectedRelatedContactStub}
                    onSelectRelatedContact={contactStub => props.onSelectRelatedContact(contactStub)}
                  />
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div {...resolve(props, 'modalInstructionalTextStyle')} {...injectTestId('no-data-message')}>
          {props.translate(popUpMessage, { searchText: props.relatedContactsSearchCriteria })}
        </div>
      )}
    </div>
  );
}

export default RelatedContactsList;
