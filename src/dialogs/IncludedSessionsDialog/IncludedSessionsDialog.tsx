import React from 'react';
import StandardDialog from '../shared/StandardDialog';
import { injectTestId } from '@cvent/nucleus-test-automation';
import Sessions from 'event-widgets/lib/Sessions/Sessions';
import { adjustTimeZoneTimesForSessions } from 'event-widgets/redux/selectors/website/sessions';

export const IncludedSessionsDialog = (props: $TSFixMe): $TSFixMe => {
  const {
    config: { display, filter },
    sessionCategoryListOrders,
    speakerCategories,
    switchTimeZone,
    translate,
    title,
    style,
    classes,
    onClose,
    sessionBundle,
    sessionBundleSessions,
    selectedTimeZone,
    eventTimezone,
    contentStyle,
    palette
  } = props;

  const compositeSessions = adjustTimeZoneTimesForSessions(
    sessionBundleSessions.map(session => {
      const speakers = [];
      const ids = Object.keys(session.speakerIds);
      for (let i = 0; i < ids.length; i++) {
        speakers.push(props.speakers[ids[i]]);
      }
      return {
        speakers,
        ...session
      };
    }),
    selectedTimeZone,
    eventTimezone
  );

  return (
    <StandardDialog
      title={translate(title, { sessionBundleName: translate(sessionBundle.name) })}
      closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
      onClose={onClose}
      style={style}
      classes={classes}
    >
      <Sessions
        {...props}
        {...injectTestId('sessions')}
        isIncludedWithSessionBundleForAttendees
        instructionalText=""
        headerText=""
        classes={classes}
        style={{ palette, ...contentStyle }}
        displayOptions={display}
        overrideFullCapacity={false}
        translate={translate}
        filterOptions={filter}
        sessionCategoryListOrders={sessionCategoryListOrders}
        compositeSessions={compositeSessions}
        speakerCategories={speakerCategories}
        switchTimeZone={switchTimeZone}
        selectedSessionFilters={{ keywordFilterValue: '', selectedFilterChoices: {} }}
      />
    </StandardDialog>
  );
};
