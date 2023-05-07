//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

// set templating engine
app.set('view engine', 'ejs');
// to parse the request
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// use public folder to store static file like css and img
app.use(express.static('public'));

mongoose.connect('mongodb://127.0.0.1:27017/udemyUserDB', {
  useNewUrlParser: true,
});
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ['password'],
});

const User = new mongoose.model('User', userSchema);

//TODO
app.get('/', function (req, res) {
  res.render('home');
});
app.get('/login', function (req, res) {
  res.render('login');
});
app.get('/register', function (req, res) {
  res.render('register');
});
app.post('/register', function (req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });
  newUser
    //   activate mongoose encrypt
    .save()
    .then((result) => {
      console.log(result);
      res.render('secrets');
    })
    .catch((err) => {
      console.log(err);
    });
});
app.post('/login', (req, res) => {
  const username = req.body.username;
  const pass = req.body.password;
  // activate mongoose decrypt
  User.findOne({ email: username }).then((foundUser) => {
    if (foundUser) {
      if (foundUser.password == pass) {
        res.render('secrets');
      } else {
        res.send('wrong password');
      }
    } else {
      res.send('user not found');
    }
  });
});
app.listen(3000, function () {
  console.log('Server started on port 3000');
});
