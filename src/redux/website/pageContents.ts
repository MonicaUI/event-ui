import getRootLayoutItem from 'nucleus-widgets/utils/layout/getRootLayoutItem';
import getAllChildWidgetsInItem from 'nucleus-widgets/utils/layout/getAllChildWidgetsInItem';
import getParentPage from 'nucleus-widgets/utils/layout/getParentPage';
import { mapValues } from 'lodash';
import { getRegistrationPaths } from './selectors';
import { GUEST_REGISTRATION, POST_REGISTRATION, REGISTRATION } from './registrationProcesses';
import { createSelector } from 'reselect';
import { getRegistrationPathIdOrDefault } from '../selectors/currentRegistrationPath';

/**
 * Gets all the widgets across all pages for the registration path. These widgets appear in the order
 * as the user would see them. This assumption is based on CSS not arranging the order or widgets.
 */
export function getOrderedWidgetsInRegistration(
  state: $TSFixMe,
  registrationPathId: $TSFixMe,
  widgetTypes: $TSFixMe
): $TSFixMe {
  const widgets = { [REGISTRATION.registrationFieldPageType]: [], [GUEST_REGISTRATION.registrationFieldPageType]: [] };
  [REGISTRATION, GUEST_REGISTRATION].forEach(pageVariety => {
    pageVariety
      .forRegistrationPath(registrationPathId)
      .pageIds(state)
      .forEach(pageId => {
        const page = state.website.pages[pageId];
        if (page) {
          const pageGroupWidgets = [];
          page.rootLayoutItemIds.forEach(rootId => {
            getAllChildWidgetsInItem(state.website.layoutItems, state.website.layoutItems[rootId], pageGroupWidgets);
          });

          widgets[pageVariety.registrationFieldPageType] = widgets[pageVariety.registrationFieldPageType].concat(
            pageGroupWidgets.filter(widget => widgetTypes.includes(widget.widgetType))
          );
        }
      });
  });
  return widgets;
}

/**
 * Gets all the post registration page widgets across all the registration paths.
 * These widgets appear in the order as the user would see them.
 * This assumption is based on CSS not arranging the order or widgets.
 */
export function getOrderedWidgetsInPostRegistration(
  state: $TSFixMe,
  registrationPathId: $TSFixMe,
  widgetTypes: $TSFixMe
): $TSFixMe {
  const registrationPages = POST_REGISTRATION.forRegistrationPath(registrationPathId)
    .pageIds(state)
    .map(id => state.website.pages[id])
    .filter(page => page);
  const widgets = {};
  widgets[REGISTRATION.registrationFieldPageType] = [];
  registrationPages.forEach(page => {
    const pageGroupWidgets = [];
    page.rootLayoutItemIds.forEach(rootId => {
      getAllChildWidgetsInItem(state.website.layoutItems, state.website.layoutItems[rootId], pageGroupWidgets);
    });

    widgets[REGISTRATION.registrationFieldPageType] = widgets[REGISTRATION.registrationFieldPageType].concat(
      pageGroupWidgets.filter(widget => widgetTypes.includes(widget.widgetType))
    );
  });

  return widgets;
}

/**
 * Gets all the widgets across all pages in all registration paths, organized by registration path.
 * Uses the same ordering logic as getOrderedWidgetsInRegistration.
 */
export function getOrderedWidgetsInAllRegistrationPaths(state: $TSFixMe, widgetTypes: $TSFixMe): $TSFixMe {
  const registrationPaths = getRegistrationPaths(state);
  return mapValues(registrationPaths, path => getOrderedWidgetsInRegistration(state, path.id, widgetTypes));
}

/**
 * Gets all the widgets across all pages in all post registration paths
 * organized by registration path.
 * Uses the same ordering logic as getOrderedWidgetsInRegistration.
 */
export function getOrderedPostRegistrationWidgetsInAllRegistrationPaths(
  state: $TSFixMe,
  widgetTypes: $TSFixMe
): $TSFixMe {
  const registrationPaths = getRegistrationPaths(state);
  return mapValues(registrationPaths, path => getOrderedWidgetsInPostRegistration(state, path.id, widgetTypes));
}

/**
 * Determines if a widget A of a given type appears before a widget B of a given type within the registration path.
 * This only looks for the first instance of each widget type.
 */
export function widgetAppearsFirstInRegistration(
  state: $TSFixMe,
  registrationPathId: $TSFixMe,
  widgetAType: $TSFixMe,
  widgetBType: $TSFixMe
): $TSFixMe {
  const orderedWidgets = getOrderedWidgetsInRegistration(state, registrationPathId, [widgetAType, widgetBType]);
  const firstWidget = orderedWidgets[REGISTRATION.registrationFieldPageType].find(
    widget => widget.widgetType === widgetAType || widget.widgetType === widgetBType
  );
  return !!(firstWidget && firstWidget.widgetType === widgetAType);
}

