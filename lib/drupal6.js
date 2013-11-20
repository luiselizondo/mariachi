var SSH = require("../lib/ssh")
	, events = require("../lib/events").events
	, e = require('events')
  , Connection = require("../lib/database")
 	, db = new Connection()
 	, Tasks = require("../lib/tasks")
 	, util = require("util")
 	, dateFormat = require("dateformat")
	, _ = require("underscore");

// id: 1,
 //  type: 'drupal6',
 //  name: 'Directorio',
 //  fqdn: 'directorio.iiiepe.edu.mx',
 //  data: 
 //   { webserver: '1',
 //     codeArchive: 'git@git.iiiepe.net:projects/directorio.git',
 //     codeBranch: 'master',
 //     destinationDirectory: '/srv/www/directorio.iiiepe.edu.mx/public_html',
 //     logsDirectory: '/srv/www/directorio.iiiepe.edu.mx/logs',
 //     databaseServer: '1',
 //     databaseArchive: 'git@git.iiiepe.net:databases/directorio.git',
 //     databaseFilename: 'database.sql.gz',
 //     databaseType: 'mysql',
 //     databaseName: 'directorio',
 //     databaseUser: 'root',
 //     databasePassword: 'directoriopass',
 //     databasePort: '3306',
 //     createDatabase: 'no',
 //     databaseUserRoot: 'root',
 //     databasePasswordRoot: 'Admin111393',
 //     data: {} } }
 //     

function Drupal6(project) {
	var self = this;
	self.project = project;

	e.EventEmitter.call(this);

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

	
	// Create the database
	self.on("end:MySQLcreateDatabase", function() {
		self.emit("start:createUser");
	});

	self.on("end:MySQLcreateUser", function() {
		self.emit("start:MySQLassignPermissions");
	});

	// Start deployment
	self.on("deploy", function() {
		console.log("Start deployment");
		if(self.project.data.createDatabase === "yes") {
			self.emit("start:createDatabase");
		}
	});

	self.on("_processStream", function(result) {
		var data = {
			status: result.operation,
			stdout: "",
			stderr: "",
		}

		if(result.err) {
			data.stderr = result.err;
		}

		// If the event does not produce stdout, we create one using the message
		if(!result.err && !result.stderr && !result.stdout) {
			data.stdout = result.operation + " FINISHED";
		}

		events.emit("projects:stream", data);

		if(err || stderr) {
			data.status = "ERROR";
			e.emit("projects:finished", data);

			e.emit("cleanup");
		}
	})

	self.on("cleanup", function() {
		self.cleanUp(function(err, stdout) {
			events.emit("projects:cleanupFinished", {
				project: self.project,
				err: err,
				stdout: stdout
			});
		});
	});

	// Event _createDatabase
	self.on("start:createDatabase", function() {
		// checks for the database type
		if(self.databaseType === "mysql") {
			self.setDatabaseServer(function(err, server) {
				self.databaseServer = server;
				
				// Create the database
				self.MySQLcreateDatabase();
			})
		}
	});

	self.on("start:createUser", function() {
		if(self.databaseType === "mysql") {
			self.MySQLcreateUser();
		}
	});
}

module.exports = Drupal6;

Drupal6.prototype.setWebServer = function(callback) {
	var self = this;
	db.getServer(self.project.data.webserver, function(err, server) {
		if(err) console.log(err);
		if(server) self.webServer = server;

		e.emit("webserver:ready");
		callback(err, server);
	})
}

Drupal6.prototype.setDatabaseServer = function(callback) {
	var self = this;
	db.getServer(self.project.data.databaseServer, function(err, server) {
		if(err) console.log(err);
		if(server) self.databaseServer = server;

		e.emit("databaseserver:ready");
		callback(err, server);
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

Drupal6.prototype.deploy = function(callback) {
	var self = this;
	console.log("Deploying");

	


	// 		self.MySQLassignPermissions(function(err, stdout, stderr) {
	// 			self.MySQLflushPrivileges(function(err, stdout, stderr) {
	// 				self.createDirectoryWebServer(function(err, stdout, stderr) {
	// 					self.createLogsDirectory(function(err, stdout, stderr) {
	// 						self.cloneDatabase(function(err, stdout, stderr) {
	// 							self.cloneProject(function(err, stdout, stderr) {
	// 								self.MySQLextractDatabaseAndImport(function(err, stdout, stderr) {
	// 									self.createVirtualHost(function(err, stdout, stderr) {
	// 										self.enableVirtualHost(function(err, stdout, stderr) {
	// 											self.enableRewriteModule(function(err, stdout, stderr) {
	// 												self.restartApache(function(err, stdout, stderr) {
	// 													callback(null, "Finished deploying project");
	// 												})
	// 											})
	// 										})
	// 									})
	// 								})
	// 							})
	// 						})
	// 					})
	// 				})
	// 			});
	// 		});
	// 	});
	// });
}

Drupal6.prototype.cleanUp = function(callback) {
	var self = this;
	console.log("Something went wrong. Starting cleanup");
	self.MySQLdropDatabase(function(err, stdout, stderr) {
		self.MySQLdropUser(function(err, stdout, stderr) {
			self.deleteDirectoryWebServer(function(err, stdout, stderr) {
				self.deleteLogsDirectory(function(err, stdout, stderr) {
					self.disableVirtualHost(function(err, stdout, stderr) {
						self.deleteVirtualHost(function(err, stdout, stderr) {
							self.restartApache(function(err, stdout, stderr) {
								callback(null, true);
							});
						})
					});
				});
			})
		})
	})
}

/**
 * Create database
 */
Drupal6.prototype.MySQLcreateDatabase = function(callback) {
	var self = this;

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
		e.emit("_processStream", {
			err: err, 
			stdout: stdout, 
			stderr: stderr, 
			operation: "CREATING DATABASE " + self.databaseName,
		});

		if(!err && !stderr) {
			e.emit("end:MySQLcreateDatabase");
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
		e.emit("_processStream", {
			err: err, 
			stdout: stdout, 
			stderr: stderr, 
			operation: "DROPING DATABASE " + self.databaseName,
		});

		if(!err && !stderr) {
			e.emit("end:MySQLcreateUser");
		}
	});
}

/**
 * Create a user
 */
Drupal6.prototype.MySQLcreateUser = function(callback) {
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
			e.emit("_processStream", {
				err: err, 
				stdout: stdout, 
				stderr: stderr, 
				operation: "CREATING USER",
			});
		});
	});
}

/**
 * Create a user
 */
Drupal6.prototype.MySQLdropUser = function(callback) {
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
			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});
	});
}

/**
 * Assign permissions
 */
Drupal6.prototype.MySQLassignPermissions = function(callback) {
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
			if(err || stderr) {
				e.emit("cleanup");
			}

			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
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
			if(err || stderr) {
				e.emit("cleanup");
			}

			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
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
				e.emit("cleanup");
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
				e.emit("cleanup");
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
				e.emit("cleanup");
			}

			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
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
			if(err || stderr) {
				e.emit("cleanup");
			}

			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
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
			if(err || stderr) {
				e.emit("cleanup");
			}

			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
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
			if(err || stderr) {
				e.emit("cleanup");
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
				e.emit("cleanup");
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
				e.emit("cleanup");
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
				e.emit("cleanup");
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
				e.emit("cleanup");
			}

			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});
	});
}
