const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//
const question = require('./questionSchema');

const userDetails = new Schema ({
  name: {
    type: String,
    required: true
  },
  emailId: {
    type: String,
    required: true
  }
});


const testSchema = new Schema({
  name : {
    type: String,
    required: true,
    unique: true
  },
  description : {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  instructions : {
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
  publishedBy : userDetails,
  live: {
    status: {
      type: Boolean,
      default: false
    },
    version: {
      type: Number,
      default: 0
    }  
  },
  usersAppeared : [],
  questions: [{
    type: Schema.Types.ObjectId, 
    ref: 'question'    
  }]
});

// Sending back basic details of a question on success
testSchema.methods.getGist = function () {
  return {
    _id: this._id,
    name: this.name,
    description: this.description,
    category: this.category,
    instructions : this.instructions,
    passingLmt : this.passingLmt,
    timeLmt : this.timeLmt,
    publishedBy : this.publishedBy,
    live: this.live,
    usersAppeared: this.usersAppeared.length,
    questions: this.questions.length
  }
};


module.exports = mongoose.model('Test', testSchema);