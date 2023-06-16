import WidgetFactory from 'nucleus-widgets/WidgetFactory';
import { getRegistrationPathId } from '../redux/selectors/currentRegistrationPath';
import customFieldWidgetFactories from './CustomFieldWidgetFactories';
import standardFieldWidgetFactories from './StandardFieldWidgetFactories';
import questionWidgetFactories from './QuestionWidgetFactories';
import OptOutWidgetFactories from '../widgets/OptOut/widgetFactories';
import UnsubscribeWidgetFactories from '../widgets/Unsubscribe/widgetFactories';
import TravelWidgetFactories from './TravelWidgetFactories';
import { getRegistrationPathIdForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { withPlannerEmailConfirmation } from '../widgets/PlannerEmailConfirmationWidget';
import VirtualDetailsWidgetFactories from '../widgets/VirtualDetails/widgetFactories';
import loadWidgetResources from './loadWidgetResources';

export default class EventGuestSideWidgetFactory extends WidgetFactory {
  constructor(experimentSettings?: $TSFixMe) {
    super(
      [
        ...questionWidgetFactories(experimentSettings),
        ...standardFieldWidgetFactories(experimentSettings),
        ...customFieldWidgetFactories(experimentSettings),
        ...OptOutWidgetFactories,
        ...UnsubscribeWidgetFactories,
        ...TravelWidgetFactories,
        ...VirtualDetailsWidgetFactories,
        {
          metadata: {
            type: 'AdmissionItems',
            name: '_widgetName_AdmissionItems__resx',
            minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 4
          },
          creator: () => import('../widgets/AdmissionItemsWidget/AdmissionItemsWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'ContactPlanner',
            name: '_widgetName_contactPlanner__resx',
            minCellSize: 1,
            appDataFieldPaths: {
              email: 'contactPlannerSettings.email',
              displayEmail: 'contactPlannerSettings.displayEmail'
            }
          },
          creator: () => import('../widgets/ContactPlannerWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'EventCountdownTimer',
            name: '_widgetName_countdowntimer__resx',
            minCellSize: 4
          },
          creator: () => import('event-widgets/lib/CountdownTimer/CountdownTimerWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'MultiLanguage',
            name: '_widgetName_MultiLanguage__resx',
            minCellSize: 4,
            disableInput: false,
            isDeletable: true
          },
          creator: () => import('../widgets/MultiLanguageWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'EventDateTime',
            name: '_widgetName_dateTime__resx',
            minCellSize: 1
          },
          creator: () => import('../widgets/EventDateTimeWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'RegistrationDeadline',
            name: '_widgetName_registrationDeadline__resx',
            minCellSize: 2
          },
          creator: () => import('../widgets/RegistrationDeadlineWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'Staffs',
            name: 'EventWidgets_Staffs_WidgetName__resx',
            minCellSize: 4
          },
          creator: () => import('../widgets/Staffs').then(m => m.default)
        },
        {
          metadata: {
            type: 'Payment',
            name: '_widgetName_payment__resx',
            minCellSize: 4,
            appDataFieldPaths: {
              paymentSettings: (state, config, widgetId) => {
                const regPathId = getRegistrationPathIdForWidget(state, widgetId);
                return `registrationPathSettings.${regPathId}.paymentSettings`;
              },
              partialPaymentSettings: (state, config, widgetId) => {
                const regPathId = getRegistrationPathIdForWidget(state, widgetId);
                return `registrationPathSettings.${regPathId}.partialPaymentSettings`;
              }
            }
          },
          creator: () => import('../widgets/PaymentWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'PostRegistrationPayment',
            name: 'EventWidgets_PostRegistrationPayment__resx',
            isDeletable: false,
            minCellSize: 4
          },
          creator: () => import('../widgets/PostRegistrationPaymentWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'RegistrationPostRegPaymentNavigator',
            name: 'EventWidgets_PostRegistrationPaymentNavigator_WidgetName__resx',
            minCellSize: 4
          },
          creator: () => import('../widgets/RegistrationPostRegPaymentNavigatorWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'EventDescription',
            name: '_widgetName_description__resx',
            minCellSize: 1
          },
          creator: () => import('event-widgets/lib/Description/DescriptionWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'EventFooter',
            name: '_widgetName_footer__resx',
            minCellSize: 4,
            isDeletable: false
          },
          creator: () => import('../widgets/EventFooterWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'EventHeader',
            name: '_widgetName_header__resx',
            minCellSize: 2
          },
          creator: () => import('event-widgets/lib/Header/HeaderWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'EventIdentityConfirmation',
            name: '_widgetName_identityConfirmation__resx',
            minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 4,
            hasChildren: true
          },
          creator: () => import('../widgets/EventIdentityConfirmationWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'EventLocation',
            name: '_widgetName_location__resx',
            minCellSize: 1
          },
          creator: () => import('../widgets/LocationWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'LocationMap',
            name: 'EventWidgets_LocationMap_WidgetName__resx',
            minCellSize: 1
          },
          creator: () => import('../widgets/LocationMapWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'EventRegisterNow',
            name: '_widgetName_register__resx',
            minCellSize: 1
          },
          creator: () => import('../widgets/RegisterButton/RegisterNowWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'EventRegisterAnother',
            name: 'EventWidgets_RegisterAnother_Register__resx',
            minCellSize: 1
          },
          creator: () => import('../widgets/RegisterButton/RegisterAnotherWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'CancelRegistration',
            name: 'EventWidgets_CancelRegistration_WidgetName__resx',
            minCellSize: 1,
            appDataFieldPaths: {
              cancellation: state => {
                const regPathId = getRegistrationPathId(state);
                return `registrationSettings.registrationPaths.${regPathId}.cancellation`;
              }
            }
          },
          creator: () => import('../widgets/CancelRegistrationWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'SubstituteRegistrant',
            name: 'EventWidgets_SubstituteReg_WidgetName__resx',
            minCellSize: 1,
            hasChildren: true,
            appDataFieldPaths: {
              substituteRegistrationSettings: state => {
                const regPathId = getRegistrationPathId(state);
                return `registrationSettings.registrationPaths.${regPathId}.substituteRegistrationSettings`;
              }
            }
          },
          creator: () => import('../widgets/RegistrationSubstitution/SubstituteRegistrationWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'InvitationForwarding',
            name: 'EventWidgets_ForwardInv_WidgetName__resx',
            minCellSize: 4,
            appDataFieldPaths: {
              invitationForwardingSettings: state => {
                const regPathId = getRegistrationPathId(state);
                return `registrationSettings.registrationPaths.${regPathId}.invitationForwardingSettings`;
              }
            }
          },
          creator: () => import('../widgets/InvitationForwardingWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'ConfirmationNumber',
            name: 'EventWidgets_ConfirmationNumber_WidgetName__resx',
            minCellSize: 1
          },
          creator: () => import('../widgets/ConfirmationNumber').then(m => m.default)
        },
        {
          metadata: {
            type: 'EventWeather',
            name: '_widgetName_weather__resx',
            minCellSize: 2
          },
          // Todo: Fill in with correct creator.
          creator: () => import('nucleus-widgets/lib/EmptyCell/EmptyCellWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'NucleusEmptyCell',
            name: '_widgetName_empty__resx',
            minCellSize: 1
          },
          creator: () => import('nucleus-widgets/lib/EmptyCell/EmptyCellWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'NucleusText',
            name: '_widgetName_text__resx',
            minCellSize: 1
          },
          creator: () => import('nucleus-widgets/lib/Text/TextWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'NucleusImage',
            name: '_widgetName_image__resx',
            minCellSize: 1
          },
          creator: () => import('../widgets/ImageWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'NucleusImageCarousel',
            name: 'NucleusWidget_WidgetName_ImageCarousel__resx',
            minCellSize: 2
          },
          creator: () => import('nucleus-widgets/lib/ImageCarousel/ImageCarouselWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'RegistrationNavigator',
            name: '_widgetName_registrationNavigation__resx',
            minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 4,
            isDeletable: false
          },
          creator: () =>
            Promise.all([
              import('../widgets/RegistrationNavigator/RegistrationNavigatorWidget'),
              import('../widgets/PlannerEmailConfirmationWidget/PlannerEmailConfirmationWrapper')
            ]).then(m => withPlannerEmailConfirmation(m[0].default, m[1].default))
        },
        {
          metadata: {
            type: 'WebsiteNavigator',
            name: '_widgetName_websiteNavigator__resx',
            minCellSize: 4
          },
          creator: () => import('../widgets/WebsiteNavigator/WebsiteNavigatorWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'RegistrationType',
            name: '_widgetName_registrationType__resx',
            appDataFieldPaths: {
              registrationTypeSettings: (state: $TSFixMe) => {
                const regPathId = getRegistrationPathId(state);
                return `registrationSettings.registrationPaths.${regPathId}.registrationTypeSettings`;
              }
            },
            minCellSize: 4
          },
          creator: () => import('../widgets/RegistrationTypeWidget/RegistrationTypeWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'GuestRegistrationType',
            name: '_widgetName_registrationType__resx',
            appDataFieldPaths: {
              registrationTypeSettings: (state: $TSFixMe) => {
                const regPathId = getRegistrationPathId(state);
                return (
                  `registrationSettings.registrationPaths.${regPathId}` +
                  '.guestRegistrationSettings.registrationTypeSettings'
                );
              }
            },
            minCellSize: 4
          },
          creator: () => import('../widgets/RegistrationTypeWidget/RegistrationTypeWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'SectionHeader',
            name: '_widgetName_sectionHeader__resx',
            minCellSize: 1
          },
          // Todo: Fill in with correct creator.
          creator: () => import('nucleus-widgets/lib/EmptyCell/EmptyCellWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'EventRegistrationModification',
            name: 'EventWidgets_ModifyRegistration_WidgetName__resx',
            minCellSize: 1,
            appDataFieldPaths: {
              modification: state => {
                const regPathId = getRegistrationPathId(state);
                return `registrationSettings.registrationPaths.${regPathId}.modification`;
              }
            }
          },
          creator: () => import('../widgets/RegistrationModificationWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'SubmitPayment',
            name: 'Submit Payment',
            minCellSize: 1
          },
          creator: () => import('../widgets/SubmitPaymentWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'RegistrationSummary',
            name: '_defaultPageTitle_regProcessStep3__resx',
            minCellSize: 4,
            appDataFieldPaths: {
              registrationPaths: () => 'registrationSettings.registrationPaths',
              registrationQuestions: () => 'registrationSettings.registrationQuestions',
              productQuestions: () => 'registrationSettings.productQuestions',
              travelQuestions: () => 'registrationSettings.travelQuestions'
            }
          },
          creator: () => import('../widgets/RegistrationSummaryWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'Sessions',
            name: 'EventWidgets_Sessions_WidgetName__resx',
            minCellSize: experimentSettings?.isFlexQuarterColumnWidgetsEnabled ? 1 : 4
          },
          creator: () => import('../widgets/SessionsWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'Agenda',
            name: '_widgetName_agenda__resx',
            minCellSize: 4
          },
          creator: () => import('../widgets/AgendaWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'AgendaAtAGlance',
            name: '_widgetName_agendaAtAGlance__resx',
            minCellSize: 4
          },
          creator: () => import('../widgets/AgendaAtAGlanceWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'TermsConditions',
            name: '_widgetName_termsConditions__resx',
            minCellSize: 4
          },
          creator: () => import('../widgets/TermsConditionsWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'Speakers',
            name: 'EventWidgets_Speakers_WidgetName__resx',
            minCellSize: 4
          },
          creator: () => import('../widgets/Speakers/SpeakersWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'RegistrationCancellationNavigator',
            name: 'EventWidgets_CancellationSurveyNavigator_WidgetName__resx',
            minCellSize: 4,
            isDeletable: false
          },
          creator: () =>
            Promise.all([
              import('../widgets/RegistrationCancellationNavigatorWidget'),
              import('../widgets/PlannerEmailConfirmationWidget/PlannerEmailConfirmationWrapper')
            ]).then(m => withPlannerEmailConfirmation(m[0].default, m[1].default))
        },
        {
          metadata: {
            type: 'RegistrationCancellationRefund',
            name: 'EventWidgets_CancellationSurveyNavigator_WidgetName__resx',
            minCellSize: 4,
            isDeletable: false
          },
          creator: () => import('../widgets/RegistrationCancellationRefundWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'RegistrationDeclineNavigator',
            name: 'EventWidgets_DeclineSurveyNavigator_WidgetName__resx',
            minCellSize: 4,
            isDeletable: false
          },
          creator: () =>
            Promise.all([
              import('../widgets/RegistrationDeclineNavigatorWidget'),
              import('../widgets/PlannerEmailConfirmationWidget/PlannerEmailConfirmationWrapper')
            ]).then(m => withPlannerEmailConfirmation(m[0].default, m[1].default))
        },
        {
          metadata: {
            type: 'RegistrationDeclineIdentityConfirmation',
            name: '_widgetName_identityConfirmation__resx',
            minCellSize: 4,
            hasChildren: true,
            disableInput: true
          },
          creator: () => import('../widgets/RegistrationDeclineIdentityConfirmationWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'EventWaitlistNavigator',
            name: 'EventWidgets_EventWaitlistNavigatorWidget_WidgetName__resx',
            minCellSize: 4,
            isDeletable: false
          },
          creator: () =>
            Promise.all([
              import('../widgets/EventWaitlistNavigatorWidget'),
              import('../widgets/PlannerEmailConfirmationWidget/PlannerEmailConfirmationWrapper')
            ]).then(m => withPlannerEmailConfirmation(m[0].default, m[1].default))
        },
        {
          metadata: {
            type: 'GuestModalNavigatorWidget',
            name: 'EventWidgets_GuestModalNavigatorWidget_WidgetName__resx',
            minCellSize: 4,
            isDeletable: false
          },
          creator: () => import('../widgets/GuestModalNavigatorWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'AddGuestFromRelatedContacts',
            name: 'EventWidgets_AddGuestFromRelatedContacts_WidgetName__resx',
            minCellSize: 4,
            isDeletable: false
          },
          creator: () => import('../widgets/AddGuestFromRelatedContacts').then(m => m.default)
        },
        {
          metadata: {
            type: 'NucleusLinkButton',
            name: 'NucleusWidgets_CustomLinkWidget_WidgetName__resx',
            minCellSize: 1
          },
          creator: () => import('../widgets/LinkButtonWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'GoToEventButton',
            name: 'NucleusWidgets_CustomLinkWidget_WidgetName__resx',
            minCellSize: 1
          },
          creator: () => import('../widgets/GoToEventButtonWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'AddToCalendar',
            name: '_widgetName_addToCalendar__resx',
            minCellSize: 1
          },
          creator: () => import('../widgets/AddToCalendarWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'GuestRegistration',
            name: 'WidgetName_RegistrationActions_GuestRegistration__resx',
            minCellSize: 1,
            appDataFieldPaths: {
              guestRegistrationSettings: (state: $TSFixMe) => {
                const regPathId = getRegistrationPathId(state);
                return `registrationSettings.registrationPaths.${regPathId}.guestRegistrationSettings`;
              }
            }
          },
          creator: () => import('../widgets/GuestRegistrationWidget/GuestRegistration').then(m => m.default)
        },
        {
          metadata: {
            type: 'EventVoucher',
            name: 'EventWidgets_EventVoucherWidget_WidgetName__resx',
            minCellSize: 4
          },
          creator: () => import('../widgets/EventVoucherWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'InviteeAgenda',
            name: 'EventWidgets_InviteeAgenda_WidgetName__resx',
            minCellSize: 4
          },
          creator: () => import('../widgets/InviteeAgendaWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'SocialMedia',
            name: 'SocialMediaFeedWidget_WidgetName__resx',
            minCellSize: 2
          },
          creator: () => import('../widgets/SocialMediaWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'Video',
            name: 'EventSiteEditor_WidgetName_VideoWidget__resx',
            minCellSize: 4
          },
          creator: () => import('../widgets/VideoWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'ShareBar',
            name: 'EventSiteEditor_WidgetName_ShareBarWidget__resx',
            minCellSize: 4,
            appDataFieldPaths: {
              customizeWidgetData: 'shareBarSettings.customizeWidgetData',
              referenceID: 'shareBarSettings.referenceID'
            }
          },
          creator: () => import('../widgets/ShareBarWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'FollowBar',
            name: 'FollowBarWidget_EditorPanel_WidgetName__resx',
            minCellSize: 4,
            disableInput: false,
            appDataFieldPaths: {
              followLabel: 'followBarSettings.followLabel',
              displayFacebook: 'followBarSettings.displayFacebook',
              facebookLink: 'followBarSettings.facebookLink',
              displayTwitter: 'followBarSettings.displayTwitter',
              twitterLink: 'followBarSettings.twitterLink',
              displayLinkedIn: 'followBarSettings.displayLinkedIn',
              linkedInLink: 'followBarSettings.linkedInLink',
              displayYouTube: 'followBarSettings.displayYouTube',
              youTubeLink: 'followBarSettings.youTubeLink',
              displayInstagram: 'followBarSettings.displayInstagram',
              instagramLink: 'followBarSettings.instagramLink'
            }
          },
          creator: () => import('../widgets/FollowBarWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'ApptsAvailability',
            name: '_widgetName_apptsAvailability__resx',
            minCellSize: 4,
            disableInput: false,
            canDuplicate: false,
            appDataFieldPaths: {
              availabilityConfigOption: state => {
                const regPathId = getRegistrationPathId(state);
                return (
                  'registrationSettings.registrationPaths.' +
                  regPathId +
                  '.apptSettings.availabilitySettings.availabilityConfigOption'
                );
              },
              apptEventDayInfo: state => {
                const regPathId = getRegistrationPathId(state);
                return (
                  'registrationSettings.registrationPaths.' +
                  regPathId +
                  '.apptSettings.availabilitySettings.apptEventDayInfo'
                );
              }
            }
          },
          creator: () => import('../widgets/ApptsAvailabilityWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'ApptsMeetingInterest',
            name: '_widgetName_apptsMeetingInterest__resx',
            minCellSize: 4,
            disableInput: false,
            canDuplicate: false,
            appDataFieldPaths: {
              companyList: state => {
                const regPathId = getRegistrationPathId(state);
                return (
                  'registrationSettings.registrationPaths.' +
                  regPathId +
                  '.apptSettings.meetingInterestSettings.companyList'
                );
              },
              useInterestLevels: state => {
                const regPathId = getRegistrationPathId(state);
                return (
                  'registrationSettings.registrationPaths.' +
                  regPathId +
                  '.apptSettings.meetingInterestSettings.useInterestLevels'
                );
              },
              interestLevelsMenu: state => {
                const regPathId = getRegistrationPathId(state);
                return (
                  'registrationSettings.registrationPaths.' +
                  regPathId +
                  '.apptSettings.meetingInterestSettings.interestLevelsMenu'
                );
              },
              useMeetingTypes: state => {
                const regPathId = getRegistrationPathId(state);
                return (
                  'registrationSettings.registrationPaths.' +
                  regPathId +
                  '.apptSettings.meetingInterestSettings.useMeetingTypes'
                );
              },
              meetingTypesMenu: state => {
                const regPathId = getRegistrationPathId(state);
                return (
                  'registrationSettings.registrationPaths.' +
                  regPathId +
                  '.apptSettings.meetingInterestSettings.meetingTypesMenu'
                );
              },
              useComments: state => {
                const regPathId = getRegistrationPathId(state);
                return (
                  'registrationSettings.registrationPaths.' +
                  regPathId +
                  '.apptSettings.meetingInterestSettings.useComments'
                );
              },
              limitSelections: state => {
                const regPathId = getRegistrationPathId(state);
                return (
                  'registrationSettings.registrationPaths.' +
                  regPathId +
                  '.apptSettings.meetingInterestSettings.limitSelections'
                );
              },
              limitSelectionMin: state => {
                const regPathId = getRegistrationPathId(state);
                return (
                  'registrationSettings.registrationPaths.' +
                  regPathId +
                  '.apptSettings.meetingInterestSettings.limitSelectionMin'
                );
              },
              limitSelectionMax: state => {
                const regPathId = getRegistrationPathId(state);
                return (
                  'registrationSettings.registrationPaths.' +
                  regPathId +
                  '.apptSettings.meetingInterestSettings.limitSelectionMax'
                );
              },
              useExhibitorData: state => {
                const regPathId = getRegistrationPathId(state);
                return (
                  'registrationSettings.registrationPaths.' +
                  regPathId +
                  '.apptSettings.meetingInterestSettings.useExhibitorData'
                );
              }
            }
          },
          creator: () => import('../widgets/ApptsMeetingInterestWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'AttendeeList',
            name: '_widgetName_attendeeList__resx',
            minCellSize: 4,
            disableInput: false
          },
          creator: () => import('../widgets/AttendeeListWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'AttendeeListOptIn',
            name: '_widgetName_attendeeListOptIn__resx',
            minCellSize: 4,
            disableInput: false
          },
          creator: () => import('../widgets/AttendeeListOptInWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'QuantityItems',
            name: 'EventSiteEditor_QuantityItems_WidgetName__resx',
            minCellSize: 4,
            disableInput: false,
            canDuplicate: false
          },
          creator: () => import('../widgets/QuantityItemsWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'DonationItems',
            name: 'EventSiteEditor_DonationItems_WidgetName__resx',
            minCellSize: 4,
            disableInput: false,
            canDuplicate: false
          },
          creator: () => import('../widgets/DonationItemsWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'ProgressBar',
            name: '_widgetName_progressBar__resx',
            minCellSize: 4,
            disableInput: false
          },
          creator: () => import('../widgets/ProgressBarWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'Fees',
            name: 'EventWidgets_Fees_WidgetName__resx',
            minCellSize: 4,
            disableInput: false
          },
          creator: () => import('../widgets/FeesWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'Code',
            name: 'EventCodeWidget_Code_WidgetName__resx',
            minCellSize: 1
          },
          creator: () => import('../widgets/CodeWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'Survey',
            name: '_widgetName_survey__resx',
            minCellSize: 1
          },
          creator: () => import('../widgets/SurveyWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'Appointments',
            name: '_widgetName_appointments__resx',
            minCellSize: 1
          },
          creator: () => import('../widgets/AppointmentsWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'UberVouchers',
            name: 'EventSiteEditor_UberVouchers_WidgetName__resx',
            minCellSize: 1
          },
          creator: () => import('../widgets/UberVouchersWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'AlreadyRegistered',
            name: 'NucleusWidgets_CustomLinkWidget_WidgetName__resx',
            minCellSize: 1
          },
          creator: () => import('../widgets/AlreadyRegisteredWidget').then(m => m.default)
        },
        {
          metadata: {
            type: 'MembershipItems',
            name: 'EventSiteEditor_MembershipItems_WidgetName__resx',
            minCellSize: 4,
            disableInput: false,
            canDuplicate: false
          },
          creator: () => import('../widgets/MembershipItemWidget/MembershipItemsWidget').then(m => m.default)
        }
      ],
      {
        loadWidgetResources
      }
    );
  }
}
