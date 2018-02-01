const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
//
const {FACEBOOK_APP_ID, FACEBOOK_APP_SECRET} = require('./key');
const {saveUser, lookupUser} = require('./../../controller/userController');
//


passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields: ['id', 'emails', 'name']
},
function(accessToken, refreshToken, profile, done) {
  if (!profile._json.first_name) {
    profile._json.first_name = 'User';
  }
  lookupUser(profile._json.email)
    .then(user => {
      if (!user) {
        let userDetails = {
          name: profile._json.first_name,
          emailId: profile._json.email,
          admin: false
        }
        saveUser(userDetails)
        .then((user) => {
          return done(null, user);
        })
        .catch((error) => {
          console.log(error);
          return (null, false);
        })
      } else {
          return done(null, user);      
      }
    })
    .catch(error => {
      console.log(error);
      return (null, false);    
    })
}
));