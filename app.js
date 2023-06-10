const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const router = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(router);
app.use(errorHandler);

app.listen(PORT);

// Я ненавижу бэкенд
