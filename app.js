const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const errors = require('./middlewares/errorHandler');

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const { PORT = 3000 } = process.env;

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(require('./routes/index'));

app.use(errors);

app.listen(PORT, () => {
});
