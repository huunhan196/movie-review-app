const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const passwordResetTokenSchema = mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  createdAt: {
    type: Date,
    expires: 3600,
    default: Date.now(),
  },
});

passwordResetTokenSchema.pre("save", async function (next) {
  const passwordResetToken = this;

  if (passwordResetToken.isModified("token")) {
    passwordResetToken.token = await bcrypt.hash(passwordResetToken.token, 8);
  }

  next();
});

passwordResetTokenSchema.methods.compareTokens = async function (token) {
  const emailVerification = this;
  const result = await bcrypt.compare(token, emailVerification.token);
  return result;
};

const PasswordResetToken = mongoose.model(
  "PasswordResetToken",
  passwordResetTokenSchema
);

module.exports = PasswordResetToken;
