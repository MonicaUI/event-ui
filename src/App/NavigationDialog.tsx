import React from 'react';
import { connect } from 'react-redux';
import Dialog from 'nucleus-core/dialog/Dialog';
import { setNavigationDialogConfig } from '../redux/pathInfo';
import DialogStylesContext from '../dialogs/DialogStylesContext';

const popupConfig = {
  dialogId: 'NavigationDialog',
  isModal: true,
  header: ''
};

type Props = {
  isOpen: boolean;
  content?: React.ReactNode;
  style?: $TSFixMe;
  setNavigationDialogConfig?: $TSFixMeFunction;
};

/**
 * Dialog for the WebsiteNavigator widget's navigation links.
 * Currently only used for the mobile view of the widget.
 */
class NavigationDialog extends React.Component<Props> {
  static displayName = 'NavigationDialog';

  constructor(props: Props) {
    super(props);
    this.closeDialog = this.closeDialog.bind(this);
  }
  closeDialog() {
    this.props.setNavigationDialogConfig({ isOpen: false });
  }
  render() {
    const { isOpen, content, style } = this.props;
    return (
      <DialogStylesContext.Consumer>
        {dialogStyles => (
          <Dialog
            {...popupConfig}
            isOpen={isOpen}
            requestClose={this.closeDialog}
            classes={{
              ...(dialogStyles as $TSFixMe).base,
              transition: { ...(dialogStyles as $TSFixMe).transitions.up }
            }}
            style={style}
          >
            {content}
          </Dialog>
        )}
      </DialogStylesContext.Consumer>
    );
  }
}

export default connect(
  (state: $TSFixMe) => {
    return {
      ...state.pathInfo.navigationDialogConfig
    };
  },
  { setNavigationDialogConfig }
)(NavigationDialog);
