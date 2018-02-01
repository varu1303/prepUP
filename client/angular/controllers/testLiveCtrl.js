angular.module('quizApp')
  .controller('testLiveController', testLiveController);

function testLiveController(httpRequest, $routeParams, socket, $location, $rootScope, tokenService, $route, $scope) {
  const tl = this;
  tl.loading = true;
  tl.answers = [];
  tl.qViewNo = 0;
  $rootScope.live = true;

//disable back button for on going test
  $scope.$on('$locationChangeStart', function(event) {
      if ($rootScope.live) {
       event.preventDefault();
      }
  });


// (4)
  tl.loadQuestions = () => {
    httpRequest.getQuestionsToAttempt($routeParams.uTestId)
      .then(response => {
        tl.questions = response.data.data;
        tl.questions.forEach(q => {
          tl.answers.push({questionId: q._id, timeTaken: 0});
        })

        if (tl.actualTimeLeft)
          tl.timeLeft = tl.actualTimeLeft;
        else
          tl.timeLeft = tl.details.timeLmt;

        if (tl.actualAnswers) {
          tl.answers.forEach(ans => {
            let i;
            tl.actualAnswers.forEach((a, index) => {
              if (a.questionId == ans.questionId) {
                ans.key = a.key;
                ans.timeTaken = a.timeTaken;
                i = index;
              }
            })
            tl.actualAnswers.splice(i, 1);
          })
        }
        socket.emit('start_countdown', {uTestId: $routeParams.uTestId, timeLeft: tl.timeLeft, answers: tl.answers});      
      })
      .catch(error => {
        console.log(error);
      })
  }
// (3)
  tl.testCheck = () => {
    httpRequest.getInstructions($routeParams.uTestId)
    .then(response => {
      tl.details = response.data.data;
      if (tl.details.score || tl.details.score === 0) {
        $rootScope.live = false;
        $location.path('/testresult/'+$routeParams.uTestId);
        socket.emit('pop_Live', {uTestId: $routeParams.uTestId});
      }
      else
        tl.loadQuestions(tl.details);         
    })
    .catch(error => {
      console.log(error);
    })
  }

// (2)
  socket.on('go_live', (data) => {
      if (data) {
        tl.actualTimeLeft = data.timeLeft;
        tl.actualAnswers = data.answers;      
      }  
      tl.testCheck();
  })


// (5)
  socket.on('countdown', (data) => {
      $rootScope.loadingtest = false;
      tl.timeLeft = data.timeLeft;
      tl.answers[tl.qViewNo].timeTaken += 1;
      if (tl.timeLeft === 0 && socket) {
        socket.emit('stopCD', {uTestId: $routeParams.uTestId});
        socket.emit('sub_answers', {uTestId: $routeParams.uTestId,
                                    uEmailId: tokenService.getPayload(tokenService.getToken()).data.emailId,
                                  answers: tl.answers});
    }
  })

  socket.on('see_result', () => {
    $rootScope.live = false;
    $location.path('/testresult/'+$routeParams.uTestId);
  })

  socket.on('go_home', () => {
    $rootScope.live = false;
    $location.path('/home');
  })

  tl.qAnswered = (qNo, key) => {
    if (tl.answers[qNo].key === key)
      tl.answers[qNo].key = undefined;
    else 
        tl.answers[qNo].key = key;
    socket.emit('save_answer', {uTestId: $routeParams.uTestId, answers: tl.answers});
  }

  tl.calcResult = () => {
    socket.emit('stopCD', {uTestId: $routeParams.uTestId});
    socket.emit('sub_answers', {uTestId: $routeParams.uTestId,
      uEmailId: tokenService.getPayload(tokenService.getToken()).data.emailId,
    answers: tl.answers});
  }

  tl.jumpToQ = index => {
    tl.qViewNo = index;
  }

  tl.moveback = () => {
    if (tl.qViewNo)
      tl.qViewNo -= 1;
  }

  tl.movenext = () => {
    if (tl.qViewNo < (tl.questions.length-1))
      tl.qViewNo += 1;
  }

// (1)
  //Maually opening connection
  socket.one().open(); 

  socket.one().once('connect', () => {
    socket.emit('monitor_test', {
      uEmailId: tokenService.getPayload(tokenService.getToken()).data.emailId,
      uTestId: $routeParams.uTestId
    })  
  })

  socket.on('disconnect', () => {
    socket.one().removeAllListeners();
  })

}