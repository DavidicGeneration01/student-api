const express = require("express");
const passport = require("passport");
const router = express.Router();

// Login page - serve HTML with GitHub OAuth button
router.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - Authorize College</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }
        .container {
          background: white;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          padding: 40px;
          text-align: center;
          max-width: 400px;
        }
        .logo {
          font-size: 48px;
          margin-bottom: 20px;
        }
        h1 {
          color: #333;
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        .subtitle {
          color: #666;
          margin-bottom: 30px;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background-color: #333;
          color: white;
          padding: 12px 30px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: 600;
          transition: background-color 0.3s ease;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }
        .button:hover {
          background-color: #555;
        }
        .info {
          margin-top: 20px;
          font-size: 12px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🎓</div>
        <h1>Authorize College</h1>
        <p class="subtitle">College by David Alade wants to access your GitHub account</p>
        <a href="/github" class="button">Authorize with GitHub</a>
        <div class="info">
          <p>Limited access to your public data</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// GitHub OAuth start
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub OAuth callback
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // Store the authenticated user in the session
    req.session.user = req.user;
    // Redirect to welcome page (or directly to Swagger UI if you prefer)
    res.redirect('/welcome');
    // If you want to skip welcome and go straight to Swagger:
    // res.redirect('/api-docs');
  }
);

// Logout route
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
