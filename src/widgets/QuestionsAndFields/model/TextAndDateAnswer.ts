function isString(value) {
  return typeof value === 'string' || value instanceof String;
}
export default class TextAndDateAnswer {
  answers: $TSFixMe;
  questionId: $TSFixMe;
  constructor(questionId: $TSFixMe, answers: $TSFixMe) {
    this.questionId = questionId;
    this.answers = answers;
  }
  toJSON(): $TSFixMe {
    // When serializing answers, leave out answers that don't have a value because reg api won't accept empty answers
    if (
      !this.answers ||
      !this.answers.find(answer => answer.text && (typeof answer.text.toJSON !== 'function' || answer.text.toJSON()))
    ) {
      return { questionId: this.questionId, answers: null };
    }
    const updatedAnswers = [];
    this.answers.forEach(answer => {
      if (answer && answer.answerType === 'Text' && isString(answer.text)) {
        if (answer.text && answer.text.trim().length > 0) {
          updatedAnswers.push({
            ...answer,
            text: answer.text.trim()
          });
        }
      } else {
        updatedAnswers.push(answer);
      }
    });
    return { questionId: this.questionId, answers: updatedAnswers };
  }
}
