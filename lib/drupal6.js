var SSH = require("../lib/ssh")
	, events = require("../lib/events").events
	, e = require('events')
  , Connection = require("../lib/database")
 	, db = new Connection()
 	, Tasks = require("../lib/tasks")
 	, util = require("util")
 	, dateFormat = require("dateformat")
	, _ = require("underscore");

var Drupal6 = function Drupal6(project) {
	e.EventEmitter.call(this);

	var self = this;
	self.project = project;

	self.type = project.type;
	self.name = project.name;
	self.fqdn = project.fqdn;

	// set properties from the database
	self.webServer = {}
	self.databaseServer = {}

	self.codeArchive = project.data.codeArchive;
	self.codeBranch = project.data.codeBranch;
	self.destinationDirectory = project.data.destinationDirectory;
	self.databaseArchive = project.data.databaseArchive;
	self.databaseFilename = project.data.databaseFilename;
	self.databaseType = project.data.databaseType;
	self.databaseName = project.data.databaseName;

	self.databaseUser = project.data.databaseUser;
	self.databasePassword = project.data.databasePassword;
	self.databasePort = project.data.databasePort;

	// self.createDatabase = project.data.createDatabase;
	self.databaseUserRoot = project.data.databaseUserRoot;
	self.databasePasswordRoot = project.data.databasePasswordRoot;

	self.stderr = "";
	self.stdout = "";

	// Set the databaseServer and webServer
	// and emit the deploy:start event
	// __construct = function() {
	// 	console.log("Construct of Drupal6");
	// }();
	
	self.on("start", function() {
		console.log("Set webserver");
		
		var started = new Date();
		// inform the global event system
		events.emit("projects:start", {
			started: dateFormat(started, "yyyy-mm-dd hh:mm:ss"),
			ended: "",
			stdout: "Starting",
			stderr: self.stderr
		});

		self.setWebServer();
	});

	self.on("setWebServer:end", function() {
		// if both the databaseName and databaseServer exists, set the DatabaseServer
		// delay execution of deploy until the database server is ready
		if(!_.isEmpty(self.databaseName) && !_.isEmpty(self.project.data.databaseServer)) {
			console.log("Creating the database by calling setDatabaseServer:start");
			self.emit("setDatabaseServer:start");
		}
		else {
			console.log("Or else");
			self.emit("deploy:start");
		}
	});

	self.on("setDatabaseServer:start", function() {
		self.setDatabaseServer();
	});
	
	self.on("setDatabaseServer:end", function() {
		self.emit("deploy:start");
	});

	// General usage case, result must be an object with 4 properties
	// operation, err, stderr and stdout
	self.on("stream", function(result) {
		var data = {
			status: result.operation,
			stdout: result.stdout,
			stderr: result.stderr,
		}

		if(result.err) {
			data.stderr = result.err.code;
			self.stderr = result.err.code;
		}

		// If the event does not produce stdout, we create one using the message
		if(!result.err && !result.stderr && !result.stdout) {
			self.stdout += result.operation + " FINISHED";
			data.stdout = result.operation + " FINISHED";
		}

		events.emit("projects:stream", data);

		if(result.err || result.stderr) {
			data.status = "ERROR";
			self.emit("projects:finished", data);

			// self.emit("cleanup");
		}
	});

	// Start deployment
	self.on("deploy:start", function() {
		// Decide to create the database or not
		if(self.project.data.createDatabase === "yes") {
			self.emit("createDatabase:start");
		}
		// do not create the database, start deployment of git files inmediatelly
		else {

		}
	});

	// Event _createDatabase
	self.on("createDatabase:start", function() {
		console.log("Fired createDatabase:start");
		// checks for the database type
		if(self.databaseType === "mysql") {
			// Create the database
			self.MySQLcreateDatabase();
		}
		if(self.databaseType === "mongo") {
			// @todo create database mongodb
		}
	});

	self.on("MySQLcreateDatabase:end", function () {
		console.log("Created the database, moving to user");
		self.MySQLcreateUser();
	});

	self.on("MySQLcreateUser:end", function() {
		console.log("Fired MySQLcreateUser:end");
		self.MySQLassignPermissions();
	});

	self.on("MySQLassignPermissions:end", function() {
		console.log("FIred MySQLassignPermissions:end");
		self.MySQLflushPrivileges();
	});

	self.on("MySQLflushPrivileges:end", function() {
		console.log("Fired MySQLflushPrivileges:end");
		self.cloneDatabase();
	});

	self.on("cloneDatabase:end", function() {
		console.log("Fired cloneDabasase:end");
		if(self.databaseType === "mysql") {
			// @todo check if the file is gzipped
			self.MySQLextractDatabaseAndImport();
		}
	});

	self.on("MySQLextractDatabaseAndImport:end", function() {
		self.finished();
	});

	self.on("cleanup", function() {
		self.cleanUp(function(err, stdout) {
			events.emit("projects:cleanupFinished", {
				project: self.project,
				err: err,
				stdout: stdout
			});
		});
	});

	self.on("projects:finished", function(data) {
		self.finished(data);
	})
}

