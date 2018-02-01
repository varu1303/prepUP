const express = require('express');
const router = express.Router();
const {responseObj} = require('./../config/response');
const User = require('./../mongo/schemas/userSchema');
const isUser = require('./middleware/isUser');
const isLoggedIn = require('./middleware/isLoggedIn');
const {createHashFunction} = require('./middleware/hashPass');
const {lookUpTest, getLiveTests4User} = require('./../controller/testController');
const {generateJWT} = require('./../controller/utilFunctions/jwt');
const createNewPassword = require('./../controller/utilFunctions/randomString');
const {sendPassMail} = require('./../controller/utilFunctions/mailer');
const {refQuestions4User, saveAnswers, getQuestionsOfTest, getInsructionsOfTest, 
    populateQnA, gettestsTaken, getAvailableTests, lookupUser, updPassword} = require('./../controller/userController');

// (1) Getting details of a test
// (2) Take a test adds questions and other details in user's 'testsTaken'
// (3) Start -> which will load the questions 
// (4) On Submit -> save the answers and calculate score
// (5) Fetch result 
// (6) Get all the taken tests
// (7) Get all the tests user can take
// (8) Forgot Password
// (9) Change Password

router.get('/getATest/:testId', isLoggedIn, isUser, (req, res) => {
  lookUpTest(req.params.testId)
    .then(test => {
      if (!test) {
        res.status(404).json(responseObj(null, 'Test not found in DB', 404, null));
      } else if (!test.live.status) {
        res.status(400).json(responseObj(null, 'Test is not live', 400, null));
      } else {
        res.json(responseObj(null, 'Test fetched succesfully', 200, test.getGist()));
      }
    })
    .catch(error => {
      res.status(500).json(responseObj(null, 'Error in getting test for user', 500, null));
    })
})

router.put('/takeAtest/:testId', isLoggedIn, isUser, (req, res) => {
  lookUpTest(req.params.testId)
    .then(test => {
      if (!test) {
        res.status(404).json(responseObj(null, 'Test not found in DB', 404, null));
      } else if (!test.live.status) {
        res.status(400).json(responseObj(null, 'Test is not live', 400, null));
      } else {
        test.usersAppeared.push(req.emailIdFROMTOKEN);
        test.save()
          .then(test => {
            refQuestions4User(test, req.emailIdFROMTOKEN)
              .then(user => {
                res.json(responseObj(null, 'User DB updated', 200, user.getTakenTestsDetails()));
              })
              .catch(error => {
                res.status(500).json(responseObj(error, 'error in saving test for user', 500, null));
              })
          })
          .catch(error => {
            res.status(500).json(responseObj(error, 'error in saving user in appeared list of test', 500, null));
          })
      }
    })
    .catch(error => {
      res.status(500).json(responseObj(null, 'Error in getting test for user', 500, null));
    })
})

router.get('/loadInstructions/:testId', isLoggedIn, isUser, (req, res) => {
  getInsructionsOfTest(req.emailIdFROMTOKEN, req.params.testId)
    .then(info => {
      res.json(responseObj(null, 'instructions loaded', 200, info));
    })
    .catch(error => {
      res.status(500).json(responseObj(error, 'Could not load instruction', 500, null));
    })

})

router.get('/loadQuestions/:testId', isLoggedIn, isUser, (req, res) => {
  getQuestionsOfTest(req.emailIdFROMTOKEN, req.params.testId)
    .then(qSet => {
      qSet = qSet.map((q => {
        questionWithoutAnserKey = {
          options: q.options,
          probStatement: q.probStatement,
          _id: q._id
        };
        return questionWithoutAnserKey;
      }))
      res.json(responseObj(null, 'Questions loaded', 200, qSet));
    })
    .catch(error => {
      res.status(500).json(responseObj(error, 'Could not load instruction', 500, null));
    })

})

