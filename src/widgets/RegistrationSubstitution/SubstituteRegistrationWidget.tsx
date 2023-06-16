import { connect } from 'react-redux';
import { openSubstituteRegistrationDialog } from '../../dialogs/index';
import { substituteRegistrationSettingsJsonPath } from '../../redux/appData';
import getJSONValue from 'nucleus-widgets/utils/fields/getJSONValue';
import { getRegistrationPathIdForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { canModifyRegistration } from '../../utils/registrationUtils';
import { getRegCart } from '../../redux/selectors/shared';
import { hasAnyValidBookingIncludingConcurAndPnr as hasAnyValidBookings } from '../../utils/substituteTravelUtils';
import React from 'react';
import SlideStyles from './TransitionFlyout.less';
import FlyoutStyles from 'nucleus-core/less/cv/Flyout.less';
import InfoFlyout from 'nucleus-core/flyout/InfoFlyout';
import { injectTestId } from '@cvent/nucleus-test-automation';
import SubstituteRegistrantWidget from 'event-widgets/lib/SubstituteRegistrant/SubstituteRegistrantWidget';

const InfoFlyoutClasses = {
  trigger: SlideStyles,
  flyout: FlyoutStyles
};

const InlineFlyoutStyles = {
  flyout: {
    container: { width: 'auto', padding: 10 }
  }
};

type Props = {
  kind?: string;
  disabled?: boolean;
  translate?: $TSFixMeFunction;
  hoverMessage?: string;
  classes?: $TSFixMe;
  style?: $TSFixMe;
  clickHandler?: $TSFixMeFunction;
  config?: $TSFixMe;
};

/**
 * Wrapper on Button Widget that shows hover message when the button is disabled
 */
export class SubstituteRegistrantWidgetWithHoverMessage extends React.Component<Props> {
  render(): $TSFixMe {
    const { config, translate, hoverMessage, disabled, classes, style, clickHandler } = this.props;
    return (
      <div>
        {disabled && (
          <InfoFlyout
            classes={InfoFlyoutClasses}
            style={InlineFlyoutStyles}
            flyoutDirection="vertical"
            forceDirection={{ vert: 'top', horz: 'center' }}
          >
            <SubstituteRegistrantWidget
              {...injectTestId('widget-button')}
              disabled={disabled}
              // @ts-expect-error ts-migrate(2322) FIXME: Type '{ disabled: true; onClick: $TSFixMeFunction;... Remove this comment to see the full error message
              onClick={clickHandler}
              config={config}
              classes={classes}
              style={style}
              translate={translate}
            />
            {translate(hoverMessage)}
          </InfoFlyout>
        )}
        {!disabled && (
          <SubstituteRegistrantWidget
            {...injectTestId('widget-button')}
            disabled={disabled}
            config={config}
            classes={classes}
            style={style}
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ disabled: boolean; config: any; classes: a... Remove this comment to see the full error message
            onClick={clickHandler}
            translate={translate}
          />
        )}
      </div>
    );
  }
}

function canSubstituteRegistration(event, substitutionDeadline) {
  return canModifyRegistration(event, substitutionDeadline);
}

function onClickHandler(props, widgetStyles) {
  return dispatch => {
    dispatch(openSubstituteRegistrationDialog(props, widgetStyles));
  };
}

function mapStateToProps(state: $TSFixMe, props: $TSFixMe) {
  const regPathId = getRegistrationPathIdForWidget(state, props.id);
  const substituteRegistrationSetting = getJSONValue(state.appData, substituteRegistrationSettingsJsonPath(regPathId));
  const regCartStatus = getRegCart(state).status;
  const isVisible = canSubstituteRegistration(state.event, new Date(substituteRegistrationSetting.deadline));

  return {
    kind: isVisible ? 'button' : 'hidden',
    disabled:
      hasAnyValidBookings(state) ||
      (regCartStatus !== 'COMPLETED' && regCartStatus !== 'TRANSIENT' && regCartStatus !== 'INPROGRESS'),
    hoverMessage: 'Sub_DisabledReason__resx'
  };
}
/**
 * Data wrapper for the SubstituteRegistrantWidgetWithHoverMessage.
 */
export default connect(mapStateToProps, { clickHandler: onClickHandler })(SubstituteRegistrantWidgetWithHoverMessage);
