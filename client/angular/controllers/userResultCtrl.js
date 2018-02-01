angular.module('quizApp')
  .controller('userResultController', userResultController);

function userResultController($routeParams, httpRequest, $timeout, $location, $scope, tokenService) {
  const ur = this;

  let userEmailId = $routeParams.userEmailId;
  let userTakenTestId = $routeParams.testId;

  if (tokenService.isLoggedIn() && tokenService.isAdmin()) {
    httpRequest.fetchUsersTestResult4Admin(userEmailId, userTakenTestId)
      .then(response => {
        if (response.data.data) {
          ur.test = response.data.data.test;
          let date = ur.test._id.toString().substring(0,8);
          ur.test.date = new Date( parseInt( date, 16 ) * 1000 );
          ur.result = response.data.data.QnA;
          ur.totalAnswered = 0;
          ur.result.forEach(q => {
            if (q.answer !== undefined)
              ur.totalAnswered += 1;
          })
        } else {
          ur.notifyThis = 'No data from server';
          ur.serverNotified = true;
          ur.serverMessageError = true;
          $timeout(() => {
            ur.serverNotified = false;
            ur.serverMessageError = false;
            $location.path('/home');
            $scope.$apply()     
          }, 3000);        
        }
      })
      .catch(error => {
        console.log(error);
        ur.notifyThis = 'Error, Come back later';
        ur.serverNotified = true;
        ur.serverMessageError = true;
        $timeout(() => {
          ur.serverNotified = false;
          ur.serverMessageError = false;
          $location.path('/home');
          $scope.$apply()     
        }, 3000);
      })
    } else {
      $location.path('/home');
    }

}