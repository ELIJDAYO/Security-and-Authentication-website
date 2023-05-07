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
// use public golder to store static file like css and img
app.use(express.static('public'));

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

app.listen(3000, function () {
  console.log('Server started on port 3000');
});
