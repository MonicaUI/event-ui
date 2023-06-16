import React from 'react';
import StandardDialog from '../shared/StandardDialog';
import { resolve } from '@cvent/nucleus-dynamic-css';
import { connect } from 'react-redux';
import { getEventTimezone } from '../../redux/reducer';
import { getSelectedTimezone } from 'event-widgets/redux/selectors/timezone';
import { adjustTimeZoneTimesForEvent } from 'event-widgets/redux/selectors/event';
import Button from 'nucleus-core/buttons/Button';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import {
  getCalendarUrl,
  getEventInfo,
  downloadEventIcsFile,
  getCalendarSettings,
  getPreviewToken,
  getTestModeHash,
  isFlexAddToGoogleCalendarVirtualEventVariant,
  getGoogleCalendar,
  getOutlookCalendar,
  isAddToCalendarEnabled
} from '../../utils/addToCalendarUtils';
import { resolveTestId } from '@cvent/nucleus-test-automation';
import { isMobileView, getEventCalendarDescription } from '../../utils/addToCalendarUtils';
import { CalendarType } from '../DownloadCalendarDialog/CalendarDownloadFileType';
import { getAttendeeId } from '../../redux/selectors/currentRegistrant';
import { getFullLanguageFromDefaultMapping } from 'event-widgets/utils/getMatchingLocale';
import ThemeableComponent from 'nucleus-widgets/lib/ThemeableComponent';

const BUTTON_WIDTH = '350px';

class AddToCalendarDialog extends ThemeableComponent<$TSFixMe, $TSFixMe> {
  getElementText: $TSFixMe;
  props: $TSFixMe;

  /**
   * If virtual event variant is on, we will not be hitting oslo-lookups service for calendar providers
   * Instead, we would be using new calendar service which supports In-Person and virtual events for calendar types
   */
  openGoogleEventCalendarUrlInNewWindow() {
    const {
      flexAddToGoogleCalendarVirtualEventVariantEnabled,
      calendarProviders,
      eventInfo,
      eventCalendarDescription
    } = this.props;
    const googleEventCalendarUrl = flexAddToGoogleCalendarVirtualEventVariantEnabled
      ? getGoogleCalendar(calendarProviders)
      : getCalendarUrl(calendarProviders?.Google.calendarProviderURL, eventInfo, true, eventCalendarDescription);

    window.open(googleEventCalendarUrl);
  }

  openOutlookEventCalendarUrlInNewWindow() {
    const { calendarProviders } = this.props;
    window.open(getOutlookCalendar(calendarProviders));
  }

  getStyleObject() {
    return {
      ...super.getStyleObject(),
      button: this.getElementText('calendarTypeNameStyles')
    };
  }

  render() {
    const {
      onClose,
      classes,
      translate,
      environment,
      pathInfo,
      isPreview,
      isTestMode,
      addToCalendarEnabled,
      attendeeId,
      locale
    } = this.props;

    const styleObject = this.getStyleObject();
    const buttonStyles = {
      ...styleObject,
      button: {
        ...styleObject.button,
        width: isMobileView() ? window.innerWidth : BUTTON_WIDTH
      }
    };

    return (
      <StandardDialog onClose={onClose} classes={classes}>
        <div {...resolve(this.props, 'calendarDisplay')} {...resolveTestId(this.props, '-container')}>
          <Button
            classes={{ button: classes.ics }}
            style={buttonStyles}
            title={translate('AddtoCalendar_EventCalendarDownloadOptions_ics__resx')}
            onClick={() =>
              downloadEventIcsFile(
                pathInfo.baseUrl,
                environment,
                getPreviewToken(isPreview, pathInfo),
                getTestModeHash(isTestMode, pathInfo),
                pathInfo.eventId,
                addToCalendarEnabled,
                CalendarType.ICS,
                attendeeId,
                locale
              )
            }
            {...resolveTestId(this.props, '-ics-download')}
          />
          {addToCalendarEnabled && (
            <Button
              classes={{ button: classes.ical }}
              style={buttonStyles}
              title={translate('AddtoCalendar_EventCalendarDownloadOptions_AppleCalendar__resx')}
              onClick={() =>
                downloadEventIcsFile(
                  pathInfo.baseUrl,
                  environment,
                  getPreviewToken(isPreview, pathInfo),
                  getTestModeHash(isTestMode, pathInfo),
                  pathInfo.eventId,
                  addToCalendarEnabled,
                  CalendarType.ICAL,
                  attendeeId,
                  locale
                )
              }
              {...resolveTestId(this.props, '-ical-download')}
            />
          )}
          <Button
            classes={{ button: classes.google }}
            style={buttonStyles}
            title={translate('AddtoCalendar_EventCalendarDownloadOptions_GoogleCalendar__resx')}
            onClick={() => this.openGoogleEventCalendarUrlInNewWindow()}
            {...resolveTestId(this.props, '-google-calendar-open')}
          />
          {addToCalendarEnabled && (
            <Button
              classes={{ button: classes.outlook }}
              style={buttonStyles}
              title={translate('AddtoCalendar_EventCalendarDownloadOptions_OutlookWeb__resx')}
              onClick={() => this.openOutlookEventCalendarUrlInNewWindow()}
              {...resolveTestId(this.props, '-outlook-calendar-open')}
            />
          )}
        </div>
      </StandardDialog>
    );
  }
}

export default connect(
  withMemoizedFunctions({ getEventCalendarDescription })(memoized => (state: $TSFixMe, props: $TSFixMe) => {
    const { global } = state.website.theme;
    const eventTimezone = getEventTimezone(state);
    const selectedTimeZone = getSelectedTimezone(state);
    let eventInfo = getEventInfo(state);
    eventInfo = adjustTimeZoneTimesForEvent(eventInfo, selectedTimeZone, eventTimezone);
    const locale = state.multiLanguageLocale?.locale;
    const localeWithCountryCode = locale ? getFullLanguageFromDefaultMapping(locale) : locale;
    const calendarSettings = getCalendarSettings(state);
    return {
      style: { ...global, ...props.modalStyles },
      translate: state.text.translate,
      calendarProviders: state.calendarProviders,
      environment: state.environment,
      pathInfo: state.pathInfo,
      isPreview: state.defaultUserSession?.isPreview,
      isTestMode: state.defaultUserSession?.isTestMode,
      eventInfo,
      eventCalendarDescription: memoized.getEventCalendarDescription(calendarSettings),
      flexAddToGoogleCalendarVirtualEventVariantEnabled: isFlexAddToGoogleCalendarVirtualEventVariant(state),
      addToCalendarEnabled: isAddToCalendarEnabled(state),
      attendeeId: getAttendeeId(state) ?? state.userSession?.inviteeId,
      locale: localeWithCountryCode
    };
  })
)(AddToCalendarDialog);
