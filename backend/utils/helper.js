const sendError = (res, error, statusCode = 401) => {
  res.status(statusCode).send({ error });
};

module.exports = sendError;
