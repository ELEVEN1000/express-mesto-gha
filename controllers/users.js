const userModel = require('../models/user');

const getUserById = (req, res) => {
  userModel
    .findById(req.params.userId)
    .orFail(() => {
      throw new Error('Not found');
    })
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === ('CastError' || 'ValidationError')) {
        return res.status(400).send({
          message: `Некорректный id ${req.params.userId}`,
        });
      }
      if (err.name === 'NotValidId') {
        return res.status(400).send({
          message: `Некорректный id ${req.params.userId}`,
        });
      }
      if (err.name === 'NotFound') {
        return res.status(404).send({
          message: `Юзер не найден по указанному id ${req.params.userId}`,
        });
      }
      return res.status(500).send({message: `Произошла ошибка ${err.name}`});
    });
};

const createUser = (req, res) => {
  userModel
    .create(req.body)
    .then((user) => {
      res.status(201).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({
          message: `Переданы некорректные данные с ошибкой ${err.name}`,
        });
      } else {
        res.status(500).send({message: `Произошла ошибка ${err.name}`});
      }
    });
};

const getUser = (req, res) => {
  userModel
    .find({})
    .then((users) => {
      res.send({ data: users });
    })
    .catch((err) => res.status(500).send({message: `Произошла ошибка ${err.name}`}));
};

const updateUser = (req, res) => {
  userModel
    .create(req.body)
    .findByIdAndUpdate(
      req.user._id,
      {new: true, runValidators: true},
    )
    .then((users) => res.send({ data: users }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({
          message: `Переданы некорректные данные с ошибкой ${err.name}`,
        });
      }
      if (err.name === 'CastError') {
        res.status(404).send({
          message: `Юзер не найден по указанному id ${req.params.userId}`,
        });
      } else {
        res.status(500).send({message: `Произошла ошибка ${err.name}`});
      }
    });
};

const updateUserAvatar = (req, res) => {
  userModel
    .create(req.body)
    .findByIdAndUpdate(
      req.user._id,
      {new: true, runValidators: true},
    )
    .then((user) => res.send({ data: user }))
    .catch((err) => res.status(500).send({message: `Произошла ошибка ${err.name}`}));
};

module.exports = {
  getUserById,
  getUser,
  createUser,
  updateUser,
  updateUserAvatar,
};
