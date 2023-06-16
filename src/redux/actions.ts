import transformEventSnapshot from 'event-widgets/utils/transformEventSnapshot';
import transformAccountSnapshot from 'event-widgets/utils/transformAccountSnapshot';
import transformEventData, {
  transformRegistrationPath,
  updateQuestionFields
} from 'event-widgets/utils/transformEventData';
import {
  LOAD_EVENT_SNAPSHOT,
  LOAD_ACCOUNT_SNAPSHOT,
  LOAD_WEBSITE_CONTENT,
  LOAD_REGISTRATION_PROCESS_CONTENT,
  UPDATE_QUESTION_VISIBILTY,
  SET_REFERRER,
  RESTORE_ALL_REG_TYPES_FOR_EVENT,
  SPINNER_SELECTION_PENDING,
  SPINNER_SELECTION_DONE
} from './actionTypes';
import loadLanguageManagementSettingsAction from 'event-widgets/redux/modules/languageManagementSettings';
import {
  getRegistrationTypeId,
  getEventRegistration,
  getAnswerForFieldId,
  getEventRegistrationId,
  getTemporaryGuestEventRegistrationId
} from './selectors/currentRegistrant';
import { getRegistrationPathIdOrNull, getRegistrationPathIdOrDefault } from './selectors/currentRegistrationPath';
import { getRegistrationTypeIdFromUserSession, getRegistrationPathIdFromSession } from './userSession';
import {
  GUEST_REGISTRATION,
  parseRegistrationProcessType,
  REGISTRATION,
  typeOfPage
} from './website/registrationProcesses';
import { getRegPackId, areRegistrationActionsDisabled } from './selectors/shared';
import { getPrimaryRegistrationId, getEventRegistrations } from './registrationForm/regCart/selectors';
import { setEventRegistrationFieldValue, setTemporaryGuestFieldValue } from './registrationForm/regCart/actions';
import {
  getQuestionIdsForVisibilityField,
  createAnswer,
  getQuestionIdsWithVisibilityLogic,
  getQuestionVisibilityFieldIdsForQuestions
} from '../utils/questionUtils';
import { getDefaultRegistrationPath, getProductQuestions } from 'event-widgets/redux/selectors/appData';
import { isGuestRegistrationEnabled } from './selectors/currentRegistrationPath';
import { mapValues } from 'lodash';
import { loadImageLookup } from 'nucleus-widgets/redux/modules/imageLookup';
import { makeVar } from '@apollo/client';

export const eventSnapshotVersionVar = makeVar('');
export const accountSnapshotVersionVar = makeVar('');

export function setReferrer(pageId: $TSFixMe): $TSFixMe {
  return {
    type: SET_REFERRER,
    payload: { pageId }
  };
}

/**
 * Loads website content
 * @param websiteContent
 * @returns {{payload: {website: *}, type: string}}
 */
export function loadWebsiteContent(websiteContent: $TSFixMe): $TSFixMe {
  return { type: LOAD_WEBSITE_CONTENT, payload: { website: websiteContent } };
}

/**
 * Loads account snapshot into store and applies any
 * necessary transforms and migrations to work with the client side application.
 * @param accountSnapshot
 * @returns {{type: string, payload: {version: *, account: {contactCustomFields}}}}
 */
export const createLoadAccountSnapshotAction = (accountSnapshot: $TSFixMe): $TSFixMe => {
  const { version } = accountSnapshot;
  accountSnapshotVersionVar(version);
  return {
    type: LOAD_ACCOUNT_SNAPSHOT,
    payload: {
      version: accountSnapshot.version,
      account: transformAccountSnapshot(accountSnapshot)
    }
  };
};
/**
 * Loads event snapshot into store and applies any
 * necessary transforms and migrations to work with the client side application.
 * @param eventSnapshot
 * @param account
 * @returns {{type: string, payload: {event: {siteEditor}, version: string, appData: {registrationSettings}, website}}}
 */
export const createLoadEventSnapshotAction = async (
  eventSnapshot: $TSFixMe,
  account: $TSFixMe,
  existingAppData = {}
): Promise<$TSFixMe> => {
  const { siteEditor, version } = eventSnapshot;
  const event = transformEventSnapshot(eventSnapshot);
  eventSnapshotVersionVar(version);
  return {
    type: LOAD_EVENT_SNAPSHOT,
    payload: {
      event,
      version,
      appData: transformEventData(siteEditor?.eventData, account, event, siteEditor?.website, existingAppData),
      website: siteEditor?.website
    }
  };
};

/**
 * Load a page snapshot into current event snapshot
 * Implemented this way to allow dispatch createLoadEventSnapshotAction with minimum knowledge
 */
