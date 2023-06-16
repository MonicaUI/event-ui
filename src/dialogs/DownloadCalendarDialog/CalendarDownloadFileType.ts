/**
 * The type id is the same as Calendar_Provider_Id as present in Lu_Calendar_Provider table
 */
export const CalendarType = {
  ICS: 'ics',
  GOOGLE: 'google',
  OUTLOOK: 'outlook',
  ICAL: 'ical'
};

/**
 * Calendar Types that downloads an ics file.
 */
export const IcsFileCalendarTypes = [CalendarType.ICS, CalendarType.ICAL];

export function fileSelectionOptions(translate: $TSFixMe, isAddToCalendarEnabled?: $TSFixMe): $TSFixMe {
  const optionArray = [
    {
      value: CalendarType.ICS,
      name: translate('AddtoCalendar_EventCalendarDownloadOptions_ics__resx')
    },
    ...(isAddToCalendarEnabled
      ? [
          {
            value: CalendarType.ICAL,
            name: translate('AddtoCalendar_EventCalendarDownloadOptions_AppleCalendar__resx')
          }
        ]
      : []),
    {
      value: CalendarType.GOOGLE,
      name: translate('AddtoCalendar_EventCalendarDownloadOptions_GoogleCalendar__resx')
    },
    ...(isAddToCalendarEnabled
      ? [
          {
            value: CalendarType.OUTLOOK,
            name: translate('AddtoCalendar_EventCalendarDownloadOptions_OutlookWeb__resx')
          }
        ]
      : [])
  ];

  return { optionArray: optionArray.filter(option => !!option), selectedValue: CalendarType.ICS };
}
