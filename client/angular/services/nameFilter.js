angular.module('quizApp')
  .filter('findByName', findByName);

function findByName() {
  return function (users, name) {
    let filtered = [];
    if (!name)
      return users;
    else {
      name = name.toLowerCase();
      filter = users.filter(user => user.name.toLowerCase().indexOf(name) >= 0);
      return filter;
    }
  }
}