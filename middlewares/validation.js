const { celebrate, Joi, Segments } = require('celebrate');

const urlRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/;

const loginValidator = celebrate({
  [Segments.BODY]: {
    email: Joi.string().required().email(),
    password: Joi.string().required().min(2),
  },
});

const signupValidator = celebrate({
  [Segments.BODY]: {
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(urlRegex),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(2),
  },
});

const getUserByIdValidator = celebrate({
  [Segments.PARAMS]: {
    userId: Joi.string().required().hex().length(24),
  },
});

const updateProfileValidator = celebrate({
  [Segments.BODY]: {
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  },
});

const updateAvatarValidator = celebrate({
  [Segments.BODY]: {
    avatar: Joi.string().required().regex(urlRegex),
  },
});

const createCardValidator = celebrate({
  [Segments.BODY]: {
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().regex(urlRegex),
  },
});

const inputIdCardValidator = celebrate({
  [Segments.PARAMS]: {
    cardId: Joi.string().required().hex().length(24),
  },
});

module.exports = {
  loginValidator,
  signupValidator,
  getUserByIdValidator,
  updateProfileValidator,
  updateAvatarValidator,
  createCardValidator,
  inputIdCardValidator,
};
