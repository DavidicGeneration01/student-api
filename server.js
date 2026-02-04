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

/* -------------------- TRUST PROXY (RENDER) -------------------- */
app.set('trust proxy', 1);

/* -------------------- ENV VALIDATION -------------------- */
const requiredEnvVars = [
  'MONGO_URI',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'SESSION_SECRET'
];

if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.push('CALLBACK_URL');
}

const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnvVars.length) {
  console.error('Missing required env vars:', missingEnvVars.join(', '));
  process.exit(1);
}

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json());

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : true,
  credentials: true
}));

/* -------------------- SESSION -------------------- */
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));

/* -------------------- PASSPORT -------------------- */
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const callbackURL =
  (process.env.CALLBACK_URL || 'http://localhost:5000/github/callback').trim();

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL,
      proxy: true
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

/* -------------------- AUTH ROUTES (🔥 MISSING BEFORE) -------------------- */

// Login page
app.get('/login', (req, res) => {
  res.send(`<a href="/auth/github">Login with GitHub</a>`);
});

// Start GitHub OAuth
app.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

// GitHub callback
app.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login'
  }),
  (req, res) => {
    res.redirect('/welcome');
  }
);

// Logout
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

/* -------------------- APP ROUTES -------------------- */
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/* -------------------- ROOT -------------------- */
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the Student API!</h1>
    <p><a href="/login">Login with GitHub</a></p>
  `);
});

/* -------------------- PROTECTED PAGE -------------------- */
app.get('/welcome', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  res.send(`
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Hello ${req.user.username} 👋</h1>
        <p><a href="/api-docs">Go to API Docs</a></p>
        <p><a href="/logout">Logout</a></p>
      </body>
    </html>
  `);
});

/* -------------------- ERRORS -------------------- */
const { notFoundHandler, errorHandler } = require('./middleware/Validate');
app.use(notFoundHandler);
app.use(errorHandler);

/* -------------------- DB + SERVER -------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
