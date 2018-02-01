const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
//
const {lookupUser} = require('./../../controller/userController');

passport.use(new LocalStrategy({
    usernameField: 'emailId'
  },
  (emailId, password, done) => {

    lookupUser(emailId)
      .then(user => {
        bcrypt.compare(password, user.password, function(err, match) {
          if(err) {
            return done(null, false);
          } else if(match) {
              return done(null, user);
          } else {
            return done(null, false);
          }
        })
      })
      .catch(error => {
        return done(null, false);
      })    
  }
));