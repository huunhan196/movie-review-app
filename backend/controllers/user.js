const User = require("../models/User");
const EmailVerificationToken = require("../models/EmailVerificationToken");
const nodemailer = require("nodemailer");
const { isValidObjectId } = require("mongoose");
const { generateOTP, generateMailTransporter } = require("../utils/mail");
const sendError = require("../utils/helper");

const create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });

  if (oldUser) return sendError(res, "This email is already in use!");

  const newUser = new User({ name, email, password });
  await newUser.save();

  let OTP = generateOTP();

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@reviewapp.com",
    to: newUser.email,
    subject: "Email Verification",
    html: `<p>Your Verification OTP</p>
    <h1>${OTP}</h1>
    `,
  });

  res.status(201).send({
    message:
      "Please verify your email. OTP has been sent to your email account!",
  });
};

const verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;
  if (!isValidObjectId(userId)) return sendError(res, "Invalid user");

  const user = await User.findById(userId);
  if (!user) return sendError(res, "User not found", 404);

  if (user.isVerified) return res.send({ error: "User is already verified" });
  const token = await EmailVerificationToken.findOne({ owner: userId });
  if (!token) return sendError(res, "Token not found");

  const isMatched = await token.compareTokens(OTP);
  if (!isMatched) return sendError(res, "Please submit a valid OTP");

  user.isVerified = true;
  await user.save();

  await EmailVerificationToken.findByIdAndDelete(token._id);

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@reviewapp.com",
    to: user.email,
    subject: "Welcome Email",
    html: "<h1>Welcome to our app. Thanks for choosing us!</h1>",
  });

  res.status(201).send({ "message": "Your email is successfully verified." });
};

const resendVerificationEmail = async function (req, res) {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.send({ error: "No user found" });

  if (user.isVerified) return sendError(res, "User is already verified");
  const alreadyHasToken = await EmailVerificationToken.findOne({
    owner: userId,
  });
  if (alreadyHasToken)
    return sendError(
      res,
      "Only after 1 hour can you request for another token."
    );

  let OTP = generateOTP();

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@reviewapp.com",
    to: user.email,
    subject: "Email Verification",
    html: `<p>Your Verification OTP</p>
    <h1>${OTP}</h1>
    `,
  });

  res
    .status(201)
    .send({ "message": "New OTP has been sent to your email account!" });
};

module.exports = { create, verifyEmail, resendVerificationEmail };
