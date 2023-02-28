const { check, validationResult } = require("express-validator");

const userValidator = [
  check("name").trim().not().isEmpty().withMessage("Name is missing"),
  check("email").normalizeEmail().isEmail().withMessage("Email is invalid"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is missing")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

const validate = async (req, res, next) => {
  const errors = validationResult(req).array();
  if (errors.length) {
    return res.status(401).send({ error: errors.map((err) => err.msg) });
  }
  next();
};

module.exports = { userValidator, validate };
