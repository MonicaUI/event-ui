import React from 'react';
import PropTypes from 'prop-types';
import ThemeableComponent from 'nucleus-widgets/lib/ThemeableComponent';
import { connect } from 'react-redux';
import { keys, map, merge, sortBy } from 'lodash';
import { isLoggedIn, getAttendeeId } from '../../redux/selectors/currentRegistrant';
import StandardDialog from '../shared/StandardDialog';
import { resolve, select } from '@cvent/nucleus-dynamic-css';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import Button from 'nucleus-core/buttons/Button';
import { withStyles } from '../ThemedDialog';
import { EMPTY_ARRAY } from '../../redux/selectors/shared';
import CalendarContentType from './CalendarContentType';
import { fileSelectionOptions, CalendarType, IcsFileCalendarTypes } from './CalendarDownloadFileType';
import { resolveTestId } from '@cvent/nucleus-test-automation';
import { adjustTimeZoneTimesForSessions } from 'event-widgets/redux/selectors/website/sessions';
import { adjustTimeZoneTimesForEvent } from 'event-widgets/redux/selectors/event';
import { getEventTimezone } from '../../redux/reducer';
import { getSelectedTimezone, getTimezoneAbbreviation } from 'event-widgets/redux/selectors/timezone';
import TimeZoneWidget from 'event-widgets/lib/TimeZone/TimeZoneWidget';
import Select from 'nucleus-core/forms/elements/Select';
import {
  formatDownloadIcsFileUrl,
  getCalendarSettings,
  getEventCalendarDescription,
  getEventInfo,
  getCalendarUrl,
  getGoogleCalendar,
  getPreviewToken,
  getTestModeHash,
  isFlexAddToGoogleCalendarVirtualEventVariant,
  CALENDAR_EVENT_ID,
  isFlexAddToGoogleCalendarEnabledVariant,
  getOutlookCalendar,
  openCalendar,
  isAddToCalendarEnabled
} from '../../utils/addToCalendarUtils';
import { getFullLanguageFromDefaultMapping } from 'event-widgets/utils/getMatchingLocale';
import { loadEventCalendarUrl, loadSessionCalendarUrl } from '../../redux/addToCalendar/actions';
import { createSelector } from 'reselect';
import { getPrimaryAndGuestSelectedSessions } from '../../redux/selectors/productSelectors';
import { injectTestId } from '@cvent/nucleus-test-automation';

const EMPTY_OBJECT = Object.freeze({});
const Dialog = withStyles(StandardDialog);

class DownloadCalendarDialog extends ThemeableComponent<$TSFixMe, $TSFixMe> {
  static propTypes = {
    modalStyles: PropTypes.object,
    style: PropTypes.object,
    switchTimeZone: PropTypes.func,
    locale: PropTypes.string.isRequired,
    isPreview: PropTypes.bool,
    isTestMode: PropTypes.bool,
    loadEventCalendarUrls: PropTypes.func,
    loadSessionCalendarUrls: PropTypes.func,
    calendarProviders: PropTypes.object,
    addToCalendarEnabled: PropTypes.bool
  };
  getElementInlineStyle: $TSFixMe;
  getElementText: $TSFixMe;
  props: $TSFixMe;
  setState: $TSFixMe;
  state: $TSFixMe;
  constructor(props) {
    super(props);
    const selectOptions = this.getSelectOptions();
    this.state = {
      selectOptions
    };
  }

  shouldLoadOutlookCalendarUrl(selectedCalendarType, calendarProviders, entityId?) {
    return selectedCalendarType === CalendarType.OUTLOOK && !getOutlookCalendar(calendarProviders, entityId);
  }

  shouldLoadGoogleCalendarUrl(selectedCalendarType, calendarProviders, entityId?) {
    return selectedCalendarType === CalendarType.GOOGLE && !getGoogleCalendar(calendarProviders, entityId);
  }

