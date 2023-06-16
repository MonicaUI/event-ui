import TextAndDateAnswer from './TextAndDateAnswer';
beforeEach(() => {
  jest.resetModules();
});

describe('TextAndDateAnswer', () => {
  const questionId = 'questionId';
  it('trims text answers correctly', () => {
    const answers = [];
    const answerLeadingSpace = {
      answerType: 'Text',
      text: '   @555'
    };
    const answerTrailingSpaces = {
      answerType: 'Text',
      text: '@555   '
    };
    const answerLeadingAndTrailingSpaces = {
      answerType: 'Text',
      text: '   @555   '
    };
    const trimmedAnswer = '@555';
    answers.push(answerLeadingSpace);
    answers.push(answerTrailingSpaces);
    answers.push(answerLeadingAndTrailingSpaces);
    const textAndDateAnswer = new TextAndDateAnswer(questionId, answers);
    const serialized = textAndDateAnswer.toJSON();
    serialized.answers.forEach(answer => expect(answer.text).toEqual(trimmedAnswer));
    expect(textAndDateAnswer.toJSON()).toMatchSnapshot();
  });
});