export const injectPageSnapshot = (pageSnapshot: $TSFixMe) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const pageNotLoaded = pageId => !state.website.pages[pageId];
    if (Object.keys(pageSnapshot.pages).some(pageNotLoaded)) {
      return await dispatch({
        type: LOAD_WEBSITE_CONTENT,
        payload: {
          website: pageSnapshot
        }
      });
    }
  };
};

/**
 * Load registration content (pages, layout items, etc.)
 */
export const loadRegistrationContent = (pageVariety: $TSFixMe, registrationPathId = null) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      appData: { registrationSettings },
      defaultUserSession: { eventId },
      eventSnapshotVersion,
      clients: { eventGuestClient },
      account,
      event,
      website
    } = getState();
    const eventRegistration = getEventRegistration(getState());
    const registrationTypeId = eventRegistration
      ? getRegistrationTypeId(getState())
      : getRegistrationTypeIdFromUserSession(getState());
    const registrationProcess = await eventGuestClient.getRegistrationContent(
      eventId,
      eventSnapshotVersion,
      pageVariety.name,
      registrationPathId,
      registrationTypeId
    );
    const registrationPath = transformRegistrationPath(
      account,
      website?.siteInfo?.sharedConfigs,
      event
    )(registrationProcess.registrationPath);
    const { imageLookup } = registrationProcess;
    if (imageLookup) {
      await dispatch(loadImageLookup(imageLookup));
    }
    dispatch({
      type: LOAD_REGISTRATION_PROCESS_CONTENT,
      payload: {
        pageVariety,
        registrationPathId,
        account,
        registrationProcess: {
          ...registrationProcess,
          registrationPath,
          registrationQuestions: mapValues(registrationProcess.registrationQuestions, (value, key) =>
            updateQuestionFields(value, registrationSettings?.registrationQuestions?.[key])
          ),
          productQuestions: mapValues(registrationProcess.productQuestions, (value, key) =>
            updateQuestionFields(value, registrationSettings?.productQuestions?.[key])
          ),
          travelQuestions: mapValues(registrationProcess.travelQuestions, (value, key) =>
            updateQuestionFields(value, registrationSettings?.travelQuestions?.[key])
          )
        }
      }
    });
  };
};

/**
 * load guest registration content (pages, layout items etc.)
 */
export const loadGuestRegistrationContent = (registrationPathId = null) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    if (isGuestRegistrationEnabled(getState())) {
      await dispatch(loadRegistrationContent(GUEST_REGISTRATION, registrationPathId));
    }
  };
};

/**
 * load group member registration content (pages, layout items etc.)
 */
export const loadMultipleRegistrationContent = (registrantPathIds = []) => {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    const alreadyFetchedRegPaths = {};
    const promiseArray = [];

    registrantPathIds.forEach(regPathId => {
      if (!alreadyFetchedRegPaths[regPathId]) {
        promiseArray.push(dispatch(loadRegistrationContent(REGISTRATION, regPathId)));
        alreadyFetchedRegPaths[regPathId] = true;
      }
    });

    await Promise.all(promiseArray);
  };
};

export const loadLandingWebsitePageContent = (registrationTypeId = null) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      defaultUserSession: { eventId },
      eventSnapshotVersion,
      clients: { eventGuestClient }
    } = getState();
    const websiteContent = await eventGuestClient.getWebsiteContent(eventId, eventSnapshotVersion, registrationTypeId);
    const { imageLookup } = websiteContent;
    if (imageLookup) {
      await dispatch(loadImageLookup(imageLookup));
    }
    return dispatch({
      type: LOAD_WEBSITE_CONTENT,
      payload: {
        website: websiteContent
      }
    });
  };
};

export function getRedirectPageIdIfOnWrongPath(currentPageId: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const processType = typeOfPage(getState(), currentPageId);
    if (!processType || processType.forCurrentRegistrant().pageIds(getState()).includes(currentPageId)) {
      return;
    }
    return await dispatch(getStartPageForCurrentRegPath(processType));
  };
}

/**
 * gets the start page of the current reg path that's in the app state for the given registration process type
 * @param processType type of registration process e.g. REGISTRATION, POST_REGISTRATION
 */
export function getStartPageForCurrentRegPath(processType: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const registrationPathId = getRegistrationPathIdOrDefault(getState());
    await dispatch(loadRegistrationContent(processType, registrationPathId));
    return processType.forRegistrationPath(registrationPathId).startPageId(getState());
  };
}

/**
 * Reloads the event snapshot from the backend and applies any necessary transforms
 * and migrations to work with the client side application.
 */
