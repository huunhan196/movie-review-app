const User = require("../models/User");

const create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });

  if (oldUser)
    return res.status(401).json({ error: "This email is already in use!" });

  const newUser = new User({ name, email, password });
  await newUser.save();

  //   var transport = nodemailer.createTransport({
  //     host: "sandbox.smtp.mailtrap.io",
  //     port: 2525,
  //     auth: {
  //       user: "ac1241f25f17e6",
  //       pass: "f8cf6d89218ed8"
  //     }
  //   });

  res.status(201).send({ user: newUser });
};

module.exports = { create };
