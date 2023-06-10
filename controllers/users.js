const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const config = require('../utils/config');
const BadRequestError = require('../utils/errors/badRequestError');
const ConflictError = require('../utils/errors/conflictError');
const NotFoundError = require('../utils/errors/notFoundError');

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
    }))
    .then((user) => res.status(201).send({
      _id: user._id,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new BadRequestError(
            'Переданы некорректные данные при создании пользователя',
          ),
        );
      }
      if (err.code === 11000) {
        return next(new ConflictError('Пользователь с таким email уже существует'));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, config, {
        expiresIn: '7d',
      });
      res.send({ _id: token });
    })
    .catch(next);
};


const getUser = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

const getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному _id не найден');
    })
    .then((user) => res.send({ data: user }))
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, about, avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, avatar ? { avatar } : { name, about }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному _id не найден');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new BadRequestError(
            'Переданы некорректные данные при обновлении данных профиля пользователя',
          ),
        );
      }
      return next(err);
    });
};

module.exports = {
  getUser,
  getUserById,
  createUser,
  updateUser,
  login,
  getUserInfo,
};
