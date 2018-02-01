angular.module('quizApp')
  .config(function($routeProvider,$locationProvider) {
    $routeProvider
      .when('/social/callback/:detail4token', {
        templateUrl: 'templates/social.html',
        controller: 'socialController',
        controllerAs: 'Social'        
      })
      .when('/home', {
        templateUrl: 'templates/home.html',
        controller: 'homeController',
        controllerAs: 'Home'
      })
      .when('/availableTests', {
        templateUrl: 'templates/availableTests.html',
        controller: 'atController',
        controllerAs: 'AT'        
      })
      .when('/test/:testId', {
        templateUrl: 'templates/test.html',
        controller: 'testController',
        controllerAs: 'Test'        
      })
      .when('/testlive/:uTestId', {
        templateUrl: 'templates/testlive.html',
        controller: 'testLiveController',
        controllerAs: 'testLive'        
      })
      .when('/testresult/:uTestId', {
        templateUrl: 'templates/testresult.html',
        controller: 'testResultController',
        controllerAs: 'testResult'        
      })
      .when('/allusers', {
        templateUrl: 'templates/allUsers.html',
        controller: 'allUserController',
        controllerAs: 'allUsers'        
      })
      .when('/user/:userEmailId/result/:testId', {
        templateUrl: 'templates/userResult.html',
        controller: 'userResultController',
        controllerAs: 'userResult'        
      })
      .when('/newtest', {
        templateUrl: 'templates/newtest.html',
        controller: 'newTestController',
        controllerAs: 'newTest'        
      })
      .when('/addQ/:testId', {
        templateUrl: 'templates/addQ.html',
        controller: 'addQController',
        controllerAs: 'addQ'        
      })
      // .otherwise({
      //   redirectTo: '/'
      // });

//To make the URLs pretty (getting rid of #)
$locationProvider.html5Mode(true);

  })

  .run(function($rootScope, $location, tokenService) {
    $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {

      if (tokenService.getToken()) 
        $rootScope.nameFromToken = tokenService.getPayload(tokenService.getToken()).data.name;

      if ($location.path() !== '/') {
          $rootScope.welcome = false;
          $rootScope.isAdmin = tokenService.isAdmin();
      }

      if ($location.path() === '/') {
        if (tokenService.isLoggedIn())
          $location.path('/home');
        else
          $rootScope.welcome = true;
      }

    });

  });