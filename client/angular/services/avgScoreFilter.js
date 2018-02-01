angular.module('quizApp')
  .filter('hasMoreThanThisAvgScore', hasMoreThanThisAvgScore);

function hasMoreThanThisAvgScore() {
  return function (users, score) {
    let filtered = [];
    if (!score && score !== 0)
      return users;
    else {
      filter = users.filter(user => user.avgScore >= score);
      return filter;
    }
  }
}