const express = require('express');
const router = express.Router();
const passport = require('passport');
//
const pass_local = require('./../config/passport/local');
const pass_fb = require('./../config/passport/fb');
const pass_google = require('./../config/passport/google');
//
const {saveUser} = require('./../controller/userController');
const {generateJWT} = require('./../controller/utilFunctions/jwt');
const {check, validationResult} = require('express-validator/check');
const {createHash, createHashFunction} = require('./middleware/hashPass');
const {responseObj} = require('./../config/response');
const {adminCred} = require('./../config/adminRightsTo');

const otp4SocialLogin = () => {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 9; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


// (1)
router.post('/register',   [
  check('userDetails.emailId')
    .isEmail().withMessage('must be an email')
    .trim(),

  check('userDetails.password', 'passwords must be 6 to 10 chars long')
    .isLength({ min: 6, max: 10 })
    .trim(),

  check('userDetails.name').exists()

], createHash, (req, res) => {

  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(responseObj(errors.mapped(), 'Server validation failed', 422, null));
    } else {
      let userDetails = req.body.userDetails;
      userDetails.password = req.hash;

      userDetails.emailId = userDetails.emailId.toLowerCase();
      let emailDomain = userDetails.emailId.split("@")[1];
      if(emailDomain == adminCred)
        userDetails.admin = true;
      else
        userDetails.admin = false;
      
      saveUser(userDetails)
        .then((user) => {
          res.json(responseObj(null, 'Sign up successful', 200, null));
        })
        .catch((error) => {
          res.status(400).json(responseObj(error, 'Sign up failed', 400, null));
        })
    }
})

// (2) - A
router.post('/credentials', passport.authenticate('local', {failureRedirect: '/auth/loginfail', session: false}), 
      (req, res) => {
        let token = generateJWT(req.user.getPayload());
        res.json(responseObj(null, 'Signed in', 200, token));
})

// (2) - B
router.get('/loginfail', (req, res) => {
  res.status(400).json(responseObj(null, 'Incorrect credentials', 400, null));
})


// (3) - A
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));


// (3) - B
router.get('/facebook/callback', passport.authenticate('facebook', { session: false,
                                                                     failureRedirect: '/auth/facebook/fail' }),
            (req,res) => {
              let otp = otp4SocialLogin();
              user = req.user;
              user.password = otp;
              user.save()
                .then(user => {
                  res.redirect('/social/callback/'+otp+user.emailId);
                })
                .catch(error => {
                  res.redirect('/');
                })             
          });


// (3) - C
router.get('/facebook/fail', (req,res) => {
  res.redirect('/');  
})

// (4) - A
router.get('/google',
  passport.authenticate('google', { scope: ['email'] }));

// (4) - B
router.get('/google/callback', passport.authenticate('google', { session: false,
                                                                 failureRedirect: '/auth/google/fail' }),

            (req,res) => {
              let otp = otp4SocialLogin();
              user = req.user;
              user.password = otp;
              user.save()
                .then(user => {
                  res.redirect('/social/callback/'+otp+user.emailId);
                })
                .catch(error => {
                  console.log(error);
                  res.redirect('/');
                }) 
          });


// (4) - C
router.get('/google/fail', (req,res) => {
  console.log('in google fail ',error);
  res.redirect('/'); 
})



module.exports = router;