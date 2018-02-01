angular.module('quizApp')
  .controller('newTestController', newTestController);


function newTestController(httpRequest, $scope, $timeout, $location, tokenService) {

  if (!tokenService.isAdmin() || !tokenService.isLoggedIn()) {
    $location.path('/home')
  }
  const nt = this;
  nt.testDetails = {};
  nt.testDetails.category = 'English';

  nt.createTest = () => {
    if (nt.testDetails.passingLmt <= 100) {
      httpRequest.createNewTest(nt.testDetails)
      .then(response => {
        nt.notifyThis = 'Test Created';
        nt.serverNotified = true;
        nt.serverMessageOk = true;
        $timeout(() => {
          nt.testDetails = {};
          nt.testDetails.category = 'English';
          nt.serverNotified = false;
          nt.serverMessageOk = false;
          $location.path('/addQ/'+response.data.data._id);
          $scope.$apply();     
        }, 3000);
      })
      .catch(error => {
        console.log(error);
        if (error.data.status == 422) {
          nt.notifyThis = 'Test already exists!';
        } else {
          nt.notifyThis = 'Server Error, Come back later';
        }
        nt.serverNotified = true;
        nt.serverMessageError = true;
        $timeout(() => {
          nt.serverNotified = false;
          nt.serverMessageError = false;
          if (error.data.status != 422) {
            $location.path('/home');
            $scope.$apply() 
          }   
        }, 3000);
      })
    } else if (nt.testDetails.passingLmt > 100) {
      nt.notifyThis = 'Passing Marks Invalid'
      nt.serverNotified = true;
      nt.serverMessageError = true;
      $timeout(() => {
        nt.serverNotified = false;
        nt.serverMessageError = false;   
      }, 3000);
    }
  }
}