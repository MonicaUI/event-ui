import React from 'react';
import ThemeableComponent from 'nucleus-widgets/lib/ThemeableComponent';
import { connect } from 'react-redux';
import { merge } from 'lodash';
import clearImageInTheme from './shared/clearImageInTheme';
import VariablesColors from 'nucleus-core/less/VariablesColors.less';
import getInlineStyle from 'nucleus-widgets/utils/style/getInlineStyle';
import { resolve } from '@cvent/nucleus-dynamic-css';
import { injectTestId } from '@cvent/nucleus-test-automation/lib/cjs';

function dialogStyle(globalTheme, sections) {
  const contentDetailsStyles = getInlineStyle(
    globalTheme.elements.body1,
    {},
    globalTheme.palette,
    globalTheme.fontPalette
  );
  return {
    ...globalTheme,
    header: globalTheme.dialog ? globalTheme.dialog.header : { styleMapping: 'header3' },
    title: globalTheme.dialog ? globalTheme.dialog.headerText : { styleMapping: 'header2' },
    message: { styleMapping: 'header2' },
    messageContainer: globalTheme.dialog ? globalTheme.dialog.body : {},
    subTitle: { styleMapping: 'header4' },
    exit: { styleMapping: 'body1' },
    input: { styleMapping: 'input' },
    link: { styleMapping: 'link' },
    label: { styleMapping: 'label', customSettings: { text: { textAlign: 'left' } } },
    button: { styleMapping: 'primaryButton' },
    content2: { ...clearImageInTheme(merge({}, globalTheme, sections.content2)), styleMapping: 'custom' },
    body1: { styleMapping: 'body1' },
    panel: globalTheme.dialog ? globalTheme.dialog.body : {},
    contentDetails: {
      instruction: contentDetailsStyles,
      tableHeader: contentDetailsStyles,
      tableContentRow: contentDetailsStyles
    },
    primaryButton: { styleMapping: 'primaryButton' },
    secondaryButton: { styleMapping: 'secondaryButton' },
    insText: { styleMapping: 'body1' },
    linkField: { styleMapping: 'input' },
    subHeader: { styleMapping: 'text2' },
    checkbox: { styleMapping: 'body1' },
    summaryTotal: { styleMapping: 'text1' }
  };
}

export function withStyles(Component: $TSFixMe): $TSFixMe {
  class ThemedDialog extends ThemeableComponent<$TSFixMe, $TSFixMe> {
    getElementBackground: $TSFixMe;
    getElementInlineStyle: $TSFixMe;
    props: $TSFixMe;
    getStyleObject() {
      return {
        dialogHeader: this.getElementInlineStyle('header'),
        title: this.getElementInlineStyle('title'),
        subTitle: this.getElementInlineStyle('subTitle'),
        exit: this.getElementInlineStyle('exit'),
        form: {
          label: {
            label: this.getElementInlineStyle('label')
          },
          textbox: this.getElementInlineStyle('input'),
          error: {
            borderColor: VariablesColors.errorColor,
            paddingRight: '1.8em'
          },
          errorMessages: {
            color: VariablesColors.errorColor,
            container: {
              textAlign: 'left'
            }
          }
        },
        link: this.getElementInlineStyle('link'),
        button: this.getElementInlineStyle('button'),
        dragHandle: this.getElementBackground('content2'),
        body: this.getElementInlineStyle('body1'),
        linkButton: this.getElementInlineStyle('link'),
        backButton: this.getElementInlineStyle('link'),
        panel: this.getElementInlineStyle('panel'),
        primaryButton: this.getElementInlineStyle('primaryButton'),
        secondaryButton: this.getElementInlineStyle('secondaryButton'),
        messageContainer: this.getElementInlineStyle('messageContainer'),
        message: this.getElementInlineStyle('message'),
        insTextURL: {
          ...this.getElementInlineStyle('insText'),
          marginBottom: '20px'
        },
        insTextShare: {
          ...this.getElementInlineStyle('insText'),
          margin: '40px 0 20px 0'
        },
        linkField: this.getElementInlineStyle('linkField'),
        subHeader: this.getElementInlineStyle('subHeader'),
        summaryTotal: this.getElementInlineStyle('summaryTotal'),
        checkbox: {
          ...this.getElementInlineStyle('checkbox'),
          borderColor: (this.getElementBackground('content2') || {}).backgroundColor,
          paddingLeft: '5px'
        },
        productTitle: {
          ...this.getElementInlineStyle('subTitle'),
          paddingLeft: '5px'
        },
        sectionHeader: {
          ...this.getElementInlineStyle('subHeader'),
          paddingLeft: '5px'
        },
        instructionalText: {
          ...this.getElementInlineStyle('body1'),
          paddingLeft: '5px'
        },
        radioButtonWrapper: {
          ...this.getElementInlineStyle('body1')
        }
      };
    }

    render() {
      let { styles } = this.props;
      // Merge any specific dialog styles that have been pre-defined.
      styles = { ...merge({}, styles, this.getStyleObject()) };
      return <Component {...this.props} style={styles} />;
    }
  }

  return connect((state: $TSFixMe, props: $TSFixMe) => {
    const {
      customFonts,
      website: {
        theme: { global, sections }
      }
    } = state;

    return {
      ...props,
      style: merge({}, dialogStyle(global, sections), { customFonts })
    };
  })(ThemedDialog);
}

export function withCancelAndConfirmButtons(Component: $TSFixMe): $TSFixMe {
  return class extends React.Component {
    render() {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
      // eslint-disable-next-line react/prop-types
      const { style, classes, cancel, confirm, content, secondaryButtonText, primaryButtonText } = this.props;
      return (
        <Component {...this.props}>
          {content && <p {...resolve({ style, classes }, 'subMessage')}>{content}</p>}
          {cancel && (
            <button
              type="button"
              {...resolve({ style, classes }, 'secondaryButton')}
              {...injectTestId('cancel-selection')}
              onClick={cancel}
            >
              {secondaryButtonText}
            </button>
          )}
          <button
            type="button"
            {...resolve({ style, classes }, 'primaryButton')}
            {...injectTestId('continue-selection')}
            onClick={confirm}
          >
            {primaryButtonText}
          </button>
        </Component>
      );
    }
  };
}
