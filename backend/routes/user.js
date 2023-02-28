const express = require("express");
const { create } = require("../controllers/user");
const { userValidator, validate } = require("../middlewares/validator");
// const auth = require("../middlewares/auth");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("<h1>Hello Worldsad!</h1>");
});

router.post("/create", userValidator, validate, create);

module.exports = router;
