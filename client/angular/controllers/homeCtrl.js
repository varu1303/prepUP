angular.module('quizApp')
  .controller('homeController', homeController);


  function homeController(tokenService, httpRequest, $location, $rootScope, $timeout, $scope) {
    
    const hc = this;
    hc.message = 'Sup? from Home!!';
    hc.isAdmin = tokenService.isAdmin();

    hc.engVal = [];
    hc.quanVal = [];
    hc.lrVal = [];
    hc.barVal = [];
    hc.engAvg = 0;
    hc.quanAvg = 0;
    hc.lrAvg = 0;


    if (!tokenService.isAdmin() && tokenService.isLoggedIn()) {
      httpRequest.getTakenTests()
      .then(response => {
        hc.tests = response.data.data;
        if (hc.tests.length) {
          hc.uTestAvg = 0;
          hc.uPassPerc = 0;
          hc.tests.forEach(test => {
            let date = test._id.toString().substring(0,8);
            test.date = new Date( parseInt( date, 16 ) * 1000 );
            if (test.score >= test.passingLmt) {
              hc.uPassPerc += 1;
              test.passed = true;
            }
            hc.uTestAvg += test.score;
            //for chart
            if (test.category === 'English') {
              hc.engVal.push(test.score);
            } else if (test.category === 'Quantitative Aptitude') {
              hc.quanVal.push(test.score);
            } else if (test.category === 'Logical Reasoning') {
              hc.lrVal.push(test.score);
            }
          })
          let engTot = 0;
          let quanTot = 0;
          let lrTot = 0;

          hc.engVal.forEach(s => {
            engTot += s;
          })
          if (hc.engVal.length)
            hc.engAvg = Math.round(engTot / hc.engVal.length);
          hc.barVal.push(hc.engAvg);

          hc.quanVal.forEach(s => {
            quanTot += s;
          })
          if (hc.quanVal.length)
            hc.quanAvg = Math.round(quanTot / hc.quanVal.length);
          hc.barVal.push(hc.quanAvg);

          hc.lrVal.forEach(s => {
            lrTot += s;
          })
          if (hc.lrVal.length)
            hc.lrAvg = Math.round(lrTot / hc.lrVal.length);
          hc.barVal.push(hc.lrAvg);


          if (hc.uPassPerc) {
            hc.uPassPerc = Math.round((hc.uPassPerc / hc.tests.length) * 100);
          }
          if (hc.uTestAvg) {
            hc.uTestAvg = Math.round(hc.uTestAvg / hc.tests.length);
          }
        }
        hc.loadDone = true;
      })
      .catch(error => {
        console.log(error);
        if (error.data.status == 401)
          hc.notifyThis = 'Login, please.'
        else
          hc.notifyThis = 'Server Error, Come back later'
        hc.serverNotified = true;
        hc.serverMessageError = true;
        $timeout(() => {
          hc.serverNotified = false;
          hc.serverMessageError = false;
          $location.path('/');
          $scope.$apply()     
        }, 3000);
        tokenService.deleteToken();
      });
    } else if (tokenService.isLoggedIn() && tokenService.isAdmin()) {
      httpRequest.getAllTest()
      .then(response => {
        hc.tests = response.data.data;
        hc.showThis(hc.tests[hc.tests.length - 1], 0);
        hc.showHD(0, hc.tests[0]._id);
      })
      .catch(error => {
        console.log(error.data);
        if (error.data.status != 404) {
          hc.notifyThis = 'Server Error, Come back later'
          hc.serverNotified = true;
          hc.serverMessageError = true;
          $timeout(() => {
            hc.serverNotified = false;
            hc.serverMessageError = false; 
            $location.path('/');
            $scope.$apply(); 
          }, 3000);   
          tokenService.deleteToken();
        } else {
          hc.loadDone = true;
        }
        });
    } else {
      $location.path('/');
    }

    hc.showThis = (test, ind) => {
      hc.inshown = ind;
      hc.selid = test._id;
      hc.selname = test.name;
      hc.category = test.category;
      hc.selstatus = test.live.status;
      hc.selpubby = test.publishedBy.name;
      let date = test._id.toString().substring(0,8);
      hc.selpubdate = new Date( parseInt( date, 16 ) * 1000 );
      hc.seldesc = test.description;
      hc.selqNo = test.questions;
      hc.selnousers = test.usersAppeared;
    }

    hc.toTestView = tId => {
      $location.path('/test/'+ tId);
    }

    hc.showHD = (ind, id) => {
      // hc.selid = id;
      if (hc.showHiddenDetail === ind)
        hc.showHiddenDetail = undefined;
      else
        hc.showHiddenDetail = ind;
    }

    hc.myConfig1 = {
      type : 'line',
      series : [
        { values : hc.engVal },    //English
        { values : hc.quanVal },   //Quant
        { values: hc.lrVal}        //LR
      ],
      scaleY: {
        values: '0:100:10'
      }
    }

    hc.myConfig2 = {
      type : "bar",
      backgroundColor : "white",
      series : [
        {
          values: hc.barVal,
          backgroundColor : "#4DC0CF"
        }
      ],
      "scale-x":{  
        "values":["ENG","QUANT","LR"] 
      },
      scaleY: {
        values: '0:100:10'
      }
    }

  }