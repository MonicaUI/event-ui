import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BaseWidget from 'nucleus-widgets/lib/BaseWidget';
import { injectTestId } from '@cvent/nucleus-test-automation';
import Checkbox from 'nucleus-form/src/components/inputs/Checkbox';
import PlannerEmailConfirmationStyles from './PlannerEmailConfirmation.less';
import { merge } from 'lodash';
import { resolve } from '@cvent/nucleus-dynamic-css';
import { setSendEmailFlag } from '../../redux/registrationForm/regCart/actions';

const checkboxStyle = globalTheme => {
  return {
    ...globalTheme,
    checkbody1: {
      styleMapping: 'text2',
      customSettings: {
        spacing: {
          padding: {
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 10
          }
        }
      }
    },
    checkbackground: {
      styleMapping: 'custom',
      customSettings: {
        background: {
          color: 'primary'
        }
      }
    },
    checkboxBorder: {
      styleMapping: 'custom',
      border: {
        borderStyle: 'solid',
        color: 'primary',
        thickness: 1
      },
      background: {
        color: 'secondary',
        borderRadius: 3
      }
    }
  };
};

/**
 * A widget to display a list of Attendees.
 */
class PlannerEmailConfirmationWidget extends BaseWidget<$TSFixMe, $TSFixMe> {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    style: PropTypes.any.isRequired,
    classes: PropTypes.any,
    sendEmail: (PropTypes as $TSFixMe).boolean,
    setSendEmailFlag: PropTypes.func
  };

  getElementInlineStyle: $TSFixMe;
  props: $TSFixMe;

  onChange = (fieldName, value, newOptionList) => {
    if (fieldName === 'sendEmail') {
      this.props.setSendEmailFlag(newOptionList[0].checked);
    }
  };

  render() {
    const { sendEmail, translate } = this.props;
    const checkboxOptions = [
      {
        name: translate('EventGuestSide_RegistrationNavigation_PlannerEmailConfirmation__resx'),
        checked: sendEmail,
        className: 'checkboxOption'
      }
    ];
    const styleObj = {
      classes: { ...PlannerEmailConfirmationStyles },
      checkbox: {
        listStyle: 'none'
      },
      horizontal: {
        checkboxLabel: { ...this.getElementInlineStyle('checkbody1'), ...this.getElementInlineStyle('checkbackground') }
      },
      checkboxBorder: this.getElementInlineStyle('checkboxBorder')
    };
    return (
      <div {...injectTestId('email-confirmation')} {...resolve(styleObj, 'checkboxPadding')}>
        <div {...resolve(styleObj, 'checkboxBorderPadding')} style={{ ...styleObj.checkboxBorder }}>
          <Checkbox
            fieldName="sendEmail"
            options={checkboxOptions}
            style={styleObj}
            classes={PlannerEmailConfirmationStyles}
            onChange={this.onChange}
          />
        </div>
      </div>
    );
  }
}

export default connect(
  (state: $TSFixMe) => {
    const {
      website: {
        theme: { global }
      },
      customFonts
    } = state;
    const style = merge({}, checkboxStyle(global), { customFonts });
    return {
      sendEmail: state.registrationForm.regCart.sendEmail,
      style
    };
  },
  { setSendEmailFlag }
)(PlannerEmailConfirmationWidget);