// order is important here, if I define a new method *before*
// this line, the method will not be recognized because it's overwritten
// http://stackoverflow.com/questions/15493285/understanding-javascript-inheritance-and-node-js-util-inherits-function-example
util.inherits(Drupal6, e.EventEmitter);

Drupal6.prototype.start = function() {
	console.log("Starting");
	var self = this;
	self.emit("start");
}

Drupal6.prototype.setWebServer = function() {
	var self = this;
	db.getServer(self.project.data.webserver, function(err, server) {
		if(err) console.log(err);
		if(server) self.webServer = server;
		self.emit("setWebServer:end");
	})
}

Drupal6.prototype.setDatabaseServer = function() {
	var self = this;
	db.getServer(self.project.data.databaseServer, function(err, server) {
		if(err) console.log(err);
		if(server) self.databaseServer = server;

		self.emit("setDatabaseServer:end");
	})
}

Drupal6.prototype.getWebServer = function() {
	var self = this;
	return self.webServer;
}

Drupal6.prototype.getDatabaseServer = function() {
	var self = this;
	return self.databaseServer;
}

// saves everything we need to save
Drupal6.prototype.finished = function(data) {	
	var self = this;
	var status = 0;
	if(data.status === "SUCCESS") {
		status = 1;
	}
	db.updateProject(self.project.id, {
		stderr: self.stderr,
		stdout: self.stdout,
		status: status,
	}, function(err, result) {


		var ended = new Date();
		data.ended = dateFormat(ended, "yyyy-mm-dd hh:mm:ss");

		events.emit("projects:finished", data);
		console.log("Finished");
	});
}

Drupal6.prototype.cleanUp = function(callback) {
	var self = this;
	console.log("Something went wrong. Starting cleanup");
}

/**
 * Create database
 */
Drupal6.prototype.MySQLcreateDatabase = function(callback) {
	var self = this;
	console.log("Executing MySQLcreateDatabase ===");

	events.emit("projects:stream", {
		stdout: "CREATING DATABASE " + self.databaseName,
		stderr: "",
		status: "CREATING DATABASE " + self.databaseName
	});

	var command = 'mysqladmin'+
		' -u' + self.databaseUserRoot +
		' -p' + self.databasePasswordRoot +
		' --port=' + self.databasePort +
		' create ' + self.databaseName;

	var sshOptions = {
		sshUser: self.databaseServer.ssh_user,
		address: self.databaseServer.address,
		sshPort: self.databaseServer.ssh_port,
		command: command
	}

	var ssh = new SSH(sshOptions);
	ssh.exec(function(err, stdout, stderr) {
		self.emit("stream", {
			err: err, 
			stdout: stdout, 
			stderr: stderr, 
			operation: "CREATING DATABASE " + self.databaseName,
		});

		if(!err && !stderr) {
			console.log("Firing MySQLcreateDatabase:end");
			self.emit("MySQLcreateDatabase:end");
		}
	});
}

/**
 * Drops database
 */
Drupal6.prototype.MySQLdropDatabase = function(callback) {
	var self = this;

	var command = 'mysql' +
			' -u' + self.databaseUserRoot +
			' -p' + self.databasePasswordRoot +
			' --port=' + self.databasePort +
			' -e "DROP DATABASE ' + self.databaseName + '"';

	var sshOptions = {
		sshUser: self.databaseServer.ssh_user,
		address: self.databaseServer.address,
		sshPort: self.databaseServer.ssh_port,
		command: command
	}

	var ssh = new SSH(sshOptions);
	ssh.exec(function(err, stdout, stderr) {
		self.emit("stream", {
			err: err, 
			stdout: stdout, 
			stderr: stderr, 
			operation: "DROPING DATABASE " + self.databaseName,
		});

		if(!err && !stderr) {
			self.emit("MySQLdropDatabase:end");
		}
	});
}