  shouldLoadEventCalendarUrls(loadEventCalendarUrls, calendarProviders, entityId, selectedCalendarType) {
    return (
      entityId === CALENDAR_EVENT_ID &&
      loadEventCalendarUrls &&
      (this.shouldLoadGoogleCalendarUrl(selectedCalendarType, calendarProviders) ||
        this.shouldLoadOutlookCalendarUrl(selectedCalendarType, calendarProviders))
    );
  }

  shouldLoadSessionCalendarUrls(loadSessionCalendarUrls, calendarProviders, selectedCalendarType, entityId) {
    return (
      loadSessionCalendarUrls &&
      (this.shouldLoadGoogleCalendarUrl(selectedCalendarType, calendarProviders, entityId) ||
        this.shouldLoadOutlookCalendarUrl(selectedCalendarType, calendarProviders, entityId))
    );
  }

  async loadEventCalendarUrl(
    selectedCalendarType,
    loadEventCalendarUrls,
    attendeeId,
    isPreview,
    pathInfo,
    isTestMode,
    locale
  ) {
    await loadEventCalendarUrls(
      selectedCalendarType,
      attendeeId,
      null,
      getPreviewToken(isPreview, pathInfo),
      getTestModeHash(isTestMode, pathInfo),
      locale
    );
  }

  async loadSessionCalendarUrl(
    selectedCalendarType,
    loadSessionCalendarUrls,
    entityId,
    attendeeId,
    isPreview,
    pathInfo,
    isTestMode,
    locale
  ) {
    await loadSessionCalendarUrls(
      selectedCalendarType,
      entityId,
      attendeeId,
      null,
      getPreviewToken(isPreview, pathInfo),
      getTestModeHash(isTestMode, pathInfo),
      locale
    );
  }

  getSelectedValueAsCalendarType(selectedCalendarType) {
    return selectedCalendarType === CalendarType.GOOGLE ? CalendarType.GOOGLE : CalendarType.OUTLOOK;
  }
  /**
   * If virtual event variant is on or if outlook is selected, we will using new calendar service which supports
   * both In-Person and virtual events/sessions for calendar types
   */
  async loadCalendarUrl(entityId, selectedCalendarType) {
    const { isPreview, isTestMode, locale, pathInfo, loadEventCalendarUrls, loadSessionCalendarUrls, attendeeId } =
      this.props;

    if (
      this.shouldLoadEventCalendarUrls(
        loadEventCalendarUrls,
        this.props.calendarProviders,
        entityId,
        selectedCalendarType
      )
    ) {
      await this.loadEventCalendarUrl(
        this.getSelectedValueAsCalendarType(selectedCalendarType),
        loadEventCalendarUrls,
        attendeeId,
        isPreview,
        pathInfo,
        isTestMode,
        locale
      );
    } else if (
      this.shouldLoadSessionCalendarUrls(
        loadSessionCalendarUrls,
        this.props.calendarProviders,
        selectedCalendarType,
        entityId
      )
    ) {
      await this.loadSessionCalendarUrl(
        this.getSelectedValueAsCalendarType(selectedCalendarType),
        loadSessionCalendarUrls,
        entityId,
        attendeeId,
        isPreview,
        pathInfo,
        isTestMode,
        locale
      );
    }
    window.open(openCalendar(selectedCalendarType, entityId, this.props.calendarProviders));
  }

