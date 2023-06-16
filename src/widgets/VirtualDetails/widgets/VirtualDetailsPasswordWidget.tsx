import React from 'react';
import { connect } from 'react-redux';
import { resolve } from '@cvent/nucleus-dynamic-css';
import BaseWidget from 'nucleus-widgets/lib/BaseWidget';
import PropTypes from 'prop-types';
import ClassNames from 'event-widgets/lib/PlainText/PlainText.less';
import VirtualDetailsPasswordWidgetStyles from './VirtualDetailsPasswordWidgetStyles.less';

/**
 * Data wrapper for virtual details page password widget
 */

class VirtualDetailsPasswordWidget extends BaseWidget<$TSFixMe, $TSFixMe> {
  static displayName = 'VirtualDetailsPasswordWidget';
  static propTypes = {
    classes: PropTypes.object,
    style: PropTypes.object,
    translate: PropTypes.func,
    text: PropTypes.string
  };
  static defaultProps = {
    classes: ClassNames
  };
  getElementInlineStyle: $TSFixMe;
  props: $TSFixMe;
  getStyleObject() {
    return {
      ...super.getStyleObject(),
      classes: { ...VirtualDetailsPasswordWidgetStyles },
      passwordLabelText: this.getElementInlineStyle('passwordLabelText'),
      passwordText: this.getElementInlineStyle('passwordText')
    };
  }
  render() {
    const {
      config: { passwordLabelText },
      text,
      translate,
      classes
    } = this.props;
    const style = this.getStyleObject();
    return (
      <>
        {text && (
          <div {...resolve({ style, classes }, 'container')}>
            <div {...resolve({ style, classes }, 'passwordLabelText')}>{translate(passwordLabelText)}</div>
            <div {...resolve({ style, classes }, 'passwordText')}>
              <div {...resolve(style, 'passwordMargin')}>{translate(text)}</div>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default connect(({ virtualDetails }: $TSFixMe) => {
  return {
    text: virtualDetails?.code
  };
})(VirtualDetailsPasswordWidget);
