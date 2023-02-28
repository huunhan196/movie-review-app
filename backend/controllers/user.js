const User = require("../models/User");
const EmailVerificationToken = require("../models/emailVerificationToken");
const PasswordResetToken = require("../models/passwordResetToken");
const crypto = require("crypto"); //default npm package in nodejs
const { isValidObjectId } = require("mongoose");
const { generateOTP, generateMailTransporter } = require("../utils/mail");
const { sendError, generateRandomBytes } = require("../utils/helper");

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

  const transport = generateMailTransporter();

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

  const transport = generateMailTransporter();

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

  const transport = generateMailTransporter();

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

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return sendError(res, "Email is missing");

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "User not found", 404);

  const alreadyHasToken = await PasswordResetToken.findOne({
    owner: user._id,
  });
  if (alreadyHasToken)
    return sendError(
      res,
      "Only after 1 hour can you request for another token."
    );

  const token = await generateRandomBytes();
  const newPasswordResetToken = new PasswordResetToken({
    owner: user._id,
    token: token,
  });
  await newPasswordResetToken.save();

  const resetPasswordUrl = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;

  const transport = generateMailTransporter();

  transport.sendMail({
    from: "security@reviewapp.com",
    to: user.email,
    subject: "Reset Password Link",
    html: `<p>Click here to reset password</p>
    <a href='${resetPasswordUrl}'>Change Password</a>
    `,
  });

  res.send({ message: "Link sent to your email." });
};

const sendResetPasswordTokenStatus = (req, res) => {
  res.send({ valid: true });
};

const resetPassword = async (req, res) => {
  const { password, userId } = req.body;

  const user = await User.findById(userId);
  const matched = await user.comparePassword(password);
  if (matched)
    return sendError(
      res,
      "New password must not be the same as the old password"
    );

  user.password = password;
  await user.save();

  await PasswordResetToken.findByIdAndDelete(req.resetToken._id);

  const transport = generateMailTransporter();

  transport.sendMail({
    from: "security@reviewapp.com",
    to: user.email,
    subject: "Password Reset Successfully",
    html: `<h1>Password Reset Successfully</h1>
    <p>Now you can use new password.</p>
    `,
  });

  res.send({ message: "Password Reset Successfully" });
};

module.exports = {
  create,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  sendResetPasswordTokenStatus,
  resetPassword,
};
