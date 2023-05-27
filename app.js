const express = require('express');
const { PORT = 3000 } = process.env;
const app = express();
const router = require('./routes');
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(express.json());
app.use(router);

app.listen(PORT);