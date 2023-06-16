import { connect, useStore } from 'react-redux';
import React from 'react';
import gql from 'graphql-tag';
import DateTimeQuestionWidget from './DateTimeQuestionWidget';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import { getAllGuestsForCurrentRegistration } from '../../../redux/selectors/currentRegistrant';
import { getQuestionsForPrimaryAndGuests, isWidgetPlacedOnGuestModal } from '../../../utils/eventRegistrationData';
import { getTravelQuestionsData } from '../../../utils/travelQuestionUtils';
import { isTravelQuestion } from 'event-widgets/utils/travelUtils';
import { getQuestionSurveyType } from '../../../utils/questionUtils';
import { useRegistrationPageVarietyPathQuery } from '../../../apollo/siteEditor/pageVarietyPathQueryHooks';
import { useGraphQLSiteEditorData, GraphQLSiteEditorDataReleases } from '../../../ExperimentHelper';
import { getWidget } from '../../../redux/website/pageContents';

const DateTimeQuestionWrapper = props => {
  return (
    <div>
      {/* eslint-disable-next-line react/prop-types */}
      {props.questions.map((questionProps, questionIndex) => {
        return <DateTimeQuestionWidget {...props} {...questionProps} key={questionIndex} />;
      })}
    </div>
  );
};

export const ConnectedDateTimeQuestionWidget = withMappedWidgetConfig(
  connect(
    withMemoizedFunctions({
      getQuestionsForPrimaryAndGuests,
      getTravelQuestionsData
    })(memoized => {
      return (state: $TSFixMe, props: $TSFixMe) => {
        let allGuests;
        let questions = [];
        // Logic specific to travel questions
        const surveType = getQuestionSurveyType(props.config);
        if (isTravelQuestion(surveType)) {
          questions = memoized.getTravelQuestionsData(state, props) || [];
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
  )(DateTimeQuestionWrapper)
);

export const DATE_TIME_QUESTION_FRAGMENT = gql`
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

export const DateTimeQuestionWidgetWithGraphQL = (props: $TSFixMe): $TSFixMe => {
  const query = useRegistrationPageVarietyPathQuery(DATE_TIME_QUESTION_FRAGMENT);
  const data = query.data || query.previousData;
  const isAirActualWidgetPresent = !!data?.event?.registrationPath?.registration?.airActual?.enabled;
  const isAirRequestWidgetPresent = !!data?.event?.registrationPath?.registration?.airRequest?.enabled;
  const isGroupFlightWidgetPresent = !!data?.event?.registrationPath?.registration?.groupFlight?.enabled;
  const isHotelRequestWidgetPresent = !!data?.event?.registrationPath?.registration?.hotelRequest?.enabled;

  return (
    <ConnectedDateTimeQuestionWidget
      isAirActualWidgetPresent={isAirActualWidgetPresent}
      isAirRequestWidgetPresent={isAirRequestWidgetPresent}
      isGroupFlightWidgetPresent={isGroupFlightWidgetPresent}
      isHotelRequestWidgetPresent={isHotelRequestWidgetPresent}
      {...props}
    />
  );
};

export const DateTimeQuestionWidgetWithRedux = (props: $TSFixMe): $TSFixMe => {
  const store = useStore();
  const isAirActualWidgetPresent = !!getWidget(store.getState(), 'AirActual').id;
  const isAirRequestWidgetPresent = !!getWidget(store.getState(), 'AirRequest').id;
  const isGroupFlightWidgetPresent = !!getWidget(store.getState(), 'GroupFlight').id;
  const isHotelRequestWidgetPresent = !!getWidget(store.getState(), 'HotelRequest').id;

  return (
    <ConnectedDateTimeQuestionWidget
      isAirActualWidgetPresent={isAirActualWidgetPresent}
      isAirRequestWidgetPresent={isAirRequestWidgetPresent}
      isGroupFlightWidgetPresent={isGroupFlightWidgetPresent}
      isHotelRequestWidgetPresent={isHotelRequestWidgetPresent}
      {...props}
    />
  );
};

export default function DateTimeQuestionExperimentWrapper(props: $TSFixMe): $TSFixMe {
  const usingGraphQLWidgetData = useGraphQLSiteEditorData(GraphQLSiteEditorDataReleases.TravelQuestionUtils);
  if (usingGraphQLWidgetData) return <DateTimeQuestionWidgetWithGraphQL {...props} />;
  return <DateTimeQuestionWidgetWithRedux {...props} />;
}
