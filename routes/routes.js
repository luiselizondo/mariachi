var User = require("../lib/user");
var user = new User();

function servers(req, res) {
	res.render("servers", {title: "Servers"});
}

function users(req, res) {
	res.render("users", {title: "Users"});
}

function recepies(req, res) {
	res.render("recepies", {title: "Recepies"});
}

function tasks(req, res) {
	res.render("tasks", {title: "Tasks"});
}

function sites(req, res) {
	res.render("sites", {title: "Sites"});
}

function templates(req, res) {
	res.render("templates", {title: "Templates"});
}

module.exports = function(app) {
	app.get("/servers", user.isUser, servers);
	app.get("/users", user.isUser, users);
	app.get("/recepies", user.isUser, recepies);
	app.get("/tasks", user.isUser, tasks);
	app.get("/sites", user.isUser, sites);
	app.get("/templates", user.isUser, templates);	
}
