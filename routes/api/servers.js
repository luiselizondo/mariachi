var Connection = require("../../lib/database")
	, Actions = require("../../lib/actions")
	, User = require("../../lib/user")
	, db = new Connection()
	, actions = new Actions()
	, user = new User()
	, config = require("../../config");

/**
 * Get all servers
 */
function getServers(req, res) {
	if(req.query.status) {
		db.getServersWithStatus(req.query.status, function(err, results) {
			if(err) {
				console.log(err);
				res.send(401, err);
			}

			if(results) {
				console.log(results);
				res.send(200, results);
			}
		});
	}
	else {
		db.getServers(function(err, results) {
			if(err) {
				console.log(err);
				res.send(401, err);
			}

			if(results) {
				res.send(200, results);
			}
		});
	}
}

/**
 * Get one server
 */
function getServer(req, res) {
	var id = req.params.id;
	db.getServer(id, function(err, result) {
		if(err) {
			console.log(err);
			res.send(500, err);
		}

		if(result) {
			res.send(200, result);
		}
	});
}

/**
 * Create a server
 */
function postServer(req, res) {
	var data = req.body;
	
	// always set the status of a server as 0
	data.status = 0;
	db.saveServer(data, function(err, result) {
		if(err) {
			console.log(err);
			res.send(500, err);
		}

		if(result) {
			res.send(201, result);
		}
	})
}

/**
 * Update a server
 */
function putServer(req, res) {
	var id = req.params.id;
	var data = req.body;
	
	db.updateServer(id, data, function(err, result) {
		if(err) {
			console.log(err);
			res.send(500, err);
		}

		if(result) {
			res.send(201, result);
		}
	})
}

/**
 * Delete a server
 */
function deleteServer(req, res) {
	var id = req.params.id;

	db.deleteServer(id, function(err, result) {
		if(err) {
			console.log(err);
			res.send(500, err);
		}

		if(result) {
			res.send(200, result);
		}
	});
}

function getSSHKey(req, res) {
	var id = req.params.id;

	db.getServer(id, function(err, server) {
		require("fs").readFile(config.ssh.publicKey, "utf-8", function(err, publicKey) {
			if(err) {
				res.send(406, err);
			}

			if(publicKey) {
				res.send(200, {
					publicKey: publicKey,
					server: server
				});
			}
		});
	});
}

/**
 * Get actions
 */
function getActions(req, res) {
	// @see lib/actions.js
	switch(req.query.action) {
		case "refreshStatus": 
			actions.refreshStatus(req, res);
			break;
	}
}

/** 
 * Creates a new SSH Key on the server 
 */
function getCreateSSHKey(req, res) {
	actions.getCreateSSHKey(req, res);
}

/** 
 * Gets an SSH Key 
 */
function getGetSSHKey(req, res) {
	actions.getGetSSHKey(req, res);
}

module.exports = function(app) {
	app.get("/api/servers", user.auth, getServers);
	app.get("/api/servers/actions", user.auth, getActions);
	app.get("/api/servers/:id", user.auth, getServer);
	app.get("/api/servers/:id/createSSHKey", user.auth, getCreateSSHKey);
	app.get("/api/servers/:id/getSSHKey", user.auth, getGetSSHKey);
	app.post("/api/servers", user.auth, postServer);
	app.put("/api/servers/:id", user.auth, putServer);
	app.delete("/api/servers/:id", user.auth, deleteServer);
	app.get("/api/ssh/key/:id", user.auth, getSSHKey);

}