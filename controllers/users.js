const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const {
  SUCCESS_STATUS,
  CREATED_STATUS,
} = require('../utils/constants');

const {
  ConflictError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require('../utils/errors/');

const { Error } = require("mongoose");

const formatUserData = (user) => ({
  name: user.name,
  about: user.about,
  avatar: user.avatar,
  _id: user._id,
  email: user.email,
});

const getUserById = (req, res) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotFound'))
    .then((users) => res.send(users))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(BadRequestError).send({ message: 'Переданы некорректные данные' });
      } else if (err.message === 'NotFound') {
        res.status(NotFoundError).send({ message: 'Пользователь по указанному id не найден' });
      } else {
        res.status(NotFoundError).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

const createUser = (req, res) => {
  const { name, about, avatar, email, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))

  User.create({ name, about, avatar })
    .then((users) => res.status(CREATED_STATUS).send(users))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BadRequestError).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      } else {
        res.status(ConflictError).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError('Неверный email или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return next(new UnauthorizedError('Неверный email или пароль'));
          }
          const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
          return res.send(token);
        });
    })
    .catch(next);
};

const getUser = (req, res, next) => {
  User.find({})
    .then((users) => res.status(SUCCESS_STATUS).send(users.map((user) => formatUserData(user))))
    .catch((err) => next(err));
};

const getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.status(SUCCESS_STATUS).send(formatUserData(user)))
    .catch((err) => next(err));
}

const updateUser = (req, res, updateData, next) => {
  User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true })
    .then((user) => {
      res.status(SUCCESS_STATUS).send(formatUserData(user));
    })
    .catch((err) => {
      if (err instanceof Error.ValidationError) {
        return next(new BadRequestError('Переданы некорректные данные при обновлении пользователя.'));
      }
      return next(err);
    });
};

const updateUserAvatar = (req, res) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        res.status(NotFoundError).send({ message: 'Пользователь по указанному id не найден.' });
      } else {
        res.send({ user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BadRequestError).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
      } else {
        res.status(ConflictError).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports = {
  getUser,
  getUserById,
  createUser,
  updateUser,
  updateUserAvatar,
  login,
  getUserInfo,
};
