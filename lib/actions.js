var Connection = require("../lib/database")
	, config = require("../config")
	, SSH = require("../lib/ssh")
	, db = new Connection();

function Actions() {

}

module.exports = Actions;

/** 
 * Check status of all servers 
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

