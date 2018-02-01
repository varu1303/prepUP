const express = require('express');
const router = express.Router();
const {responseObj} = require('./../config/response');
const isLoggedIn = require('./middleware/isLoggedIn');
const isAdmin = require('./middleware/isAdmin');
const {createTest, addQuestionToTest, lookUpTest, updateLiveStatus, 
  getAllTest4Admin, getTest, removeQuestion, replaceQuestionInTest, updateTestDetail} = require('./../controller/testController');
const {saveQuestion} = require('./../controller/questionController');
const {lookupUser, getAllUsers, populateQnA} = require('./../controller/userController');

// 1) Create a new test
// 2) Add questions to new test - cannot do if test is LIVE
// 3) Take the test LIVE - with each LIVE, version increments 
// 4) get all tests with basic details
// 5) get all details of a particular test*
// 6) add question to the existing test -> 2 takes care of this
// 7) Remove a question from a test -> cannot do if test is LIVE
// 8) Edit a question ( create a new question and ref it in Test and pop old) -> cannot do if test is LIVE
// 9) Get a user with details
// 10) Get all users
// 11) Get test result of a user
// 12) Edit test detail - instruction, passing Limit or time limit

router.post('/newTest', isLoggedIn, isAdmin, (req, res) => {
  let testDetails = req.body.testDetails;
  testDetails.timeLmt *= 60;
  testDetails.adminName = req.nameFROMTOKEN;
  testDetails.adminId = req.emailIdFROMTOKEN;
  createTest(testDetails)
    .then(test => {
      res.json(responseObj(null, 'Test created', 200, test))
    })
    .catch(error => {
      if (error.code === 11000)
        res.status(422).json(responseObj(error, 'Test already exists with that name', 422, null));    
      else
        res.status(400).json(responseObj(error, 'Test could not be created', 400, null));
    })
})


router.post('/addquestion/:testId', isLoggedIn, isAdmin, (req, res) => {
  let question = req.body.questionDetails;
  let testId = req.params.testId;
  let optionCount = question.options ? question.options.length : 0;
  if (optionCount < 4) {
    res.status(400).json(responseObj(null, 'Minimum 4 options required', 400, null))
  } else if ( (!question.answer && question.answer !== 0) || !question.options[question.answer]) {
    res.status(400).json(responseObj(null, 'Answer key has to be provided', 400, null))    
  } else {
    lookUpTest(testId)
      .then(test => {
        if (!test) {
          res.status(404).json(responseObj(null, 'Test ID not present in DB', 404, null));
        } else if (test.live.status) {
            res.status(422).json(responseObj(null, 'Test is live cannot change questions', 422, null));
        } else {
            saveQuestion(question)
              .then(question => {
                return addQuestionToTest(question._id, testId)
              })
              .then(test => {
                if (!test) {
                  throw (404);
                } else {
                  res.json(responseObj(null, 'Question added to test', 200, test.getGist()));
                }
              })
              .catch(error => {
                if (error === 404) 
                  res.status(404).json(responseObj(null, 'Test ID not present in DB', 404, null));
                else 
                  res.status(500).json(responseObj(error, 'Could not add question to test', 500, null));    
              })
        }
      })
      .catch(error => {
        res.status(500).json(responseObj(null, 'Server error in getting test', 500, null));    
      })
  }
})

router.put('/testlive/:testId', isLoggedIn, isAdmin, (req,res) => {
  let live = req.body.live;
  testId = req.params.testId;
  lookUpTest(testId)
    .then(test => {
      if (!test) {
        return 404;
      } else {
        if (live === undefined)
          return 400;
        else if (test.live.status && live)
          return 409;
        else if (test.questions.length < 5 && live)
          return 422;
        else {
          return updateLiveStatus(test._id, live);   
        }
      }
    })
    .then(test => {
      if (test === 404)
        res.status(404).json(responseObj(null, 'Test not found in DB', 404, null));
      else if (test === 409)
        res.status(409).json(responseObj(null, 'Test already live', 409, null));
      else if (test === 400)
        res.status(400).json(responseObj(null, 'Provide Status', 400, null));
      else if (test === 422)
        res.status(422).json(responseObj(null, 'Cannot take a test live with less than 5 questions', 422, null));
      else
        res.json(responseObj(null, 'status updated', 200, test.getGist()));
    })
    .catch(error => {
      res.json(responseObj(error, 'Error in updating Test status', 500, null));
    })
  
})

router.get('/allTest', isLoggedIn, isAdmin, (req,res) => {
  getAllTest4Admin()
    .then(tests => {
      if (!tests.length) {
        res.status(404).json(responseObj(null, 'No tests in DB', 404, null));
      } else {
        tests = tests.map(test => {
          return test.getGist();
        });
        res.json(responseObj(null, 'Tests fetched', 200, tests));
      }
    })
    .catch(error => {
      res.status(500).json(responseObj(error, 'Error in fetching tests', 500, null));
    })
})

