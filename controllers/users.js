const User = require('../models/user');
const {
  ERROR_CODE_BAD_REQUEST,
  ERROR_CODE_INTERNAL,
  ERROR_CODE_NOT_FOUND,
  STATUS_CODES_CREATED,
} = require('../utils/constants');

const getUserById = (req, res) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotFound'))
    .then((users) => res.send(users))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      } else if (err.message === 'NotFound') {
        res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Пользователь по указанному id не найден' });
      } else {
        res.status(ERROR_CODE_INTERNAL).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((users) => res.status(STATUS_CODES_CREATED).send(users))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      } else {
        res.status(ERROR_CODE_INTERNAL).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

const getUser = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(() => res.status(ERROR_CODE_INTERNAL).send({ message: 'На сервере произошла ошибка' }));
};

const updateUser = (req, res) => {
  const userId = req.user._id;
  const { name, about } = req.body;
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Пользователь по указанному id не найден.' });
      } else {
        res.send({ user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
      } else {
        res.status(ERROR_CODE_INTERNAL).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

const updateUserAvatar = (req, res) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Пользователь по указанному id не найден.' });
      } else {
        res.send({ user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
      } else {
        res.status(ERROR_CODE_INTERNAL).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports = {
  getUser,
  getUserById,
  createUser,
  updateUser,
  updateUserAvatar,
};
