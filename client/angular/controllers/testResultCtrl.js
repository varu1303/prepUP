angular.module('quizApp')
  .controller('testResultController', testResultController);


function testResultController(httpRequest, $routeParams, $rootScope, $timeout, $location, $scope, tokenService) {

  const tr = this; 
  $rootScope.live = false;

  if (tokenService.isLoggedIn() && !tokenService.isAdmin()) {
  httpRequest.userGetResult($routeParams.uTestId)
    .then(response => {
      if (response.data.data) {
        tr.test = response.data.data.test;
        let date = tr.test._id.toString().substring(0,8);
        tr.test.date = new Date( parseInt( date, 16 ) * 1000 );
        tr.result = response.data.data.QnA;
        tr.totalAnswered = 0;
        tr.result.forEach(q => {
          if (q.answer !== undefined)
            tr.totalAnswered += 1;
        })
      } else {
        tr.notifyThis = 'Test not found';
        tr.serverNotified = true;
        tr.serverMessageError = true;
        $timeout(() => {
          tr.serverNotified = false;
          tr.serverMessageError = false; 
          $location.path('/home');
          $scope.$apply(); 
        }, 3000);        
      }

    })
    .catch(error => {
      console.log(error);
      if (error.data.status == 401)
        tr.notifyThis = 'Unauthorised';
      else
        tr.notifyThis = 'Server Error, Come back later';
      tr.serverNotified = true;
      tr.serverMessageError = true;
      $timeout(() => {
        tr.serverNotified = false;
        tr.serverMessageError = false; 
        $location.path('/home');
        $scope.$apply(); 
      }, 3000);   
    })
  } else {
    $location.path('/home');
  }
}