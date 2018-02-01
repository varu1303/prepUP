angular.module('quizApp')
  .filter('filterBySection', filterBySection);

function filterBySection() {
  return function (availableTests, secName) {
    let filtered = [];
    if (secName === 'All')
      return availableTests;
    else {
      filter = availableTests.filter(test => test.category === secName);
      return filter;
    }
  }
}