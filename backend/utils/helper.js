const crypto = require("crypto");

const sendError = (res, error, statusCode = 401) => {
  res.status(statusCode).send({ error });
};

const generateRandomBytes = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(30, (err, buff) => {
      if (err) reject(err);
      const bufferString = buff.toString("hex");

      resolve(bufferString);
    });
  });
};

module.exports = { sendError, generateRandomBytes };
