var Connection = require("../../lib/database")
	, events = require('../../lib/events').events
	, User = require("../../lib/user")
	, Logs = require("../../lib/logs")
	, user = new User();

function getLogs(req, res) {
	var logs = new Logs();
	setInterval(function() {
		logs.getLogs(function(err, results) {
			// do nothing here, we send the response throught events
		})
	}, 5000);

	logs.getLogs(function(err, results) {
		if(err) {
			res.send(500, {error: err});
		}

		if(results) {
			res.send(200, {result: results});
		}
	})
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