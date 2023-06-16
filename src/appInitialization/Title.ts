import { connect } from 'react-redux';
import Title from 'nucleus-guestside-site/src/containers/Title';
import { get } from 'lodash';

function getTitle(userText, pageId, title) {
  return (
    get(userText, 'website.pages.' + pageId + '.title') || get(userText, 'website.pages.' + pageId + '.name') || title
  );
}

export default connect((state: $TSFixMe) => {
  const isArchived = state.event?.isArchived;
  let id = state.pathInfo.currentPageId;
  if (!id && isArchived) {
    id = 'eventArchivePage';
  }
  const translate = state.text.translate;
  const userText = state?.localizedUserText?.currentLocale
    ? get(state.localizedUserText.localizations, state.localizedUserText.currentLocale, null)
    : null;
  const title =
    id && state.website.pages[id]
      ? getTitle(userText, id, state.website.pages[id].title || state.website.pages[id].name)
      : null;
  return {
    title:
      title &&
      translate('AppInitialization_Title_PageTitle__resx', {
        title: translate(title),
        eventTitle: translate(state.event.title)
      })
  };
})(Title);
