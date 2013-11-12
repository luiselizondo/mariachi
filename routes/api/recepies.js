var Connection = require("../../lib/database");
var db = new Connection();
var User = require("../../lib/user");
var user = new User();

/**
 * Get all Recepies
 */
function getRecepies(req, res) {
	db.getRecepies(function(err, results) {
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
 * Get one Recepie
 */
function getRecepie(req, res) {
	var id = req.params.id;
	db.getRecepie(id, function(err, result) {
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
 * Create a Recepie
 */
function postRecepie(req, res) {
	var data = req.body;

	db.saveRecepie(data, function(err, result) {
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
 * Update a Recepie
 */
function putRecepie(req, res) {
	var id = req.params.id;
	var data = req.body;
	
	db.updateRecepie(id, data, function(err, result) {
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
 * Delete a Recepie
 */
function deleteRecepie(req, res) {
	var id = req.params.id;

	db.deleteRecepie(id, function(err, result) {
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
	app.get("/api/recepies", user.auth, getRecepies);
	app.get("/api/recepies/:id", user.auth, getRecepie);
	app.post("/api/recepies", user.auth, postRecepie);
	app.put("/api/recepies/:id", user.auth, putRecepie);
	app.delete("/api/recepies/:id", user.auth, deleteRecepie);
}