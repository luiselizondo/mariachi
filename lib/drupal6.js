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
	self.status = 0;

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
	self.logsDirectory = project.data.logsDirectory;

	self.stderr = "";
	self.stdout = "";
	
	self.on("start", function() {
		console.log("Set webserver");
		
		var started = new Date();

		// inform the global event system that we just started
		events.emit("projects:start", {
			started: dateFormat(started, "yyyy-mm-dd hh:mm:ss"),
			ended: "",
			stdout: "STARTING" + "\n",
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

			// DEPLOY START WILL START ON setDatabaseServer:end
		}
		else {			
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
		self.status = 1;

		var data = {
			status: result.operation,
			stdout: result.stdout + "\n",
			stderr: result.stderr + "\n",
		}

		if(result.err) {
			data.stderr = result.err.code  + "\n";
			self.stderr = result.err.code  + "\n";
			self.status = 0;
		}

		// If the event does not produce stdout, we create one using the message
		if(!result.err && !result.stderr && !result.stdout) {
			self.stdout += result.operation + " FINISHED" + "\n";
			data.stdout = result.operation + " FINISHED" + "\n";
			self.status = 1;
		}

		events.emit("projects:stream", data);

		if(result.err || result.stderr) {
			data.status = "ERROR";
			self.status = 0;
			// self.emit("cleanup");
		}

		// self.emit("projects:finished", data);
	});

	// Start deployment
	self.on("deploy:start", function() {
		// Decide to create the database or not
		if(self.project.data.createDatabase === "yes") {
			self.emit("deployDatabaseServer:start");
		}
		// do not create the database, start deployment of git files inmediatelly
		else {
			self.emit("deployWebServer:start");
		}
	});

	// Event _createDatabase
	self.on("deployDatabaseServer:start", function() {
		// checks for the database type
		if(self.databaseType === "mysql") {
			// Create the database
			self.emit("MySQLdropDatabase:start");
		}
		if(self.databaseType === "mongo") {
			// @todo create database mongodb
		}
	});

	self.on("MySQLdropDatabase:start", function() {
		self.MySQLdropDatabase();
	})

	self.on("MySQLdropDatabase:end", function() {
		self.MySQLdropUser();
	})

	self.on("MySQLdropUser:end", function() {
		self.MySQLcreateDatabase();
	})

	self.on("MySQLcreateDatabase:end", function () {
		self.MySQLcreateUser();
	});

	self.on("MySQLcreateUser:end", function() {
		console.log("Fired MySQLcreateUser:end");
		self.MySQLassignPermissions();
	});

	self.on("MySQLassignPermissions:end", function() {
		console.log("Fired MySQLassignPermissions:end");
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
		self.emit("deployWebServer:start");
	});

	self.on("deployWebServer:start", function() {
		self.deleteDirectoryWebServer();
	});

	self.on("deleteDirectoryWebServer:end", function() {
		self.createDirectoryWebServer();
	});

	self.on("createDirectoryWebServer:end", function() {
		self.deleteLogsDirectory();
	});

	self.on("deleteLogsDirectory:end", function() {
		self.createLogsDirectory();
	});

	self.on("createLogsDirectory:end", function() {
		self.cloneProject();
	});

	self.on("cloneProject:end", function() {
		self.disableVirtualHost();
	});

	self.on("disableVirtualHost:end", function() {
		self.deleteVirtualHost();
	});

	self.on("deleteVirtualHost:end", function() {
		self.createVirtualHost();
	});

	self.on("createVirtualHost:end", function() {
		self.enableVirtualHost();
	});

	self.on("enableVirtualHost:end", function() {
		self.restartApache();
	});

	self.on("restartApache:end", function() {
		self.emit("projects:finished");
	});

	self.on("cleanup", function() {
		self.cleanUp();
	});

	self.on("projects:finished", function() {
		self.finished();
	})
}

// order is important here, if I define a new method *before*
// this line, the method will not be recognized because it's overwritten
// http://stackoverflow.com/questions/15493285/understanding-javascript-inheritance-and-node-js-util-inherits-function-example
util.inherits(Drupal6, e.EventEmitter);

/**
 * Start deployment
 */
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
Drupal6.prototype.finished = function() {	
	var self = this;
	var status = self.status;
	var ended = new Date();


	db.updateProject(self.project.id, {
		stderr: self.stderr,
		stdout: self.stdout,
		status: status,
	}, function(err, result) {

		if(self.status === 1) {
			status = "SUCCESS";
		}
		else {
			status = "ERROR";
		}

		// Send this to the ges
		var data = {
			stdout: self.stdout,
			stderr: self.stderr,
			status: status,
			ended: dateFormat(ended, "yyyy-mm-dd hh:mm:ss")
		}

		// inform the global events system
		events.emit("projects:finished", data);
		console.log("Finished");
	});
}

Drupal6.prototype.cleanUp = function(callback) {
	var self = this;
	console.log("Something went wrong. Starting cleanup");

	// self.emit("MySQLdropDatabase:start");
}

/**
 * Create database
 */
Drupal6.prototype.MySQLcreateDatabase = function(callback) {
	var self = this;
	console.log("Executing MySQLcreateDatabase ===");

	events.emit("projects:stream", {
		stdout: "CREATING DATABASE " + self.databaseName + "\n",
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
			operation: "CREATING DATABASE",
		});

		if(!err && !stderr) {
			self.emit("MySQLcreateDatabase:end");
		}
	});
}

