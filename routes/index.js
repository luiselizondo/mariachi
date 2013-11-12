var passport = require("passport")
	, util = require('util')
	, Connection = require("../lib/database")
	, db = new Connection()
  , LocalStrategy = require('passport-local').Strategy;

/**
 * Password is not encripted
 */
passport.use(new LocalStrategy(
  function(username, password, done) {
    db.loadUser(username, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (password !== user.password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.getUser(id, function(err, user) {
    done(err, user);
  });
});

/*
 * GET home page.
 */

function login(req, res){
  res.render('login', { title: 'Mariachi' });
};

function logout(req, res) {
  req.logout();
  res.redirect("/");
}

/**
 * Check if a user is logged in, if it is, send to /servers
 * if not, go to login 
 */
function isUser(req, res, next) {
  if(!req.session.passport.user) {
    next();
  }
  else {
    res.redirect("/tasks");
  }
}

module.exports = function(app) {
  app.get('/', isUser, login);
  app.get("/login", login);
  app.post("/login", passport.authenticate('local', { 
    successRedirect: "/tasks", 
    failureRedirect: "/login",
    failureFlash: true 
  }));

  app.get("/logout", logout);
}