const jwt = require('jsonwebtoken');
const secret = require('./../../config/secret');

module.exports = {
  generateJWT: payload => {
    return jwt.sign( { data: payload }, secret);
  },

  extractJWT: req => req.get('x-auth'),

  verifyJWT: token => {
    try {
      let decoded = jwt.verify(token, secret);
      return decoded;
    } catch(err) {
      // err
      // console.log(err);
      return false;
    }
  }
}