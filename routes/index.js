const express = require('express');
const passport = require('passport');
const router = express.Router();

/* LOGIN */
router.get('/login', (req, res) => {
  res.send(`
    <h1>Authorize College</h1>
    <a href="/github">Authorize with GitHub</a>
  `);
});

/* GITHUB AUTH */
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

/* CALLBACK */
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/welcome');
  }
);

/* WELCOME */
router.get('/welcome', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');

  res.send(`
    <h1>Hello User</h1>
    <a href="/api-docs">Go to API Docs</a><br/>
    <a href="/logout">Logout</a>
  `);
});

/* LOGOUT */
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

module.exports = router;