/**
 * Gets the page of the first appearance of a widget type. If the widget is not found a page is not returned.
 */
export function getPageOfFirstWidgetInstanceInRegistration(
  state: $TSFixMe,
  registrationPathId: $TSFixMe,
  widgetType: $TSFixMe
): $TSFixMe {
  const allWidgets = getOrderedWidgetsInRegistration(state, registrationPathId, [widgetType]);
  const widget = allWidgets[REGISTRATION.registrationFieldPageType][0];

  return widget && getParentPage(state, widget);
}

/**
 * Look through website JSON blob to find out which pages the given widget is on
 * @param {JSON} website - website snapshot, includes layoutItems, pages, and some others
 * @param {object} query - query params for searching:
 *   @property {string} [fieldId] - fieldId field under the layoutItem.config
 *   @property {string} [widgetType] - widget type keyword (declared in widgetFactory)
 * @returns {Array<string>} - list of pageIds that the widget type present
 */
export function findWidgetPresentedPages(website: $TSFixMe, query?: $TSFixMe): $TSFixMe {
  if (!query || typeof query !== 'object') {
    return [];
  }
  const allContainingAncestorWidgetIds = Object.values(website.layoutItems)
    .filter(
      widget =>
        (query.widgetType && (widget as $TSFixMe).widgetType === query.widgetType) ||
        (query.fieldId &&
          (widget as $TSFixMe).config &&
          ((widget as $TSFixMe).config.fieldId === query.fieldId || (widget as $TSFixMe).config.id === query.fieldId))
    )
    .map(widget => getRootLayoutItem(website.layoutItems, widget).id);
  return Object.keys(website.pages).filter(pageId =>
    website.pages[pageId].rootLayoutItemIds.some(id => allContainingAncestorWidgetIds.includes(id))
  );
}

/**
 * Look through website JSON blob to find out which pages the given widget is on
 * @param {JSON} website - website snapshot, includes layoutItems, pages, and some others
 * @property {string} [widgetType] - widget type keyword (declared in widgetFactory)
 * @property {string} [currentPageId] - The page on which we want to search for the widget
 * @returns {boolean} - True if widget is present on this page or else false
 */
export function isWidgetPresentOnCurrentPage(
  website: $TSFixMe,
  widgetType?: $TSFixMe,
  currentPageId?: $TSFixMe
): $TSFixMe {
  return findWidgetPresentedPages(website, { fieldId: '', widgetType }).includes(currentPageId);
}

/**
 * Use registration path information to find out if a widget has present on past pages
 * @param {Object} state - redux state
 * @param {object} query - query params for searching:
 *   @property {string} [fieldId] - fieldId field under the layoutItem.config
 *   @property {string} [widgetType] - widget type keyword (declared in widgetFactory)
 * @returns {boolean}
 */
export function isWidgetReviewed(state: $TSFixMe, query?: $TSFixMe): $TSFixMe {
  if (!query || typeof query !== 'object') {
    return false;
  }
  const widgetLastPresentedPageId = findWidgetPresentedPages(state.website, query);
  const pageIds = REGISTRATION.forCurrentRegistrant().pageIds(state);
  // cyclic dependency with types if import { getCurrentPageId } from '../../pathInfo'
  const currentPageId = state.pathInfo.currentPageId;
  return pageIds.slice(0, pageIds.indexOf(currentPageId)).some(id => widgetLastPresentedPageId.includes(id));
}

/**
 * Gets the page which contains the sessions widget. If the session widget does not exist for registration
 * then no page is returned.
 */
export const getPageWithSessions = (state: $TSFixMe): $TSFixMe =>
  getPageOfFirstWidgetInstanceInRegistration(state, getRegistrationPathIdOrDefault(state), 'Sessions');
/**
 * Gets the page which contains the EventIdentityConfirmation widget.
 * If the EventIdentityConfirmation widget does not exist for registration then no page is returned.
 */
export const getPageWithEventIdentityConfirmation = (state: $TSFixMe): $TSFixMe =>
  getPageOfFirstWidgetInstanceInRegistration(state, getRegistrationPathIdOrDefault(state), 'EventIdentityConfirmation');

/**
 * Gets the page which contains the admission items widget. If the admission items widget does not exist
 * for registration then no page is returned.
 */
export const getPageWithAdmissionItems = (state: $TSFixMe): $TSFixMe =>
  getPageOfFirstWidgetInstanceInRegistration(state, getRegistrationPathIdOrDefault(state), 'AdmissionItems');

/**
 * Gets the page which contains the registration type widget. If the admission items widget does not exist
 * for registration then no page is returned.
 */
export const getPageWithRegistrationType = (state: $TSFixMe): $TSFixMe =>
  getPageOfFirstWidgetInstanceInRegistration(state, getRegistrationPathIdOrDefault(state), 'RegistrationType');

