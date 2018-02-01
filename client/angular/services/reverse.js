angular.module('quizApp')
  .filter('reverse', reverse);

function reverse() {
  return function(items) {
    if (items)
      return items.slice().reverse();
  };
}