/**
 * Drops database
 */
Drupal6.prototype.MySQLdropDatabase = function(callback) {
	console.log("Executing MySQLdropDatabase ===");
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
			operation: "DROPING DATABASE",
		});

		self.emit("MySQLdropDatabase:end");
	});
}

/**
 * Create a user
 */
Drupal6.prototype.MySQLcreateUser = function(callback) {
	console.log("Executing MySQLcreateUser ===");
	// CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
	var self = this;

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
			self.emit("MySQLcreateUser:end");
		}
	});
}

/**
 * Create a user
 */
Drupal6.prototype.MySQLdropUser = function(callback) {
	console.log("Executing MySQLdropUser ===");
	// CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
	var self = this;

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
			operation: "DROPING USER " + "\n",
		});

		self.emit("MySQLdropUser:end");
	});
}

/**
 * Assign permissions
 */
Drupal6.prototype.MySQLassignPermissions = function(callback) {
	console.log("Executing MySQLassignPermissions ===");
	// GRANT ALL PRIVILEGES ON * . * TO 'newuser'@'localhost';
	var self = this;

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
}

/**
 * Assign permissions
 */
Drupal6.prototype.MySQLflushPrivileges = function(callback) {
	console.log("Executing MySQLflushPrivileges ===");
	var self = this;

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
			console.log("Firing MySQLflushPrivileges ===");
			self.emit("MySQLflushPrivileges:end");
		}
	});
}

/**
 * Clone Database into the directory /tmp/nameOfProject
 */
Drupal6.prototype.cloneDatabase = function(callback) {
	console.log("Executing cloneDatabase ===");
	var self = this;
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
			console.log("Firing cloneDatabase ===");
			self.emit("cloneDatabase:end");
		}
	});
}

/**
 * Gunzip a database file and import it
 */
Drupal6.prototype.MySQLextractDatabaseAndImport = function(callback) {
	console.log("Executing MySQLextractDatabaseAndImport ===");
	var self = this;
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
			console.log("Firing MySQLextractDatabaseAndImport ===");
			self.emit("MySQLextractDatabaseAndImport:end");
		}
	});
}

/**
 * Imports a database, the file should not be gzipped
 */
Drupal6.prototype.MySQLimportDatabase = function(callback) {
	var self = this;
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
}













