var _ = require("underscore")
	, fs = require("fs")
  , Connection = require("../../lib/database")
	, events = require('../../lib/events').events
 	, SSH = require("../../lib/ssh")
	, User = require("../../lib/user")
	, Tasks = require("../../lib/tasks")
	, dateFormat = require("dateformat")
	, Project = require("../../lib/projects")
	, user = new User()
	, db = new Connection()
	, tasks = new Tasks();

// require events, this is an instantiated class
events.on("tasks:execute", function(id) {	
	console.log("Task id: " + id);
	db.getTask(id, function(err, task) {
		console.log("Task");
		console.log(task);

		events.emit("tasks:start", {
			task: task,
			started: task.started,
			stderr: null,
			stdout: null,
			status: "STARTED"
		});

		if(err) {
			var now = new Date();

			var ended = dateformat(now, "yyyy-mm-dd hh:mm:ss");

			// if we can't get the task, emit the tasks:finished 
			// event with an error prematurately
			events.emit("tasks:finished", {
				task: task,
				started: task.started,
				ended: ended,
				stderr: err,
				stdout: null,
				status: "ERROR"
			});
		}

		if(task) {
			if(task.type == "recepie") {
				tasks.executeRecepie(task);
			}
			if(task.type == "template") {
				tasks.deployTemplate(task);
			}
		}
	});
});

/**
 * Get all Tasks
 */
function getTasks(req, res) {
	db.getTasks(function(err, results) {
		if(err) {
			console.log(err);
			res.send(401, err);
		}

		if(results) {
			console.log(results);
			res.send(200, results);
		}
	});
}

/**
 * Get one Task
 */
function getTask(req, res) {
	var id = req.params.id;
	db.getTask(id, function(err, result) {
		if(err) {
			console.log(err);
			res.send(500, err);
		}

		if(result) {
			res.send(200, result);
		}
	});
}

/**
 * Create a Task
 */
function postTask(req, res) {
	var data = req.body;
	
	data.user = user.current(req, res);

	var now = new Date();
	
	// DATETIME FORMAT IS 'YYYY-MM-DD HH:MM:SS'
	data.started = dateFormat(now, "yyyy-mm-dd hh:mm:ss");

	console.log("About to save");
	console.log(data);

	db.saveTask(data, function(err, result) {
		if(err) {
			console.log("db.saveTask err");
			console.log(err);
			res.send(500, err);
		}

		if(result) {
			// result.insertId is the id of the task created
			events.emit("tasks:execute", result.insertId);
			res.send(201, result);
		}
	});
}

module.exports = function(app) {
	app.get("/api/tasks", user.auth, getTasks);
	app.get("/api/tasks/:id", user.auth, getTask);
	app.post("/api/tasks", user.auth, postTask);
	// app.delete("/api/tasks/:id", user.auth, deleteTask);
}