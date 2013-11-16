var Connection = require("../lib/database")
	, config = require("../config")
	, SSH = require("../lib/ssh")
	, db = new Connection();

function Actions() {

}

module.exports = Actions;

/** 
 * Check status of all servers 
 * Saves last status to the database
 * @return object with the id of the server and the status
 */
Actions.prototype.refreshStatus = function(req, res) {
	db.getServers(function(err, servers) {
		var counter = 0;
		var serversTotal = servers.length;

		var results = [];
		servers.forEach(function(server) {
			var options = {
				sshUser: server.ssh_user,
				sshPort: server.ssh_port,
				address: server.address,
			}

			var ssh = new SSH(options);

			ssh.checkStatus(function(err, status) {
				db.updateServer(server.id, {status: status}, function(err, result) {
					results.push({
						id: server.id,
						status: status
					});
					
					counter++;

					// finish
					if(counter === serversTotal) {
						res.send(200, results);
					}
				})
			});
		});
	});
}

Actions.prototype.getCreateSSHKey = function(req, res) {
	var id = req.params.id;
	var self = this;

	db.getServer(id, function(err, server) {
		if(err) {
			res.send(406, err);
		}
		if(server) {
			var options = {
				sshUser: server.ssh_user,
				sshPort: server.ssh_port,
				address: server.address,
				command: "ssh-keygen -t rsa -f ~/.ssh/id_rsa -N ''"
			}

			var ssh = new SSH(options);

			ssh.exec(function(err, stdout, stderr) {
				if(err) {
					console.log(err);
					res.send(406, {error: err});
				}
				if(stderr) {
					console.log(stderr);
					res.send(406, {error: stderr});
				}
				if(stdout) {
					console.log(stdout);
					res.send(200, {result: stdout});
				}
			});
		}
	})
}

Actions.prototype.getGetSSHKey = function(req, res) {
	var id = req.params.id;
	var self = this;

	db.getServer(id, function(err, server) {
		if(err) {
			res.send(406, {error: err});
		}
		if(server) {
			var options = {
				sshUser: server.ssh_user,
				sshPort: server.ssh_port,
				address: server.address,
				command: "cat ~/.ssh/id_rsa.pub"
			}

			var ssh = new SSH(options);

			ssh.exec(function(err, stdout, stderr) {
				if(err) {
					console.log(err);
					res.send(200, {result: err});
				}
				if(stderr) {
					console.log(stderr);
					res.send(200, {result: stderr});
				}
				if(stdout) {
					console.log(stdout);
					res.send(200, {result: stdout});
				}
			});
		}
	})
}