const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//

const questionSchema = new Schema({
  probStatement : {
    type: String,
    required: true
  },
  options : [{
    type: String,
    required: true
  }],
  answer : {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('question', questionSchema);