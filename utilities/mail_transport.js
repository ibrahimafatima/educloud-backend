const nodemailer = require("nodemailer");
const config = require('config');

module.exports = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'edukloud@gmail.com',
      pass: config.get("mail_password")
    }
  });
