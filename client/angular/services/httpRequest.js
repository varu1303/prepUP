angular.module('quizApp')
  .service('httpRequest', httpRequest);


function httpRequest($http, tokenService) {

  this.userSignUp = userDetails => {
    return $http.post('/auth/register', {
      userDetails
    })
  }

  this.userSignIn = (emailId, password) => {
    return $http.post('/auth/credentials', {
      emailId,
      password
    });
  }

  this.getTokenFromOTP = (emailId, pass) => {
      return $http.post('/user/otp4token', {
      "emailId": emailId,
      "password": pass
    })
  }

  this.getTakenTests = () => {
    return $http.get('/user/testsTaken', {
      headers: {'x-auth' : tokenService.getToken()
      }
    })
  }

  this.getAvailableTests = () => {
    return $http.get('/user/testsAvailable', {
      headers: {'x-auth' : tokenService.getToken()
      }
    })
  }

  this.getTestDetails = testId => {
    return $http.get('/user/getAtest/'+testId, {
      headers: {'x-auth' : tokenService.getToken()
      }      
    })
  }

  this.takeTest = testId => {
    return $http.put('/user/takeAtest/'+testId, {}, {
      headers: {'x-auth' : tokenService.getToken()
      }      
    })
  }

  this.getInstructions = testId => {
    return $http.get('/user/loadInstructions/'+testId, {
      headers: {'x-auth' : tokenService.getToken()
      }      
    })
  }


  this.getQuestionsToAttempt = testId => {
    return $http.get('/user/loadQuestions/'+testId, {
      headers: {'x-auth' : tokenService.getToken()
      }      
    })
  }

  this.saveAnsandCalcScore = (answers, testId) => {
    return $http.put('/user/saveAnswers/'+ testId, {
      answers: answers
    }, {
      headers: {'x-auth' : tokenService.getToken()
      }
    })
  }

  this.userGetResult = testId => {
    return $http.get('/user/questionStats/'+testId, {
      headers: {'x-auth' : tokenService.getToken()
      }      
    })
  }

  this.getAllTest = () => {
    return $http.get('/admin/allTest', {
      headers: {'x-auth' : tokenService.getToken()
      }      
    })
  }

  this.getCompleteTest4Admin = testId => {
    return $http.get('/admin/gettest/'+testId, {
      headers: {'x-auth' : tokenService.getToken()
      }      
    })
  }

  this.toggleLive = (live, testId) => {
    return $http.put('/admin/testlive/'+testId, {
      live: live
    }, {
      headers: {'x-auth' : tokenService.getToken()
    }      
    })
  }

  this.fetchAllUsers = () => {
    return $http.get('/admin/allUsers', {
      headers: {'x-auth' : tokenService.getToken()
    }      
    })
  }

  // this.fetchAUser4Admin = userEmailId => {
  //   return $http.get('/admin/getUser/'+userEmailId, {
  //     headers: {'x-auth' : tokenService.getToken()
  //   }      
  //   })
  // }

  this.fetchUsersTestResult4Admin = (userEmailId, testId) => {
    return $http.get('/admin/resultQnA/'+userEmailId+'/'+testId, {
      headers: {'x-auth' : tokenService.getToken()
    }      
    })
  }

  this.createNewTest = testDetails => {
    return $http.post('/admin/newTest', {
      testDetails
    }, {
      headers: {'x-auth' : tokenService.getToken()
    }      
    })
  }

  this.addQuestionToTest = (questionDetails, testId) => {
    return $http.post('/admin/addquestion/'+testId, {
      questionDetails
    }, {
      headers: {'x-auth' : tokenService.getToken()
    }      
    })
  }

  this.removeQfromTest = (qId, tId) => {
    return $http.delete('/admin/editTestlist/'+tId+'/'+qId, {
      headers: {'x-auth' : tokenService.getToken()
    }      
    })
  }

  this.editQinTest = (qId, tId, questionDetails) => {
    return $http.put('/admin/editQuestion/'+tId+'/'+qId, {
      questionDetails
    }, {
      headers: {'x-auth' : tokenService.getToken()
    }      
    })    
  }

  this.editTestReq = (testDetails, tId) => {
    return $http.put('/admin/editTestDetail/'+tId, {
      testDetails
    }, {
      headers: {'x-auth' : tokenService.getToken()
    }      
    })    
  }

  this.forgotPassword = emailId => {
    return $http.post('/user/forgotpass', {
      emailId
    })
  }

  this.changePassword = newPassword => {
    return $http.post('/user/changepass', {
      newPassword
    }, {
      headers: {'x-auth' : tokenService.getToken()}
    })
  }

}