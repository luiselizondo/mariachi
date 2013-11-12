var Connection = require("../../lib/database");
var db = new Connection();
var User = require("../../lib/user");
var user = new User();

/**
 * Get all Users
 */
function getUsers(req, res) {
	db.getUsers(function(err, results) {
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

/**
 * Get one User
 */
function getUser(req, res) {
	var id = req.params.id;
	db.getUser(id, function(err, result) {
		if(err) {
			console.log(err);
			res.send(500, err);
		}

		if(result) {
			console.log(result);
			res.send(200, result);
		}
	});
}

/**
 * Create a User
 */
function postUser(req, res) {
	var data = req.body;
	
	data.created = new Date();

	db.saveUser(data, function(err, result) {
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
 * Update a User
 */
function putUser(req, res) {
	var id = req.params.id;
	var data = req.body;
	
	db.updateUser(id, data, function(err, result) {
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
 * Delete a User
 */
function deleteUser(req, res) {
	var id = req.params.id;

	db.deleteUser(id, function(err, result) {
		if(err) {
			console.log(err);
			res.send(500, err);
		}

		if(result) {
			res.send(200, result);
		}
	});
}

module.exports = function(app) {
	app.get("/api/users", user.auth, getUsers);
	app.get("/api/users/:id", user.auth, getUser);
	app.post("/api/users", user.auth, postUser);
	app.put("/api/users/:id", user.auth, putUser);
	app.delete("/api/users/:id", user.auth, deleteUser);
}