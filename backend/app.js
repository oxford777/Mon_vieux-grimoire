require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const userRoutes = require('./routes/user');
const booksRoutes = require('./routes/books');
const path = require('path');

const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.log('Connexion à MongoDB échouée !', error));

app.use(express.json());

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/auth', userRoutes);
app.use('/api/books', booksRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;