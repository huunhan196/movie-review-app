const express = require("express");
const {
  create,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  sendResetPasswordTokenStatus,
  resetPassword,
} = require("../controllers/user");
const isValidPassResetToken = require("../middlewares/user");
const {
  userValidator,
  validate,
  passwordValidator,
} = require("../middlewares/validator");
// const auth = require("../middlewares/auth");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("<h1>Hello Worldsad!</h1>");
});

router.post("/create", userValidator, validate, create);
router.post("/verify-email", verifyEmail);
router.post("/resend-email-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post(
  "/verify-pass-reset-token",
  isValidPassResetToken,
  sendResetPasswordTokenStatus
);
router.post(
  "/reset-password",
  passwordValidator,
  validate,
  isValidPassResetToken,
  resetPassword
);

module.exports = router;
