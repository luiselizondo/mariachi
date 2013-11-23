var Connection = require("../../lib/database")
	, events = require('../../lib/events').events
	, User = require("../../lib/user")
	, Logs = require("../../lib/logs")
	, user = new User();

function getLogs(req, res) {
	var logs = new Logs();
	setInterval(function() {
		logs.getLogs();
	}, 5000);

	res.send(200);
}

function getLog(req, res) {
	var logs = new Logs();
	logs.get(req.params.id, function(err, result) {

		if(err) {
			res.send(404, {error: err});
		}

		if(result) {
			res.send(200, {result: result});
		}
	});
}

module.exports = function(app) {
	app.get("/api/logs", user.auth, getLogs);
	app.get("/api/logs/:id", user.auth, getLog);
}