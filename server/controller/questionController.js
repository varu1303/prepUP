const Question = require('./../mongo/schemas/questionSchema');

module.exports = {

  saveQuestion: questionDetails => {
    let question = new Question({
      probStatement: questionDetails.probStatement,
      options: questionDetails.options,
      answer: questionDetails.answer
    });

    return question.save();
  }
}