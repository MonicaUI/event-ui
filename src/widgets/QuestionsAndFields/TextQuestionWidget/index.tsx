import { connect, useStore } from 'react-redux';
import React from 'react';
import gql from 'graphql-tag';
import TextQuestionWidget from './TextQuestionWidget';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import { getAllGuestsForCurrentRegistration } from '../../../redux/selectors/currentRegistrant';
import { AnswerFormatTypes } from 'cvent-question-widgets/lib/TextQuestion';
import { setIn } from 'icepick';
import { getQuestionsForPrimaryAndGuests, isWidgetPlacedOnGuestModal } from '../../../utils/eventRegistrationData';
import { getTravelQuestionsData } from '../../../utils/travelQuestionUtils';
import { getQuestionSurveyType } from '../../../utils/questionUtils';
import { isTravelQuestion } from 'event-widgets/utils/travelUtils';
import { useRegistrationPageVarietyPathQuery } from '../../../apollo/siteEditor/pageVarietyPathQueryHooks';
import { useGraphQLSiteEditorData, GraphQLSiteEditorDataReleases } from '../../../ExperimentHelper';
import { getWidget } from '../../../redux/website/pageContents';

function getQuestionHardLimit(answerFormatType) {
  /*
   * PROD-55666: when no max is set, normandy default to max 10 characters,
   * we need to match that behavior here.
   */
  const HARD_LIMIT = 9999999999;
  if (answerFormatType === AnswerFormatTypes.NUMBER) {
    return HARD_LIMIT;
  }
  return null;
}

function getModifiedConfig(config) {
  const questionHardLimit = getQuestionHardLimit(config.appData.question.questionTypeInfo.answerFormatType);
  if (questionHardLimit) {
    return setIn(config, ['appData', 'question', 'questionTypeInfo', 'hardLimit'], questionHardLimit);
  }
  return config;
}

const TextQuestionWrapper = props => {
  return (
    <div>
      {/* eslint-disable-next-line react/prop-types */}
      {props.questions.map((questionProps, questionIndex) => {
        // eslint-disable-next-line react/prop-types
        return <TextQuestionWidget {...props} {...questionProps} key={questionIndex} config={props.config} />;
      })}
    </div>
  );
};

export const ConnectedTextQuestionWidget = withMappedWidgetConfig(
  connect(
    withMemoizedFunctions({
      getModifiedConfig,
      getQuestionsForPrimaryAndGuests,
      getTravelQuestionsData
    })(memoized => {
      return (state: $TSFixMe, props: $TSFixMe) => {
        const config = memoized.getModifiedConfig(props.config);
        let allGuests;
        let questions = [];
        // Logic specific to travel questions
        const surveType = getQuestionSurveyType(props.config);
        if (isTravelQuestion(surveType)) {
          questions = getTravelQuestionsData(state, props) || [];
        } else {
          /* Logic Specific to Product Question */
          const isProductQuestion = props.config.appData.question.isProductQuestion;
          const isOnGuestModal = isWidgetPlacedOnGuestModal(props.config);
          // Don't duplicate primary's and other guests' questions on guest modal
          if (isProductQuestion && !isOnGuestModal) {
            allGuests = getAllGuestsForCurrentRegistration(state);
          }
          const isProductSubQuestion = isProductQuestion && props.config.appData.parentQuestionId;
          questions = memoized.getQuestionsForPrimaryAndGuests(allGuests, isProductSubQuestion, props.metaData);
        }
        return {
          config,
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          numGuests: allGuests && allGuests.length,
          questions
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
  )(TextQuestionWrapper)
);

export const TEXT_QUESTION_FRAGMENT = gql`
  fragment QuestionWidget on PageVarietyPath {
    airActual {
      enabled
    }
    airRequest {
      enabled
    }
    groupFlight {
      enabled
    }
    hotelRequest {
      enabled
    }
  }
`;

export const TextQuestionWidgetWithGraphQL = (props: $TSFixMe): $TSFixMe => {
  const query = useRegistrationPageVarietyPathQuery(TEXT_QUESTION_FRAGMENT);
  const data = query.data || query.previousData;
  const isAirActualWidgetPresent = !!data?.event?.registrationPath?.registration?.airActual?.enabled;
  const isAirRequestWidgetPresent = !!data?.event?.registrationPath?.registration?.airRequest?.enabled;
  const isGroupFlightWidgetPresent = !!data?.event?.registrationPath?.registration?.groupFlight?.enabled;
  const isHotelRequestWidgetPresent = !!data?.event?.registrationPath?.registration?.hotelRequest?.enabled;

  return (
    <ConnectedTextQuestionWidget
      isAirActualWidgetPresent={isAirActualWidgetPresent}
      isAirRequestWidgetPresent={isAirRequestWidgetPresent}
      isGroupFlightWidgetPresent={isGroupFlightWidgetPresent}
      isHotelRequestWidgetPresent={isHotelRequestWidgetPresent}
      {...props}
    />
  );
};

export const TextQuestionWidgetWithRedux = (props: $TSFixMe): $TSFixMe => {
  const store = useStore();
  const isAirActualWidgetPresent = !!getWidget(store.getState(), 'AirActual').id;
  const isAirRequestWidgetPresent = !!getWidget(store.getState(), 'AirRequest').id;
  const isGroupFlightWidgetPresent = !!getWidget(store.getState(), 'GroupFlight').id;
  const isHotelRequestWidgetPresent = !!getWidget(store.getState(), 'HotelRequest').id;

  return (
    <ConnectedTextQuestionWidget
      isAirActualWidgetPresent={isAirActualWidgetPresent}
      isAirRequestWidgetPresent={isAirRequestWidgetPresent}
      isGroupFlightWidgetPresent={isGroupFlightWidgetPresent}
      isHotelRequestWidgetPresent={isHotelRequestWidgetPresent}
      {...props}
    />
  );
};

export default function TextQuestionExperimentWrapper(props: $TSFixMe): $TSFixMe {
  const usingGraphQLWidgetData = useGraphQLSiteEditorData(GraphQLSiteEditorDataReleases.TravelQuestionUtils);
  if (usingGraphQLWidgetData) return <TextQuestionWidgetWithGraphQL {...props} />;
  return <TextQuestionWidgetWithRedux {...props} />;
}