/**
 * Create a user
 */
Drupal6.prototype.MySQLcreateUser = function(callback) {
	console.log("Executing MySQLcreateUser ===");
	// CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
	var self = this;

	self.setDatabaseServer(function(err, res) {
		var query = 'CREATE USER \'' + self.databaseUser + '\'@' + '\'localhost\' IDENTIFIED BY \''+ self.databasePassword +'\'';
		var command = 'mysql' +
				' -u' + self.databaseUserRoot +
				' -p' + self.databasePasswordRoot +
				' --port=' + self.databasePort +
				' -e "' + query + '"';

		var sshOptions = {
			sshUser: self.databaseServer.ssh_user,
			address: self.databaseServer.address,
			sshPort: self.databaseServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			self.emit("stream", {
				err: err, 
				stdout: stdout, 
				stderr: stderr, 
				operation: "CREATING USER",
			});

			if(!err && !stderr) {
				console.log("Firing MySQLcreateUser:end");
				self.emit("MySQLcreateUser:end");
			}
		});
	});
}

/**
 * Create a user
 */
Drupal6.prototype.MySQLdropUser = function(callback) {
	console.log("Executing MySQLdropUser ===");
	// CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
	var self = this;

	self.setDatabaseServer(function(err, res) {
		var query = 'DROP USER \'' + self.databaseUser + '\'@' + '\'localhost\'';
		var command = 'mysql' +
				' -u' + self.databaseUserRoot +
				' -p' + self.databasePasswordRoot +
				' --port=' + self.databasePort +
				' -e "' + query + '"';

		var sshOptions = {
			sshUser: self.databaseServer.ssh_user,
			address: self.databaseServer.address,
			sshPort: self.databaseServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			self.emit("stream", {
				err: err, 
				stdout: stdout, 
				stderr: stderr, 
				operation: "DROPING USER",
			});

			if(!err && !stderr) {
				console.log("Firing MySQLdropUser ===");
				self.emit("MySQLdropUser:end");
			}
		});
	});
}

/**
 * Assign permissions
 */
Drupal6.prototype.MySQLassignPermissions = function(callback) {
	console.log("Executing MySQLassignPermissions ===");
	// GRANT ALL PRIVILEGES ON * . * TO 'newuser'@'localhost';
	var self = this;

	self.setDatabaseServer(function(err, res) {
		var query = 'GRANT ALL PRIVILEGES ON *.* TO \'' + self.databaseUser + '\'@' + '\'localhost\'';
		var command = 'mysql' +
				' -u' + self.databaseUserRoot +
				' -p' + self.databasePasswordRoot +
				' --port=' + self.databasePort +
				' -e "' + query + '"';

		var sshOptions = {
			sshUser: self.databaseServer.ssh_user,
			address: self.databaseServer.address,
			sshPort: self.databaseServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			self.emit("stream", {
				err: err, 
				stdout: stdout, 
				stderr: stderr, 
				operation: "ASSIGNING PERMISSIONS",
			});

			if(!err && !stderr) {
				console.log("Firing MySQLassignPermissions:end ===");
				self.emit("MySQLassignPermissions:end");
			}
		});
	});
}

/**
 * Assign permissions
 */
Drupal6.prototype.MySQLflushPrivileges = function(callback) {
	var self = this;

	self.setDatabaseServer(function(err, res) {
		var query = 'FLUSH PRIVILEGES';
		var command = 'mysql' +
				' -u' + self.databaseUserRoot +
				' -p' + self.databasePasswordRoot +
				' --port=' + self.databasePort +
				' -e "' + query + '"';

		var sshOptions = {
			sshUser: self.databaseServer.ssh_user,
			address: self.databaseServer.address,
			sshPort: self.databaseServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			self.emit("stream", {
				err: err, 
				stdout: stdout, 
				stderr: stderr, 
				operation: "FLUSHING PRIVILEGES",
			});

			if(!err && !stderr) {
				self.emit("MySQLflushPrivileges:end");
			}
		});
	});
}

/**
 * Clone Database into the directory /tmp/nameOfProject
 */
