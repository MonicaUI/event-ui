import React from 'react';
import { GuestProductSelectionDialog } from './GuestProductSelectionDialog';
import GuestProductSelectionStyles from './GuestProductSelectionDialog.less';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { withSpinnerButtonAndTransparentWrapper } from '../../redux/registrationForm/regCart/productUpdate';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { connect } from 'react-redux';
import { merge, isEmpty } from 'lodash';
import { bindActionCreators } from 'redux';
import { getAdmissionItem } from '../../redux/selectors/event';
import { getSessionGroups } from '../../redux/selectors/productSelectors';
import { getWidget } from '../../redux/website/pageContents';
import { getEventTimezone } from '../../redux/reducer';
import formatFee from 'event-widgets/utils/formatFee';
import { withStyles } from '../ThemedDialog';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';
import { useRegistrationPageVarietyPathQuery } from '../../apollo/siteEditor/pageVarietyPathQueryHooks';
import { useGraphQLSiteEditorData, GraphQLSiteEditorDataReleases } from '../../ExperimentHelper';
import gql from 'graphql-tag';
import { useStore } from 'react-redux';

export type EventRegistrationSelection = {
  isSelected: boolean;
  isDisabled: boolean;
  isIncluded?: boolean;
  isWaitlisted?: boolean;
  fee?: number;
  registeredForProductInGroup?: boolean;
  registeredProductId?: string;
};

const flexProductVersionToCheck = 21;

const Dialog = withStyles(GuestProductSelectionDialog);

const boundCloseDialog = () => {
  return dispatch => {
    dispatch(closeDialogContainer());
  };
};

const mapStateToProps = state => {
  const {
    event,
    text: { translate },
    customFonts,
    experiments: { flexProductVersion = -1 }
  } = state;
  const style = merge({}, { customFonts });
  const classes = { ...GuestProductSelectionStyles };
  const { attendingFormat = AttendingFormat.INPERSON } = event;
  return {
    style,
    classes,
    translate,
    flexProductVersion,
    attendingFormat
  };
};

