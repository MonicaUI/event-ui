import { connect } from 'react-redux';
import ButtonWidget from 'nucleus-widgets/lib/Button/ButtonWidget';
import { get } from 'lodash';
import { openDownloadCalendarDialog } from '../dialogs/DownloadCalendarDialog';
import CalendarContentType from '../dialogs/DownloadCalendarDialog/CalendarContentType';
import { getFullLanguageFromDefaultMapping } from 'event-widgets/utils/getMatchingLocale';
import { openAddToCalendarDialog } from '../dialogs/AddToCalendarDialog';
import { isRegistrationAsAFeatureOff } from 'event-widgets/redux/selectors/event';
import {
  formatDownloadIcsFileUrl,
  getPreviewToken,
  getTestModeHash,
  isAddToCalendarEnabled,
  isFlexAddToGoogleCalendarEnabledVariant,
  isFlexAddToGoogleCalendarVirtualEventVariant
} from '../utils/addToCalendarUtils';
import { CalendarType } from '../dialogs/DownloadCalendarDialog/CalendarDownloadFileType';
import { getAttendeeId } from '../redux/selectors/currentRegistrant';

const downloadCalendar = props => {
  global.location.replace(props.calendarPath);
};
const downloadCalendarButtonHandler = (calendarSettings, openCalendarDialog, openAddToEventCalendarDialog, props) => {
  const calendarContentType = get(calendarSettings, ['calendarContentType'], CalendarContentType.EVENT);
  const {
    sessionsDisabled,
    isFlexAddToGoogleCalendarEnabled,
    config: { style: modalStyles },
    isRegistrationFeatureOff
  } = props;
  if (calendarContentType === CalendarContentType.EVENT || sessionsDisabled || isRegistrationFeatureOff) {
    if (isFlexAddToGoogleCalendarEnabled) {
      openAddToEventCalendarDialog({ modalStyles });
    } else {
      downloadCalendar(props);
    }
  } else {
    openCalendarDialog({ modalStyles });
  }
};

function mapStateToProps(state: $TSFixMe, props: $TSFixMe) {
  const { pathInfo, event, multiLanguageLocale, environment, appData, defaultUserSession } = state;
  const isRegistrationFeatureOff = isRegistrationAsAFeatureOff(state.event);
  const locale = multiLanguageLocale?.locale;
  const localeWithCountyCode = locale ? getFullLanguageFromDefaultMapping(locale) : locale;
  const calendarPathUrl = formatDownloadIcsFileUrl({
    calendarBasePath: pathInfo.baseUrl,
    environment,
    locale: localeWithCountyCode ? locale : null,
    previewToken: getPreviewToken(defaultUserSession.isPreview, pathInfo),
    testModeHash: getTestModeHash(defaultUserSession.isTestMode, pathInfo),
    eventId: event.id,
    addToCalendarEnabled: isAddToCalendarEnabled(state),
    calendarType: CalendarType.ICS,
    attendeeId: getAttendeeId(state)
  });

  return {
    calendarSettings: get(appData, ['calendarSettings']),
    kind: 'button',
    disabled: false,
    calendarPath: calendarPathUrl,
    isFlexAddToGoogleCalendarEnabled: isFlexAddToGoogleCalendarEnabledVariant(state),
    isFlexAddToGoogleCalendarVirtualEventVariant: isFlexAddToGoogleCalendarVirtualEventVariant(state),
    config: {
      ...props.config,
      link: {
        enabled: false,
        text: ''
      }
    },
    sessionsDisabled: !event?.eventFeatureSetup?.agendaItems?.sessions,
    isRegistrationFeatureOff
  };
}

const mergeProps = (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
  return {
    ...ownProps,
    ...stateProps,
    clickHandler: downloadCalendarButtonHandler.bind(
      null,
      stateProps.calendarSettings,
      dispatchProps.openDownloadCalendarDialog,
      dispatchProps.openAddToCalendarDialog
    )
  };
};

const mapDispatchToProps = (dispatch: $TSFixMe) => {
  return {
    openDownloadCalendarDialog: ({ modalStyles }) => dispatch(openDownloadCalendarDialog(modalStyles)),
    openAddToCalendarDialog: ({ modalStyles }) => dispatch(openAddToCalendarDialog(modalStyles))
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ButtonWidget);
