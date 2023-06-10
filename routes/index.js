const router = require('express').Router();
const userRouter = require('./users');
const cardRouter = require('./cards');
const NotFoundError = require("../utils/errors/notFoundError");

router.use('/users', userRouter);
router.use('/cards', cardRouter);

router.use((req, res, next) => next(new NotFoundError('Маршрут не найден')));

module.exports = router;
