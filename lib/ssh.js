var Connection = require("ssh2");
var config = require("../config");
var events = require('./events').events;
var _ = require("underscore");

function SSH(options) {
	this.sshUser = options.sshUser;
	this.serverAddress = options.address;
	this.sshPort = options.sshPort;
	this.command = options.command;
}

SSH.prototype.exec = function(callback) {
	var self = this;
	var connection = new Connection();
	
	var stdout = "";
	var stderr = "";

	connection.on("connect", function() {
		console.log("Connecting...");
	});

	connection.on("ready", function(c) {
		console.log("Executing command: " + self.command);
		connection.exec(self.command, function(err, stream) {
			if(err) {
				console.log("Execucion error...");
				console.log(err);
				callback(err, null, null);
			}
			stream.on('data', function(data, extended) {
				console.log("Streaming...");
				// socket should send the result to the client
				// but do not save the data to the database until eveything is ready (on end)
	      
				if(extended === "stderr") {
					stderr += data;
				}
				else {
					stdout += data;
				}

				// Application events, stream what we get
				events.emit("tasks:stream", {
					stderr: stderr,
					stdout: stdout,
					status: "EXECUTING"
				});
	    });

			stream.on("end", function() {		
				console.log("Stream end...");		
				callback(err, stdout, stderr);
			});

			stream.on("close", function() {
				console.log("Closing stream...");
			});

			stream.on("exit", function() {
				console.log("Exit stream...");
				connection.end();
			});
		});
	});

	connection.on("error", function(err) {
		console.log("Connection error");
		callback(err, null);
	});

	connection.on("end", function() {
		console.log("Connection end");
	});

	connection.on("close", function() {
		console.log("Connection closed");
	});

	connection.connect({
		host: this.serverAddress,
		port: this.sshPort,
		username: this.sshUser,
		privateKey: require("fs").readFileSync(config.ssh.privateKey),
		publicKey: require("fs").readFileSync(config.ssh.publicKey)
	});
};

/**
 * Check status of a server
 */
SSH.prototype.checkStatus = function(callback) {
	var self = this;
	var connection = new Connection();

	connection.on("connect", function() {
		
	});

	connection.on("ready", function() {
		callback(false, true);
	});

	connection.on("error", function(err) {
		callback(true, false);
	});

	connection.on("end", function() {
	});

	connection.on("close", function() {
	});

	connection.connect({
		host: this.serverAddress,
		port: this.sshPort,
		username: this.sshUser,
		privateKey: require("fs").readFileSync(config.ssh.privateKey),
		publicKey: require("fs").readFileSync(config.ssh.publicKey)
	});
}



SSH.prototype.scp = function(localPath, remotePath, callback) {
	var self = this;
	var connection = new Connection();
	
	var stdout = null;
	var stderr = null;

	connection.on("connect", function() {
		
	});

	connection.on("ready", function() {
		connection.sftp(function(err, sftp) {
			if(err) {
				console.log(err);
			}

			sftp.on("end", function() {
				events.emit("tasks:stream", {
					stderr: null,
					stdout: "Disconnecting from the server..."
				})
				callback(err, sftp);
			});

			sftp.fastPut(localPath, remotePath, function(err) {
				if(err) callback(err, null);
				else {
					callback(err, "File transfered");
				}
			});
		});
	});

	connection.on("error", function(err) {
		callback(err, null);
	});

	connection.on("end", function() {
	});

	connection.on("close", function() {
	});

	connection.connect({
		host: this.serverAddress,
		port: this.sshPort,
		username: this.sshUser,
		privateKey: require("fs").readFileSync(config.ssh.privateKey),
		publicKey: require("fs").readFileSync(config.ssh.publicKey)
	});
};
module.exports = SSH;