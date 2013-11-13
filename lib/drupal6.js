var SSH = require("../lib/ssh")
	, events = require("../lib/events").events
  , Connection = require("../lib/database")
 	, db = new Connection()
	, _ = require("underscore");

function Drupal6(options) {
	var self = this;
	self.type = "";
	self.name = "";
	self.fqdn = "";
	self.data = {}
	self.options = {}

	// private constructor 
	__construct = function() {
		console.log(options);

		self.type = options.type;
		self.name = options.name;
		self.fqdn = options.fqdn;
		self.data = options.data;
		self.options = options;

		self.deploy();
	}()
}

module.exports = Drupal6;

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
 * Deploy action
 */
Drupal6.prototype.deploy = function() {
	var self = this;
}

/**
 * Create database
 */
Drupal6.prototype.createDatabase = function(callback) {
	var self = this;
	var command = 'mysqladmin'+
		' -u' + self.data.databaseUserRoot +
		' -p' + self.data.databasePasswordRoot +
		' --port=' + self.data.databasePort +
		' create ' + self.data.databaseName;

	var sshOptions = {
		sshUser: self.options.databaseServer.ssh_user,
		serverAddress: self.options.databaseServer.address,
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
 * Drops database
 */
Drupal6.prototype.dropDatabase = function(callback) {
	var self = this;
	var command = 'mysqladmin' +
		' -u' + self.data.databaseUserRoot +
		' -p' + self.data.databasePasswordRoot +
		' --port=' + self.data.databasePort +
		' -y' +
		' drop ' + self.data.databaseName;
}

/**
 * Create a user
 */
Drupal6.prototype.createUser = function(callback) {
	// CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
	var self = this;
	var query = 'CREATE USER "' + self.data.databaseUser + '"@' +
		'"localhost" IDENTIFIED BY "'+ self.data.databasePassword +'"';

	var command = 'mysql '+
		' -u' + self.data.databaseUserRoot +
		' -p' + self.data.databasePasswordRoot +
		' --port=' + self.data.databasePort +
		' --execute ' + query;

	var sshOptions = {
		sshUser: self.options.databaseServer.ssh_user,
		serverAddress: self.options.databaseServer.address,
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
 * Assign permissions
 */
Drupal6.prototype.assignPermissions = function() {
	// GRANT ALL PRIVILEGES ON * . * TO 'newuser'@'localhost';
	var self = this;
	var query = 'GRANT ALL PRIVILEGES ON *.* TO "' + self.data.databaseUser + '"@' +
		'"localhost"';

	var command = 'mysql '+
		' -u' + self.data.databaseUserRoot +
		' -p' + self.data.databasePasswordRoot +
		' --port=' + self.data.databasePort +
		' --execute ' + query;

	var sshOptions = {
		sshUser: self.options.databaseServer.ssh_user,
		serverAddress: self.options.databaseServer.address,
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
 * Clone the codeArchive setting to the destinationDirectory using the codeBranch
 */
Drupal6.prototype.cloneProject = function() {
	var self = this;
	var command = 'git clone' +
		' -b ' + self.options.codeBranch + 
		' ' + self.options.codeArchive +
		' ' + self.options.destinationDirectory;

	var sshOptions = {
		sshUser: self.options.databaseServer.ssh_user,
		serverAddress: self.options.databaseServer.address,
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
 * Clone Database into the directory /tmp/nameOfProject
 */
Drupal6.prototype.cloneDatabase = function() {
	var self = this;
	var command = 'git clone' +
		' ' + self.options.databaseArchive +
		' /tmp/' + self.name;

	var sshOptions = {
		sshUser: self.options.databaseServer.ssh_user,
		serverAddress: self.options.databaseServer.address,
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
		serverAddress: self.options.databaseServer.address,
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
		serverAddress: self.options.databaseServer.address,
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
 * Creates a directory
 */
Drupal6.prototype.createDirectory = function(directory) {
	var self = this;
	var command = 'mkdir -p ' + directory;

	var sshOptions = {
		sshUser: self.options.databaseServer.ssh_user,
		serverAddress: self.options.databaseServer.address,
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
		serverAddress: self.options.databaseServer.address,
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
		serverAddress: self.options.databaseServer.address,
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
