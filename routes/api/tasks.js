var _ = require("underscore")
	, fs = require("fs")
  , Connection = require("../../lib/database")
	, events = require('../../lib/events').events
 	, SSH = require("../../lib/ssh")
	, User = require("../../lib/user")
	, Tasks = require("../../lib/tasks")
	, user = new User()
	, db = new Connection()
	, tasks = new Tasks();

// require events, this is an instantiated class
events.on("tasks:execute", function(id) {	
	db.getTask(id, function(err, task) {
		if(err) {
			// if we can't get the task, emit the tasks:finished 
			// event with an error
			events.emit("tasks:finished", {
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
				tasks.executeTemplate(task);
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
	
	// data.created = new Date();
	// @todo change for a real value
	data.user = 1;

	db.saveTask(data, function(err, result) {
		if(err) {
			console.log(err);
			res.send(500, err);
		}

		if(result) {
			res.send(201, result);
		}
	});
}

/**
 * Update a Task
 */
function putTask(req, res) {
	var id = req.params.id;
	var status = req.body.status;

	db.changeTaskStatus(id, status, function(err, result) {
		if(err) {
			console.log(err);
			res.send(500, err);
		}

		if(result) {
			// If the status is "EXECUTE" then execute the task
			if(status === "EXECUTE") {
				events.emit("tasks:execute", id);
			}

			res.send(201, result);
		}
	});
}

/**
 * Delete a Task
 */
function deleteTask(req, res) {
	var id = req.params.id;

	db.changeTaskStatus(id, "CANCELED", function(err, result) {
		if(err) {
			console.log(err);
			res.send(500, err);
		}

		if(result) {
			res.send(200, result);
		}
	});
}

module.exports = function(app) {
	app.get("/api/tasks", user.auth, getTasks);
	app.get("/api/tasks/:id", user.auth, getTask);
	app.post("/api/tasks", user.auth, postTask);
	app.put("/api/tasks/:id", user.auth, putTask);
	app.delete("/api/tasks/:id", user.auth, deleteTask);
}