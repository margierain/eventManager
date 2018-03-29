const sgMail = require('@sendgrid/mail');
const config = require('config');

sgMail.setApiKey(config.SENDGRID_API_KEY);

function sendEmail(sendToEmail, emailSubject, textFormat, htmlFormat) {
  const msg = {
    to: sendToEmail,
    from: 'test@example.com',
    subject: emailSubject,
    text: textFormat,
    html: htmlFormat,
  };
  sgMail.send(msg);
}



module.exports = { sendEmail };