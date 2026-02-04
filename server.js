// server.js
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

// -------------------- Validate environment variables --------------------
const requiredEnvVars = ['MONGO_URI', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'SESSION_SECRET'];
if (process.env.NODE_ENV === 'production') requiredEnvVars.push('CALLBACK_URL');

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// -------------------- Middleware --------------------
app.use(express.json());

// CORS configuration (allow cookies)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // allow cookies to be sent
  optionsSuccessStatus: 200
}));

// Session configuration
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

app.use(passport.initialize());
app.use(passport.session());

// Basic headers for older clients
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, PATCH, OPTIONS, DELETE");
  next();
});

// -------------------- Passport GitHub OAuth --------------------
const callbackURL = process.env.CALLBACK_URL || 'http://localhost:5000/github/callback';
if (!callbackURL.startsWith('https://') && process.env.NODE_ENV === 'production') {
  console.error('CALLBACK_URL must be HTTPS in production. Current:', callbackURL);
  process.exit(1);
}

passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL,
    proxy: true
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile); // store GitHub profile
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// -------------------- Routes --------------------
app.use('/', require('./routes/index'));           // login/logout/welcome routes
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  swaggerOptions: { withCredentials: true } // send cookies
}));

// -------------------- Root and welcome --------------------
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the Student API!</h1>
    <p><a href="/login">Login with GitHub</a></p>
  `);
});

app.get('/welcome', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');

  res.send(`
    <h1>Hello, ${req.user.username || 'User'}</h1>
    <p><a href="/api-docs">Go to API Docs</a></p>
    <a href="/logout">Logout</a>
  `);
});

// -------------------- Error handling --------------------
const { notFoundHandler, errorHandler } = require('./middleware/Validate');
app.use(notFoundHandler);
app.use(errorHandler);

// -------------------- Unhandled promise / exception handling --------------------
process.on('unhandledRejection', err => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// -------------------- MongoDB connection --------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000} in ${process.env.NODE_ENV} mode`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
