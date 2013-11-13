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

Drupal6.prototype.deploy = function() {
	var self = this;
}

Drupal6.prototype.createDatabase = function(callback) {
	var self = this;
	var command = 'mysqladmin'+
		' -u' + self.data.databaseUserRoot +
		' -p' + self.data.databasePasswordRoot +
		' create database ' + self.data.databaseName;

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

Drupal6.prototype.createUser = function(callback) {
	var self = this;
	var command = 'mysqladmin'+
		' -u' + self.data.databaseUserRoot +
		' -p' + self.data.databasePasswordRoot +
		' create database ' + self.data.databaseName;

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

Drupal6.prototype.assignPermissions = function() {

}

Drupal6.prototype.cloneProject = function() {

}

Drupal6.prototype.cloneDatabase = function() {

}

Drupal6.prototype.extractDatabase = function() {

}

Drupal6.prototype.importDatabase = function() {

}

Drupal6.prototype.createDirectory = function() {

}

Drupal6.prototype.createVirtualHost = function() {

}

Drupal6.prototype.enableVirtualHost = function() {

}

Drupal6.prototype.restartApache = function() {

}