Drupal6.prototype.deleteDirectoryWebServer = function() {
	var self = this;

	var command = 'sudo rm -Rf ' + self.destinationDirectory;

	var sshOptions = {
		sshUser: self.webServer.ssh_user,
		address: self.webServer.address,
		sshPort: self.webServer.ssh_port,
		command: command
	}

	var ssh = new SSH(sshOptions);
	ssh.exec(function(err, stdout, stderr) {
		self.emit("stream", {
			err: err, 
			stdout: stdout, 
			stderr: stderr, 
			operation: "DELETING DIRECTORY FOR WEBSERVER",
		});

		// Always continue
		self.emit("deleteDirectoryWebServer:end");
	});
}

/**
 * Creates a directory
 */
Drupal6.prototype.createDirectoryWebServer = function() {
	var self = this;

	var command = 'sudo mkdir -p ' + self.destinationDirectory;

	var sshOptions = {
		sshUser: self.webServer.ssh_user,
		address: self.webServer.address,
		sshPort: self.webServer.ssh_port,
		command: command
	}

	var ssh = new SSH(sshOptions);
	ssh.exec(function(err, stdout, stderr) {
		self.emit("stream", {
			err: err, 
			stdout: stdout, 
			stderr: stderr, 
			operation: "CREATING DIRECTORY FOR WEBSERVER",
		});

		// COntinue if no err or no stderr
		if(!err && !stderr) {
			self.emit("createDirectoryWebServer:end");
		}
	});
}

/**
 * Creates a directory
 */
Drupal6.prototype.createLogsDirectory = function() {
	var self = this;
	var command = 'sudo mkdir -p ' + self.logsDirectory;

	var sshOptions = {
		sshUser: self.webServer.ssh_user,
		address: self.webServer.address,
		sshPort: self.webServer.ssh_port,
		command: command
	}

	var ssh = new SSH(sshOptions);
	ssh.exec(function(err, stdout, stderr) {
		self.emit("stream", {
			err: err, 
			stdout: stdout, 
			stderr: stderr, 
			operation: "CREATING DIRECTORY FOR LOGS",
		});

		if(!err && !stderr) {
			self.emit("createLogsDirectory:end");
		}
	});
}

/**
 * Creates a directory
 */
Drupal6.prototype.deleteLogsDirectory = function() {
	var self = this;
	var command = 'sudo rm -Rf ' + self.logsDirectory;

	var sshOptions = {
		sshUser: self.webServer.ssh_user,
		address: self.webServer.address,
		sshPort: self.webServer.ssh_port,
		command: command
	}

	var ssh = new SSH(sshOptions);
	ssh.exec(function(err, stdout, stderr) {
		self.emit("stream", {
			err: err, 
			stdout: stdout, 
			stderr: stderr, 
			operation: "DELETING LOGS DIRECTORY",
		});

		// Always continue
		self.emit("deleteLogsDirectory:end");
	});
}

/**
 * Clone the codeArchive setting to the destinationDirectory using the codeBranch
 */
Drupal6.prototype.cloneProject = function() {
	console.log("Cloning project started");
	var self = this;
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
		self.emit("stream", {
			err: err, 
			stdout: stdout, 
			stderr: stderr, 
			operation: "CLONE PROJECT",
		});

		console.log("Cloning project ended");

		console.log(err);
		console.log(stdout);
		console.log(stderr);

		if(!err && !stderr) {
			self.emit("cloneProject:end");
		}
	});
}

Drupal6.prototype.deleteVirtualHost = function() {
	var self = this;

	var command = 'sudo rm -Rf /etc/apache2/sites-available/' + self.fqdn + ".conf";

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
			operation: "DELETING VIRTUAL HOST",
		});

		// Always continue
		self.emit("deleteVirtualHost:end");
		
	});
}

