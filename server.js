const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const passport = require('passport');
const session = require('express-session');
const GithubStrategy = require('passport-github2').Strategy;
const cors = require('cors');

dotenv.config();
const app = express();

/* ========== TRUST PROXY ========== */
app.set('trust proxy', 1);

/* ========== CORS & BODY ========== */
app.use(express.json());
app.use(cors({
  origin: 'https://student-api-9llg.onrender.com',
  credentials: true
}));

/* ========== SESSION ========== */
app.use(session({
  name: 'connect.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

/* ========== PASSPORT ========== */
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GithubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    proxy: true
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

/* ========== AUTH MIDDLEWARE ========== */
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

/* ========== ROUTES ========== */
app.use('/', require('./routes/index'));
app.use('/api/students', ensureAuthenticated, require('./routes/studentRoutes'));
app.use('/api/courses', ensureAuthenticated, require('./routes/courseRoutes'));
app.use('/api-docs', ensureAuthenticated, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/* ========== ROOT ========== */
app.get('/', (req, res) => {
  res.redirect('/login');
});

/* ========== DATABASE & SERVER ========== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    console.log('GitHub CALLBACK_URL =', process.env.CALLBACK_URL);
    app.listen(process.env.PORT || 5000, () => console.log('Server running'));
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
