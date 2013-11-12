var Connection = require("./database");
var db = new Connection();

function User() {

}

User.prototype.get = function(id, callback) {
	db.getUser(id, function(err, user) {
		callback(err, user);
	});
}

User.prototype.current = function() {
	if(req.session.passport.user) {
		this.get(req.session.passport.user, function(err, user) {
			if(err) return false;
			if(user) return user;
		})
	}
	else {
		return false;
	}
}

User.prototype.isUser = function(req, res, next) {
	if(!req.session.passport.user) {
		res.redirect("/login");
	}
	else {
		next();
	}
}

User.prototype.auth = function(req, res, next) {
	if(!req.session.passport.user) {
		res.send(403, "Access denied");
	}
	else {
		next()
	}
}

module.exports = User;