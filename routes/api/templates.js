var Connection = require("../../lib/database");
var db = new Connection();
var User = require("../../lib/user");
var user = new User();

/**
 * Get all Templates
 */
function getTemplates(req, res) {
	db.getTemplates(function(err, results) {
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
 * Get one Template
 */
function getTemplate(req, res) {
	var id = req.params.id;
	db.getTemplate(id, function(err, result) {
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
 * Create a Template
 */
function postTemplate(req, res) {
	var data = req.body;

	db.saveTemplate(data, function(err, result) {
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
 * Update a Template
 */
function putTemplate(req, res) {
	var id = req.params.id;
	var data = req.body;
	
	db.updateTemplate(id, data, function(err, result) {
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
 * Delete a Template
 */
function deleteTemplate(req, res) {
	var id = req.params.id;

	db.deleteTemplate(id, function(err, result) {
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
	app.get("/api/templates", user.auth, getTemplates);
	app.get("/api/templates/:id", user.auth, getTemplate);
	app.post("/api/templates", user.auth, postTemplate);
	app.put("/api/templates/:id", user.auth, putTemplate);
	app.delete("/api/templates/:id", user.auth, deleteTemplate);
}