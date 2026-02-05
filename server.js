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

// Trust proxy - Required for Render and other cloud platforms
// This ensures Express correctly identifies HTTPS requests behind the proxy
app.set('trust proxy', 1);

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'SESSION_SECRET'];
// In production (e.g. Render), CALLBACK_URL must be set to the full HTTPS callback URL
if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.push('CALLBACK_URL');
}
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

  // Callback URL: must be full HTTPS URL in production (e.g. Render)
  const callbackURL = (process.env.CALLBACK_URL || 'http://localhost:5000/github/callback').trim();
  if (!callbackURL.startsWith('https://') && process.env.NODE_ENV === 'production') {
    console.error('CALLBACK_URL must be an HTTPS URL in production. Current value:', callbackURL || '(empty)');
    process.exit(1);
  }
  console.log('GitHub OAuth Callback URL:', callbackURL);

  passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: callbackURL,
    proxy: true  // Trust X-Forwarded-Proto so redirect_uri uses https behind Render
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
  res.send(`
    <h1>Welcome to the Student API!</h1>
    <p><a href="/login">Login with GitHub</a></p>
  `);
});

// Welcome route shown after successful GitHub login
app.get('/welcome', (req, res) => {
  // Require the user to be logged in
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Hello User</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          background: #f5f7fb;
        }
        .container {
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          padding: 40px;
          text-align: center;
          max-width: 480px;
        }
        h1 {
          margin-bottom: 16px;
          font-size: 32px;
        }
        a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
        }
        a:hover {
          text-decoration: underline;
        }
        .logout {
          margin-top: 16px;
          display: block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Hello User</h1>
        <p><a href="/api-docs">Go to API Docs</a></p>
        <a class="logout" href="/logout">Logout</a>
      </div>
    </body>
    </html>
  `);
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
