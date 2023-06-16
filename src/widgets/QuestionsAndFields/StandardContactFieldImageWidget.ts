import { connect } from 'react-redux';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import { textRequired } from '@cvent/nucleus-form-validations';
import wrapInput, { inputOptions } from 'nucleus-form/src/components/wrapInput';
import { showLoadingDialog, hideLoadingDialog } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import StandardContactFields from 'event-widgets/lib/StandardContactFields/StandardContactFields';
import { REQUIRED } from 'cvent-question-widgets/lib/DisplayType';
import StandardContactFieldImageWidget from 'event-widgets/lib/StandardContactFields/StandardContactFieldImageWidget';
import { getLocalizedContactFieldForWidget } from './utils';
import * as eventRegistrationData from '../../utils/eventRegistrationData';
import { get } from 'lodash';

import { getRegCart, areRegistrationActionsDisabled } from '../../redux/selectors/shared';
import {
  getTemporaryGuestEventRegistrationId,
  getEventRegistrationId,
  getRegCartEventSnapshotVersion,
  isRegistrationModification
} from '../../redux/selectors/currentRegistrant';

const uploadType = 'PROFILE_IMAGE';

function getFileAnswer(isRegMod, file) {
  let fileAnswer = {
    friendlyName: file.name,
    physicalName: file.path,
    imageUri: file.uRL + '?' + Date.now(), // This dummy parameter is used to invalidate browser image cache and load the image everytime
    fileSize: file.fileSize
  };

  if (isRegMod) {
    fileAnswer = {
      ...fileAnswer,
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ deletable: boolean; friendlyName: any; phy... Remove this comment to see the full error message
      deletable: true
    };
  }
  return fileAnswer;
}

function onFileUploadSuccess(currentAnswer, uploads, setAnswer, setterAction, isRegMod, file, removeFile) {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (uploads && uploads.files) {
    removeFile(uploads.files[0], file);
  }
  const fileAnswer = getFileAnswer(isRegMod, file);
  return setAnswer(setterAction, fileAnswer);
}

function onFileUploadComplete(currentAnswer, uploads, setAnswer, setterAction, isRegMod, file, removeFile) {
  return async dispatch => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (file && file.path) {
      await dispatch(onFileUploadSuccess(currentAnswer, uploads, setAnswer, setterAction, isRegMod, file, removeFile));
    }
    return await dispatch(hideLoadingDialog());
  };
}

function onRemoveFile(flexFileClient, setAnswer, setterAction, isRegMod, fileIdentifiers, fileToRemove, uploadedFile) {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const deletable = fileToRemove && fileToRemove.deletable;
  let shouldBeDeleted = !isRegMod || (isRegMod && deletable);
  if (uploadedFile) {
    shouldBeDeleted = shouldBeDeleted && fileToRemove.path !== uploadedFile.path;
  }
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (fileToRemove && fileToRemove.path && shouldBeDeleted) {
    flexFileClient.deleteFile(fileToRemove.path, uploadType, fileIdentifiers);
  }
  return setAnswer(setterAction, null);
}

function setImagePublicUri(setAnswer, setterAction, flexFileClient, answer, path) {
  return async dispatch => {
    const publicLinkItem = await flexFileClient.getPublicFileUrl(path, uploadType);
    const imageUri = publicLinkItem.publicLink;
    const updatedAnswer = { ...answer, imageUri };
    return dispatch(setAnswer(setterAction, updatedAnswer));
  };
}

function getUploads(answer, defaultValue) {
  const fileName = get(answer, 'value.friendlyName', '');
  const path = get(answer, 'value.physicalName', '');
  const imageUri = get(answer, 'value.imageUri', '');
  const deletable = get(answer, 'value.deletable', false);
  const uploads = fileName ? { files: [{ fileName, path, imageUri, deletable }] } : defaultValue;
  return uploads;
}