/**
 * Gets the page which contains the payment widget.
 * If the payment does not exist for registration then no page is returned.
 */
export const getPageWithPayment = (state: $TSFixMe): $TSFixMe =>
  getPageOfFirstWidgetInstanceInRegistration(state, getRegistrationPathIdOrDefault(state), 'Payment');

/**
 * Gets the page which contains the registration summary widget.
 * If the registration summary widget does not exist
 * for registration then no page is returned.
 */
export const getPageWithRegistrationSummary = (state: $TSFixMe): $TSFixMe =>
  getPageOfFirstWidgetInstanceInRegistration(state, getRegistrationPathIdOrDefault(state), 'RegistrationSummary');

/**
 * Determines if the sessions widget appears before the admission item widget in registration. If neither widget
 * is a part of registration this will simply return false.
 */
export const sessionsAppearBeforeAdmissionItems = (state: $TSFixMe): $TSFixMe =>
  widgetAppearsFirstInRegistration(state, getRegistrationPathIdOrDefault(state), 'Sessions', 'AdmissionItems');

/**
 * Determines if the sessions widget appears before the registration type  widget in registration. If neither widget
 * is a part of registration this will simply return false.
 */
export const sessionsAppearBeforeRegistrationType = (state: $TSFixMe): $TSFixMe =>
  widgetAppearsFirstInRegistration(state, getRegistrationPathIdOrDefault(state), 'Sessions', 'RegistrationType');

/**
 * Determines if the reg type widget appears before the EventIdentityConfirmation widget in registration.
 * If neither widget is a part of registration this will simply return false.
 */
export const regTypeAppearBeforeEventIdentityConfirmation = (state: $TSFixMe): $TSFixMe =>
  widgetAppearsFirstInRegistration(
    state,
    getRegistrationPathIdOrDefault(state),
    'RegistrationType',
    'EventIdentityConfirmation'
  );

/**
 * Determines if the sessions widget appears on a page before the admission item widget in registration.
 * If neither widget is a part of registration this will simply return false.
 */
export const sessionsAppearOnPageBeforeAdmissionItems = createSelector(
  sessionsAppearBeforeAdmissionItems,
  getPageWithAdmissionItems,
  getPageWithSessions,
  (isSessionsBeforeAdmissionItems, pageWithAdmissionItems, pageWithSessions) => {
    return (
      isSessionsBeforeAdmissionItems &&
      pageWithAdmissionItems &&
      pageWithSessions &&
      pageWithAdmissionItems.id !== pageWithSessions.id
    );
  }
);
/**
 * Determines if the sessions widget appears on a page before the registration type widget in registration.
 * If neither widget is a part of registration this will simply return false.
 */
export const sessionsAppearOnPageBeforeRegistrationType = createSelector(
  sessionsAppearBeforeRegistrationType,
  getPageWithRegistrationType,
  getPageWithSessions,
  (isSessionsBeforeRegistrationType, pageWithRegistrationType, pageWithSessions) => {
    return (
      isSessionsBeforeRegistrationType &&
      pageWithRegistrationType &&
      pageWithSessions &&
      pageWithRegistrationType.id !== pageWithSessions.id
    );
  }
);

/**
 * Determines if the Session widget appears on same page as Payment or Registration Summary widgets in
 * registration. If none of the widgets are a part of registration this will simply return false.
 */
export const sessionsAppearOnSamePageAsPaymentOrRegSummary = createSelector(
  getPageWithPayment,
  getPageWithSessions,
  getPageWithRegistrationSummary,
  (pageWithPayment, pageWithSessions, pageWithRegSummary) => {
    return pageWithPayment?.id === pageWithSessions?.id || pageWithRegSummary?.id === pageWithSessions?.id;
  }
);

/**
 * Determines if the registration type widget appears on a page before the EventIdentityConfirmation widget in
 * registration. If neither widget is a part of registration this will simply return false.
 */
export const regTypeAppearOnPageBeforeEventIdentityConfirmation = createSelector(
  regTypeAppearBeforeEventIdentityConfirmation,
  getPageWithEventIdentityConfirmation,
  getPageWithRegistrationType,
  (isRegTypeBeforesEventIdentityConfirmation, pageWithEventIdentityConfirmation, pageWithRegistrationType) => {
    return (
      isRegTypeBeforesEventIdentityConfirmation &&
      pageWithEventIdentityConfirmation &&
      pageWithRegistrationType &&
      pageWithEventIdentityConfirmation.id !== pageWithRegistrationType.id
    );
  }
);

export const getWidget = (state: $TSFixMe, widgetType: $TSFixMe): $TSFixMe => {
  const allWidgets = getOrderedWidgetsInRegistration(state, getRegistrationPathIdOrDefault(state), [widgetType]);
  return allWidgets[REGISTRATION.registrationFieldPageType][0] || {};
};

