import v1PageMigrations from 'nucleus-widgets/migrations/website/v1/pages';

export const LOAD_EVENT_ARCHIVE_PAGE_DATA = 'event-guestside-site/LOAD_EVENT_ARCHIVE_PAGE_DATA';

export const transformAndLoadEventArchivedPageData = (eventArchivePageData: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const { website: existingWebsite } = getState();
    dispatch({
      type: LOAD_EVENT_ARCHIVE_PAGE_DATA,
      payload: {
        website: {
          ...existingWebsite,
          pages: v1PageMigrations(eventArchivePageData.pages),
          layoutItems: eventArchivePageData.layoutItems,
          pluginData: eventArchivePageData.plugins
        }
      }
    });
  };
};
