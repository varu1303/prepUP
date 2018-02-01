const Test = require('./../mongo/schemas/testSchema');

module.exports = {
  createTest: testDetails => {
    let test = new Test({
      name: testDetails.name,
      description: testDetails.description,
      instructions: testDetails.instructions,
      passingLmt: testDetails.passingLmt,
      timeLmt: testDetails.timeLmt,
      category: testDetails.category,
      publishedBy: {
        name: testDetails.adminName,
        emailId: testDetails.adminId
      }
    });

    return test.save();
  },

  addQuestionToTest: (question, testId) => {
    return Test.findByIdAndUpdate(testId, {$push: {"questions": question}, $set: {"usersAppeared": []}},
                                                  {safe: true, new : true});
  },

  lookUpTest: testId => {
    return Test.findById(testId);
  },

  getTest: testId => {
    return Test.findById(testId).populate('questions');
  },

  updateLiveStatus: (testId, live) => {
    if (live)
      return Test.findByIdAndUpdate(testId, {$set: {'live.status': live}, $inc: {'live.version': 1}}, {new : true});
    else
      return Test.findByIdAndUpdate(testId, {$set: {'live.status': live}}, {new : true});    
  },

  updateTestDetail: (test, testDetails) => {
    test.instructions = testDetails.instructions;
    test.timeLmt = testDetails.timeLmt * 60;
    test.passingLmt = testDetails.passingLmt;

    return test.save();
  },

  getAllTest4Admin: () => {
    return Test.find();
  },

  removeQuestion: (test, qId) => {

    let index = test.questions.indexOf(qId);
    return new Promise((resolve, reject) => {
      if (index === -1) {
        reject({message: 'question not in test', status: 404});
      } else {
        test.questions.splice(index, 1);
        test.save()
          .then(test => {
            resolve(test);
          })
          .catch(error => {
            reject({message: 'server error in saving changes', status: 500});
          })
      }
    })
  },

  replaceQuestionInTest: (test, newQId, oldQId) => {
    let index = test.questions.indexOf(oldQId);

    return new Promise((resolve, reject) => {
      if (index === -1) {
        reject({message: 'Question to be edited not in DB', status: 404})
      } else {
        test.questions.set(index, newQId);
        test.save()
          .then(test => {
            resolve(test);
          })
          .catch(error => {
            reject({message: 'server error in saving changes', status: 500});
          })
      }
    })
  },

  getLiveTests4User: () => {
    return Test.find({'live.status': true});
  }
}