export const getGuestRegistrationPageWidget = (state: $TSFixMe, widgetType: $TSFixMe): $TSFixMe => {
  const allWidgets = getOrderedWidgetsInRegistration(state, getRegistrationPathIdOrDefault(state), [widgetType]);
  return allWidgets[GUEST_REGISTRATION.registrationFieldPageType][0] || {};
};

/**
 * Gets the page which contains the quantity items widget.
 * If the quantity item widget does not exist for registration, then no page is returned.
 */
export const getPageWithQuantityItems = (state: $TSFixMe): $TSFixMe =>
  getPageOfFirstWidgetInstanceInRegistration(state, getRegistrationPathIdOrDefault(state), 'QuantityItems');

/**
 * Determines if the quantity items widget appears before the registration type  widget in registration.
 * If neither widget is a part of registration this will simply return false.
 */
export const quantityItemsAppearBeforeRegistrationType = (state: $TSFixMe): $TSFixMe =>
  widgetAppearsFirstInRegistration(state, getRegistrationPathIdOrDefault(state), 'QuantityItems', 'RegistrationType');

/**
 * Determines if the quantity items widget appears on a page before the registration type widget in registration.
 * If neither widget is a part of registration this will simply return false.
 */
export const quantityItemsAppearOnPageBeforeRegistrationType = createSelector(
  quantityItemsAppearBeforeRegistrationType,
  getPageWithRegistrationType,
  getPageWithQuantityItems,
  (isQuantityItemsBeforeRegistrationType, pageWithRegistrationType, pageWithQuantityItems) => {
    return (
      isQuantityItemsBeforeRegistrationType &&
      pageWithRegistrationType &&
      pageWithQuantityItems &&
      pageWithRegistrationType.id !== pageWithQuantityItems.id
    );
  }
);

/**
 * Determines if the quantity items widget appears before the admission item widget in registration.
 * If neither widget is a part of registration this will simply return false.
 */
export const quantityItemsAppearBeforeAdmissionItems = (state: $TSFixMe): $TSFixMe =>
  widgetAppearsFirstInRegistration(state, getRegistrationPathIdOrDefault(state), 'QuantityItems', 'AdmissionItems');

/**
 * Determines if the quantity item widget appears before the EventIdentityConfirmation widget in registration.
 * If neither widget is a part of registration this will simply return false.
 */
export const quantityItemAppearBeforeEventIdentityConfirmation = (state: $TSFixMe): $TSFixMe =>
  widgetAppearsFirstInRegistration(
    state,
    getRegistrationPathIdOrDefault(state),
    'QuantityItems',
    'EventIdentityConfirmation'
  );

/**
 * Determines if the quantity items widget appears on a page before the admission item widget in registration.
 * If neither widget is a part of registration this will simply return false.
 */
export const quantityItemsAppearOnPageBeforeAdmissionItems = createSelector(
  quantityItemsAppearBeforeAdmissionItems,
  getPageWithAdmissionItems,
  getPageWithQuantityItems,
  (isQuantityItemsBeforeAdmissionItems, pageWithAdmissionItems, pageWithQuantityItems) => {
    return (
      isQuantityItemsBeforeAdmissionItems &&
      pageWithAdmissionItems &&
      pageWithQuantityItems &&
      pageWithAdmissionItems.id !== pageWithQuantityItems.id
    );
  }
);

/**
 * Determines if the quantity item widget appears on a page before the EventIdentityConfirmation widget in
 * registration. If neither widget is a part of registration this will simply return false.
 */
export const quantityItemAppearOnPageBeforeEventIdentityConfirmation = createSelector(
  quantityItemAppearBeforeEventIdentityConfirmation,
  getPageWithEventIdentityConfirmation,
  getPageWithQuantityItems,
  (isQuantityItemBeforesEventIdentityConfirmation, pageWithEventIdentityConfirmation, pageWithQuantityItems) => {
    return (
      isQuantityItemBeforesEventIdentityConfirmation &&
      pageWithEventIdentityConfirmation &&
      pageWithQuantityItems &&
      pageWithEventIdentityConfirmation.id !== pageWithQuantityItems.id
    );
  }
);

/**
 * Determines if the quantity item widget appears on same page as the Payment or Registration Summary
 * widgets in registration. If none of the widgets are a part of registration this will simply return false.
 */
export const quantityItemAppearOnSamePageAsPaymentOrRegSummary = createSelector(
  getPageWithPayment,
  getPageWithQuantityItems,
  getPageWithRegistrationSummary,
  (pageWithPayment, pageWithQuantityItems, pageWithRegSummary) => {
    return pageWithPayment?.id === pageWithQuantityItems?.id || pageWithRegSummary?.id === pageWithQuantityItems?.id;
  }
);
