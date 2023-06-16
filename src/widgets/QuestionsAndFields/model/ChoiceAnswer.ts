export default class ChoiceAnswer {
  answers: $TSFixMe;
  questionId: $TSFixMe;
  constructor(questionId: $TSFixMe, answers: $TSFixMe) {
    this.questionId = questionId;
    this.answers = answers;
  }
  toJSON(): $TSFixMe {
    const containsValidChoiceAnswer = this.answers.find(answer => answer.answerType === 'Choice' && answer.choice);
    const containsNAChoice = this.answers.find(answer => answer.answerType === 'NA');
    const containsOtherAnswer = this.answers.find(answer => answer.answerType === 'Other');

    // When serializing answers, leave out answers that don't have a value because reg api won't accept empty answers
    if (!(containsValidChoiceAnswer || containsNAChoice || containsOtherAnswer)) {
      return { questionId: this.questionId, answers: [] };
    }
    return { questionId: this.questionId, answers: this.answers };
  }
}
