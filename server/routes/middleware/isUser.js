const {responseObj} = require('./../../config/response');

module.exports = (req, res, next) => {
  if(req.isAdminFROMTOKEN) {
    res.status(401).json(responseObj(null, 'this functionality only for users', 401, null))
  } else {
    next();
  }
}