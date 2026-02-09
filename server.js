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

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'SESSION_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Use JSON body parsing and CORS
app.use(express.json());
// Configure CORS - allow specific origins or all for development
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Session and passport
app.use(session({ 
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Basic CORS headers for older clients
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, PATCH, OPTIONS, DELETE"
  );
  next();
});

  passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {  
    //user.findOrCreate({ githubId: profile.id }, function (err, user) {
      return done(null, profile);
    //}
  }
  ));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

// Routes
app.use('/', require('./routes/index'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root route (friendly message)
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`
      <h1>Welcome ${req.user.displayName}!</h1>
      <p>You are logged in as ${req.user.username}</p>
      <a href="/logout">Logout</a> | <a href="/api-docs">API Docs</a>
    `);
  } else {
    res.send(`
      <h1>Welcome to the Student API!</h1>
      <p><a href="/login">Login with GitHub</a></p>
      <p>Use <a href="/api-docs">/api-docs</a> to access Swagger UI.</p>
    `);
  }
});

// 404 Not Found handler
const { notFoundHandler, errorHandler } = require('./middleware/Validate');
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Gracefully shutdown on unhandled rejection
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000} in ${process.env.NODE_ENV} mode`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