Drupal6.prototype.cloneDatabase = function(callback) {
	var self = this;
	self.setDatabaseServer(function(err, res) {
		console.log("Cloning databaseArchive %s into /tmp/%s", self.databaseArchive, self.name);
		var command = 'rm -Rf /tmp/' + self.name +
		' ; git clone' +
		' ' + self.databaseArchive +
		' /tmp/' + self.name;

		var sshOptions = {
			sshUser: self.databaseServer.ssh_user,
			address: self.databaseServer.address,
			sshPort: self.databaseServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			self.emit("stream", {
				err: err, 
				stdout: stdout, 
				stderr: stderr, 
				operation: "CLONING DATABASE",
			});

			if(!err && !stderr) {
				self.emit("cloneDatabase:end");
			}
		});
	});
}

/**
 * Gunzip a database file and import it
 */
Drupal6.prototype.MySQLextractDatabaseAndImport = function(callback) {
	var self = this;
	self.setDatabaseServer(function(err, res) {
		
		var command = 'cd /tmp/' + self.name +
			' ; gunzip < ' + self.databaseFilename +
			' | ' +
			' mysql -u' + self.databaseUser +
			' -p' + self.databasePassword +
			' ' + self.databaseName;

		var sshOptions = {
			sshUser: self.databaseServer.ssh_user,
			address: self.databaseServer.address,
			sshPort: self.databaseServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			self.emit("stream", {
				err: err, 
				stdout: stdout, 
				stderr: stderr, 
				operation: "EXTRACTING MYSQL DATABASE AND IMPORTING",
			});

			if(!err && !stderr) {
				self.emit("MySQLextractDatabaseAndImport:end");
			}
		});
	});
}

/**
 * Imports a database, the file should not be gzipped
 */
Drupal6.prototype.MySQLimportDatabase = function(callback) {
	var self = this;
	self.setDatabaseServer(function(err, res) {

		var command = 'cd /tmp/' + self.name +
			' mysql -u' + self.databaseUser +
			' -p' + self.databasePassword +
			' ' + self.databaseName + 
			' < ' + self.databaseFilename;

		var sshOptions = {
			sshUser: self.databaseServer.ssh_user,
			address: self.databaseServer.address,
			sshPort: self.databaseServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			self.emit("stream", {
				err: err, 
				stdout: stdout, 
				stderr: stderr, 
				operation: "IMPORTING DATABASE",
			});

			if(!err && !stderr) {
				self.emit("MySQLimportDatabase:end");
			}
		});
	});
}













Drupal6.prototype.deleteDirectoryWebServer = function(callback) {
	var self = this;

	self.setWebServer(function(err, res) {
		var command = 'sudo rm -Rf ' + self.destinationDirectory;

		var sshOptions = {
			sshUser: self.webServer.ssh_user,
			address: self.webServer.address,
			sshPort: self.webServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});
	});
}

/**
 * Creates a directory
 */
Drupal6.prototype.createDirectoryWebServer = function(callback) {
	var self = this;

	self.setWebServer(function(err, res) {
		var command = 'sudo mkdir -p ' + self.destinationDirectory;

		var sshOptions = {
			sshUser: self.webServer.ssh_user,
			address: self.webServer.address,
			sshPort: self.webServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			if(err || stderr) {
				self.emit("cleanup");
			}

			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});
	});
}

/**
 * Creates a directory
 */
Drupal6.prototype.createLogsDirectory = function(callback) {
	var self = this;
	self.setWebServer(function(err, res) {
		var command = 'sudo mkdir -p ' + self.logsDirectory;

		var sshOptions = {
			sshUser: self.webServer.ssh_user,
			address: self.webServer.address,
			sshPort: self.webServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			if(err || stderr) {
				self.emit("cleanup");
			}

			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});
	});
}

/**
 * Creates a directory
 */
Drupal6.prototype.deleteLogsDirectory = function(callback) {
	var self = this;
	self.setWebServer(function(err, res) {
		var command = 'sudo r -Rf ' + self.logsDirectory;

		var sshOptions = {
			sshUser: self.webServer.ssh_user,
			address: self.webServer.address,
			sshPort: self.webServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});
	});
}

/**
 * Clone the codeArchive setting to the destinationDirectory using the codeBranch
 */
