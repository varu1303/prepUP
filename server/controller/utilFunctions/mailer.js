const nodemailer = require('nodemailer');
//
const {emailId, password} = require('./../../config/email-cred');

let transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  auth: {
      user: emailId, // Your email id
      pass: password // Your password
  }
});

module.exports = {
  
  sendPassMail: (email, newpass) => {
  
    return new Promise((resolve, reject) => {
        let text = `Your new password is : ${newpass}. You can change your password once you login!` 
        let mailOptions = {
                from: emailId, // sender address
                to: email, // list of receivers
                subject: 'New Password - MockUp!', // Subject line
                text: text 
            };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
                reject();

            }else{
                resolve({
                    email,
                    pass: newpass
                });
            }
        }); 
        
    });


  }
}