const jwt = require('jsonwebtoken');

const UnauthorizedError = require('../utils/errors/unauthorizedError');
const { config } = require('../utils/config');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  const bearer = 'Bearer ';

  if (!authorization || !authorization.startsWith(bearer)) {
    throw new UnauthorizedError('Необходима авторизация');
  }

  const token = authorization.replace(bearer, '');
  let payload;

  try {
    payload = jwt.verify(token, config);
  } catch (err) {
    throw new UnauthorizedError('Необходима авторизация');
  }

  req.user = payload;
  next();
};
