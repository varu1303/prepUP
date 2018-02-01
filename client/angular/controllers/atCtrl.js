angular.module('quizApp')
  .controller('atController', atController);


function atController(httpRequest, $location, $scope, $timeout, tokenService) {

  const at = this;

  at.selCategory = 'All';

  if (tokenService.isLoggedIn() && !tokenService.isAdmin()) {
    httpRequest.getAvailableTests()
    .then(response => {
      at.tests = response.data.data;
      at.tests.forEach(test => {
        let date = test._id.toString().substring(0,8);
        test.date = new Date( parseInt( date, 16 ) * 1000 );
        test.duration = Math.round (test.timeLmt / 60);
      })
      at.loadDone = true;
    })
    .catch(error => {
      console.log(error);
      at.notifyThis = 'Server Error, Come back later';
      at.serverNotified = true;
      at.serverMessageError = true;
      $timeout(() => {
        at.serverNotified = false;
        at.serverMessageError = false; 
        $location.path('/home');
        $scope.$apply(); 
      }, 3000);   
    });
  } else {
    $location.path('/home');
  }

}