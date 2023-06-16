export default function pageContainingWidgetFixture(pageId: $TSFixMe, widgetId: $TSFixMe): $TSFixMe {
  const pages = {
    [pageId]: {
      id: pageId,
      name: pageId,
      title: pageId,
      version: 1,
      rootLayoutItemIds: ['container'],
      type: 'PAGE'
    }
  };
  const layoutItems = {
    container: {
      id: 'container',
      layout: {
        type: 'container',
        parentId: null,
        childIds: [widgetId]
      }
    },
    [widgetId]: {
      id: widgetId,
      layout: {
        type: 'page',
        parentId: 'container',
        childIds: []
      },
      config: {}
    }
  };
  return { pages, layoutItems };
}
