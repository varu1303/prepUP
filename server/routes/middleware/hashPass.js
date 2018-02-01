const bcrypt = require('bcrypt');
const saltRounds = 13;
//
const {responseObj} = require('./../../config/response');

module.exports = {
  
  createHash: (req, res, next) => {
    let pass = req.body.userDetails.password.toString();
    // generate a salt
    bcrypt.genSalt(saltRounds, function(err, salt) {
      if (err) 
        res.status(500).json(responseObj(err,'Error in crypting password',500,null));
      else {
        // hash the password along with our new salt

        bcrypt.hash(pass, salt, function(err, hash) {
          // override the cleartext password with the hashed one
          if(!err){
            req.hash = hash;
            next();
          } else {
            res.status(500).json(responseObj(err,'Error in crypting password',500,null));
          }

        })
      }


    })
  },

  createHashFunction: password => {

    password = password.toString();    
    // generate a salt
    let salt = bcrypt.genSaltSync(saltRounds);
    password = bcrypt.hashSync(password, salt);
    
    return password;
  }

}