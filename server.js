const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'herfilmsecret',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Load movies data
const movies = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'movies.json')));

function ensureAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Home page - list movies
app.get('/', ensureAuth, (req, res) => {
  res.render('home', { movies, user: req.session.user });
});

// Movie detail
app.get('/movie/:id', ensureAuth, (req, res) => {
  const movie = movies.find(m => m.id === req.params.id);
  if (!movie) return res.status(404).send('Movie not found');
  res.render('detail', { movie, user: req.session.user });
});

// Play movie
app.get('/movie/:id/play', ensureAuth, (req, res) => {
  const movie = movies.find(m => m.id === req.params.id);
  if (!movie) return res.status(404).send('Movie not found');
  res.render('player', { movie, user: req.session.user });
});

// Register
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.render('register', { error: 'All fields required' });
  // In-memory user store
  req.session.user = { email };
  res.redirect('/');
});

// Login
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { email } = req.body;
  if (!email) return res.render('login', { error: 'Email required' });
  // Accept any email/password for demo
  req.session.user = { email };
  res.redirect('/');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