export const filterEventSnapshot = (
  eventSnapshotVersion: $TSFixMe,
  registrationTypeId: $TSFixMe,
  registrationPathId: $TSFixMe
) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    if (!eventSnapshotVersion) {
      throw new Error('Cannot reload event snapshot without an existing version.');
    }
    const {
      appData,
      defaultUserSession: { eventId },
      account,
      clients: { eventSnapshotClient }
    } = getState();
    const registrationPackId = getRegPackId(getState());
    const eventSnapshot = await eventSnapshotClient.getEventSnapshot(eventId, {
      version: eventSnapshotVersion,
      registrationTypeId,
      registrationPathId,
      registrationPackId
    });
    if (eventSnapshot.version !== eventSnapshotVersion) {
      throw new Error(`event snapshot version: ${eventSnapshot.version} returned from getEventSnapshot API,
        does not match with requested version: ${eventSnapshotVersion}`);
    }
    await Promise.all([
      dispatch(await createLoadEventSnapshotAction(eventSnapshot, account, appData)),
      dispatch(loadLandingWebsitePageContent(registrationTypeId))
    ]);
    dispatch(loadLanguageManagementSettings());
  };
};

export const loadLandingPageContent = (pageVarietyName: $TSFixMe) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    /**
     * PROD-83998: need to reload website when plugin data mismatch
     * if refreshing on registration pages
     */
    const eventRegistration = getEventRegistration(getState());
    const registrationTypeId = eventRegistration
      ? getRegistrationTypeId(getState())
      : getRegistrationTypeIdFromUserSession(getState());
    await dispatch(loadLandingWebsitePageContent(registrationTypeId));
    const varietiesToLoad = [];
    const registrationVariety = parseRegistrationProcessType(pageVarietyName);
    if (registrationVariety) {
      varietiesToLoad.push(registrationVariety);
      if (pageVarietyName === REGISTRATION.name && isGuestRegistrationEnabled(getState())) {
        varietiesToLoad.push(GUEST_REGISTRATION);
      }
      const regPathId = getRegistrationPathIdOrNull(getState()) || getRegistrationPathIdFromSession(getState());
      if (regPathId && regPathId !== getDefaultRegistrationPath(getState().appData).id) {
        await dispatch(filterEventSnapshot(getState().eventSnapshotVersion, registrationTypeId, regPathId));
      }
      return await Promise.all(varietiesToLoad.map(variety => dispatch(loadRegistrationContent(variety, regPathId))));
    }
  };
};

let callSequence = 0;
let lastCall = 0;
/**
 * Loads a specific version of event snapshot from the backend and applies any
 * necessary transforms and migrations to work with the client side application.
 */
export const loadEventSnapshotAndTransform = (eventSnapshotVersion?: $TSFixMe) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      defaultUserSession: { eventId },
      account,
      clients: { eventSnapshotClient }
    } = getState();
    const callNumber = (lastCall = callSequence++);
    const registrationTypeId = getRegistrationTypeId(getState());
    const registrationPathId = getRegistrationPathIdOrNull(getState());
    const registrationPackId = getRegPackId(getState());
    const eventSnapshot = await eventSnapshotClient.getEventSnapshot(eventId, {
      version: eventSnapshotVersion,
      registrationTypeId,
      registrationPathId,
      registrationPackId
    });
    const loadSnapshotAction = await createLoadEventSnapshotAction(eventSnapshot, account);
    // These should only be unequal if we have dispatched this action again while this was in flight
    if (lastCall === callNumber) {
      // state did not change during API call, we can apply the change (API response) to the state
      dispatch(loadSnapshotAction);
      dispatch(loadLanguageManagementSettings());
    }
  };
};

/**
 * Loads the account, event and travel(if on) snapshots from the backend and applies any necessary transoforms
 * and migrations to work with the client side application.
 */
export const loadCombinedSnapshot = () => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      defaultUserSession: { eventId },
      clients: { eventSnapshotClient }
    } = getState();
    const eventRegistration = getEventRegistration(getState());
    const registrationTypeId = eventRegistration
      ? getRegistrationTypeId(getState())
      : getRegistrationTypeIdFromUserSession(getState());
    const registrationPathId = getRegistrationPathIdOrNull(getState());
    const registrationPackId = getRegPackId(getState());
    const snapshots = await Promise.all([
      eventSnapshotClient.getAccountSnapshot(eventId),
      eventSnapshotClient.getEventSnapshot(eventId, { registrationTypeId, registrationPathId, registrationPackId })
    ]);
    const [accountSnapshot, eventSnapshot] = snapshots;
    dispatch(createLoadAccountSnapshotAction(accountSnapshot));
    dispatch(await createLoadEventSnapshotAction(eventSnapshot, getState().account));
  };
};