router.get('/gettest/:testId', isLoggedIn, isAdmin, (req, res) => {
  getTest(req.params.testId)
    .then(test => {
      if (!test) {
        res.status(404).json(responseObj(null, 'Test not found in DB', 404, null));
      } else {
        res.json(responseObj(null, 'Test fetched', 200, test));
      }
    })
    .catch(error => {
      res.status(500).json(responseObj(error, 'Error in getting Test from DB', 500, null));
    })
})


router.delete('/editTestlist/:testId/:questionId', isLoggedIn, isAdmin, (req, res) => {
  testId = req.params.testId;
  qId = req.params.questionId;
  lookUpTest(testId)
    .then(test => {
      if (!test) {
        res.status(404).json(responseObj(null, 'Test ID not present in DB', 404, null));
      } else if (test.live.status) {
          res.status(422).json(responseObj(null, 'Test is live cannot change questions', 422, null));
      } else {
          removeQuestion(test, qId)
            .then(test => {
              res.json(responseObj(null, 'Question Removed', 200, null));
            })
            .catch(error => {
              if(error.status === 404)
                res.status(404).json(responseObj(error.message, 'Question not in test', 404, null));
              else
                res.status(500).json(responseObj(error, 'Error in popping question from Test', 500, null));    
            })
      }
    })
    .catch(error => {
      res.status(500).json(responseObj(null, 'Server error in getting test', 500, null));    
    })  
})

router.put('/editQuestion/:testId/:questionId', isLoggedIn, isAdmin, (req, res) => {
  testId = req.params.testId;
  qId = req.params.questionId;

  let question = req.body.questionDetails;
  let optionCount = question.options ? question.options.length : 0;

  if (optionCount < 4) {
    res.status(400).json(responseObj(null, 'Minimum 4 options required', 400, null))
  } else if ( (!question.answer && question.answer !== 0) || !question.options[question.answer]) {
    res.status(400).json(responseObj(null, 'Answer key has to be provided', 400, null))    
  } else {
    lookUpTest(testId)
      .then(test => {
        if (!test) {
          res.status(404).json(responseObj(null, 'Test ID not present in DB', 404, null));
        } else if (test.live.status) {
            res.status(422).json(responseObj(null, 'Test is live cannot change questions', 422, null));
        } else {
            saveQuestion(question)
              .then(question => {
                  return replaceQuestionInTest(test, question._id, qId)
                })
                .then(test => {
                    res.json(responseObj(null, 'Question edited in test', 200, test.getGist()));
                })
                .catch(error => {
                  if (error.status === 404) 
                    res.status(404).json(responseObj(null, error.message, 404, null));
                  else 
                    res.status(500).json(responseObj(error, 'Could not edit question in test', 500, null));    
                })
        }
      })
      .catch(error => {
        res.status(500).json(responseObj(null, 'Server error in getting test', 500, null));    
      })
  }

})

router.get('/getUser/:userEmail', isLoggedIn, isAdmin, (req, res) => {
  lookupUser(req.params.userEmail)
    .then(user => {
      if (!user)
        res.status(404).json(responseObj(null, 'User not found in DB', 404, null));
      else
        res.json(responseObj(null, 'Got user from DB', 200, user.getPublicFields()));
    })
    .catch(error => {
      res.status(500).json(responseObj(error, 'Error in getting user', 500, null));
    })
})

router.get('/allUsers', isLoggedIn, isAdmin, (req, res) => {
  getAllUsers()
    .then(users => {
      let onlyUser = [];
      users.forEach(user => {
        if (!user.admin)
          onlyUser.push(user);
      })
      if (onlyUser.length === 0)
        res.status(404).json(responseObj(null, 'No users in DB', 404, null));
      else {
        onlyUser = onlyUser.map(user => {
          return user.getPublicFields();
        })
        res.json(responseObj(null, 'Users fetched', 200, onlyUser));  
      }  
    })
    .catch(error => {
      res.status(500).json(responseObj(error, 'Error in getting users', 500, null));
    })
})

router.get('/resultQnA/:userEmail/:testId', isLoggedIn, isAdmin, (req, res) => {
  populateQnA(req.params.testId, req.params.userEmail)
    .then(QnA => {
      res.json(responseObj(null, 'QnA analysis report', 200, QnA));
    })
    .catch(error => {
      res.json(responseObj(error, 'error in fetching result', 500, null));
    })

})

router.put('/editTestDetail/:testId', isLoggedIn, isAdmin, (req, res) => {
  const testDetails = req.body.testDetails;
  const testId = req.params.testId;
  lookUpTest(testId)
  .then(test => {
    if (!test) {
      return 404;
    } else {
      if (test.live.status)
        return 409;
      else 
        return updateTestDetail(test, testDetails);
    }
  })
  .then(test => {
    if (test === 404)
      res.status(404).json(responseObj(null, 'Test not found in DB', 404, null));
    else if (test === 409)
      res.status(409).json(responseObj(null, 'Test is live', 409, null));
    else
      res.json(responseObj(null, 'status updated', 200, test.getGist()));
  })
  .catch(error => {
    res.json(responseObj(error, 'Error in updating Test status', 500, null));
  })
})

module.exports = router;