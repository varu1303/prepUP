const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//
const question = require('./questionSchema');

const testDetails = new Schema ({
  name: {
    type: String,
    required: true
  },
  version: {
    type: Number
  },
  description: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    required: true
  }, 
  passingLmt : {
    type: Number,
    required: true
  },
  timeLmt : {
    type: Number,
    required: true
  },
  publishedBy : {
    type: String,
    required: true
  },
  score: {
    type: Number
  },
  questions : [{
    type: Schema.Types.ObjectId, 
    ref: 'question'    
  }],
  category: {
    type: String
  },
  answers : [{
    questionId: {
      type: String
    },
    key: {
      type: String
    },
    timeTaken: {
      type: Number,
      default: 0
    }
  }]  
});

//

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  emailId: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  admin: {
    type: Boolean,
    default: false
  },
  testsTaken: [testDetails] 
},{ versionKey: false });


// Sending back publicfields on success
userSchema.methods.getPublicFields = function () {
  return {
    name: this.name,
    emailId: this.emailId,
    admin: this.admin,
    testsTaken: this.testsTaken
  }
};

// Sending payload data
userSchema.methods.getPayload = function () {
  let payload = {
      name: this.name,
      emailId: this.emailId,
      admin: this.admin,
  };
  return payload;
};

userSchema.methods.getTakenTestsDetails = function () {
  let test = this.testsTaken[this.testsTaken.length - 1];
  return test;
}


module.exports = mongoose.model('User', userSchema);