const cardModel = require('../models/card')

const getCards = (req, res) => {
  cardModel
    .find({})
    .then((cards) => {
      res.send(cards);
    })
    .catch((err) =>
      res.status(500).send({ message: `Произошла ошибка ${err.name}` })
    );
}

const createCard = (req, res) => {
  cardModel
    .create({owner: req.user._id, ...req.body})
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((err) => {
      if (err.message === 'ValidationError') {
        res.status(400).send({
          message: `Переданы некорректные данные с ошибкой ${err.name}`,
        });
      } else {
        res.status(500).send({ message: `Произошла ошибка ${err.name}` });
      }
    })
}

const deleteCard = (req, res) => {
  cardModel
    .findById(req.params.cardId)
    .then((card) => {
      res.status(201).send(card);
      cardModel.findByIdAndRemove(req.params.cardId)
        .orFail(() => {
          throw new Error('NotFound');
        })
        .then(() => res.send({ message: 'Карточка удалена' }));
    })
    .catch((err) => {
      if (err.name === "NotFound") {
        res.status(404).send({
          message: `Карточка не найдена ${err.name}`,
        });
      } else {
        res.status(500).send({ message: `Произошла ошибка ${err.name}` });
      }
    });
};

const likeCard = (req, res) => {
  cardModel.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => {
      throw new Error('NotFound');
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(404).send({
          message: `Карточка не найдена`,
        });
      } else {
        res.status(500).send({ message: `Произошла ошибка ${err.name}` });
      }
    });
};

const dislikeCard = (req, res) => {
  cardModel.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => {
      throw new Error('NotFound');
    })
    .then((card) => res.send({ data: card }))
    .catch((err) =>
      res.status(500).send({ message: `Произошла ошибка ${err.name}` })
    );
};

module.exports ={
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard
}