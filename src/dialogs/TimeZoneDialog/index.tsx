import React from 'react';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { TimeZoneDialog } from './TimeZoneDialog';
import TimeZoneDialogStyles from './TimeZoneDialog.less';
import { withStyles } from '../ThemedDialog';
import { connect } from 'react-redux';
import { setSelectedTimeZone } from '../../redux/timeZoneSelection';
import { updateTimeZonePreference } from '../../redux/timezones';

const Dialog = withStyles(TimeZoneDialog);

const classes = {
  ...TimeZoneDialogStyles
};

const mapStateToProps = (state: $TSFixMe) => {
  return {
    title: 'EventGuestSide_TimeZone_Dialog_Title_resx',
    translate: state.text.translate,
    eventTimeZone: state.event.timezone,
    timeZones: state.timezones,
    selectedTimeZone: state.selectedTimeZone,
    instructionalText: 'EventGuestSide_TimeZone_Dialog_Instruction_resx'
  };
};

const mapDispatchToProps = (dispatch: $TSFixMe) => {
  return {
    changeTimeZone: selectedTimeZone => {
      dispatch(closeDialogContainer());
      if (selectedTimeZone) {
        dispatch(setSelectedTimeZone(selectedTimeZone));
        dispatch(updateTimeZonePreference(selectedTimeZone));
      }
    },
    closeDialog: () => {
      dispatch(closeDialogContainer());
    }
  };
};

const ConnectedTimeZoneDialog = connect(mapStateToProps, mapDispatchToProps)(Dialog);

export const openTimeZoneDialog = () => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ classes: { [x: string]: string; }; }' is n... Remove this comment to see the full error message
    const dialog = <ConnectedTimeZoneDialog classes={classes} />;
    return dispatch(
      openDialogContainer(dialog, () => {}, {
        classes: {
          dialogContainer: TimeZoneDialogStyles.dialogContainer
        },
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};
