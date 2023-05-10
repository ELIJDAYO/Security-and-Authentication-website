//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

main().catch((err) => console.log('err'));

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

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/userDB');
}
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
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
  bcrypt.hash(req.body.password, saltRounds).then(function (hash) {
    // Store hash in your password DB.
    const newUser = new User({
      email: req.body.username,
      password: hash,
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
});
app.post('/login', (req, res) => {
  const username = req.body.username;
  const pass = req.body.password;
  // activate mongoose decrypt
  User.findOne({ email: username }).then((foundUser) => {
    if (foundUser) {
      // Load hash from your password DB.
      bcrypt
        .compare(req.body.password, foundUser.password)
        .then(function (result) {
          if (result == true) {
            res.render('secrets');
          }
        })
        .catch(function (e) {
          console.log(e);
        });
    } else {
      res.send('user not found');
    }
  });
});
app.listen(3000, function () {
  console.log('Server started on port 3000');
});