  getStyleObject() {
    return {
      eventHeader: this.getElementInlineStyle('eventHeader'),
      sessionHeader: this.getElementInlineStyle('sessionHeader'),
      sessionHeaderOnly: this.getElementInlineStyle('sessionHeaderOnly'),
      itemTitle: this.getElementInlineStyle('itemTitle'),
      description: this.getElementInlineStyle('description'),
      button: this.getElementInlineStyle('button'),
      messageContainer: { ...this.getElementInlineStyle('messageContainer') },
      link: this.getElementInlineStyle('link'),
      dateRange: this.getElementInlineStyle('dateRange'),
      noSessionNotification: this.getElementInlineStyle('noSessionNotification'),
      card: this.getElementInlineStyle('card'),
      dropdownLabel: this.getElementInlineStyle('dropdownLabel'),
      select: this.getElementText('calendarTypeNameStyles')
    };
  }
  shouldShowEventCalendar() {
    const { calendarContentType } = this.props;
    return calendarContentType === CalendarContentType.ALL || calendarContentType === CalendarContentType.EVENT;
  }
  shouldShowSessionCalendar() {
    const { calendarContentType } = this.props;
    return (
      (calendarContentType === CalendarContentType.ALL || calendarContentType === CalendarContentType.SESSION) &&
      this.props.isUserLoggedIn &&
      this.props.sessions?.length > 0
    );
  }
  onlySessionCalendar() {
    const { calendarContentType } = this.props;
    return calendarContentType === CalendarContentType.SESSION;
  }
  renderDateTimeRange(style, startDateTime, endDateTime) {
    const { translateDate, translateTime, selectedTimeZone, translate } = this.props;
    const timeZone = getTimezoneAbbreviation(translate, selectedTimeZone);
    return (
      <div {...resolve(style, 'dateRange')} {...injectTestId('download-calendar-date-time-range')}>
        {translateDate(new Date(startDateTime), 'short')},{' '}
        {startDateTime && translateTime(new Date(startDateTime), 'short')} {endDateTime && ' - '}
        {endDateTime && translateDate(new Date(endDateTime), 'short')},{' '}
        {endDateTime && translateTime(new Date(endDateTime), 'short')}
        {!!timeZone && timeZone}
      </div>
    );
  }
  updateTheEventOrSessionTitle(translate, eventInfoOrSessionDetails) {
    return {
      ...eventInfoOrSessionDetails,
      title: translate(eventInfoOrSessionDetails.title)
    };
  }
  getSessionDownloadUrl(session) {
    const { sessionId } = session;
    const {
      pathInfo,
      environment,
      calendarProviders,
      locale,
      translate,
      isPreview,
      isTestMode,
      flexAddToGoogleCalendarVirtualEventVariantEnabled,
      addToCalendarEnabled,
      attendeeId
    } = this.props;
    const { selectedValue } = this.state.selectOptions;
    if (selectedValue === CalendarType.GOOGLE) {
      return flexAddToGoogleCalendarVirtualEventVariantEnabled
        ? getGoogleCalendar(calendarProviders, sessionId)
        : getCalendarUrl(
            calendarProviders.Google.calendarProviderURL,
            this.updateTheEventOrSessionTitle(translate, session)
          );
    } else if (addToCalendarEnabled && selectedValue === CalendarType.OUTLOOK) {
      return getOutlookCalendar(calendarProviders, sessionId);
    }

    return formatDownloadIcsFileUrl({
      calendarBasePath: pathInfo.baseUrl,
      environment,
      locale,
      sessionId,
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ calendarBasePath: any; environ... Remove this comment to see the full error message
      getPreviewToken: getPreviewToken(isPreview, isTestMode),
      testModeHash: getTestModeHash(isPreview, isTestMode),
      eventId: pathInfo.eventId,
      addToCalendarEnabled,
      calendarType: selectedValue,
      attendeeId
    });
  }
  getEventDownloadUrl() {
    const {
      environment,
      calendarProviders,
      locale,
      eventCalendarDescription,
      eventInfo,
      translate,
      pathInfo,
      isPreview,
      isTestMode,
      flexAddToGoogleCalendarVirtualEventVariantEnabled,
      addToCalendarEnabled,
      attendeeId
    } = this.props;

    const { selectedValue } = this.state.selectOptions;
    if (selectedValue === CalendarType.GOOGLE) {
      return flexAddToGoogleCalendarVirtualEventVariantEnabled
        ? getGoogleCalendar(calendarProviders)
        : getCalendarUrl(
            calendarProviders.Google.calendarProviderURL,
            this.updateTheEventOrSessionTitle(translate, eventInfo),
            true,
            eventCalendarDescription
          );
    } else if (addToCalendarEnabled && selectedValue === CalendarType.OUTLOOK) {
      return getOutlookCalendar(calendarProviders);
    }

    return formatDownloadIcsFileUrl({
      calendarBasePath: pathInfo.baseUrl,
      environment,
      locale,
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ calendarBasePath: any; environ... Remove this comment to see the full error message
      getPreviewToken: getPreviewToken(isPreview, pathInfo),
      testModeHash: getTestModeHash(isTestMode, pathInfo),
      eventId: pathInfo.eventId,
      addToCalendarEnabled,
      calendarType: selectedValue,
      attendeeId
    });
  }
  updateFileType = (fieldName, newValue, newOptions) => {
    this.setState({
      selectOptions: newOptions
    });
  };
  getSelectOptions = () => {
    const { translate, addToCalendarEnabled } = this.props;
    return fileSelectionOptions(translate, addToCalendarEnabled);
  };

