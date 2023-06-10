const router = require('express').Router();
const userRouter = require('./users');
const cardRouter = require('./cards');
const { ERROR_CODE_NOT_FOUND } = require('../utils/constants');
const { login, createUser } = require('../controllers/users');
const { loginValidator, signupValidator } = require('../middlewares/validation');

router.post('/signin', loginValidator, login);
router.post('/signup', signupValidator, createUser);

router.use('/users', userRouter);
router.use('/cards', cardRouter);

router.use('*', (req, res) => {
  res.status(ERROR_CODE_NOT_FOUND).send({ message: `Страницы по адресу ${req.baseUrl} не существует` });
});

module.exports = router;
