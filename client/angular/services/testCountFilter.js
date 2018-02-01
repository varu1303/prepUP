angular.module('quizApp')
  .filter('hasTakenThisManyTest', hasTakenThisManyTest);

function hasTakenThisManyTest() {
  return function (users, count) {
    let filtered = [];
    if (!count && count !== 0)
      return users;
    else {
      filter = users.filter(user => user.testsTaken.length >= count);
      return filter;
    }
  }
}