const mapDispatchToProps = () => {
  return (dispatch, ownProps) => {
    const actions = {
      onClose: boundCloseDialog,
      applyGuestProductSelectionWithLoading: withLoading(ownProps.applyGuestProductSelection),
      applyGuestProductSelectionWithSpinnerButtonAndTransparentWrapper: withSpinnerButtonAndTransparentWrapper(
        ownProps.applyGuestProductSelection
      )
    };
    return bindActionCreators(actions, dispatch);
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { flexProductVersion } = stateProps;
  const { sessionStatus } = ownProps;
  let applyGuestProductSelection;
  if (flexProductVersion >= flexProductVersionToCheck && sessionStatus && sessionStatus !== 'undefined') {
    applyGuestProductSelection = dispatchProps.applyGuestProductSelectionWithSpinnerButtonAndTransparentWrapper;
  } else {
    applyGuestProductSelection = dispatchProps.applyGuestProductSelectionWithLoading;
  }
  return {
    ...ownProps,
    ...stateProps,
    onClose: dispatchProps.onClose,
    applyGuestProductSelection
  };
};

const ConnectedGuestProductSelectionDialog = connect(mapStateToProps, mapDispatchToProps, mergeProps)(Dialog);

export const GUEST_PRODUCT_SELECTION_DIALOG_FRAGMENT = gql`
  fragment GuestProductSelectionDialog on PageVarietyPath {
    sessions {
      display {
        fees
      }
    }
    admissionItems {
      display {
        fees
      }
    }
  }
`;

export const GuestProductSelectionDialogWithGraphQL = (props: $TSFixMe): $TSFixMe => {
  const { isAdmissionItem, isDiscountItem } = props;
  let displayFee = false;

  const query = useRegistrationPageVarietyPathQuery(GUEST_PRODUCT_SELECTION_DIALOG_FRAGMENT);
  const data = query.data || query.previousData;
  const displaySessionFees = data?.event?.registrationPath?.registration?.sessions?.display?.fees;
  const displayAdmissionItemsFees = data?.event?.registrationPath?.registration?.admissionItems?.display?.fees;

  if (isAdmissionItem) {
    displayFee = !!displayAdmissionItemsFees;
  }
  if (!isAdmissionItem && !isDiscountItem) {
    displayFee = !!displaySessionFees;
  }

  return <ConnectedGuestProductSelectionDialog displayFee={displayFee} {...props} />;
};

export const GuestProductSelectionDialogWithRedux = (props: $TSFixMe): $TSFixMe => {
  const { isAdmissionItem, isDiscountItem } = props;
  const store = useStore();
  let displayFee = false;

  if (isAdmissionItem) {
    const admissionItemWidget = getWidget(store.getState(), 'AdmissionItems');
    displayFee = !admissionItemWidget.config
      ? false
      : // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        admissionItemWidget.config.display && admissionItemWidget.config.display.fees;
  }
  if (!isAdmissionItem && !isDiscountItem) {
    const sessionWidget = getWidget(store.getState(), 'Sessions');
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    displayFee = !sessionWidget.config ? false : sessionWidget.config.display && sessionWidget.config.display.fees;
  }

  return <ConnectedGuestProductSelectionDialog displayFee={displayFee} {...props} />;
};

export function GuestProductSelectionDialogExperimentWrapper(props: $TSFixMe): $TSFixMe {
  const usingGraphQLWidgetData = useGraphQLSiteEditorData(GraphQLSiteEditorDataReleases.GuestProductSelectionDialog);
  if (usingGraphQLWidgetData) return <GuestProductSelectionDialogWithGraphQL {...props} />;
  return <GuestProductSelectionDialogWithRedux {...props} />;
}

export const openGuestProductSelectionDialog = (
  dialogTitle?: $TSFixMe,
  productId?: $TSFixMe,
  productTitle?: $TSFixMe,
  productCapacity?: $TSFixMe,
  overrideCapacity?: $TSFixMe,
  eventRegSelections?: Record<string, EventRegistrationSelection>,
  eventRegistrations?: $TSFixMe,
  currentPrimaryRegId?: $TSFixMe,
  isGroupReg?: $TSFixMe,
  applyGuestProductSelection?: $TSFixMe,
  fees = {},
  defaultFeeId?: $TSFixMe,
  forWaitlistingAttendees = false,
  sessionStatus?: $TSFixMe,
  groupFlightInstructionText?: $TSFixMe,
  spinnerSelection?: $TSFixMe
) => {
  // eslint-disable-next-line complexity
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    // decides instructional text based on product type
    const sessionGroups = getSessionGroups(getState());
    const isAdmissionItem = getAdmissionItem(getState(), productId);
    const isDiscountItem = currentPrimaryRegId === '';
    let isSessionInGroup;

    if (!isAdmissionItem && !isDiscountItem) {
      Object.values(sessionGroups).forEach(sessionGroup => {
        if (isEmpty(isSessionInGroup)) {
          isSessionInGroup = Object.values(sessionGroup.sessions).filter(s => (s as $TSFixMe).id === productId);
        }
      });
    }
    const showInstructionalText =
      isAdmissionItem || !isEmpty(isSessionInGroup) || isDiscountItem || groupFlightInstructionText != null;
    let instructionalText;
    if (groupFlightInstructionText) {
      instructionalText = groupFlightInstructionText;
    } else {
      instructionalText = isAdmissionItem
        ? 'GuestProductSelection_AdmissionItem_InstructionalText__resx'
        : 'GuestProductSelection_InstructionalText__resx';
    }
    if (isDiscountItem) {
      instructionalText =
        productCapacity > 1
          ? 'GuestProductSelection_DiscountCapacityGreaterThanOne_InstructionalText__resx'
          : 'GuestProductSelection_DiscountCapacityEqualToOne_InstructionalText__resx';
    }

    // Create local data structure to keep track of selected people
    const timezone = getEventTimezone(getState());
    const localEventRegSelections = eventRegSelections;
    const unselectedList = {};
    const alreadySelectedList = {};

    Object.values(eventRegistrations).forEach(eventReg => {
      const eventRegId = (eventReg as $TSFixMe).eventRegistrationId;
      const registrationTypeId = (eventReg as $TSFixMe).registrationTypeId;

      if (localEventRegSelections[eventRegId]) {
        localEventRegSelections[eventRegId].fee = formatFee(fees, defaultFeeId, registrationTypeId, timezone);
        // checks if person is already registered for product in group
        if (
          localEventRegSelections[eventRegId].isSelected ||
          localEventRegSelections[eventRegId].registeredForProductInGroup
        ) {
          alreadySelectedList[eventRegId] = localEventRegSelections[eventRegId];
        } else {
          unselectedList[eventRegId] = localEventRegSelections[eventRegId];
        }
      }
    });

    const dialog = (
      <GuestProductSelectionDialogExperimentWrapper
        title={dialogTitle}
        productId={productId}
        productTitle={productTitle}
        productCapacity={productCapacity}
        overrideCapacity={overrideCapacity}
        eventRegistrations={eventRegistrations}
        currentPrimaryRegId={currentPrimaryRegId}
        groupMemberEventRegId={currentPrimaryRegId}
        isGroupReg={isGroupReg}
        instructionalText={instructionalText}
        showInstructionalText={showInstructionalText}
        applyGuestProductSelection={applyGuestProductSelection}
        currency={getState().text.resolver.currency}
        fees={fees}
        forWaitlistingAttendees={forWaitlistingAttendees}
        sessionStatus={sessionStatus}
        spinnerSelection={spinnerSelection}
        initialLocalEventRegSelections={localEventRegSelections}
        initialUnselectedList={unselectedList}
        initialAlreadySelectedList={alreadySelectedList}
        shouldShowUnselected={!isEmpty(unselectedList) && !isEmpty(alreadySelectedList)}
        shouldShowAlreadySelected={!isEmpty(alreadySelectedList)}
        isAdmissionItem={isAdmissionItem}
        isDiscountItem={isDiscountItem}
      />
    );
    return dispatch(
      openDialogContainer(dialog, () => dispatch(boundCloseDialog()), {
        classes: { dialogContainer: GuestProductSelectionStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
