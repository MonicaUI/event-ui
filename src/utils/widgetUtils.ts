import getAllWidgetsOnPage from 'nucleus-widgets/utils/layout/getAllWidgetsOnPage';
import { defaultMemoize } from 'reselect';

export const containsVideoWidget = defaultMemoize((website, pageId) => {
  const videoWidget = getAllWidgetsOnPage(website, pageId).find(widget => widget.widgetType === 'Video');
  return !!videoWidget;
});
