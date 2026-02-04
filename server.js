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

/* --------------------------------------------------
   TRUST PROXY (REQUIRED FOR RENDER / HTTPS)
--------------------------------------------------- */
app.set('trust proxy', 1);

/* --------------------------------------------------
   ENV VALIDATION
--------------------------------------------------- */
const requiredEnv = [
  'MONGO_URI',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'SESSION_SECRET',
];

if (process.env.NODE_ENV === 'production') {
  requiredEnv.push('CALLBACK_URL');
}

const missing = requiredEnv.filter(v => !process.env[v]);
if (missing.length) {
  console.error('Missing environment variables:', missing);
  process.exit(1);
}

/* --------------------------------------------------
   MIDDLEWARE
--------------------------------------------------- */
app.use(express.json());

const allowedOrigins = [
  'https://student-api-9llg.onrender.com',
  'http://localhost:5000',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}));

app.use(passport.initialize());
app.use(passport.session());

/* --------------------------------------------------
   PASSPORT CONFIG
--------------------------------------------------- */
const callbackURL =
  process.env.NODE_ENV === 'production'
    ? process.env.CALLBACK_URL
    : 'http://localhost:5000/github/callback';

console.log('GitHub OAuth callback URL:', callbackURL);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL,
      proxy: true,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

/* --------------------------------------------------
   AUTH GUARD
--------------------------------------------------- */
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

/* --------------------------------------------------
   ROUTES
--------------------------------------------------- */

// Home
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the Student API</h1>
    <a href="/login">Login with GitHub</a>
  `);
});

// Login
app.get(
  '/login',
  passport.authenticate('github', { scope: ['user:email'] })
);

// GitHub Callback
app.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/api-docs');
  }
);

// Logout
app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
});

// Health check (Render friendly)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/* --------------------------------------------------
   PROTECTED SWAGGER
--------------------------------------------------- */
app.use(
  '/api-docs',
  ensureAuth,
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

/* --------------------------------------------------
   API ROUTES
--------------------------------------------------- */
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));

/* --------------------------------------------------
   ERROR HANDLING
--------------------------------------------------- */
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* --------------------------------------------------
   DATABASE + SERVER
--------------------------------------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