const defaultValidationObject = Object.freeze({});
function getWidgetValidations(isPlanner, isRequired, translate) {
  return !isPlanner && isRequired ? { required: textRequired(translate) } : defaultValidationObject;
}

const defaultValue = Object.freeze({});
export default withMappedWidgetConfig(
  connect(
    withMemoizedFunctions({
      getUploads,
      getWidgetValidations,
      getLocalizedContactFieldForWidget
    })(memoized => (state: $TSFixMe, props: $TSFixMe) => {
      const {
        text: { translate },
        clients: { flexFileClient }
      } = state;
      const registrationField = getLocalizedContactFieldForWidget(state, props.config, props.id);
      const fieldConfig = StandardContactFields[props.config.fieldId];
      const eventRegistrationPath = eventRegistrationData.buildEventRegistrationPath(fieldConfig.regApiPath);
      const answer = eventRegistrationData.answer({
        state,
        widgetConfig: props.config,
        eventRegistrationPath
      });
      const fileName = get(answer, 'value.physicalName', '');
      const isFileUploaded = fileName !== '';

      const regCart = getRegCart(state);
      const disableUploadButton = areRegistrationActionsDisabled(state);
      const eventRegistrationId = answer.isWidgetPlacedOnGuestModal
        ? getTemporaryGuestEventRegistrationId(state)
        : getEventRegistrationId(state);
      const eventSnapshotVersion = getRegCartEventSnapshotVersion(state);
      const fileIdentifiers = {
        fieldId: props.config.fieldId,
        regCartId: regCart.regCartId,
        eventRegistrationId
      };
      const uploadURL = flexFileClient.getFileUploadUrl(uploadType, fileIdentifiers, eventSnapshotVersion);

      return {
        registrationField,
        eventRegistrationId: getEventRegistrationId(state),
        skipRequiredValidation: state.defaultUserSession.isPlanner,
        buttonText: translate(props.config.uploadButtonText),
        deleteText: translate(props.config.deleteText),
        uploadURL,
        flexFileClient,
        uploads: memoized.getUploads(answer, defaultValue),
        answer: answer.value,
        isRegMod: isRegistrationModification(state),
        setterAction: answer.setterAction,
        fieldId: props.config.fieldId,
        fieldName: translate(registrationField.displayName),
        value: isFileUploaded,
        validations: memoized.getWidgetValidations(
          state.defaultUserSession.isPlanner,
          registrationField.display === REQUIRED,
          translate
        ),
        fileIdentifiers,
        disableUploadButton
      };
    }),
    {
      onFileUploadComplete,
      onRemoveFile,
      showLoadingDialog,
      setImagePublicUri,
      setAnswer: eventRegistrationData.setAnswerAction
    },
    (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
      return {
        ...ownProps,
        ...stateProps,
        ...dispatchProps,
        onFileUploadStart: dispatchProps.showLoadingDialog.bind(null),
        onFileUploadComplete: dispatchProps.onFileUploadComplete.bind(
          null,
          stateProps.answer,
          stateProps.uploads,
          dispatchProps.setAnswer,
          stateProps.setterAction,
          stateProps.isRegMod
        ),
        onRemoveFile: dispatchProps.onRemoveFile.bind(
          null,
          stateProps.flexFileClient,
          dispatchProps.setAnswer,
          stateProps.setterAction,
          stateProps.isRegMod,
          stateProps.fileIdentifiers
        ),
        setImagePublicUri: dispatchProps.setImagePublicUri.bind(
          null,
          dispatchProps.setAnswer,
          stateProps.setterAction,
          stateProps.flexFileClient
        ),
        disableUploadImageButton: stateProps.disableUploadButton ?? false
      };
    }
  )(
    wrapInput({
      ...inputOptions,
      inputIdKey: 'fieldId',
      defaultIncludeErrorMessages: true,
      labelKey: 'fieldName'
    })(StandardContactFieldImageWidget)
  )
);
