angular.module('quizApp')
  .controller('addQController', addQController);


function addQController($routeParams, httpRequest, $location, $scope, $timeout, $route, tokenService) {

  if (!tokenService.isLoggedIn() || !tokenService.isAdmin()) {
    $location.path('/home');
  }

  const aq = this;

  aq.questionDetails = {};
  aq.questionDetails.options = ['','','',''];
  aq.questionDetails.answer = '0';
  aq.tId = $routeParams.testId;

  aq.moreOption = () => {
    aq.questionDetails.options.push('');    
  }

  let anyDups = () => {
    let check = [];
    let dup = false;
    aq.questionDetails.options.forEach((o) => {
      if (check[o] === undefined) {
        check[o] = 1;
      } else {
        dup = true;
      }     
    })
    return dup;    
  }

  aq.postQuestion = () => {  
    if (!anyDups()) {
      httpRequest.addQuestionToTest(aq.questionDetails, $routeParams.testId)
      .then(response => {
        aq.notifyThis = 'Question Added';
        aq.serverNotified = true;
        aq.serverMessageOk = true;
        $timeout(() => {
          aq.serverNotified = false;
          aq.serverMessageOk = false;
          $route.reload();    
        }, 1500);
      })
      .catch(error => {
        console.log(error);
        aq.notifyThis = 'Server Error, Come back later';
        aq.serverNotified = true;
        aq.serverMessageError = true;
        $timeout(() => {
          aq.serverNotified = false;
          aq.serverMessageError = false;
          $location.path('/home');
          $scope.$apply()     
        }, 3000);
      })
    } else {
      aq.notifyThis = 'Error, Duplicate options!';
      aq.serverNotified = true;
      aq.serverMessageError = true;
      $timeout(() => {
        aq.serverNotified = false;
        aq.serverMessageError = false;    
      }, 3000);     
    }


  }
}

