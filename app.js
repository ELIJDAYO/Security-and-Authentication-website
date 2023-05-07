//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

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
const userSchema = {
  email: String,
  password: String,
};
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
