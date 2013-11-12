var Connection = require("../../lib/database");
var db = new Connection();
var User = require("../../lib/user");
var user = new User();

/**
 * Get all servers
 */
function getServers(req, res) {
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
	var publicKey = require("fs").readFileSync("/Users/luis/.ssh/id_rsa.pub");
	res.send(200, publicKey);
}

module.exports = function(app) {
	app.get("/api/servers", user.auth, getServers);
	app.get("/api/servers/:id", user.auth, getServer);
	app.post("/api/servers", user.auth, postServer);
	app.put("/api/servers/:id", user.auth, putServer);
	app.delete("/api/servers/:id", user.auth, deleteServer);
	app.get("/api/ssh/key", user.auth, getSSHKey);
}