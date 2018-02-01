const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
//
const {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET} = require('./key');
const {saveUser, lookupUser} = require('./../../controller/userController');
//

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
function(accessToken, refreshToken, profile, done) {
  if (!profile.name.displayName) {
    profile.name.displayName = 'User';
  }
  lookupUser(profile.emails[0].value)
  .then(user => {
    if (!user) {
      let userDetails = {
        name: profile.name.displayName,
        emailId: profile.emails[0].value,
        admin: false
      }
      saveUser(userDetails)
      .then((user) => {
        return done(null, user);
      })
      .catch((error) => {
        console.log('error');
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
