const router = require('express').Router();
const userRouter = require('./users');
const cardRouter = require('./cards');
const NotFoundError = require('../utils/errors/notFoundError');
const { login, createUser } = require('../controllers/users');
const { loginValidator, signupValidator } = require('../middlewares/validation');
const auth = require('../middlewares/auth');

router.post('/signin', loginValidator, login);
router.post('/signup', signupValidator, createUser);

router.use(auth);

router.use('/users', userRouter);
router.use('/cards', cardRouter);

router.use('*', (req, res, next) => next(new NotFoundError('Ресурс не найден')));

module.exports = router;
