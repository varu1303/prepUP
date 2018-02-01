const {extractJWT, verifyJWT} = require('./../../controller/utilFunctions/jwt');
const {responseObj} = require('./../../config/response');

module.exports = (req, res, next) => {
  let jwt = extractJWT(req);
  if(!jwt) {
    res.status(401).json(responseObj(null,'No Token Provided',401,null));    
  } else {
    let validUser = verifyJWT(jwt);
    if(validUser) {
      req.emailIdFROMTOKEN = validUser.data.emailId;
      req.nameFROMTOKEN = validUser.data.name;
      req.isAdminFROMTOKEN = validUser.data.admin;
      next();
    } else {
      res.status(401).json(responseObj(null,'Invalid Token',401,null));
    }
  }

}

