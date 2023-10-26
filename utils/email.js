const nodemailer = require('nodemailer');

const sendEmail = async (option) => {
    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const emailOption = {
        from: "Collaboration support<support@collaboration.com>",
        to: option.email,
        subject: option.subject,
        text: option.message
      }
      await transport.sendMail(emailOption);
}

module.exports = sendEmail;