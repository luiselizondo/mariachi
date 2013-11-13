var SSH = require("../lib/ssh")
	, events = require("../lib/events").events
  , Connection = require("../lib/database")
 	, db = new Connection()
	, fs = require("fs")
	, _ = require("underscore")
	, mustache = require("mustache");

/**
 * Declare a new Tasks class
 */
function Tasks() {

}

module.exports = Tasks;

/**
 * Executes a recepie inside a task
 * @param {object} [task] [the task to execute, it will include the recepie and the
 *                        data needed to connect to the server]
 */
Tasks.prototype.executeRecepie = function(task) {

	// if not an object, return
	if(!_.isObject(task)) {
		return;
	}

	var options = {
		sshUser: task.ssh_user,
		address: task.address,
		sshPort: task.ssh_port,
		command: task.recepie.recepie,
	}

	var ssh = new SSH(options);

	// execute by calling the method exec on the ssh library
	ssh.exec(function(err, stdout, stderr) {
		// the data object will be saved to the database
		var data = {
			stdout: stdout,
			stderr: stderr,
			status: "SUCCESS"
		}
		
		// if there's an error with the ssh library, which is not
		// the stderr, we save it as a stderr and send it in data
		if(err) {
			data.stderr = err;
			data.stdout = null;
			data.status = "ERROR";
		}

		// the task finished, by now, 
		// emit the event tasks:finished
		// and send the data, the listener is a socket.io
		events.emit("tasks:finished", {
			stderr: data.stderr, 
			stdout: data.stdout, 
			status: data.status
		});
		
		// update the task to the database
		// we don't return anything
		db.updateTask(task.id, data, function(err, result) {
			return;
		});
	})
}

/**
 * Writes a temporary file with information
 * @param {string} [data] [a string that will be saved into a file]
 * @param {callback} [callback] [callback to execute when ready]
 */
Tasks.prototype.writeTempFile = function(data, callback) {
	// declare a new date to use in the filename
	var date = new Date();

	// declare a new filename
	var filename = "/tmp/mariachiTemplateFile-" + date;

	// write the data to the filename
	fs.writeFile(filename, data, function(err) {
		if(err) {
			callback(err, null);
		}
		else {
			// return the filename
			callback(null, filename);
		}
	});
}

/**
 * Deploys a template
 * @param {object} [task] [the task to execute, it must include the template to
 *                        deploy and the ssh options to use]
 */
Tasks.prototype.deployTemplate = function(task) {
	var self = this;

	// the source, a string with the data not yet compiled
	var source = task.template.template;

	// declare a new params object
	// look for the patterns registered in task.data and loop,
	// use each pattern.
	// build an object in the form of params = {someid: somevalue}
	// to pass it to the template
	var params = {}
	_.each(task.data, function(item, index) {
		params[item.id] = item.value;
	});	

	// compile the source
	var template = mustache.compile(source);

	// replace values in the template with the params available
	var compiledTemplate = template(params);

	// declare the options we'll use in ssh
	var options = {
		sshUser: task.ssh_user,
		address: task.address,
		sshPort: task.ssh_port,
	}

	var ssh = new SSH(options);
			
	// We can't send a string as a file, so we need to save a temp file
	// first
	// temporary, change this for the destination parameter
	var remoteFile = "/tmp/testFile.conf";

	self.writeTempFile(compiledTemplate, function(err, localFile) {
		if(err) console.log(err);

		if(localFile) {
			ssh.scp(localFile, remoteFile, function(stderr, stdout) {
				// Declare data, we'll use it to save the results to the database
				// and to emit the event
				var data = {
					stdout: stdout,
					stderr: stderr,
					status: "EXECUTING"
				}
				
				if(stderr) {
					data.status = "ERROR";
				}

				if(stdout) {
					data.status = "SUCCESS";
				}
				
				// emit the tasks:finished event, the listener is in socket.js
				events.emit("tasks:finished", {
					stderr: data.stderr, 
					stdout: data.stdout, 
					status: data.status
				});

				db.updateTask(task.id, data, function(err, result) {
					return;
				});
			});
		}
	});
}		