const { Error } = require('mongoose');
const Card = require('../models/card');

const {
  SUCCESS_STATUS,
  CREATED_STATUS,
} = require('../utils/constants');

const BadRequestError = require('../utils/errors/badRequestError');
const NotFoundError = require('../utils/errors/notFoundError');
const ForbiddenError = require('../utils/errors/forbiddenError');

const populateOptions = [
  { path: 'likes', select: ['name', 'about', 'avatar', '_id'] },
  { path: 'owner', select: ['name', 'about', 'avatar', '_id'] },
];

const formatCard = (card) => ({
  likes: card.likes.map((user) => ({
    name: user.name,
    about: user.about,
    avatar: user.avatar,
    _id: user._id,
  })),
  _id: card._id,
  name: card.title,
  link: card.link,
  owner: {
    name: card.owner.name,
    about: card.owner.about,
    avatar: card.owner.avatar,
    _id: card.owner._id,
  },
  createdAt: card.createdAt,
});

const getCards = (req, res, next) => {
  Card.find({})
    .populate(populateOptions)
    .then((cards) => res.status(SUCCESS_STATUS).send(cards.map(formatCard)))
    .catch((err) => next(err));
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ title: name, link, owner: req.user._id })
    .then((card) => res.status(CREATED_STATUS).send({
      name: card.name,
      link: card.link,
      _id: card._id,
    }))
    .catch((err) => {
      if (err instanceof Error.ValidationError) {
        return next(new BadRequestError('Переданы некорректные данные при создании карточки.'));
      }
      return next(err);
    });
};

const deleteCard = (req, res, next) => {
  const userId = req.user._id;
  Card.findById(req.params.cardId)
    .orFail()
    .then((card) => {
      if (card.owner._id.toString() !== userId) {
        throw new ForbiddenError('Нет прав для удаления карточки с указанным _id');
      }
      Card.deleteOne({ _id: req.params.cardId })
        .then(() => {
          res.status(SUCCESS_STATUS).send({ message: 'Пост удалён.' });
        });
    })
    .catch((err) => {
      if (err instanceof Error.CastError) {
        return next(new BadRequestError('Карточка с указанным _id не найдена.'));
      }
      if (err instanceof Error.DocumentNotFoundError) {
        return next(new NotFoundError('Передан несуществующий _id карточки.'));
      }
      return next(err);
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(NotFoundError).send({ message: 'Передан несуществующий id карточки.' });
      } else {
        res.send({ card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(BadRequestError).send({ message: 'Переданы некорректные данные для постановки лайка.' });
      } else {
        res.status(ForbiddenError).send({ message: err.message });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(NotFoundError).send({ message: 'Передан несуществующий id карточки.' });
      } else {
        res.send({ card });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(BadRequestError).send({ message: 'Переданы некорректные данные для снятии лайка.' });
      } else {
        res.status(ForbiddenError).send({ message: err.message });
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
