const {responseObj} = require('./../../config/response');

module.exports = (req, res, next) => {
  if(!req.isAdminFROMTOKEN) {
    res.status(401).json(responseObj(null, 'Only Admins can access this api', 401, null))
  } else {
    next();
  }
}