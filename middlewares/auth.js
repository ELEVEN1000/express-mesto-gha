const jwt = require('jsonwebtoken');

const config = require('../utils/config');
const UnauthorizedError = require('../utils/errors/unauthorizedError');

module.exports = (req, res, next) => {
  const token = req.cookies.jwtToken;
  let payload;

  try {
    payload = jwt.verify(token, config.jwtSecretKey);
  } catch (err) {
    const error = new UnauthorizedError('Необходима авторизация');
    return next(error);
  }

  req.user = payload;
  return next();
};
