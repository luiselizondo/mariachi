var Connection = require("../../lib/database")
	, events = require('../../lib/events').events
	, User = require("../../lib/user")
	, Logs = require("../../lib/logs")
	, logs = new Logs()
	, user = new User();

function getLogs(req, res) {
	logs.getLogs(function(err, results) {
		if(err) {
			console.log(err);
			res.send(400, {error: err});
		}
		if(!err && !results.length) {
			res.send(204, {result: "No results"});	
		}
		if(results.length) {
			console.log(results);
			res.send(200, results);
		}
	});
}

function getLog(req, res) {
	logs.get(req.params.id, function(err, result) {

		if(err) {
			res.send(400, {error: err});
		}

		if(result) {
			res.send(200, {result: result});
		}
	});
}

function logsAuth(req, res, next) {

	// username
	// password
	// 
	
	next();
}

function postLog(req, res) {
	logs.save(req.body, function(err, result) {
		if(err) {
			res.send(400, {error: err});
		}

		if(result) {
			res.send(201, {result: result});
		}
	});
}

module.exports = function(app) {
	app.get("/api/logs", user.auth, getLogs);
	app.get("/api/logs/:id", user.auth, getLog);
	app.post("/api/logs", logsAuth, postLog);
}