export function loadLanguageManagementSettings() {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const state = getState();
    const { event, text } = state;
    const regPathId = getRegistrationPathIdOrDefault(state);
    dispatch(loadLanguageManagementSettingsAction(event, regPathId, text));
  };
}

export const updateQuestionVisibility = (visibility: $TSFixMe, questionIds: $TSFixMe): $TSFixMe => {
  return {
    type: UPDATE_QUESTION_VISIBILTY,
    payload: { visibility, questionIds }
  };
};

// Record promises of calls to visibility logic
let visibilityLogicEvaluations = [];

export async function runningVisibilityLogicEvaluations(): Promise<$TSFixMe> {
  return Promise.all(visibilityLogicEvaluations).then(promiseResults => {
    if (promiseResults.length === visibilityLogicEvaluations.length) {
      visibilityLogicEvaluations = [];
    }
  });
}

export const evaluateQuestionVisibilityLogic = (fieldId: $TSFixMe, getQuestions = false, isGuest = false) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const {
      clients: { regCartClient },
      eventSnapshotVersion,
      accessToken,
      registrationForm: {
        regCart: { regCartId },
        regCart
      },
      event: { id: eventId }
    } = state;
    const currentRegistrantId = getEventRegistrationId(state) || getPrimaryRegistrationId(regCart);
    const currentRegPath = getRegistrationPathIdOrNull(state);
    const questionIdsList = getQuestions
      ? getQuestionIdsWithVisibilityLogic(state, isGuest, currentRegPath)
      : getQuestionIdsForVisibilityField(state, fieldId, isGuest, currentRegPath);
    const registrations = getEventRegistrations(regCart);
    const registrationActionsDisabled = areRegistrationActionsDisabled(state);

    const questionRegistrantMapping = getQuestionRegistrantMapping(
      state,
      registrations,
      currentRegistrantId,
      questionIdsList,
      isGuest
    );
    const registrantVisibilityLogicQuery = getVisibilityLogicQuery(
      state,
      registrations,
      questionRegistrantMapping,
      isGuest
    );
    let evaluationResults = {};
    if (!registrationActionsDisabled && questionIdsList.length && Object.keys(registrantVisibilityLogicQuery).length) {
      const promise = regCartClient.evaluateVisibilityLogic(
        accessToken,
        registrantVisibilityLogicQuery,
        eventSnapshotVersion,
        eventId,
        regCartId
      );
      visibilityLogicEvaluations.push(promise);
      evaluationResults = await promise;
      Object.keys(evaluationResults).forEach(registrationId => {
        const evaluationResult = evaluationResults[registrationId];
        Object.keys(evaluationResult).forEach(questionId => {
          if (!evaluationResult[questionId]) {
            const path = ['attendee', 'eventAnswers', questionId];
            // Create a blank answer for the question to clear the value.
            const answer = createAnswer(questionId);
            if (isGuest) {
              dispatch(setTemporaryGuestFieldValue(path, answer));
            } else {
              dispatch(setEventRegistrationFieldValue(registrationId, path, answer));
            }
          }
        });
      });
    }
    return dispatch(updateQuestionVisibility(transformQuestionVisibility(evaluationResults), questionIdsList));
  };
};

/**
 * Returns an associative array mapping the questionIds to associated registrantIds. Product questions can have
 * many or no applicable registrants, while other questions typicaly have just one registrant.  If a questionId
 * has no related registrants, it will not be included in the returned mapping
 * @param {*} state
 * @param {*} registrations
 * @param {*} currentRegistrantId
 * @param {*} questionIds
 */
