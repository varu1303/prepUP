const User = require('./../mongo/schemas/userSchema');
const Question = require('./../mongo/schemas/questionSchema');
const Test = require('./../mongo/schemas/testSchema');

const events = require('events');
const eventEmitter = new events.EventEmitter();

eventEmitter.on('answersEvaluated', (correct, totalQuestions, user, index) => {
  let score = Math.ceil( (correct / totalQuestions) * 100);
  user.testsTaken[index].score = score;
})

eventEmitter.on('pushedInQSet', (qSet, user, index, resolve) => {
  if(qSet.length === user.testsTaken[index].questions.length)
    resolve(qSet);
});

eventEmitter.on('QnAready', (result, resolve) => {
  resolve(result);
})

module.exports = {

  saveUser : userDetails => {
    let user = new User({
      name: userDetails.name,
      emailId: userDetails.emailId,
      password: userDetails.password,
      admin: userDetails.admin
    });

    return user.save();
  },

  lookupUser: emailId => {
    return User.findOne({emailId: emailId});
  },

  noAnswer: (emailId, testId) => {
    return new Promise((resolve, reject) => {
      User.findOne({emailId: emailId})
      .then(user => {
        user.testsTaken.forEach(test => {
          if (test._id == testId) {
            test.score = 0;
            test.answers = [];
          }
        })
        return user.save();
      })
      .then(user => {
        resolve(user);
      })
      .catch(error => {
        reject(error);
      })
    })

  },

  updPassword: updateDetails => {
    return (new Promise((resolve, reject) => {
      User.findOne({emailId: updateDetails.email})
        .then((user) => {
          if(!user)
            throw new Error("Email ID not found in DB");
          else {
            user.password = updateDetails.pass;
            return user.save();
          }
        })
        .then((finuser) => {
          resolve(finuser);
        })
        .catch((err) => {
          reject(err);
        })
    })
    )},

  getAllUsers: () => {
    return User.find();
  },

  refQuestions4User: (test, userId) => {
    return new Promise((resolve, reject) => {
      User.findOne({emailId: userId})
        .then(user => {
          let newTest = {};
          newTest.name = test.name;
          newTest.instructions = test.instructions;
          newTest.description = test.description;
          newTest.passingLmt = test.passingLmt;
          newTest.timeLmt = test.timeLmt;
          newTest.publishedBy= test.publishedBy;
          newTest.questions = test.questions;
          newTest.version = test.live.version;
          newTest.category = test.category;
          user.testsTaken.push(newTest);
          return user.save();
        })
        .then(user => {
          resolve(user);
        })
        .catch(error => {
          reject(error);
        })
    })
  },

  getInsructionsOfTest: (userEmailId, testId) => {
    return new Promise((resolve, reject) => {
      User.findOne({emailId: userEmailId})
        .then(user => {
          if (!user.testsTaken.length)
            reject({message: 'No tests in users profile', status: 400});

          let index;
          user.testsTaken.forEach((test, i) => {
            if (test._id == testId)
              index = i;
          })
          if (index === undefined) {
            reject({message: 'Test Id not present in users test taken list', status: 404})
          } else {
            let info = {};
            info.name = user.testsTaken[index].name;
            info.version = user.testsTaken[index].version;
            info.description = user.testsTaken[index].description;
            info.instructions = user.testsTaken[index].instructions;
            info.passingLmt = user.testsTaken[index].passingLmt;
            info.timeLmt = user.testsTaken[index].timeLmt;
            info.publishedBy = user.testsTaken[index].publishedBy;
            info.score = user.testsTaken[index].score;
            resolve(info);
          }
        })
        .catch(error => {
          reject({message: 'Error in finding user in db', status: 500});
        })
    })
  },

  getQuestionsOfTest: (userEmailId, testId) => {
    return new Promise((resolve, reject) => {
      User.findOne({emailId: userEmailId})
        .then(user => {
          if (!user.testsTaken.length)
            reject({message: 'No tests in users profile', status: 400});

          let index;
          user.testsTaken.forEach((test, i) => {
            if (test._id == testId)
              index = i;
          })
          if (index === undefined) {
            reject({message: 'Test Id not present in users test taken list', status: 404})
          } else {
            let qSet = [];
            user.testsTaken[index].questions.forEach(qId => {
              Question.findById(qId)
                .then(q => {
                  if (q) {
                  qSet.push(q);
                  eventEmitter.emit('pushedInQSet', qSet, user, index, resolve);
                  }
                })
                .catch(error => {
                  console.log('error in getting question for user');
                })
            })
          }
        })
        .catch(error => {
          reject({message: 'Error in finding user in db', status: 500});
        })
    })
  },

  saveAnswers: (answers, testId, userEmailId) => {
    return new Promise((resolve, reject) => {
      User.findOne({emailId: userEmailId})
      .then(user => {
        if (!user.testsTaken.length) 
          reject({message: 'No tests in users profile', status: 400});
        else {
          let index;
          user.testsTaken.forEach((test, i) => {
            if (test._id == testId)
              index = i;
          })
          if (index === undefined) {
            reject({message: 'Test Id not present in users test taken list', status: 404});
          } else {
              let correct = 0;
              let evaluated = 0;
              let totalQuestions = user.testsTaken[index].questions.length;
              let totAnswers = answers.length;
              user.testsTaken[index].answers = answers;
              user.testsTaken[index].answers.forEach(QnA => {
                Question.findById(QnA.questionId)
                  .then(q => {
                    if (q.answer == QnA.key) {
                      correct += 1;
                    }
                    evaluated += 1;
                    if (evaluated === totAnswers) {
                      eventEmitter.emit('answersEvaluated', correct, totalQuestions, user, index);
                      user.save()
                      .then(user => {
                        resolve(user);
                      })
                      .catch(error => {
                        reject({message: 'Error in saving answers to user', status: 422});
                      })

                    }
                  })
                  .catch(error => {
                    evaluated += 1;
                    console.log('question not in db ', error);
                  })
              })    
          }
        }

      })
      .catch(error => {
        return reject({message: 'Error in finding user in db', status: 500});
      })
    })
  },

  populateQnA: (testId, userEmailId) => {
    return new Promise((resolve, reject) => {
      let QnAtobeSent = [];
      let added = 0;
      User.findOne({emailId: userEmailId}) 
        .then(user => {
          if (!user) {
            reject('user not in DB');
          } else {
          let tfound = false;
          user.testsTaken.forEach((test, index) => {
            if (test._id == testId) {
              tfound = true;
              let l = user.testsTaken[index].answers.length;
                user.testsTaken[index].answers.forEach(QnA => {
                  Question.findById(QnA.questionId)
                    .then(q => {
                      let qna = {};
                      qna.question = q;
                      qna.answer = QnA.key;
                      qna.time = QnA.timeTaken;
                      QnAtobeSent.push(qna);
                      added += 1;
                      
                      if (l === added) {
                        let result = {QnA: QnAtobeSent, test: user.testsTaken[index]};
                        eventEmitter.emit('QnAready', result, resolve);    
                      }
                    })
                    .catch(error => {
                      reject(error);
                    })
              })
          }
          })
          if (!tfound) {
            reject('test not in users list of taken tests');
          }
        }
        })
        .catch(error => {
          reject(error);
        })
    });
  
  },

  gettestsTaken: userEmailId => {
    return User.findOne({emailId: userEmailId});
  },

  getAvailableTests: userEmailId => {
    return new Promise((resolve, reject) => {
      Test.find()
        .then(tests => {
          let availableTests = [];
          tests.forEach(test => {
            if (test.usersAppeared.indexOf(userEmailId) === -1 && test.live.status) {
              availableTests.push(test);
            }  
          })
          resolve(availableTests);
        })
        })
        .catch(error => {
          reject({message: 'Error in getting tests', status: 500});
        })
    }


}