router.put('/saveAnswers/:testId', isLoggedIn, isUser, (req, res) => {
  let answers = req.body.answers;
  saveAnswers(answers, req.params.testId, req.emailIdFROMTOKEN)
    .then(user => {
      let testOut;
      user.testsTaken.forEach((test, i) => {
        if (test._id == req.params.testId)
          testOut = user.testsTaken[i];
      })
      res.json(responseObj(null, 'Answers saved and score calculated', 200, testOut));
    })
    .catch(error => {
      res.status(error.status).json(responseObj(null, error.message, error.status, null));
    })
})

router.get('/questionStats/:testId', isLoggedIn, isUser, (req, res) => {
  populateQnA(req.params.testId, req.emailIdFROMTOKEN)
    .then(result => {
      res.json(responseObj(null, 'QnA analysis report', 200, result));
    })
    .catch(error => {
      res.json(responseObj(null, 'Error in getting result', 500, null));
    })
})

router.get('/testsTaken', isLoggedIn, isUser, (req, res) => {
  gettestsTaken(req.emailIdFROMTOKEN)
    .then(user => {
      res.json(responseObj(null, 'tests fetched', 200, user.testsTaken));
    })
    .catch(error => {
      res.status(500).json(responseObj(error, 'Error in gettin tests', 500, null));
    })
})

router.get('/testsAvailable', isLoggedIn, isUser, (req, res) => {
  getAvailableTests(req.emailIdFROMTOKEN)
    .then(tests => {
      res.json(responseObj(null, 'Sending back the available tests', 200, tests));
    })
    .catch(error => {
      res.status(500).json(responseObj(error, 'error in getting tests', 500, null));
    })
})


//AFTER SOCIAL LOGIN, returning a token if a valid otp is submitted and 'expiring'(deleting) it after one time use

router.post('/otp4token', (req, res) => {
  if (req.body.password) {
    User.findOne({emailId: req.body.emailId})
      .then(user => {
        if(!user)
          res.status(404).json(responseObj(null, 'user not in db', 404, null));
        else {
          if (user.password === req.body.password) {
            user.password = '';
            user.save()
              .then(user => {
                let token = generateJWT(user.getPayload());
                res.json(responseObj(null, 'OTP correct sending back token', 200, token));  
              })
              .catch(error => {
                res.status(500).json(error, 'Error in disabling OTP', 500, null);
              })
          } else {
            res.status(401).json(responseObj(null, 'Incorrect OTP', 401, null));
          }
        }
      })
      .catch(error => {
        res.status(500).json(responseObj(error, 'Error in looking up user', 500, null));
      })  
  } else {
    res.status(400).json(responseObj(null, 'OTP not provided cannot provide token', 400, null));
  }
})


router.post('/forgotpass', (req, res) => {
  let userEmailId = req.body.emailId;

  if(!userEmailId )
    res.status(400).json(responseObj(null,'Email ID not provided',400,null)); 
  else {
    lookupUser(userEmailId )
      .then(user => {
        if(!user)
          res.status(404).json(responseObj(null,'Email ID not found in the Database',404,null));
        else {
          sendPassMail(userEmailId, createNewPassword())
            .then(updateDetails => {
              updateDetails.pass = createHashFunction(updateDetails.pass);
              return updPassword(updateDetails);                
            })
            .then((user) => {
              res.json(responseObj(null, 'New password set and sent', 200, null));    
            })
            .catch((error) => {
              res.status(500).json(responseObj(error,'Error in Setting and sending new password',500,null));
            })
        }
      })
      .catch((error) => {
        res.status(500).json(responseObj(error,'Error in Finding user in DB',500,null));
      })      
  }
})

router.post('/changepass', isLoggedIn, (req, res) => {
  if(!req.body.newPassword)
    res.status(400).json(responseObj(null,'New password not provided',400,null));  
  else {
    let u = {};
    u.email = req.emailIdFROMTOKEN;
    u.pass = createHashFunction(req.body.newPassword);

    updPassword(u)
      .then((user) => {
        res.json(responseObj(null,'Password changed',200,null));     
      })
      .catch((error) => {
        res.status(500).json(responseObj(error,'Error in changing password',500,null));        
      })

    }
  })


module.exports = router;