angular.module('quizApp')
  .controller('allUserController', allUserController);

  function allUserController(httpRequest, $location, $scope, $timeout, tokenService) {

    const au = this;
    
    if (tokenService.isLoggedIn() && tokenService.isAdmin()) {
      httpRequest.fetchAllUsers()
      .then(response => {
        au.usersList = response.data.data.filter(user => {
          return !user.admin;
        })
        au.usersList.forEach(user => {
          user.passCount = 0;
          user.avgScore = 0;
          user.showTestDetail = false;
          user.testsTaken.forEach(test => {
            if (test.score >= test.passingLmt)
              user.passCount += 1;
            user.avgScore += test.score;
            let date = test._id.toString().substring(0,8)
            test.date = new Date( parseInt( date, 16 ) * 1000 );
          })
          if (user.avgScore)
            user.avgScore = Math.round(user.avgScore / user.testsTaken.length);
        })
        au.loadDone = true;
      })
      .catch(error => {
        console.log('error ', error);
        if (error.data.status != 404) {
          if (error.data.status != 404)
            au.notifyThis = 'Unauthorised';
          else
            au.notifyThis = 'Server Error, Come back later';
          au.serverNotified = true;
          au.serverMessageError = true;
          $timeout(() => {
            au.serverNotified = false;
            au.serverMessageError = false; 
            $location.path('/home');
            $scope.$apply(); 
          }, 3000);
        }
      })
    }
    else { 
      $location.path('/home');
    }


      au.setShowTest = index => {
        au.usersList[index].showTestDetail = !au.usersList[index].showTestDetail;
      }

      au.result = (uEmail, utId) => {
        $location.path(`/user/${uEmail}/result/${utId}`);
      }
  }