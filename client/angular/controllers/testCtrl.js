angular.module('quizApp')
  .controller('testController', testController);



function testController(httpRequest, $routeParams, $location, tokenService, $route, $timeout, $rootScope, $scope) {
  const tc = this;
  tc.isAdmin = tokenService.isAdmin();

  let testId = $routeParams.testId;

  if (!tc.isAdmin && tokenService.isLoggedIn()) {
    httpRequest.getTestDetails(testId)
      .then(response => {
        tc.tobeTaken = response.data.data;
        let date = tc.tobeTaken._id.toString().substring(0,8);
        tc.pubDate = new Date( parseInt( date, 16 ) * 1000 );
        tc.tLimitH = Math.floor(tc.tobeTaken.timeLmt / 3600);
        tc.tLimitM = ((tc.tobeTaken.timeLmt % 3600) / 60);
      })
      .catch(error => {
        console.log('error', error);
        if (error.data.status == 404)
          tc.notifyThis = 'Test not present';
        else if (error.data.status == 400)
          tc.notifyThis = 'Test not live';
        else 
          tc.notifyThis = 'Server Error, Come back later';
        tc.serverNotified = true;
        tc.serverMessageError = true;
        $timeout(() => {
          tc.serverNotified = false;
          tc.serverMessageError = false; 
          $location.path('/home');
          $scope.$apply(); 
        }, 3000);
      })
  } else if (tokenService.isLoggedIn() && tokenService.isAdmin()) {
    httpRequest.getCompleteTest4Admin(testId)
      .then(response => {
        tc.compTest = response.data.data;
        let date = tc.compTest._id.toString().substring(0,8);
        tc.pubDate = new Date( parseInt( date, 16 ) * 1000 );
        tc.tLimitH = Math.floor(tc.compTest.timeLmt / 3600);
        tc.tLimitM = ((tc.compTest.timeLmt % 3600) / 60);
        if (tc.compTest.questions.length > 4 && !tc.compTest.live.status)
          tc.liv5 = true;
        if (tc.compTest.live.status)
          tc.arc5 = true;
        if (!tc.compTest.live.status)
          tc.arch = true;
      })
      .catch(error => {
        console.log('error', error);
        if (error.data.status == 404)
          tc.notifyThis = 'Test not present';
        else 
          tc.notifyThis = 'Server Error, Come back later';
        tc.serverNotified = true;
        tc.serverMessageError = true;
        $timeout(() => {
          tc.serverNotified = false;
          tc.serverMessageError = false; 
          $location.path('/home');
          $scope.$apply(); 
        }, 3000);
      })   
  } else {
    $location.path('/home');
  }


  tc.userAttempts = tId => {
    httpRequest.takeTest(tId)
      .then(response => {
        $rootScope.loadingtest = true;
        $rootScope.live = true;
        $location.path('/testlive/'+response.data.data._id);
      })
      .catch(error => {
        console.log('error in taking test ',error);
        if (error.data.status == 404)
          tc.notifyThis = 'Test not present';
        else if (error.data.status == 400)
          tc.notifyThis = 'Test not live';
        else 
          tc.notifyThis = 'Server Error, Come back later';
        tc.serverNotified = true;
        tc.serverMessageError = true;
        $timeout(() => {
          tc.serverNotified = false;
          tc.serverMessageError = false; 
          $location.path('/home');
          $scope.$apply(); 
        }, 3000);
      })
  }

  tc.toggleLiveStatus = () => {
    httpRequest.toggleLive(!tc.compTest.live.status, testId)
      .then(response => {
        $route.reload();
      })
      .catch(error => {
        console.log('error', error);
        if (error.data.status == 404)
          tc.notifyThis = 'Test not present';
        else if (error.data.status == 422)
          tc.notifyThis = 'Test already live';
        else if (error.data.status == 409)
          tc.notifyThis = 'Questions need to be GE 5';
        else 
          tc.notifyThis = 'Server Error, Come back later';
        tc.serverNotified = true;
        tc.serverMessageError = true;
        $timeout(() => {
          tc.serverNotified = false;
          tc.serverMessageError = false; 
          $location.path('/home');
          $scope.$apply(); 
        }, 3000);
      })   
  }

  tc.addQView = () => {
    $location.path('/addQ/'+$routeParams.testId);
  }

  tc.removeQ = qId => {
    httpRequest.removeQfromTest(qId, $routeParams.testId)
      .then(response => {
        $route.reload();
      })
      .catch(error => {
        console.log('error', error);
        if (error.data.status == 404)
          tc.notifyThis = 'Test/Que not present';
        else if (error.data.status == 422)
          tc.notifyThis = 'Test is live';
        else 
          tc.notifyThis = 'Server Error, Come back later';
        tc.serverNotified = true;
        tc.serverMessageError = true;
        $timeout(() => {
          tc.serverNotified = false;
          tc.serverMessageError = false; 
          $location.path('/home');
          $scope.$apply(); 
        }, 3000);       
      })
  }

  tc.editQpop = q => {
    tc.editQ = true;
    tc.editQid = q._id;
    tc.editQprob = q.probStatement;
    tc.editQoptions = q.options;
    tc.editQanswer = q.answer;
  }

  editQOdups = () => {
    let check = [];
    let dup = false;
    tc.editQoptions.forEach((o) => {
      if (check[o] === undefined) {
        check[o] = 1;
      } else {
        dup = true;
      }     
    })
    return dup;   
  }

  tc.editQsub = () => {
    let questionDetails = {};
    questionDetails.probStatement = tc.editQprob;
    questionDetails.options = tc.editQoptions;
    questionDetails.answer = tc.editQanswer;

    if (editQOdups()) {
      tc.notifyThis = 'Duplicate Options!';
      tc.serverNotified = true;
      tc.serverMessageError = true;
      $timeout(() => {
        tc.serverNotified = false;
        tc.serverMessageError = false; 
      }, 3000);
    } else {
      httpRequest.editQinTest(tc.editQid, $routeParams.testId, questionDetails)
      .then(response => {
        tc.notifyThis = 'Question Edited';
        tc.serverNotified = true;
        tc.serverMessageOk = true;
        $timeout(() => {
          tc.serverNotified = false;
          tc.serverMessageOk = false;
          $route.reload();   
        }, 2000);
      })
      .catch(error => {
        console.log('error', error);
        if (error.data.status == 400)
          tc.notifyThis = 'Invalid Submission';
        else if (error.data.status == 404)
          tc.notifyThis = 'Not in DB';
        else if (error.data.status == 422)
          tc.notifyThis = 'Test is live!';
        else 
          tc.notifyThis = 'Server Error, Come back later';
        tc.serverNotified = true;
        tc.serverMessageError = true;
        $timeout(() => {
          tc.serverNotified = false;
          tc.serverMessageError = false; 
          $location.path('/home');
          $scope.$apply(); 
        }, 3000);
      })
    }
  }

  tc.editTestView = () => {
    tc.editT = true;
    tc.editTinstructions = tc.compTest.instructions;
    tc.editTpassingLmt = tc.compTest.passingLmt;
    tc.editTtimeLmt = tc.compTest.timeLmt / 60;
  }

  tc.editTsub = () => {
    let testDetails = {};
    testDetails.instructions = tc.editTinstructions;
    testDetails.passingLmt = tc.editTpassingLmt;
    testDetails.timeLmt = tc.editTtimeLmt;

    if ( testDetails.passingLmt > 100 ) {
      tc.notifyThis = 'Passing Marks Invalid';
      tc.serverNotified = true;
      tc.serverMessageError = true;
      $timeout(() => {
        tc.serverNotified = false;
        tc.serverMessageError = false; 
      }, 3000);
    } else {
      httpRequest.editTestReq(testDetails, $routeParams.testId)
      .then(response => {
        tc.notifyThis = 'Test Edited';
        tc.serverNotified = true;
        tc.serverMessageOk = true;
        $timeout(() => {
          tc.serverNotified = false;
          tc.serverMessageOk = false;
          $route.reload();   
        }, 2000);
      })
      .catch(error => {
        console.log('error', error);
        if (error.data.status == 409)
          tc.notifyThis = 'Invalid Submission';
        else if (error.data.status == 404)
          tc.notifyThis = 'Not in DB';
        else 
          tc.notifyThis = 'Server Error, Come back later';
        tc.serverNotified = true;
        tc.serverMessageError = true;
        $timeout(() => {
          tc.serverNotified = false;
          tc.serverMessageError = false; 
          $location.path('/home');
          $scope.$apply(); 
        }, 3000);
      })
    }

  }

  tc.addOpt = () => {
    tc.editQoptions.push('');
  }
}