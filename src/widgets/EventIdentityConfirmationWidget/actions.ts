import {
  getEventRegistration,
  getVisibleRegistrationTypesByPlannerSelection
} from '../../redux/selectors/currentRegistrant';
import { getRegistrationPageFields } from '../../redux/selectors/currentRegistrationPath';
import { NOT_VISIBLE, READ_ONLY } from 'cvent-question-widgets/lib/DisplayType';
import { isWidgetReviewed } from '../../redux/website/pageContentsWithGraphQL';
import StandardContactFields from 'event-widgets/lib/StandardContactFields/StandardContactFields';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import { CLEAR_REG_CART_INFERRED_FIELDS } from '../../redux/registrationForm/regCart/actionTypes';
import { setIn } from 'icepick';
import { getRegCart } from '../../redux/selectors/shared';
import { saveRegistration } from '../../redux/registrationForm/regCart';
import { runRegistrationTypeChangeValidationsForPrimaryAndGuest } from '../../redux/registrationForm/regCart';
import {
  handleRegistrationTypeSelectionConflict,
  validateUserRegistrationTypeSelection
} from '../../dialogs/selectionConflictDialogs';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { getUpdateErrors } from '../../redux/registrationForm/errors';
import { openNoAdmissionItemAvailableForRegistrationTypeDialog, openPrivateEventErrorDialog } from '../../dialogs';
import { merge } from 'lodash';
import { populateVisibleProducts } from '../../redux/visibleProducts';
import { clearOutOfSyncUserSessionFieldsAndUrlQuery } from '../../redux/registrantLogin/actions';
import { ApolloClient } from '@apollo/client';
import type { RootState, AsyncAppThunk } from '../../redux/reducer';

export const isRegTypeReviewed = async (
  state: RootState,
  registrationTypeId: string,
  registrationPathId: string,
  apolloClient: ApolloClient<unknown>
): Promise<boolean> => {
  const widgetTypeName = 'RegistrationType';
  const visibleRegTypes = getVisibleRegistrationTypesByPlannerSelection(state, registrationPathId) || [];
  const isRegTypeWidgetReviewed = await isWidgetReviewed(state, { widgetType: widgetTypeName }, apolloClient);
  return visibleRegTypes.includes(registrationTypeId) && isRegTypeWidgetReviewed;
};

export function clearFields(): AsyncAppThunk {
  return async (
    dispatch,
    getState,
    {
      apolloClient
    }: {
      apolloClient?: ApolloClient<unknown>;
    }
  ) => {
    try {
      const state = getState();
      const eventRegistration = JSON.parse(JSON.stringify(getEventRegistration(state)));
      const isRegTypeWidgetReviewed = await isRegTypeReviewed(
        state,
        eventRegistration.registrationTypeId,
        eventRegistration.registrationPathId,
        apolloClient
      );
      if (state.userSession.regTypeId && !isRegTypeWidgetReviewed) {
        const regTypeChangeValidations = await runRegistrationTypeChangeValidationsForPrimaryAndGuest(
          validateUserRegistrationTypeSelection,
          defaultRegistrationTypeId,
          getState(),
          true,
          apolloClient
        );
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (regTypeChangeValidations && regTypeChangeValidations.hasConflicts) {
          return dispatch(
            handleRegistrationTypeSelectionConflict(
              regTypeChangeValidations.validationResults,
              null,
              null,
              dissociateInviteeAndClearInferredFields
            )
          );
        }
      }
      const linkedInviteeIdToRemove = eventRegistration.attendee.attendeeId;
      if (state.userSession.regTypeId && !isRegTypeWidgetReviewed) {
        eventRegistration.registrationTypeId = defaultRegistrationTypeId;
      }
      /*
       * This is an existing pattern that we will need to revisit later. We should clear
       * the individual field rather than replace the entire reg cart
       */
      dispatch({
        type: CLEAR_REG_CART_INFERRED_FIELDS,
        payload: {
          regCart: setIn(
            getRegCart(state),
            ['eventRegistrations', eventRegistration.eventRegistrationId],
            eventRegistration
          )
        }
      });
      /**
       * on clear fields regType is cleared, need to reevaluate visible products
       */
      await dispatch(populateVisibleProducts(eventRegistration.eventRegistrationId));
      await dispatch(dissociateInviteeAndClearInferredFields());
      return await dispatch(withLoading(saveRegistration)(linkedInviteeIdToRemove));
    } catch (error) {
      if (
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
        getUpdateErrors.isPrivateEvent(error, getState()) ||
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0-1 arguments, but got 2.
        getUpdateErrors.isAttendeeNotAllowedByCustomLogic(error, getState())
      ) {
        return await dispatch(openPrivateEventErrorDialog());
      }
      if (getUpdateErrors.isAdmissionItemsNotAvailableForRegTypeError(error)) {
        return await dispatch(openNoAdmissionItemAvailableForRegistrationTypeDialog());
      }
      throw error;
    }
  };
}

export function dissociateInviteeAndClearInferredFields(): AsyncAppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    const eventRegistration = JSON.parse(JSON.stringify(getEventRegistration(state)));
    // invitee associated attendeeId and contact Id
    delete eventRegistration.attendee.attendeeId;
    delete eventRegistration.attendee.personalInformation.contactId;
    // inferred information to clear: 2. inviteeId related personalInformation
    const existingContactInfo = eventRegistration.attendee.personalInformation;
    const contactInfo = await Promise.all(
      getRegistrationPageFields(state).map(async field => {
        const isFieldReviewed = await isWidgetReviewed(state, { fieldId: field.fieldId });
        return field.display !== NOT_VISIBLE && field.display !== READ_ONLY && isFieldReviewed ? field : null;
      })
    );
    const filteredContactInfo = contactInfo.filter(Boolean);
    const copiedContactInfo = filteredContactInfo.map(field =>
      field.isCustomField
        ? {
            customFields: {
              [field.fieldId]: existingContactInfo.customFields[field.fieldId]
            }
          }
        : {
            // @ts-expect-error ts-migrate(2464) FIXME: A computed property name must be of type 'string',... Remove this comment to see the full error message
            [(StandardContactFields[field.fieldId] || {}).regApiPath]:
              // @ts-expect-error ts-migrate(2538) FIXME: Type 'string[]' cannot be used as an index type.
              existingContactInfo[(StandardContactFields[field.fieldId] || {}).regApiPath]
          }
    );
    const temp = copiedContactInfo.reduce(
      (copiedInfo, info) => (info.customFields ? merge(copiedInfo, info) : Object.assign(copiedInfo, info)),
      {}
    );
    eventRegistration.attendee.personalInformation = temp;

    await dispatch(clearOutOfSyncUserSessionFieldsAndUrlQuery());
    // Reversing the order so that inviteeId is set to undefined for sourceId to be shown as editable.
    dispatch({
      type: CLEAR_REG_CART_INFERRED_FIELDS,
      payload: {
        regCart: setIn(
          getRegCart(state),
          ['eventRegistrations', eventRegistration.eventRegistrationId],
          eventRegistration
        )
      }
    });
  };
}
