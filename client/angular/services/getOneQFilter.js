angular.module('quizApp')
  .filter('getOneQ', getOneQ);

function getOneQ() {
  return function(questions, qNo) {
    if (questions) {
      let oneQ = [];
      oneQ.push(questions[qNo]);
      return oneQ;
    }
    else
      return [];
  }
}