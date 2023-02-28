const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const emailVerificationSchema = mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  createdAt: {
    type: Date,
    expires: 3600,
    default: Date.now(),
  },
});

emailVerificationSchema.pre("save", async function (next) {
  const emailVerification = this;

  if (emailVerification.isModified("token")) {
    emailVerification.token = await bcrypt.hash(emailVerification.token, 8);
  }

  next();
});

const EmailVerificationToken = mongoose.model(
  "EmailVerificationToken",
  emailVerificationSchema
);

module.exports = EmailVerificationToken;
