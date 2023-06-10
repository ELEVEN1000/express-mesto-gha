const Card = require('../models/card');

const BadRequestError = require('../utils/errors/badRequestError');
const NotFoundError = require('../utils/errors/notFoundError');

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
    .then((cards) => res.status(200).send(cards.map(formatCard)))
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ title: name, link, owner: req.user._id })
    .then((card) => res.status(201).send({
      name: card.title,
      link: card.link,
      _id: card._id,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new BadRequestError(
            'Переданы некорректные данные при создании карточки',
          ),
        );
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
        throw new NotFoundError('Карточка с указанным _id не найдена');
      }
      Card.deleteOne({ _id: req.params.cardId })
        .then(() => {
          res.status(200).send({ message: 'Пост удалён.' });
        });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        return next(new BadRequestError('Карточка с указанным _id не найдена.'));
      }
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Передан несуществующий _id карточки.'));
      }
      return next(err);
    });
};

const updateCardLikes = (req, res, updateQuery, next) => {
  Card.findByIdAndUpdate(req.params.cardId, updateQuery, { new: true })
    .populate(populateOptions)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Передан несуществующий _id карточки.');
      }
      res.status(200).send(formatCard(card));
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        return next(new BadRequestError('Переданы некорректные данные для постановки/снятии лайка.'));
      }
      return next(err);
    });
};

const likeCard = (req, res, next) => {
  const updateQuery = { $addToSet: { likes: req.user._id } };
  updateCardLikes(req, res, updateQuery, next);
}

const dislikeCard = (req, res, next) => {
  const updateQuery = { $addToSet: { likes: req.user._id } };
  updateCardLikes(req, res, updateQuery, next);
}


module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
