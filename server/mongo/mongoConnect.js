const mongoose = require('mongoose');
const db = require('./../config/mongoUri');

mongoose.Promise = global.Promise;
mongoose.connect(db);

module.exports = mongoose.connection;