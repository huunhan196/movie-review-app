const nodemailer = require("nodemailer");

const generateOTP = (otp_length = 6) => {
  let OTP = "";
  for (let i = 0; i < otp_length; i++) {
    OTP += Math.floor(Math.random() * 9);
  }
  return OTP;
};

const generateMailTransporter = () =>
  nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "ac1241f25f17e6",
      pass: "f8cf6d89218ed8",
    },
  });

module.exports = { generateOTP, generateMailTransporter };
