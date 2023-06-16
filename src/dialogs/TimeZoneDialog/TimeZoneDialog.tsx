import React, { useState } from 'react';
import { resolveTestId, injectTestId } from '@cvent/nucleus-test-automation';
import RadioButton from 'nucleus-form/src/components/inputs/RadioButton';
import { resolve } from '@cvent/nucleus-dynamic-css';
import Button from 'nucleus-core/buttons/Button';
import StandardDialog from '../shared/StandardDialog';
import TimeZoneDialogStyles from './TimeZoneDialog.less';
import { DEVICE_TIMEZONE_ID } from 'event-widgets/redux/selectors/timezone';
import { convertEventTimezoneTranslations } from 'event-widgets/redux/selectors/timezone';

export const TimeZoneDialog = (props: $TSFixMe): $TSFixMe => {
  const initialState = () => {
    return props.selectedTimeZone.value ? props.selectedTimeZone.value : props.eventTimeZone;
  };

  const [selectedTimeZone, setSelectedTimeZone] = useState(() => initialState());
  const { translate, eventTimeZone, timeZones, title, instructionalText, closeDialog, changeTimeZone, classes, style } =
    props;

  const getEventTimeZone = () => {
    const timeZonesValue = Object.values(timeZones);
    const eventTimeZoneValue = timeZonesValue.find(timeZone => (timeZone as $TSFixMe).id === eventTimeZone);
    return {
      ...convertEventTimezoneTranslations(translate, eventTimeZoneValue),
      value: eventTimeZone
    };
  };

  const deviceTimeZone = {
    utcOffset: -new Date().getTimezoneOffset(),
    value: DEVICE_TIMEZONE_ID,
    name: translate('Event_GuestSide_DeviceTimeZone_desc_resx'),
    nameResourceKey: 'Event_GuestSide_DeviceTimeZone__resx'
  };

  const options = {
    optionArray: [getEventTimeZone(), deviceTimeZone],
    selectedValue: selectedTimeZone
  };

  const handleTimeZoneChange = (fieldName, value) => {
    setSelectedTimeZone(value);
  };

  const changeTimeZoneValue = () => {
    const selectedTimeZoneValue = options.optionArray.find(option => option.value === selectedTimeZone);
    changeTimeZone(selectedTimeZoneValue);
  };

  return (
    <StandardDialog
      title={translate(title)}
      closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
      style={style}
      classes={classes}
    >
      <div {...resolve(props, 'panel')}>
        <div {...resolve(props, 'body')} className={TimeZoneDialogStyles.instructionalText}>
          {translate(instructionalText)}
        </div>
        <div {...resolveTestId(props)} {...resolve(props, 'radioButtonWrapper')}>
          <RadioButton
            classes={classes}
            style={style}
            fieldName="TimeZoneList"
            options={options}
            onChange={handleTimeZoneChange}
          />
        </div>
        <div {...resolveTestId(props)} {...resolve({ classes }, 'adjustButtonWrapper')}>
          <Button
            classes={classes}
            style={style}
            {...injectTestId('CancelButton')}
            kind="secondaryButton"
            onClick={closeDialog}
          >
            {translate('EventWidgets_DeclineNavigator_ExitDefaultDisplayText__resx')}
          </Button>
          <Button
            classes={classes}
            style={style}
            {...injectTestId('AdjustButton')}
            onClick={changeTimeZoneValue}
            kind="primaryButton"
          >
            {translate('Event_GuestSide_Button_Adjust_resx')}
          </Button>
        </div>
      </div>
    </StandardDialog>
  );
};
