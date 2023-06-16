import React from 'react';
import { connect } from 'react-redux';
import ReadOnlyContent from 'nucleus-widgets/renderers/readOnlyContent';
import { RootState } from '../redux/reducer';
import { Page } from '@cvent/flex-event-shared/target/guestside';
import { MappedPage } from './useGraphQLPageData';

type ReadOnlyContentProps = {
  rootLayoutItemId: string;
  page?: Page | MappedPage;
  layoutItems?: unknown;
};

const Content = connect((state: RootState, props: ReadOnlyContentProps) => {
  return {
    isGuest: true,
    theme: state.website.theme,
    imageLookup: state.imageLookup,
    browserFeatures: state.browserFeatures,
    layoutItems: props.page && 'layoutItems' in props.page ? props.page?.layoutItems : state.website.layoutItems,
    widgetFactory: state.widgetFactory,
    guestTranslate: state.text.translate
  };
})(ReadOnlyContent) as React.FunctionComponent<ReadOnlyContentProps>;

Content.displayName = 'Content';

export default Content;
