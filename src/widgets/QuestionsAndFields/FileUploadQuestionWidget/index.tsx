import { connect } from 'react-redux';
import React from 'react';
import FileUploadWidget from './FileUploadQuestionWidget';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import {
  getRegCartEventSnapshotVersion,
  getAllGuestsForCurrentRegistration
} from '../../../redux/selectors/currentRegistrant';
import { getRegCart, areRegistrationActionsDisabled } from '../../../redux/selectors/shared';
import { getQuestionsForPrimaryAndGuests, isWidgetPlacedOnGuestModal } from '../../../utils/eventRegistrationData';

const FileUploadQuestionWrapper = props => {
  return (
    <div>
      {/* eslint-disable-next-line react/prop-types */}
      {props.questions.map((questionProps, questionIndex) => {
        return <FileUploadWidget {...props} {...questionProps} key={questionIndex} />;
      })}
    </div>
  );
};

export default withMappedWidgetConfig(
  connect(
    withMemoizedFunctions({
      getQuestionsForPrimaryAndGuests
    })(memoized => {
      return (state: $TSFixMe, props: $TSFixMe) => {
        const {
          accessToken,
          clients: { flexFileClient }
        } = state;
        const regCart = getRegCart(state);
        const eventSnapshotVersion = getRegCartEventSnapshotVersion(state);
        const regCartId = regCart.regCartId;

        /* Logic Specific to Product Question */
        let allGuests;
        const isProductQuestion = props.config.appData.question.isProductQuestion;
        const isOnGuestModal = isWidgetPlacedOnGuestModal(props.config);
        // Don't duplicate primary's and other guests' questions on guest modal
        if (isProductQuestion && !isOnGuestModal) {
          allGuests = getAllGuestsForCurrentRegistration(state);
        }
        const isProductSubQuestion = isProductQuestion && props.config.appData.parentQuestionId;
        return {
          accessToken,
          flexFileClient,
          eventSnapshotVersion,
          regCartId,
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          numGuests: allGuests && allGuests.length,
          questions: memoized.getQuestionsForPrimaryAndGuests(allGuests, isProductSubQuestion, props.metaData),
          disableUploadButton: areRegistrationActionsDisabled(state)
        };
      };
    }),
    {},
    (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
      return {
        ...ownProps,
        ...stateProps,
        ...dispatchProps
      };
    }
  )(FileUploadQuestionWrapper)
);