  render() {
    const {
      eventInfo,
      isUserLoggedIn,
      sessions,
      translate,
      onClose,
      style: { palette },
      classes,
      login,
      isFlexAddToGoogleCalendarEnabled,
      flexAddToGoogleCalendarVirtualEventVariantEnabled,
      translateWithDatatags
    } = this.props;
    const cardStyle = {
      padding: '16px 12px 0px 12px',
      margin: '10px 0 10px 0'
    };
    const calculatedStyles = this.getStyleObject();
    const style = { style: { ...calculatedStyles, card: { ...calculatedStyles.card, ...cardStyle } }, classes };
    const hideAdjustTimeZone = true;
    return (
      <Dialog
        onClose={onClose}
        classes={classes}
        title={translate('EventGuestSide_DownloadCalendarModal_AddToCalendar__resx')}
      >
        <div {...resolveTestId(this.props, '-container')}>
          <TimeZoneWidget
            instructionalTextStyles="instructionalText"
            hideAdjustTimeZone={hideAdjustTimeZone}
            classes={classes}
            style={style}
            widgetName="addToCalendar"
          />
          {isFlexAddToGoogleCalendarEnabled && (this.shouldShowEventCalendar() || this.shouldShowSessionCalendar()) && (
            <div {...resolve(style, 'dropdownContainer')}>
              <div {...resolve(style, 'dropdownLabel')}>
                {translate('EventGuestSide_DownloadCalendarModal_FileType__resx')}
              </div>
              {this.renderSelect(style)}
            </div>
          )}
          {this.shouldShowEventCalendar() && (
            <div {...resolveTestId(this.props, '-event-container')}>
              <div {...resolve(style, 'eventHeader')}>
                {translate('EventGuestSide_DownloadCalendarModal_EventHeader__resx')}
              </div>
              <div {...resolve(style, 'description')}>
                {translate('EventGuestSide_DownloadCalendarModal_DownloadEventInstructions__resx')}
              </div>
              {this.renderItem(
                'event',
                style,
                palette,
                translate,
                translate(eventInfo.title),
                eventInfo.startDate,
                eventInfo.endDate,
                this.getEventDownloadUrl(),
                flexAddToGoogleCalendarVirtualEventVariantEnabled,
                CALENDAR_EVENT_ID
              )}
            </div>
          )}
          {this.shouldShowSessionCalendar() ? (
            <div {...resolveTestId(this.props, '-session-container')}>
              <div {...resolve(style, this.onlySessionCalendar() ? 'sessionHeaderOnly' : 'sessionHeader')}>
                {translate('EventGuestSide_DownloadCalendarModal_SessionsHeader__resx')}
              </div>
              <div {...resolve(style, 'description')}>
                {translate('EventGuestSide_DownloadCalendarModal_DownloadSessionsInstructions__resx')}
              </div>
              {sessions.map(session =>
                this.renderItem(
                  'session',
                  style,
                  palette,
                  translate,
                  translateWithDatatags(session.title),
                  session.startTime,
                  session.endTime,
                  this.getSessionDownloadUrl(session),
                  flexAddToGoogleCalendarVirtualEventVariantEnabled,
                  session.sessionId
                )
              )}
            </div>
          ) : (
            <div {...resolveTestId(this.props, '-sessioncalender-nosession')}>
              {this.onlySessionCalendar() && isUserLoggedIn && (
                <div {...resolve(style, 'noSessionNotification')}>
                  {translate('EventGuestSide_DownloadCalendarModal_NoSessionNotification__resx')}
                </div>
              )}
            </div>
          )}
          {!isUserLoggedIn && (
            <div {...resolve(this.props, 'loginButtonContainer')}>
              <Button
                kind="secondaryButton"
                {...select(style, 'button')}
                onClick={() => login()}
                {...resolveTestId(this.props, '-login')}
                title={translate('EventGuestSide_DownloadCalendarModal_LoginText__resx')}
              />
            </div>
          )}
        </div>
      </Dialog>
    );
  }
  renderSelect({ style, classes }) {
    return (
      <Select
        options={this.state.selectOptions}
        onChange={this.updateFileType}
        breakPoint="mediaMedium"
        fieldName="fileType"
        style={style}
        classes={classes}
        {...resolveTestId(this.props, '-dropdown-container')}
      />
    );
  }
  renderItem(
    type,
    style,
    palette,
    translate,
    title,
    startDate,
    endDate,
    downloadUrl,
    flexAddToGoogleCalendarVirtualEventVariantEnabled,
    entityId
  ) {
    const { selectedValue } = this.state.selectOptions;
    return (
      <div {...resolve(style, 'card')}>
        <div>
          <div {...resolve(style, 'itemTitle')}>{title}</div>
          {this.renderDateTimeRange(style, startDate, endDate)}
        </div>
        <div {...resolve(style, 'downloadButtonContainer')}>
          {!IcsFileCalendarTypes.includes(selectedValue)
            ? this.renderAnchorItem(
                style,
                type,
                downloadUrl,
                translate,
                '_blank',
                entityId,
                flexAddToGoogleCalendarVirtualEventVariantEnabled,
                selectedValue
              )
            : this.renderAnchorItem(style, type, downloadUrl, translate, '')}
        </div>
      </div>
    );
  }
  renderAnchorItem(
    style,
    type,
    downloadUrl,
    translate,
    target,
    entityId?,
    flexAddToGoogleCalendarVirtualEventVariantEnabled = false,
    selectedCalendarType?
  ) {
    if (flexAddToGoogleCalendarVirtualEventVariantEnabled || selectedCalendarType === CalendarType.OUTLOOK) {
      return (
        <a
          onClick={() => this.loadCalendarUrl(entityId, selectedCalendarType)}
          {...resolve(style, 'linkButton', 'link', 'inlineBlock')}
          {...resolveTestId(this.props, `-${type}-download`)}
        >
          {translate('EventGuestSide_DownloadCalendarModal_Download__resx')}
        </a>
      );
    }
    return (
      <a
        {...resolve(style, 'linkButton', 'link', 'inlineBlock')}
        href={downloadUrl}
        {...resolveTestId(this.props, `-${type}-download`)}
        target={target}
      >
        {translate('EventGuestSide_DownloadCalendarModal_Download__resx')}
      </a>
    );
  }
}

