import React from 'react';
import { connect } from 'react-redux';
import { defaultMemoize } from 'reselect';
import FileUploadWidget from 'event-widgets/lib/FileUpload/FileUploadWidget';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import { textRequired } from '@cvent/nucleus-form-validations';
import TextAndDateAnswer from '../model/TextAndDateAnswer';
import escapeQuestionHtmlField from 'event-widgets/utils/escapeQuestionHtmlField';
import { showLoadingDialog, hideLoadingDialog } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import {
  setAnswerAction,
  buildQuestionAnswerPath,
  createAnswer,
  getQuestionHeader
} from '../../../utils/eventRegistrationData';
import {
  isQuestionVisible,
  getTemporaryGuestEventRegistrationId,
  getEventRegistrationId,
  getFileUploadAnswer
} from '../../../redux/selectors/currentRegistrant';
import wrapInput, { inputOptions } from 'nucleus-form/src/components/wrapInput';
import { setParentQuestionId } from '../utils';
import { showSpinnerSelection, hideSpinnerSelection } from '../../../redux/actions';
import renderRichText from 'nucleus-widgets/utils/renderRichText';

const uploadType = 'EVENT_QUESTION';

function getFileAnswer(questionId, file) {
  const fileAnswer = [
    {
      answerType: 'Text',
      text: file.name,
      ...file
    }
  ];
  return new TextAndDateAnswer(questionId, fileAnswer);
}

function onFileUploadSuccess(baseAction, questionId, currentAnswer, uploads, file, removeFile) {
  const savedAnswer = currentAnswer?.answers?.find(entry => entry.answerType === 'Text');
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 3.
  const answer = getFileAnswer(questionId, file, savedAnswer);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (uploads && uploads.files) {
    removeFile(uploads.files[0], file);
  }
  return setAnswerAction(baseAction, answer);
}

function onFileUploadComplete(
  baseAction,
  questionId,
  currentAnswer,
  uploads,
  isWidgetPlacedOnGuestModal,
  file,
  removeFile
) {
  return async dispatch => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (file && file.path) {
      await dispatch(onFileUploadSuccess(baseAction, questionId, currentAnswer, uploads, file, removeFile));
    }
    return !isWidgetPlacedOnGuestModal ? await dispatch(hideLoadingDialog()) : await dispatch(hideSpinnerSelection());
  };
}

function onRemoveFile(baseAction, questionId, flexFileClient, fileIdentifiers, fileToRemove, uploadedFile) {
  const answer = new TextAndDateAnswer(questionId, [{ answerType: 'Text', text: '' }]);
  const shouldBeDeleted = uploadedFile ? fileToRemove.path !== uploadedFile.path : true;
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (fileToRemove && fileToRemove.path && shouldBeDeleted) {
    flexFileClient.deleteFile(fileToRemove.path, uploadType, fileIdentifiers);
  }
  return setAnswerAction(baseAction, answer);
}

const defaultValidationObject = Object.freeze({});
function getWidgetValidations(isPlanner, isRequired, translate, isWidgetQuestionVisible) {
  return !isPlanner && isRequired && isWidgetQuestionVisible
    ? { required: textRequired(translate) }
    : defaultValidationObject;
}

export default connect(
  withMemoizedFunctions({
    escapeQuestionHtmlField,
    getWidgetValidations,
    setParentQuestionId
  })(memoized => {
    const buildQuestionAnswerPathMemoized = defaultMemoize(questionId => {
      return buildQuestionAnswerPath(questionId);
    });
    const getAnswer = createAnswer();
    const getFileUploads = defaultMemoize(answerValue => {
      return getFileUploadAnswer(answerValue);
    });
    const isFileUploaded = defaultMemoize(answer => {
      return !!answer?.value?.answers?.[0]?.text;
    });
    const getLabel = defaultMemoize((html, translate) => (
      <span dangerouslySetInnerHTML={{ __html: renderRichText(html, translate) }} />
    ));

    return (state: $TSFixMe, props: $TSFixMe) => {
      const { flexFileClient, eventSnapshotVersion, regCartId, disableUploadButton } = props;
      const { translate, numGuests } = props;
      let config = memoized.escapeQuestionHtmlField(props.config);
      const question = config.appData.question;
      config = memoized.setParentQuestionId(state.appData, config, question.id);
      let eventRegistrationId = props.eventRegistrationId;

      const answer = getAnswer({
        state,
        widgetConfig: props.config,
        eventRegistrationPath: buildQuestionAnswerPathMemoized(question.id),
        eventRegistrationId
      });
      if (!eventRegistrationId) {
        eventRegistrationId = answer.isWidgetPlacedOnGuestModal
          ? getTemporaryGuestEventRegistrationId(state)
          : getEventRegistrationId(state);
      }
      const isWidgetQuestionVisible = isQuestionVisible(state, config, answer, props.eventRegistrationId);
      const fileIdentifiers = {
        fieldId: question.id,
        regCartId,
        eventRegistrationId
      };
      const uploadURL = flexFileClient.getFileUploadUrl(uploadType, fileIdentifiers, eventSnapshotVersion);
      const fieldId = question.id + (eventRegistrationId ? '-' + eventRegistrationId : '');
      const questionHeader =
        !props.config.appData.parentQuestionId &&
        question.isProductQuestion &&
        numGuests > 0 &&
        getQuestionHeader(state, props);
      const spinnerSelectionVisible =
        answer.isWidgetPlacedOnGuestModal &&
        state.spinnerSelection &&
        state.spinnerSelection.pendingSpinnerSelection === config.id;
      return {
        config,
        locale: state.text.locale,
        uploads: getFileUploads(answer.value),
        uploadURL,
        flexFileClient,
        answer: answer.value,
        fieldId,
        fieldName: getLabel(question.html, translate),
        translate,
        value: isFileUploaded(answer),
        validations: memoized.getWidgetValidations(
          state.defaultUserSession.isPlanner,
          question.additionalInfo.required,
          translate,
          isWidgetQuestionVisible
        ),
        setterAction: answer.setterAction,
        isQuestionVisible: isWidgetQuestionVisible,
        questionHeader,
        isWidgetPlacedOnGuestModal: answer.isWidgetPlacedOnGuestModal,
        spinnerSelectionVisible,
        fileIdentifiers,
        disableUploadButton
      };
    };
  }),
  { onFileUploadComplete, onRemoveFile, showLoadingDialog, showSpinnerSelection },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      onFileUploadStart: !stateProps.isWidgetPlacedOnGuestModal
        ? dispatchProps.showLoadingDialog.bind(null)
        : dispatchProps.showSpinnerSelection.bind(null, stateProps.config.id),
      onFileUploadComplete: dispatchProps.onFileUploadComplete.bind(
        null,
        stateProps.setterAction,
        ownProps.config.id,
        stateProps.answer,
        stateProps.uploads,
        stateProps.isWidgetPlacedOnGuestModal
      ),
      onRemoveFile: dispatchProps.onRemoveFile.bind(
        null,
        stateProps.setterAction,
        ownProps.config.id,
        stateProps.flexFileClient,
        stateProps.fileIdentifiers
      )
    };
  }
)(
  wrapInput({
    ...inputOptions,
    inputIdKey: 'fieldId',
    defaultIncludeErrorMessages: true,
    labelKey: 'fieldName'
  })(FileUploadWidget)
);
