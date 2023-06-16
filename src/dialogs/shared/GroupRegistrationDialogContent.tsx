import React from 'react';
import ThemeableComponent from 'nucleus-widgets/lib/ThemeableComponent';
import { resolve } from '@cvent/nucleus-dynamic-css';
import PropTypes from 'prop-types';

export default class GroupRegistrationDialogContent extends ThemeableComponent<$TSFixMe, $TSFixMe> {
  static propTypes = {
    registrationAction: PropTypes.func.isRequired,
    registrations: PropTypes.object,
    classes: PropTypes.object.isRequired,
    style: PropTypes.object.isRequired,
    registrationCanAction: PropTypes.object.isRequired,
    registrationCannotAction: PropTypes.object.isRequired,
    instructionText: PropTypes.string.isRequired,
    labelText: PropTypes.string.isRequired,
    actionText: PropTypes.string.isRequired,
    translate: PropTypes.object
  };

  getElementInlineStyle: $TSFixMe;
  props: $TSFixMe;

  getStyleObject(): $TSFixMe {
    return {
      modalLabelStyles: this.getElementInlineStyle('attendeeSelectionModalStyles.modalLabelStyles'),
      modalLinkStyles: {
        ...this.getElementInlineStyle('attendeeSelectionModalStyles.modalLinkStyles'),
        display: 'inline-block'
      },
      modalItemBackgroundStyles: this.getElementInlineStyle('attendeeSelectionModalStyles.modalItemBackgroundStyles'),
      modalAttendeeNameStyles: {
        ...this.getElementInlineStyle('attendeeSelectionModalStyles.modalAttendeeNameStyles'),
        display: 'inline-block'
      }
    };
  }

  render(): $TSFixMe {
    const {
      registrationCanAction,
      registrationCannotAction,
      translate,
      registrationAction,
      classes,
      instructionText,
      labelText,
      actionText
    } = this.props;
    const style = { style: this.getStyleObject() };
    return (
      <div>
        <div {...resolve(style, 'modalLabelStyles')}>{instructionText}</div>
        {/* eslint-disable-next-line @typescript-eslint/prefer-optional-chain */}
        {registrationCanAction &&
          registrationCanAction.map(registration =>
            this.renderItem(
              registration.name,
              registration.id,
              registrationAction,
              style,
              classes,
              actionText,
              translate
            )
          )}
        {registrationCannotAction && registrationCannotAction.length > 0 && (
          <div>
            <div {...resolve(style, 'modalLabelStyles')}>{labelText}</div>
            {registrationCannotAction.map(registration => {
              return (
                <div key="noAction">
                  <span className={classes.attendeeSelectionName}>
                    <span {...resolve(style, 'modalAttendeeNameStyles')}>{registration.name}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  renderItem(
    name: $TSFixMe,
    registrationId: $TSFixMe,
    registrationAction: $TSFixMe,
    style: $TSFixMe,
    classes: $TSFixMe,
    actionText: $TSFixMe,
    translate: $TSFixMe
  ): $TSFixMe {
    return (
      <div>
        <div {...resolve(style, 'modalItemBackgroundStyles')}>
          <span className={classes.attendeeSelectionName}>
            <span {...resolve(style, 'modalAttendeeNameStyles')}>{name}</span>
          </span>
          <span className={classes.attendeeSelectionLink}>
            <a
              {...resolve(style, 'modalLinkStyles')}
              id={registrationId}
              href="#"
              onClick={() => registrationAction(registrationId, translate)}
            >
              {actionText}
            </a>
          </span>
        </div>
        <div className={classes.attendeeSelectionSpace}></div>
      </div>
    );
  }
}