/**
 * return all the sessions a registrant is registered for
 */
export const getSessions = createSelector(
  state => getPrimaryAndGuestSelectedSessions(state),
  state => (state as $TSFixMe).visibleProducts.Widget.sessionProducts,
  state => (state as $TSFixMe).text.translate,
  (registeredSessions, availableSessions, translate) => {
    // Fix for https://jira.cvent.com/browse/PROD-106981 in case planner delete any session in test mode
    const filteredSessionIds = keys(registeredSessions || EMPTY_OBJECT).filter(
      sessionId => availableSessions[sessionId]
    );
    const sessions = map(filteredSessionIds, sessionId => {
      const product = availableSessions[sessionId];
      return {
        sessionId,
        title: translate(product.name),
        startTime: product.startTime,
        endTime: product.endTime,
        location: translate(product.locationName),
        description: translate(product.description),
        displayPriority: product.displayPriority
      };
    });
    // Fix for PROD-121926, sort the sessions according to displayPriority.
    const sortedSessions = sortBy(sessions, s => s.title);
    const sessionsSortedByDp = sortBy(sortedSessions, s => (s.displayPriority === 0 ? Infinity : s.displayPriority));
    return sortBy(sessionsSortedByDp, s => s.startTime);
  }
);
const dialogStyle = (globalTheme, modalStyles) => {
  return {
    ...globalTheme,
    eventHeader: modalStyles.headerStyles,
    sessionHeader: modalStyles.headerStyles,
    sessionHeaderOnly: modalStyles.headerStyles,
    itemTitle: modalStyles.titleStyles,
    description: modalStyles.instructionTextStyles,
    button: modalStyles.loginButtonStyles,
    link: modalStyles.downloadLinkStyles,
    dateRange: modalStyles.dateTimeStyles,
    card: modalStyles.cardStyles,
    noSessionNotification: { styleMapping: 'text1' },
    dropdownLabel: { styleMapping: 'text2' },
    calendarTypeNameStyles: modalStyles.calendarTypeNameStyles
  };
};

