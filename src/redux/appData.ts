import { LOAD_EVENT_SNAPSHOT, LOAD_REGISTRATION_PROCESS_CONTENT, UPDATE_QUESTION_VISIBILTY } from './actionTypes';
import { getRegistrationPathId } from './selectors/currentRegistrationPath';
import setJSONValue from 'nucleus-widgets/utils/fields/setJSONValue';
import { getMergedRoommateSettings } from 'event-widgets/utils/travelUtils';
import getJSONValue from 'nucleus-widgets/utils/fields/getJSONValue';
import * as currentRegistrant from './selectors/currentRegistrant';
import { setIn } from 'icepick';
import { isProductQuestion } from '../utils/questionUtils';
import { merge } from 'lodash';

export const UPDATE_ROOMMATE_SETTINGS = 'event-guestside-site/appData/UPDATE_ROOMMATE_SETTINGS';

function mergeRegistrationSettings(existingRegistrationSettings = {}, newRegistrationSettings) {
  return {
    ...merge({}, existingRegistrationSettings, newRegistrationSettings),
    registrationPaths: merge(
      {},
      (existingRegistrationSettings as $TSFixMe).registrationPaths,
      newRegistrationSettings.registrationPaths
    ),
    registrationQuestions: merge(
      {},
      (existingRegistrationSettings as $TSFixMe).registrationQuestions,
      newRegistrationSettings.registrationQuestions
    ),
    productQuestions: merge(
      {},
      newRegistrationSettings.productQuestions,
      (existingRegistrationSettings as $TSFixMe).productQuestions
    )
  };
}

function mergeRegistrationProcess(existingAppData, registrationProcess) {
  const {
    registrationPathId,
    registrationPath,
    registrationPathSettings,
    registrationQuestions,
    productQuestions,
    travelQuestions
  } = registrationProcess;
  const {
    registrationSettings: existingRegistrationSettings = {},
    registrationPathSettings: existingRegistrationPathSettings = {}
  } = existingAppData;
  return {
    ...existingAppData,
    registrationSettings: {
      ...existingRegistrationSettings,
      registrationPaths: {
        ...existingRegistrationSettings.registrationPaths,
        [registrationPathId]: registrationPath
      },
      registrationQuestions: {
        ...existingRegistrationSettings.registrationQuestions,
        ...registrationQuestions
      },
      productQuestions: {
        ...existingRegistrationSettings.productQuestions,
        ...productQuestions
      },
      travelQuestions: {
        ...existingRegistrationSettings.travelQuestions,
        ...travelQuestions
      }
    },
    registrationPathSettings: {
      ...existingRegistrationPathSettings,
      [registrationPathId]: registrationPathSettings
    }
  };
}

function mergeAppData(existingAppData = {}, newAppData) {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'registrationSettings' does not exist on ... Remove this comment to see the full error message
  const { registrationSettings = {}, registrationPathSettings = {} } = existingAppData;
  const { registrationSettings: newRegistrationSettings, registrationPathSettings: newRegistrationPathSettings } =
    newAppData;
  /*
   * Keep all reg paths and questions that have ever been seen so that things that have been filtered out because of a
   * reg path change don't disappear before we have a chance to switch to a page in the new reg path and so that the
   * reg paths used by other group/guest members are still available
   */
  return {
    ...existingAppData,
    ...newAppData,
    registrationSettings: newRegistrationSettings
      ? mergeRegistrationSettings(registrationSettings, newRegistrationSettings)
      : registrationSettings,
    registrationPathSettings: {
      ...registrationPathSettings,
      ...newRegistrationPathSettings
    }
  };
}

function roommateRequestSetupJsonPath(regPathId) {
  return (
    `registrationSettings.registrationPaths.${regPathId}.travelSettings.hotelRequestSettings` +
    '.roommateRequestSettings'
  );
}

export function substituteRegistrationSettingsJsonPath(regPathId: $TSFixMe): $TSFixMe {
  return `registrationSettings.registrationPaths.${regPathId}.substituteRegistrationSettings`;
}

export function invitationForwardingSettingsJsonPath(regPathId: $TSFixMe): $TSFixMe {
  return `registrationSettings.registrationPaths.${regPathId}.invitationForwardingSettings`;
}

function roommateRequestSetupRootJsonPath(regPathId) {
  return 'appData.' + roommateRequestSetupJsonPath(regPathId);
}

/**
 * action creator
 * @param mergedRoommateSettings
 * @returns {{payload: {mergedRoommateSettings: *}, type: string}}
 */
function createUpdateRoommateSettingsAction(mergedRoommateSettings) {
  return {
    type: UPDATE_ROOMMATE_SETTINGS,
    payload: { mergedRoommateSettings }
  };
}

/**
 * update app data for widgets that do not have roommate settings in appData
 * or do not have new roommate settings
 * @param configRoommateSetupSettings
 * @returns {Function}
 */
export function updateAppDataForRoommateSettings(configRoommateSetupSettings: $TSFixMe) {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const regPathId = currentRegistrant.getRegistrationPathId(getState());
    const roommateRequestSettings = getJSONValue(getState(), roommateRequestSetupRootJsonPath(regPathId));
    const mergedRoommateSettings = getMergedRoommateSettings(configRoommateSetupSettings, roommateRequestSettings);

    if (mergedRoommateSettings) {
      return dispatch(createUpdateRoommateSettingsAction(mergedRoommateSettings));
    }
  };
}

export default function appDataReducer(state = {}, action: $TSFixMe, rootState?: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case LOAD_EVENT_SNAPSHOT:
      return mergeAppData(state, action.payload.appData);
    case LOAD_REGISTRATION_PROCESS_CONTENT:
      return mergeRegistrationProcess(state, action.payload.registrationProcess);
    case UPDATE_ROOMMATE_SETTINGS: {
      const roommateSetupSettings = action.payload.mergedRoommateSettings || {};
      const regPathId = getRegistrationPathId(rootState);
      return setJSONValue(state, roommateRequestSetupJsonPath(regPathId), roommateSetupSettings);
    }
    case UPDATE_QUESTION_VISIBILTY: {
      const { visibility } = action.payload;
      let newState = state;
      Object.keys(visibility).forEach(questionId => {
        let questionType = 'registrationQuestions';
        if (isProductQuestion(state, questionId)) {
          questionType = 'productQuestions';
        }
        newState = setIn(
          newState,
          ['registrationSettings', questionType, questionId, 'question', 'isVisible'],
          visibility[questionId]
        );
      });
      return newState;
    }
    default:
      return state;
  }
}
