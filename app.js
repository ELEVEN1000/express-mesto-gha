const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');
const router = require('./routes/index');
const { login, createUser } = require('./controllers/users');
const { loginValidator, signupValidator } = require('./middlewares/validation');

const errorHandler = require('./middlewares/errorHandler');
const auth = require('./middlewares/auth');
const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

router.post('/signin', loginValidator, login);
router.post('/signup', signupValidator, createUser);

app.use(helmet());
app.use(router);
app.use(errors());
app.use(errorHandler);
app.use(auth);

app.listen(PORT);
