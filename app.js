// Credit to Sir Satnam udemy
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
// const ejs = require('ejs');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
// const SHA256 = require('crypto-js/sha256');
// const bcrypt = require('bcryptjs');
// const salt = bcrypt.genSaltSync(10);
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const findOrCreate = require('mongoose-findorcreate');
const passportLocalMongoose = require('passport-local-mongoose');
const port = 3000;

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'Our secret.',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//created a connection to mongodb
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/userDB');
}

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
  secret: String,
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//encryption using mongoose-encryption

// var secret = process.env.KEY;
//   userSchema.plugin(encrypt, {
//     secret: secret,
//     encryptedFields: ['password']

//   });

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(async function (id, done) {
  let err, user;
  try {
    user = await User.findById(id).exec();
  } catch (e) {
    err = e;
  }
  done(err, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/secrets',
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate(
        { username: profile.displayName, googleId: profile.id },
        function (err, user) {
          return cb(err, user);
        }
      );
    }
  )
);

app.route('/').get((req, res) => {
  res.render('home');
});
app
  .route('/login')
  .get((req, res) => {
    res.render('login');
  })
  .post(async (req, res) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });
    req.login(user, (err) => {
      if (err) {
        console.log(err);
        return;
      }
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secrets');
      });
    });
  });

app
  .route('/register')
  .get((req, res) => {
    res.render('register');
  })
  .post((req, res) => {
    User.register(
      { username: req.body.username },
      req.body.password,
      (err, user) => {
        if (err) {
          console.log(err);
          res.redirect('/register');
          return;
        }
        passport.authenticate('local')(req, res, () => {
          res.redirect('/secrets');
        });
      }
    );
  });

app
  .route('/auth/google')
  .get(passport.authenticate('google', { scope: ['profile'] }));

app
  .route('/auth/google/secrets')
  .get(
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => res.redirect('/secrets')
  );

app.route('/secrets').get(async (req, res) => {
  //                                    not equal to null
  const users = await User.find({ secret: { $ne: null } }).exec();
  res.render('secrets', { users: users });
});

app
  .route('/submit')
  .get((req, res) => {
    if (req.isAuthenticated()) {
      res.render('submit');
      return;
    }
    res.redirect('/login');
  })
  .post(async (req, res) => {
    if (req.isAuthenticated()) {
      const submittedSecret = req.body.secret;
      const user = await User.findById(req.user._id).exec();
      user.secret = submittedSecret;
      await user.save().then(() => res.redirect('/secrets'));
      return;
    }
    res.redirect('/login');
  });

app.route('/logout').get((req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

app.listen(3000 || process.env.PORT, () => {
  console.log('Server is running.');
});
