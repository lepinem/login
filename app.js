// app.js

//globals and dependencies
const express = require('express');
const session = require('express-session')
const mustacheExpress = require('mustache-express');
const app = express();
const dal = require('./dal');
const bodyParser = require('body-parser')

// middleware

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//session
app.use(
  session({
    secret: 'jammyjam',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: null }
  })
)

app.use(function (req, res, next) {
  if (req.session.usr) {
    req.isAuthenticated = true
  } else {
    req.isAuthenticated = false
  }
  console.log(req.isAuthenticated, 'session')
  next()
})

//routes
//landing to login page via redirect
app.get('/', function (req, res) {
  res.render('home', { isAuthenticated: req.isAuthenticated })
})


app.get('/admin', function (req, res) {
  if (req.isAuthenticated) {
    const users = dal.getUsers()
    res.render('admin', { users: users, loggedUsr: req.session.usr })
  } else {
    res.redirect('/')
  }
})

//login page with input boxes
app.get('/login', function (req, res) {
  res.render('login')
})

//input creds hit return
app.post('/login', function (req, res) {
  const sesh = req.session
  const foundUsr = dal.getUser(req.body.username)
  if (req.body.password === foundUsr.password) {
    sesh.usr = { name: foundUsr.name }
    res.redirect('/admin')
  } else {
    res.send('womp womp')
  }
})

app.get('/logout', function (req, res) {
  req.session.destroy()
  res.render('logout')
})

app.listen(3000, function () {
  console.log('server running on port 3000')
})
