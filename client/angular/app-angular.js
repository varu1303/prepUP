angular.module('quizApp',['ngRoute','ngAnimate', 'zingchart-angularjs'])
  .controller('MainController', MainController);



function MainController($location, tokenService, httpRequest, $timeout, $rootScope, $scope) {

  let mc = this;

  if ($location.path() === '/') 
    $rootScope.welcome = true;


  mc.removeToken = function() {
    tokenService.deleteToken();
    setTimeout(() => {
      $location.path('/');
      $scope.$apply();
    }, 500);

  }

  mc.popreq = (request) => {
    mc.popnow = true;
    if (request === 'signup') {
      mc.signup = true;
      mc.forgotpass = false;;
    } else {
      mc.forgotpass = true;
      mc.signup = false;
    }
  }

  mc.register = userDetails => {

    if (userDetails.password === userDetails.conpassword) {
      mc.notConfirmed = false;
      httpRequest.userSignUp(userDetails)
        .then(user => {
          mc.notifyThis = 'You successfully got registered!'
          mc.serverNotified = true;
          mc.serverMessageOk = true;
          $timeout(() => {
            mc.serverNotified = false;
            mc.serverMessageOk = false;    
          }, 4000);
          $timeout(() => {
            mc.popnow = false;
            mc.userDetails = {};
          }, 1000)

        })
        .catch(error => {
          if (error.data.error.code == 11000) {
            mc.notifyThis = 'Email already registered!';    
          } else {
            mc.notifyThis = 'Server Error!'; 
          }
          mc.serverNotified = true;
          mc.serverMessageError = true;
          $timeout(() => {
            mc.serverNotified = false;
            mc.serverMessageError = false;    
          }, 4000);
        })
    } else {
      mc.notifyThis = 'Passwords do not match!'
      mc.serverNotified = true;
      mc.serverMessageError = true;
      $timeout(() => {
        mc.serverNotified = false;
        mc.serverMessageError = false;    
      }, 3000);
    }
  }

  mc.forgotPass = () => {
    httpRequest.forgotPassword(mc.registeredEmail)
      .then(data => {
        mc.notifyThis = 'Check your E-mail!';
        mc.popnow = false;
        mc.registeredEmail = '';
        mc.serverNotified = true;
        mc.serverMessageOk = true;
        $timeout(() => {
          mc.serverNotified = false;
          mc.serverMessageOk = false;    
        }, 4000);
      })
      .catch(error => {
        mc.notifyThis = 'Error, Try Later!';
        mc.serverNotified = true;
        mc.serverMessageError = true;
        $timeout(() => {
          mc.serverNotified = false;
          mc.serverMessageError = false;    
        }, 3000);        
      })
  }

  mc.changePass = () => {
    if (mc.changedPassword === mc.conChangedPassword) {
      httpRequest.changePassword(mc.changedPassword)
        .then(data => {
          mc.notifyThis = 'Password Changed!';
          mc.serverNotified = true;
          mc.serverMessageOk = true;
          mc.changedPassword = '';
          mc.conChangedPassword = '';
          mc.popChange = false;
          $timeout(() => {
            mc.serverNotified = false;
            mc.serverMessageOk = false;    
          }, 2000);
        })
        .catch(error => {
          mc.notifyThis = 'Error, Try Later!';
          mc.serverNotified = true;
          mc.serverMessageError = true;
          $timeout(() => {
            mc.serverNotified = false;
            mc.serverMessageError = false;    
          }, 3000);        
        })
    } else {
      mc.notifyThis = 'Passwords do not match!'
      mc.serverNotified = true;
      mc.serverMessageError = true;
      $timeout(() => {
        mc.serverNotified = false;
        mc.serverMessageError = false;    
      }, 3000);      
    }
      
  }

  mc.navigate = (path) => {
    $location.path(path);
  }

  mc.goHome = () => {
    $location.path('/home');
  }

  mc.signIn = () => {
    httpRequest.userSignIn(mc.signInEmail, mc.signInPass)
      .then(response => {
        tokenService.saveToken(response.data.data);
        $timeout(() => {
          mc.signInEmail = '';
          mc.signInPass = '';
        }, 2000);
        $location.path('/home');
      })
      .catch(error => {
        mc.notifyThis = 'Incorrect Credentials!'
        mc.serverNotified = true;
        mc.serverMessageError = true;
        $timeout(() => {
          mc.serverNotified = false;
          mc.serverMessageError = false;    
        }, 3000);        
      })
  }



}