var passport = require("passport")
	, util = require('util')
	, Connection = require("../lib/database")
	, db = new Connection()
  , crypto = require("crypto")
  , config = require("../config")
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

      // Encrypt password and compare
      var algorithm = "aes256";
      var key = config.secretKey;
      var cipher = crypto.createCipher(algorithm, key);
      var encriptedPassword = cipher.update(password, "utf8", "hex") + cipher.final("hex");

      if (encriptedPassword !== user.password) {
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