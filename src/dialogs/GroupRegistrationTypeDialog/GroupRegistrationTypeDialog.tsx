import React, { useState, useMemo, useCallback } from 'react';
import { resolveTestId, injectTestId } from '@cvent/nucleus-test-automation';

import RadioButton from 'nucleus-form/src/components/inputs/RadioButton';
import Button from 'nucleus-core/buttons/Button';
import { resolve } from '@cvent/nucleus-dynamic-css';
import { choiceRequired } from '@cvent/nucleus-form-validations';
import { setIn } from 'icepick';
import StandardDialog from '../shared/StandardDialog';

/**
 * Add text color customization according to the global theme in dialog messageContainer.
 * body tag provides the text color of global theme.
 * @param Component
 */
export function withTextColorProperty(Component: $TSFixMe): $TSFixMe {
  return class extends React.Component {
    render() {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
      // eslint-disable-next-line react/prop-types
      const { style } = this.props;
      if (style) {
        // eslint-disable-next-line react/prop-types
        const customTextColor = (style.body || {}).color;
        const customStyle = {
          ...style,
          messageContainer: {
            // eslint-disable-next-line react/prop-types
            ...style.messageContainer,
            color: customTextColor
          }
        };
        return <Component {...this.props} style={customStyle} />;
      }
      return <Component {...this.props} />;
    }
  };
}

/**
 * A dialog which allows a registration type selection for a group member
 */

export const GroupRegistrationTypeDialog = (props: $TSFixMe): $TSFixMe => {
  const [localRegCart, setLocalRegCart] = useState(props.regCart);
  const [selectedRegistrationType, setSelectedRegistrationType] = useState(undefined);
  const {
    title,
    translate,
    style,
    classes,
    onClose,
    groupMemberVisibleRegTypes,
    regTypeHasAvailableAdmissionItemMap,
    isAdmissionItemsEnabled,
    groupMemberEventRegId,
    applyGroupMemberRegTypeSelection,
    inviteeId,
    contactId,
    hasMultiLanguage
  } = props;

  const renderOptionArray = () => {
    return groupMemberVisibleRegTypes
      .filter(regType => regType.name !== '')
      .map(regType => {
        const noAdmissionItemsAvailableForRegType =
          !regTypeHasAvailableAdmissionItemMap[regType.id] && isAdmissionItemsEnabled;
        const disabled = regType.closedForGroupMember || noAdmissionItemsAvailableForRegType;
        const regTypeText = hasMultiLanguage ? translate(`${regType.id}.name`) : translate(regType.name);
        const name =
          regTypeText +
          (disabled ? ` ${translate('EventGuestSide_RegistrationType_CapacityFull_DropDownText__resx')}` : '');
        return {
          name,
          disabled,
          value: regType.id,
          className: 'inputStyle'
        };
      });
  };

  const getValidations = useMemo(() => {
    return {
      choiceRequired: choiceRequired(translate)
    };
  }, [translate]);

  /*
   * This will update the regCart in this components state with the group members regtype
   * but it will not replace the regCart in the redux state, since we want to do that only
   *after an update to regAPI has been done
   */

  const handleRegTypeChange = useCallback(
    (fieldName, value) => {
      const updatedLocalRegCart = setIn(
        localRegCart,
        ['eventRegistrations', groupMemberEventRegId, 'registrationTypeId'],
        value
      );
      setSelectedRegistrationType(value);
      setLocalRegCart(updatedLocalRegCart);
    },
    [localRegCart, groupMemberEventRegId]
  );

  const applyGroupMemberRegTypeSelectionHelper = useCallback(() => {
    applyGroupMemberRegTypeSelection(localRegCart, groupMemberEventRegId, inviteeId, contactId);
  }, [localRegCart, groupMemberEventRegId, inviteeId, contactId, applyGroupMemberRegTypeSelection]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedRenderOptions = useMemo(renderOptionArray, []);

  const createRadioButtonOptions = useMemo(
    () => ({ optionArray: memoizedRenderOptions, selectedValue: selectedRegistrationType }),
    [memoizedRenderOptions, selectedRegistrationType]
  );

  return (
    <StandardDialog
      title={translate(title)}
      onClose={onClose}
      closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
      style={style}
      classes={classes}
    >
      <div {...resolve(props, 'panel')}>
        <div {...resolve(props, 'instructionalText')}>
          {translate('EventGuestSide_GroupMemberRegistrationTypeModal_InstructionalText_resx')}
        </div>
        <div {...resolveTestId(props)} {...resolve({ classes }, 'radioButtonWrapper')}>
          <RadioButton
            options={createRadioButtonOptions}
            fieldName="RegTypeRadioButtonList"
            classes={classes}
            style={style}
            disabled={false}
            validations={getValidations}
            onChange={handleRegTypeChange}
            setFocus
          />
        </div>
        <div {...resolveTestId(props)} {...resolve({ classes }, 'nextButtonWrapper')}>
          <Button
            classes={classes}
            style={style}
            {...injectTestId('CancelButton')}
            kind="secondaryButton"
            onClick={onClose}
          >
            {translate('_registrationNavigatorWidget_exitDefaultDisplayText__resx')}
          </Button>
          <Button
            classes={classes}
            style={style}
            {...injectTestId('NextButton')}
            onClick={applyGroupMemberRegTypeSelectionHelper}
            kind="primaryButton"
            disabled={!selectedRegistrationType}
          >
            {translate('_registrationNavigatorWidget_forwardDefaultDisplayText__resx')}
          </Button>
        </div>
      </div>
    </StandardDialog>
  );
};
