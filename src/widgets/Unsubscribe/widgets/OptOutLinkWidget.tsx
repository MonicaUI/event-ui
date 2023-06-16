import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BaseWidget from 'nucleus-widgets/lib/BaseWidget';
import ClassNames from 'event-widgets/lib/PlainText/PlainText.less';
import { routeToPage } from '../../../redux/pathInfo';
/**
 * A text link widget for opt out option in unsubscribe page
 */
class OptOutLinkWidget extends BaseWidget<$TSFixMe, $TSFixMe> {
  static displayName = 'OptOutLinkWidget';
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
      text: this.getElementInlineStyle('text')
    };
  }
  render() {
    const {
      config: { instructionText, linkText },
      onClick,
      translate
    } = this.props;
    const style = this.getStyleObject();
    return (
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'container' does not exist on type '{ tex... Remove this comment to see the full error message
      <div style={style.container}>
        <p style={style.text}>
          {translate(instructionText)}{' '}
          <a href="#" onClick={onClick}>
            {translate(linkText)}
          </a>
          .
        </p>
      </div>
    );
  }
}

/**
 * Data wrapper for OptOutLinkWidget
 */
export default connect(undefined, {
  onClick: () => routeToPage('opt-out')
})(OptOutLinkWidget);
