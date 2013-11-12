var Connection = require("../../lib/database");
var db = new Connection();
var SSH = require("../../lib/ssh");
var User = require("../../lib/user");
var user = new User();
var _ = require("underscore");
var fs = require("fs");

// require events, this is an instantiated class
var events = require('../../lib/events');
var mustache = require("mustache");

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
	console.log(data);
	
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
	})
}

/**
 * Update a Task
 */
function putTask(req, res) {
	var id = req.params.id;
	var status = req.body.status;

	// Listen event

	function executeRecepie(task, callback) {
		var options = {
			sshUser: task.ssh_user,
			address: task.address,
			sshPort: task.ssh_port,
			command: task.recepie.recepie,
		}
		var ssh = new SSH(options);
		ssh.exec(function(err, stdout, stderr) {
			var data = {
				stdout: stdout,
				stderr: stderr,
				status: "SUCCESS"
			}
			
			if(err) {
				data.stderr = err
				data.status = "ERROR";
			}

			events.emit("tasks:finished", {stderr: stderr, stdout: stdout, status: data.status});
			
			db.updateTask(id, data, function(err, result) {
				console.log(err);
				console.log(result);
				callback(err, result);
			});
		})
	}

	function writeTempFile(data, callback) {
		var date = new Date();
		var filename = "/tmp/mariachiTemplateFile-" + date;
		fs.writeFile(filename, data, function(err) {
			if(err) {
				callback(err, null);
			}
			else {
				callback(null, filename);
			}
		});
	}

	function executeTemplate(task, callback) {
		var source = task.template.template;

		// convert each pattern into an object
		// that will work as the pattern replacement values
		var params = {}
		_.each(task.data, function(item, index) {
			params[item.id] = item.value;
		});	

		var template = mustache.compile(source);
		var compiledTemplate = template(params);

		var options = {
			sshUser: task.ssh_user,
			address: task.address,
			sshPort: task.ssh_port,
		}

		var ssh = new SSH(options);
		
		// We can't send a string as a file, so we need to save a temp file
		// first
		var remoteFile = "/tmp/testFile.conf";

		writeTempFile(compiledTemplate, function(err, localFile) {
			ssh.scp(localFile, remoteFile, function(stderr, stdout) {
				var data = {
					stdout: stdout,
					stderr: stderr,
				}
				
				if(stderr) {
					data.status = "ERROR";
					events.emit("tasks:finished", {stderr: stderr, stdout: stdout, status: "ERROR"});
				}

				if(stdout) {
					data.status = "SUCCESS";
					events.emit("tasks:finished", {stderr: stderr, stdout: stdout, status: "SUCCESS"});	
				}

				db.updateTask(id, data, function(err, result) {
					callback(stderr, stdout);
				});
			});
		});
	}
	
	events.on("tasks:execute", function(id, callback) {
		console.log("Called event: task:execute");
		db.getTask(id, function(err, task) {
			if(err) callback(err, task);
			if(task) {
				if(task.type == "recepie") {
					executeRecepie(task, function(err, result) {

					});
				}
				if(task.type == "template") {
					executeTemplate(task, function(err, result) {

					});
				}
			}
		});
	});
	
	var possibleStatus = ["WAITING", "EXECUTING", "SUCCESS", "ERROR", "CANCELED"];

	if(status == "EXECUTING") {
		db.changeTaskStatus(id, status, function(err, result) {
			if(err) {
				console.log(err);
				res.send(500, err);
			}

			if(result) {
				// Fire event
				events.emit("tasks:execute", id, function(err, result) {
					
				});
				
				res.send(201, result);
			}
		});
	}
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