Drupal6.prototype.cloneProject = function(callback) {
	var self = this;
	self.setWebServer(function(err, res) {
		var command = 'sudo git clone' +
				' ' + self.codeArchive +
				' -b ' + self.codeBranch + 
				' ' + self.destinationDirectory;

		var sshOptions = {
			sshUser: self.webServer.ssh_user,
			address: self.webServer.address,
			sshPort: self.webServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			if(err || stderr) {
				self.emit("cleanup");
			}

			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});
	});
}




Drupal6.prototype.deleteVirtualHost = function(callback) {
	var self = this;

	self.setWebServer(function(err, res) {
		var command = 'sudo rm -Rf /etc/apache2/sites-available/' + self.fqdn + ".conf";

		var sshOptions = {
			sshUser: self.databaseServer.ssh_user,
			address: self.databaseServer.address,
			sshPort: self.databaseServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});
	});
}

// Use recepies
Drupal6.prototype.createVirtualHost = function(callback) {
	var self = this;

	self.setWebServer(function(err, res) {
		var now = new Date();
		var started = dateformat(now, "yyyy-mm-dd hh:mm:ss");

		var template = '<VirtualHost *:80>\n' +
   		'  ServerName ' + iiiepe.edu.mx + '\n' +
   		'  DocumentRoot ' + self.destinationDirectory + '\n' +
   		'  ErrorLog ' + self.logsDirectory + '/error.log' + '\n' +
   		'  CustomLog ' + self.logsDirectory + '/access.log combined' + '\n' +
   		' \n' +
   		' <Directory "' + self.destinationDirectory + '">' + '\n' +
   		'   AllowOverride All' +
   		'   Options FollowSymLinks' +
   		' </Directory>' +
   		'</VirtualHost>';

		var task = {
			id: 0,
			status: "EXECUTING",
			type: "template",
			task: 0, //?
			started: started,
			server: self.project.webserver,
			user: 1,
			parameters: [
				{
					id: "destination",
					value: "/etc/apache2/sites-available/" + self.fqdn + ".conf"	
				}
			],
			template: {
				template: template
			},
			task: {
				ssh_user: self.webServer.ssh_user,
				address: self.webServer.address,
				ssh_port: self.webServer.ssh_port
			}
		}

		var task = new Tasks();
		task.deployTemplate(task, function(err, stdout, stderr) {
			if(err || stderr) {
				self.emit("cleanup");
			}

			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});

	});
}

/**
 * Disable virtual host
 * Virtualhost should be in the form of fqdn.conf
 */
Drupal6.prototype.disableVirtualHost = function(callback) {
	var self = this;
	self.setWebServer(function(err, res) {
		var command = 'sudo a2dissite ' + self.fqdn + '.conf';

		var sshOptions = {
			sshUser: self.webServer.ssh_user,
			address: self.webServer.address,
			sshPort: self.webServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});

	});
}

/**
 * Enable virtual host
 * Virtualhost should be in the form of fqdn.conf
 */
Drupal6.prototype.enableVirtualHost = function(callback) {
	var self = this;
	self.setWebServer(function(err, res) {
		var command = 'sudo a2ensite ' + self.fqdn + '.conf';

		var sshOptions = {
			sshUser: self.webServer.ssh_user,
			address: self.webServer.address,
			sshPort: self.webServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			if(err || stderr) {
				self.emit("cleanup");
			}

			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});

	});
}

/**
 * Restarts apache
 */
Drupal6.prototype.enableRewriteModule = function(callback) {
	var self = this;
	self.setWebServer(function(err, res) {
		var command = 'sudo a2enmod rewrite';

		var sshOptions = {
			sshUser: self.webServer.ssh_user,
			address: self.webServer.address,
			sshPort: self.webServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			if(err || stderr) {
				self.emit("cleanup");
			}

			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});
	});
}


/**
 * Restarts apache
 */
Drupal6.prototype.restartApache = function(callback) {
	var self = this;
	self.setWebServer(function(err, res) {
		var command = 'sudo service apache2 restart';

		var sshOptions = {
			sshUser: self.webServer.ssh_user,
			address: self.webServer.address,
			sshPort: self.webServer.ssh_port,
			command: command
		}

		var ssh = new SSH(sshOptions);
		ssh.exec(function(err, stdout, stderr) {
			if(err || stderr) {
				self.emit("cleanup");
			}

			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});
	});
}

module.exports = Drupal6;