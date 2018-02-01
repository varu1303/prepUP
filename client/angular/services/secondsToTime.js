angular.module('quizApp')
  .filter('secondsToDateTime', secondsToDateTime);

function secondsToDateTime() {
  return function(seconds) {
      return new Date(1970, 0, 1).setSeconds(seconds);
  };
}