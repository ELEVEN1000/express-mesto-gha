const mongoose = require('mongoose');
const { Error } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const config = require('../utils/config');
const BadRequestError = require('../utils/errors/badRequestError');
const ConflictError = require('../utils/errors/conflictError');
const NotFoundError = require('../utils/errors/notFoundError');
const UnauthorizedError = require('../utils/errors/unauthorizedError');

const {
  SUCCESS_STATUS,
  CREATED_STATUS,
} = require('../utils/constants');

const formatUserData = (user) => ({
  name: user.name,
  about: user.about,
  avatar: user.avatar,
  _id: user._id,
  email: user.email,
});

const getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => {
      res.status(SUCCESS_STATUS).send(formatUserData(user));
    })
    .catch((err) => {
      if (err instanceof Error.CastError) {
        return next(new BadRequestError('Пользователь по указанному _id не найден.'));
      }
      if (err instanceof Error.DocumentNotFoundError) {
        return next(new NotFoundError('Пользователь с таким id не найден'));
      }
      return next(err);
    });
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    })
      .then((user) => res.status(CREATED_STATUS).send(formatUserData(user)))
      .catch((err) => {
        if (err instanceof Error.ValidationError) {
          return next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
        }
        if (err.code === 11000) {
          return next(new ConflictError('Пользователь с таким email уже зарегистрирован'));
        }
        return next(err);
      })
      .catch(next));
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .select('+password')
    .orFail()
    .then((user) => bcrypt.compare(password, user.password).then((match) => {
      if (match) {
        const token = jwt.sign({ _id: user._id }, config.jwtSecretKey, {
          expiresIn: '7d',
        });
        res.cookie('jwtToken', token, {
          maxAge: 3600,
          httpOnly: true,
        });
        return res.send({ jwtToken: token });
      }
      throw new UnauthorizedError('Переданы неверные email или пароль');
    }))
    .catch((err) => {
      if (err instanceof Error.DocumentNotFoundError) {
        return next(new UnauthorizedError('Переданы неверные email или пароль'));
      }
      return next(err);
    });
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(SUCCESS_STATUS).send(users.map((user) => formatUserData(user))))
    .catch(next);
};

const getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному _id не найден');
    })
    .then((user) => res.status(SUCCESS_STATUS).send(formatUserData(user)))
    .catch(next);
};

const updateUser = (req, res, updateData, next) => {
  User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      res.status(SUCCESS_STATUS).send(formatUserData(user));
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError('Переданы некорректные данные при обновлении пользователя.'));
      }
      return next(err);
    });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  updateUser(req, res, { avatar });
};

const updateProfile = (req, res) => {
  const { name, about } = req.body;
  updateUser(req, res, { name, about });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  login,
  getUserInfo,
  updateAvatar,
  updateProfile,
};
