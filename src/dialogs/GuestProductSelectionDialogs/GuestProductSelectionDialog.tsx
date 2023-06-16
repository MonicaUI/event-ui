import React, { useState, useCallback } from 'react';
import { resolveTestId, injectTestId } from '@cvent/nucleus-test-automation';
import Checkbox from 'nucleus-form/src/components/inputs/Checkbox';
import Button from 'nucleus-core/buttons/Button';
import { resolve } from '@cvent/nucleus-dynamic-css';
import { getIn } from 'icepick';
import { isEmpty, filter } from 'lodash';
import StandardDialog from '../shared/StandardDialog';
import { shouldHybridFlowWork } from 'event-widgets/utils/AttendingFormatUtils';

export const PRODUCT_STATUS = {
  ACTIVE: 2,
  CLOSED: 3,
  CANCELLED: 7
};

/**
 * A dialog which allows product selection for complex guests
 */
export const GuestProductSelectionDialog = (props: $TSFixMe): $TSFixMe => {
  const {
    eventRegistrations,
    fees,
    translate,
    isGroupReg,
    overrideCapacity,
    currency,
    displayFee,
    forWaitlistingAttendees,
    productId,
    currentPrimaryRegId,
    sessionStatus,
    title,
    style,
    classes,
    onClose,
    productTitle,
    instructionalText,
    showInstructionalText,
    productCapacity,
    initialAlreadySelectedList,
    initialUnselectedList,
    initialLocalEventRegSelections,
    shouldShowAlreadySelected,
    shouldShowUnselected,
    applyGuestProductSelection,
    spinnerSelection,
    attendingFormat
  } = props;

  const [localEventRegSelections, setLocalEventRegSelections] = useState({ ...initialLocalEventRegSelections });
  const [localCapacityRemaining, setLocalCapacityRemaining] = useState(productCapacity || 0);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [unselectedList, setUnselectedList] = useState({ ...initialUnselectedList });
  const [alreadySelectedList, setAlreadySelectedList] = useState({ ...initialAlreadySelectedList });

  const renderProductOptionArray = eventRegistrationSelections => {
    let optionArray = eventRegistrations.map(
      // eslint-disable-next-line complexity
      eventReg => {
        const eventRegId = eventReg.eventRegistrationId;
        // if eventReg Id is not in the list skip it
        if (!eventRegistrationSelections[eventRegId]) {
          return;
        }
        const isGroupMember = isGroupReg && eventReg.attendeeType === 'ATTENDEE';
        const defaultName = !isGroupMember
          ? translate('GuestProductSelection_DefaultPrimaryName__resx')
          : translate('GuestProductSelection_DefaultGroupMemberName__resx');
        let firstName = getIn(eventReg, ['attendee', 'personalInformation', 'firstName']) || '';
        const lastName = getIn(eventReg, ['attendee', 'personalInformation', 'lastName']) || '';
        // If they have a valid first or last name, no need to add the default text;
        firstName = firstName || lastName ? firstName : defaultName;
        const isSelected = eventRegistrationSelections[eventRegId].isSelected;
        const isIncluded = eventRegistrationSelections[eventRegId].isIncluded;
        const isDisabled = eventRegistrationSelections[eventRegId].isDisabled;
        const isWaitlisted = eventRegistrationSelections[eventRegId].isWaitlisted;
        const isOptionDisabledByCapacity = !overrideCapacity && !isSelected && localCapacityRemaining === 0;
        // build the content for the name
        const contentsForName = [];
        if (!forWaitlistingAttendees && isWaitlisted) {
          contentsForName.push(translate('lbl_FullName_Waitlisted__resx', { firstName, lastName }));
        } else {
          contentsForName.push(translate('lbl_FullName__resx', { firstName, lastName }));
        }
        if (isIncluded) {
          contentsForName.push(
            <span key="isIncluded" style={{ float: 'right' }}>
              {translate('EventGuest_GuestProductModal_Included__resx')}
            </span>
          );
        } else if (isDisabled) {
          contentsForName.push(
            <span key="isDisabled" style={{ float: 'right' }}>
              {translate('GuestProductSelection_NotAvailable__resx')}
            </span>
          );
        } else if (fees && displayFee) {
          // show the price
          contentsForName.push(
            <span key="Fee" style={{ float: 'right' }}>
              {localEventRegSelections[eventRegId].fee === null
                ? translate('EventWidgets_Products_Free__resx')
                : currency(localEventRegSelections[eventRegId].fee)}
            </span>
          );
        }
        const name = <span>{contentsForName}</span>;
        return {
          name,
          value: eventRegId,
          checked: isSelected,
          disabled: eventRegistrationSelections[eventRegId].isDisabled || isOptionDisabledByCapacity || isIncluded,
          className: 'inputStyle'
        };
      }
    );
    // filter out all undefined objects
    optionArray = optionArray.filter(option => option);
    return optionArray;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedRenderUnselected = useCallback(renderProductOptionArray(unselectedList), [unselectedList, displayFee]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedRenderAlreadySelected = useCallback(renderProductOptionArray(alreadySelectedList), [
    alreadySelectedList,
    displayFee
  ]);

  const onChange = useCallback(
    (fieldName, value) => {
      setLocalEventRegSelections(prevState => {
        return {
          ...prevState,
          [value]: {
            ...prevState[value],
            isSelected: !prevState[value].isSelected
          }
        };
      });

      let updatedLocalCapacityRemaining = shouldHybridFlowWork(attendingFormat) ? 0 : localCapacityRemaining;

      if (updatedLocalCapacityRemaining >= 0) {
        updatedLocalCapacityRemaining = !localEventRegSelections[value].isSelected
          ? updatedLocalCapacityRemaining - 1
          : updatedLocalCapacityRemaining + 1;
      }

      if (unselectedList[value]) {
        setUnselectedList(prevState => {
          return {
            ...prevState,
            [value]: {
              ...prevState[value],
              isSelected: !prevState[value].isSelected
            }
          };
        });
      }

      if (alreadySelectedList[value]) {
        setAlreadySelectedList(prevState => {
          return {
            ...prevState,
            [value]: {
              ...prevState[value],
              isSelected: !prevState[value].isSelected
            }
          };
        });
      }

      setLocalCapacityRemaining(updatedLocalCapacityRemaining);
      setShowErrorPopup(false);
    },
    [alreadySelectedList, unselectedList, localCapacityRemaining, localEventRegSelections, attendingFormat]
  );

  const calculateTotal = useCallback(() => {
    if (!fees || isEmpty(fees)) {
      return translate('EventWidgets_Products_Free__resx');
    }

    let total = 0.0;
    Object.values(localEventRegSelections).forEach(eventRegSelection => {
      if ((eventRegSelection as $TSFixMe).isSelected && !(eventRegSelection as $TSFixMe).isIncluded) {
        total += !(eventRegSelection as $TSFixMe).fee ? 0 : (eventRegSelection as $TSFixMe).fee;
      }
    });

    return translate('GuestProductSelection_TotalDue__resx', { total: currency(total) });
  }, [translate, fees, localEventRegSelections, currency]);

  const applyGuestProductSelectionWrapper = useCallback(() => {
    if (!forWaitlistingAttendees && sessionStatus === PRODUCT_STATUS.ACTIVE) {
      /*
       * While using Main Session Capacity Popup, if main capacity is remaining and any attendee is in waitlist,
       * then, show the error popup
       */
      const waitlistedRegSelections = filter(localEventRegSelections, regSelection => regSelection.isWaitlisted).filter(
        waitlistedRegSelection => !waitlistedRegSelection.isSelected
      );
      if (localCapacityRemaining > 0 && waitlistedRegSelections.length > 0) {
        setShowErrorPopup(true);
        return;
      }
    }

    applyGuestProductSelection(
      productId,
      currentPrimaryRegId,
      localEventRegSelections,
      eventRegistrations,
      forWaitlistingAttendees,
      spinnerSelection
    );
  }, [
    forWaitlistingAttendees,
    productId,
    applyGuestProductSelection,
    localEventRegSelections,
    eventRegistrations,
    spinnerSelection,
    currentPrimaryRegId,
    localCapacityRemaining,
    sessionStatus
  ]);

  return (
    <StandardDialog
      title={translate(title)}
      onClose={onClose}
      closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
      style={style}
      classes={classes}
    >
      {showErrorPopup && (
        <div {...resolve({ classes }, 'errorMessageOnPopup')}>
          {translate('EventGuestSide_SessionCapacityConflict_ValidationMessage_resx')}
        </div>
      )}
      <div {...resolve({ classes }, 'content')}>
        <div {...resolve({ style, classes }, 'productTitle')}>{translate(productTitle)}</div>
        {showInstructionalText && (
          <div {...resolve({ style, classes }, 'instructionalText')}>
            {translate(instructionalText, { availableCapacity: productCapacity })}
          </div>
        )}
        {shouldShowUnselected && (
          <div>
            <div {...resolve({ style, classes }, 'sectionHeader')}>
              {translate('GuestProductSelection_AvailableRegistrants__resx')}
            </div>
          </div>
        )}
        <div {...resolveTestId(props)} {...resolve({ classes }, 'checkboxWrapper')}>
          <Checkbox
            options={memoizedRenderUnselected}
            fieldName="ProductSelection"
            {...injectTestId('unselected-checkbox')}
            classes={classes}
            style={style}
            onChange={onChange}
            setFocus={shouldShowUnselected}
          />
        </div>
        {shouldShowAlreadySelected && (
          <div>
            <div {...resolve({ style, classes }, 'sectionHeader')}>
              {translate('GuestProductSelection_AlreadySelected__resx')}
            </div>
            <div {...resolveTestId(props)} {...resolve({ classes }, 'checkboxWrapper')}>
              <Checkbox
                options={memoizedRenderAlreadySelected}
                fieldName="AlreadySelectedProductSelection"
                {...injectTestId('already-selected-checkbox')}
                classes={classes}
                style={style}
                onChange={onChange}
                setFocus={shouldShowAlreadySelected}
              />
            </div>
          </div>
        )}
        <div>
          <div className={classes.totalBar} />
          {fees && displayFee && (
            <div {...resolveTestId(props)} {...resolve({ classes }, 'checkboxWrapper')}>
              <div {...resolve(props, 'summaryTotal')}>
                <span {...injectTestId('total')} key="total" style={{ float: 'right' }}>
                  {calculateTotal()}
                </span>
              </div>
            </div>
          )}
          <div className={classes.separator} />
        </div>
        <div {...resolveTestId(props)} {...resolve({ classes }, 'buttonGroupWrapper')}>
          <Button
            classes={classes}
            style={style}
            {...injectTestId('cancel-button')}
            kind="secondaryButton"
            onClick={onClose}
            title={translate('GuestProductSelection_DialogCancelButtonText__resx')}
          />
          <Button
            classes={classes}
            style={style}
            {...injectTestId('done-button')}
            kind="primaryButton"
            onClick={applyGuestProductSelectionWrapper}
            title={translate('GuestProductSelection_DialogConfirmButtonText__resx')}
          />
        </div>
      </div>
    </StandardDialog>
  );
};