export default connect(
  withMemoizedFunctions({ getEventCalendarDescription })(memoized => (state: $TSFixMe, props: $TSFixMe) => {
    const {
      customFonts,
      website: {
        theme: { global }
      }
    } = state;
    const eventTimezone = getEventTimezone(state);
    const selectedTimeZone = getSelectedTimezone(state);
    let eventInfo = getEventInfo(state);
    let sessions = isLoggedIn(state) ? getSessions(state) : EMPTY_ARRAY;
    eventInfo = adjustTimeZoneTimesForEvent(eventInfo, selectedTimeZone, eventTimezone);
    sessions = adjustTimeZoneTimesForSessions(sessions, selectedTimeZone, eventTimezone);
    // set the full language locale
    const locale = state.multiLanguageLocale?.locale;
    const localeWithCountyCode = locale ? getFullLanguageFromDefaultMapping(locale) : locale;
    const calendarSettings = getCalendarSettings(state);

    return {
      style: merge({}, dialogStyle(global, props.modalStyles), { customFonts }),
      eventInfo,
      translate: state.text.translate,
      translateDate: state.text.translateDate,
      translateTime: state.text.translateTime,
      sessions,
      isUserLoggedIn: isLoggedIn(state),
      calendarContentType: calendarSettings.calendarContentType,
      eventCalendarDescription: memoized.getEventCalendarDescription(calendarSettings),
      pathInfo: state.pathInfo,
      isPreview: state.defaultUserSession?.isPreview,
      isTestMode: state.defaultUserSession?.isTestMode,
      environment: state.environment,
      selectedTimeZone,
      calendarProviders: state.calendarProviders,
      isFlexAddToGoogleCalendarEnabled: isFlexAddToGoogleCalendarEnabledVariant(state),
      addToCalendarEnabled: isAddToCalendarEnabled(state),
      flexAddToGoogleCalendarVirtualEventVariantEnabled: isFlexAddToGoogleCalendarVirtualEventVariant(state),
      locale: localeWithCountyCode,
      attendeeId: getAttendeeId(state) ?? state.userSession?.inviteeId,
      translateWithDatatags: state.text.translateWithDatatags
    };
  }),
  {
    loadEventCalendarUrls: loadEventCalendarUrl,
    loadSessionCalendarUrls: loadSessionCalendarUrl
  }
)(DownloadCalendarDialog);