export function getQuestionRegistrantMapping(
  state: $TSFixMe,
  registrations: $TSFixMe,
  currentRegistrantId: $TSFixMe,
  questionIds: $TSFixMe,
  isGuest = false
): $TSFixMe {
  const { appData } = state;
  const questionRegistrantMapping = {};
  if (questionIds.length) {
    const productQuestions = getProductQuestions(appData);
    questionIds.forEach(questionId => {
      if (questionId in productQuestions) {
        const productQuestionAssns = productQuestions[questionId].productQuestionAssociations;
        const matchingRegistrants = Object.values(registrations)
          // filter associated registrations to those related to current registration
          .filter(
            registration =>
              (registration as $TSFixMe).eventRegistrationId === currentRegistrantId ||
              ((registration as $TSFixMe).primaryRegistrationId === currentRegistrantId &&
                (registration as $TSFixMe).attendeeType === 'GUEST')
          )
          // filter registrations to those with the associated product
          .filter(registration => {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'productRegistrations' does not exist on ... Remove this comment to see the full error message
            const { productRegistrations, sessionRegistrations } = registration;
            return (
              !!productQuestionAssns &&
              productQuestionAssns.some(
                assn =>
                  (!!productRegistrations && productRegistrations.some(prodReg => assn === prodReg.productId)) ||
                  (!!sessionRegistrations && assn in sessionRegistrations)
              )
            );
          })
          .map(registration => (registration as $TSFixMe).eventRegistrationId);

        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (matchingRegistrants && matchingRegistrants.length) {
          questionRegistrantMapping[questionId] = matchingRegistrants;
        }
      } else {
        questionRegistrantMapping[questionId] = isGuest
          ? [getTemporaryGuestEventRegistrationId(state)]
          : [currentRegistrantId];
      }
    });
  }
  return questionRegistrantMapping;
}

/**
 * Builds and returns the payload for the visibility logic endpoint. It iterates over the questionRegistrantMapping
 * param, creating demarcated sub queries for each registrant present in the mapping.  The resulting structure is
 * keyed by registrant UUID and contains the visibility logic query specific to that registrant
 * @param {*} state
 * @param {*} registrations
 * @param {*} questionRegistrantMapping
 */
export function getVisibilityLogicQuery(
  state: $TSFixMe,
  registrations: $TSFixMe,
  questionRegistrantMapping: $TSFixMe,
  isGuest: $TSFixMe
): $TSFixMe {
  const registrantVisbilityLogicQuery = {};
  const questionRegistrantMappingKeys = questionRegistrantMapping && Object.keys(questionRegistrantMapping);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (questionRegistrantMappingKeys && questionRegistrantMappingKeys.length) {
    questionRegistrantMappingKeys.forEach(questionId => {
      const registrantIds = questionRegistrantMapping[questionId];
      registrantIds.forEach(registrantId => {
        const registrant = registrations[registrantId];
        if (!(registrant.eventRegistrationId in registrantVisbilityLogicQuery)) {
          registrantVisbilityLogicQuery[registrant.eventRegistrationId] = {
            answers: [],
            questionIds: []
          };
        }
        const fieldIdsList = getQuestionVisibilityFieldIdsForQuestions(state, [questionId]);
        if (fieldIdsList.length) {
          fieldIdsList.map(id => {
            if (
              !registrantVisbilityLogicQuery[registrant.eventRegistrationId].answers.some(
                answer => answer.questionId === id
              )
            ) {
              registrantVisbilityLogicQuery[registrant.eventRegistrationId].answers.push(
                getAnswerForFieldId(state, id, isGuest, registrant)
              );
            }
          });
          registrantVisbilityLogicQuery[registrant.eventRegistrationId].questionIds.push(questionId);
        }
      });
    });
  }
  return registrantVisbilityLogicQuery;
}

/**
 * Transforms the datastructure which is keyed by registrationId, to one that
 * is keyed by questionId.
 * @param {object} registrantQuestionVisibility
 */
export function transformQuestionVisibility(registrantQuestionVisibility: $TSFixMe): $TSFixMe {
  const questionRegistrantVisibility = {};
  Object.keys(registrantQuestionVisibility).forEach(registrationId => {
    const registrantQuestions = registrantQuestionVisibility[registrationId];
    Object.keys(registrantQuestions).forEach(questionId => {
      const visibility = registrantQuestions[questionId];
      if (!(questionId in questionRegistrantVisibility)) {
        questionRegistrantVisibility[questionId] = {};
      }
      questionRegistrantVisibility[questionId][registrationId] = visibility;
    });
  });
  return questionRegistrantVisibility;
}

/**
 * Creates action object to restore all reg types to state.
 * @param eventSnapshot
 * @returns {Promise<{payload: {eventSnapshot: *}, type: string}>}
 */
export const createRestoreRegTypesAction = (eventSnapshot: $TSFixMe): $TSFixMe => {
  return {
    type: RESTORE_ALL_REG_TYPES_FOR_EVENT,
    payload: eventSnapshot
  };
};

/**
 * Create action object to show the spinner.
 * @param payload : payload when dispatching action.
 */
export const showSpinnerSelection = (payload: $TSFixMe): $TSFixMe => {
  return { type: SPINNER_SELECTION_PENDING, payload };
};

/**
 * Create action object to hide the spinner.
 */
export const hideSpinnerSelection = (): $TSFixMe => {
  return { type: SPINNER_SELECTION_DONE };
};