// Use recepies
Drupal6.prototype.createVirtualHost = function() {
	var self = this;

	var now = new Date();
	var started = dateFormat(now, "yyyy-mm-dd hh:mm:ss");

	var template = '<VirtualHost *:80>\n' +
 		'  ServerName ' + self.fqdn + '\n' +
 		'  DocumentRoot ' + self.destinationDirectory + '\n' +
 		'  ErrorLog ' + self.logsDirectory + '/error.log' + '\n' +
 		'  CustomLog ' + self.logsDirectory + '/access.log combined' + '\n' +
 		' \n' +
 		' <Directory "' + self.destinationDirectory + '">' + '\n' +
 		'     AllowOverride All' + '\n' +
 		'     Options FollowSymLinks' + '\n' +
 		'  </Directory>' + '\n' +
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
				value: "/tmp/" + self.fqdn + ".conf"	
			}
		],
		template: {
			template: template
		},
		ssh_user: self.webServer.ssh_user,
		address: self.webServer.address,
		ssh_port: self.webServer.ssh_port
	}

	var tasks = new Tasks();
	tasks.deployTemplate(task, function(err, stdout, stderr) {
		self.emit("stream", {
			err: err, 
			stdout: stdout, 
			stderr: stderr, 
			operation: "CREATING VIRTUAL HOST",
		});

		if(!err && !stderr) {
			self.moveVirtualHostFile();
		}
	});
}


/**
 * Disable virtual host
 * Virtualhost should be in the form of fqdn.conf
 */
Drupal6.prototype.moveVirtualHostFile = function() {
	var self = this;
	var command = 'sudo mv /tmp/' + self.fqdn + '.conf' +
		' /etc/apache2/sites-available/' + self.fqdn + '.conf';

	var sshOptions = {
		sshUser: self.webServer.ssh_user,
		address: self.webServer.address,
		sshPort: self.webServer.ssh_port,
		command: command
	}

	var ssh = new SSH(sshOptions);
	ssh.exec(function(err, stdout, stderr) {
		self.emit("stream", {
			err: err, 
			stdout: stdout, 
			stderr: stderr, 
			operation: "MOVING VIRTUAL HOST FILE",
		});

		// Always continue
		self.emit("createVirtualHost:end");
	});
}

/**
 * Disable virtual host
 * Virtualhost should be in the form of fqdn.conf
 */
Drupal6.prototype.disableVirtualHost = function() {
	var self = this;
	var command = 'sudo a2dissite ' + self.fqdn + '.conf';

	var sshOptions = {
		sshUser: self.webServer.ssh_user,
		address: self.webServer.address,
		sshPort: self.webServer.ssh_port,
		command: command
	}

	var ssh = new SSH(sshOptions);
	ssh.exec(function(err, stdout, stderr) {
		self.emit("stream", {
			err: err, 
			stdout: stdout, 
			stderr: stderr, 
			operation: "DISABLING VIRTUAL HOST",
		});

		// Always continue
		self.emit("disableVirtualHost:end");
	});
}

/**
 * Enable virtual host
 * Virtualhost should be in the form of fqdn.conf
 */
Drupal6.prototype.enableVirtualHost = function() {
	var self = this;
	var command = 'sudo a2ensite ' + self.fqdn + '.conf';

	var sshOptions = {
		sshUser: self.webServer.ssh_user,
		address: self.webServer.address,
		sshPort: self.webServer.ssh_port,
		command: command
	}

	var ssh = new SSH(sshOptions);
	ssh.exec(function(err, stdout, stderr) {
		self.emit("stream", {
			err: err, 
			stdout: stdout, 
			stderr: stderr, 
			operation: "ENABLING VIRTUAL HOST",
		});

		if(!err && !stderr) {
			self.emit("enableVirtualHost:end");
		}
	});
}


/**
 * Restarts apache
 */
Drupal6.prototype.restartApache = function() {
	var self = this;
	var command = 'sudo service apache2 restart';

	var sshOptions = {
		sshUser: self.webServer.ssh_user,
		address: self.webServer.address,
		sshPort: self.webServer.ssh_port,
		command: command
	}

	var ssh = new SSH(sshOptions);
	ssh.exec(function(err, stdout, stderr) {
		self.emit("stream", {
			err: err, 
			stdout: stdout, 
			stderr: stderr, 
			operation: "RESTARTING APACHE",
		});

		
		self.emit("restartApache:end");
	});
}

module.exports = Drupal6;