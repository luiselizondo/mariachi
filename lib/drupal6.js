var SSH = require("../lib/ssh")
	, events = require("../lib/events").events
	, EventEmitter = require('events').EventEmitter
  , e = new EventEmitter()
  , Connection = require("../lib/database")
 	, db = new Connection()
	, _ = require("underscore");

function Drupal6(project) {
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
	self.databaseUserRoot = "";
	self.databasePasswordRoot = "";
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


/**
 * Create database
 */
Drupal6.prototype.createDatabase = function(callback) {
	var self = this;

	self.setDatabaseServer(function(err, res) {
		var command = 'mysqladmin'+
			' -u' + self.project.data.databaseUserRoot +
			' -p' + self.project.data.databasePasswordRoot +
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
			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});
	});
}

/**
 * Drops database
 */
Drupal6.prototype.dropDatabase = function(callback) {
	var self = this;

	self.setDatabaseServer(function(err, res) {
		var command = 'mysql' +
				' -u' + self.project.data.databaseUserRoot +
				' -p' + self.project.data.databasePasswordRoot +
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
			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});
	});
}

/**
 * Create a user
 */
Drupal6.prototype.createUser = function(callback) {
	// CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
	var self = this;

	self.setDatabaseServer(function(err, res) {
		var query = 'CREATE USER \'' + self.data.databaseUser + '\'@' + '\'localhost\' IDENTIFIED BY \''+ self.data.databasePassword +'\'';
		var command = 'mysql' +
				' -u' + self.project.data.databaseUserRoot +
				' -p' + self.project.data.databasePasswordRoot +
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
Drupal6.prototype.assignPermissions = function() {
	// GRANT ALL PRIVILEGES ON * . * TO 'newuser'@'localhost';
	var self = this;

	self.setDatabaseServer(function(err, res) {
		var query = 'GRANT ALL PRIVILEGES ON *.* TO \'' + self.data.databaseUser + '\'@' + '\'localhost\'';
		var command = 'mysql' +
				' -u' + self.project.data.databaseUserRoot +
				' -p' + self.project.data.databasePasswordRoot +
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
Drupal6.prototype.flushPrivileges = function() {
	var self = this;

	self.setDatabaseServer(function(err, res) {
		var query = 'FLUSH PRIVILEGES';
		var command = 'mysql' +
				' -u' + self.project.data.databaseUserRoot +
				' -p' + self.project.data.databasePasswordRoot +
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
 * Creates a directory
 */
Drupal6.prototype.createDirectoryWebServer = function() {
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
			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});
	});
}

/**
 * Creates a directory
 */
Drupal6.prototype.createLogsDirectory = function() {
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
			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});
	});
}

/**
 * Clone the codeArchive setting to the destinationDirectory using the codeBranch
 */
Drupal6.prototype.cloneProject = function() {
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
			if(err) callback(err, null);
			if(stderr) callback(stderr, stdout);
			if(stdout) callback(stderr, stdout);
		});
	});
}










/**
 * Clone Database into the directory /tmp/nameOfProject
 */
Drupal6.prototype.cloneDatabase = function() {
	var self = this;
	var command = 'git clone' +
		' ' + self.options.databaseArchive +
		' /tmp/' + self.name;

	var sshOptions = {
		sshUser: self.options.databaseServer.ssh_user,
		address: self.options.databaseServer.address,
		sshPort: self.options.databaseServer.ssh_port,
		command: command
	}

	var ssh = new SSH(sshOptions);
	ssh.exec(function(err, stdout, stderr) {
		if(err) callback(err, null);
		if(stderr) callback(stderr, stdout);
		if(stdout) callback(stderr, stdout);
	});
}

/**
 * Gunzip a database file and import it
 */
Drupal6.prototype.extractDatabaseAndImport = function() {
	var self = this;
	var command = 'cd /tmp/' + self.name +
		' ; gunzip < ' + self.options.databaseFilename +
		' | ' +
		' mysql -u' + self.options.databaseUser +
		' -p' + self.options.databasePassword +
		' ' + self.options.databaseName;

	var sshOptions = {
		sshUser: self.options.databaseServer.ssh_user,
		address: self.options.databaseServer.address,
		sshPort: self.options.databaseServer.ssh_port,
		command: command
	}

	var ssh = new SSH(sshOptions);
	ssh.exec(function(err, stdout, stderr) {
		if(err) callback(err, null);
		if(stderr) callback(stderr, stdout);
		if(stdout) callback(stderr, stdout);
	});
}

/**
 * Imports a database, the file should not be gzipped
 */
Drupal6.prototype.importDatabase = function() {
	var self = this;
	var command = 'cd /tmp/' + self.name +
		' mysql -u' + self.options.databaseUser +
		' -p' + self.options.databasePassword +
		' ' + self.options.databaseName + 
		' < ' + self.options.databaseFilename;

	var sshOptions = {
		sshUser: self.options.databaseServer.ssh_user,
		address: self.options.databaseServer.address,
		sshPort: self.options.databaseServer.ssh_port,
		command: command
	}

	var ssh = new SSH(sshOptions);
	ssh.exec(function(err, stdout, stderr) {
		if(err) callback(err, null);
		if(stderr) callback(stderr, stdout);
		if(stdout) callback(stderr, stdout);
	});
}



// Use recepies
Drupal6.prototype.createVirtualHost = function() {

}

/**
 * Enable virtual host
 * Virtualhost should be in the form of fqdn.conf
 */
Drupal6.prototype.enableVirtualHost = function() {
	var self = this;
	var command = 'sudo a2ensite ' + self.options.fqdn + '.conf';

	var sshOptions = {
		sshUser: self.options.databaseServer.ssh_user,
		address: self.options.databaseServer.address,
		sshPort: self.options.databaseServer.ssh_port,
		command: command
	}

	var ssh = new SSH(sshOptions);
	ssh.exec(function(err, stdout, stderr) {
		if(err) callback(err, null);
		if(stderr) callback(stderr, stdout);
		if(stdout) callback(stderr, stdout);
	});
}

/**
 * Restarts apache
 */
Drupal6.prototype.restartApache = function() {
	var self = this;
	var command = 'sudo service apache2 restart';

	var sshOptions = {
		sshUser: self.options.databaseServer.ssh_user,
		address: self.options.databaseServer.address,
		sshPort: self.options.databaseServer.ssh_port,
		command: command
	}

	var ssh = new SSH(sshOptions);
	ssh.exec(function(err, stdout, stderr) {
		if(err) callback(err, null);
		if(stderr) callback(stderr, stdout);
		if(stdout) callback(stderr, stdout);
	});
}
