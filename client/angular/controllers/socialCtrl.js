angular.module('quizApp')
  .controller('socialController', socialController);


function socialController(tokenService, $location, $routeParams, httpRequest) {
 

  let detail4token = $routeParams.detail4token;
  let emailId = detail4token.substring(9,detail4token.length+1);
  let pass = detail4token.substring(0,9);

  httpRequest.getTokenFromOTP(emailId, pass)
    .then(data => {
      tokenService.saveToken(data.data.data);
      $location.path('/home');
    })
    .catch(error => {
      console.log(error)
      $location.path('/');
    })


}