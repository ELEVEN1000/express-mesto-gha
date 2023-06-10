const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const helmet = require('helmet');
const router = require('./routes/index');
const { login, createUser } = require('./controllers/users');
const { loginValidator, signupValidator } = require('./middlewares/validation');

const { PORT = 3000 } = process.env;
const errorHandler = require('./middlewares/errorHandler');
const auth = require('./middlewares/auth');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

router.post('/signin', loginValidator, login);
router.post('/signup', signupValidator, createUser);

app.use(errorHandler);
app.use(helmet());
app.use(auth);
app.use(router);
app.use(errors());

app.listen(PORT, () => {
});
