const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const errors = require('./middlewares/errorHandler');

// подключаемся к серверу mongo
mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true,
  // useFindAndModify: false
});

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const app = express();

// теперь клиент имеет доступ только к публичным файлам
app.use(express.static(path.join(__dirname, 'public')));

// middleware для обработки данных в формате JSON
app.use(express.json());

app.use(cookieParser());

app.use(require('./routes/index'));

app.use(errors);

app.listen(PORT, () => {
});