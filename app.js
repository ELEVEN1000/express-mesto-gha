const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const router = require('./routes');
const auth = require('./middlewares/auth');
const errors = require('./middlewares/errors');
const { loginValidator, signupValidator } = require('./middlewares/validation');
const { login, createUser } = require('./controllers/users');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

router.post('/signin', loginValidator, login);
router.post('/signup', signupValidator, createUser);

const { PORT = 3000 } = process.env;

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(errors);
app.use(helmet());
app.use(auth);
app.use(router);
app.use(require('./routes/index'));

app.listen(PORT, () => {
});
