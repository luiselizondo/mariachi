
/**
 * Module dependencies.
 */

var config = require("./config");
var express = require('express');
var http = require('http');
var path = require('path');
var flash = require('connect-flash');
var passport = require("passport");
var app = express();
var server = http.createServer(app);

// Installer
if(!config) {
	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'jade');
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(flash());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));

	require("./installer/installer")(app);

	server.listen(app.get('port'), function(){
	  console.log('Installer server listening on port ' + app.get('port'));
	});

	return;
}

var CaminteStore = require("connect-caminte")(express);
var io = require('socket.io');
var io = io.listen(server);
var User = require("./lib/user");
var user = new User();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser('keyboard cat'));
app.use(express.session({
	store: new CaminteStore({
		driver: "mysql",
		collection: "Sessions",
		db: config.mysql,
		clear_interval: 6000,
		maxAge: 60000
	}),
	secret: config.secretKey,
	cookie: { maxAge: 86400000 }
}));

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(flash());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Main routes
require("./routes")(app);
require("./routes/routes")(app);

app.get('/flash', function(req, res){
  // Set a flash message by passing the key, followed by the value, to req.flash().
  req.flash('info', 'Flash is back!')
  res.redirect('/');
});

// API
require("./routes/api/servers")(app);
require("./routes/api/users")(app);
require("./routes/api/recepies")(app);
require("./routes/api/tasks")(app);
require("./routes/api/sites")(app);
require("./routes/api/templates")(app);

require("./lib/socket")(io);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});