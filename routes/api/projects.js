var Connection = require("../../lib/database");
var db = new Connection();
var SSH = require("../../lib/ssh");
var User = require("../../lib/user");
var user = new User();

/**
 * Get all Projects
 */
function getProjects(req, res) {
	db.getProjects(function(err, results) {
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
 * Get one Project
 */
function getProject(req, res) {
	var id = req.params.id;
	db.getProject(id, function(err, result) {
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
 * Create a Project
 */
function postProject(req, res) {
	var data = req.body;

	// name an fqdn are separate fields
	var insert = {
		name: data.name,
		fqdn: data.fqdn,
		status: 0
	}

	delete data.name;
	delete data.fqdn;
	insert.data = JSON.stringify(data);
	
	console.log(insert);
	db.saveProject(insert, function(err, result) {
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
 * Update a Project
 */
function putProject(req, res) {
	var id = req.params.id;
	var data = req.body;
	
	db.updateProject(id, data, function(err, result) {
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
 * Delete a Project
 */
function deleteProject(req, res) {
	var id = req.params.id;

	db.deleteProject(id, function(err, result) {
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
	app.get("/api/projects", user.auth, getProjects);
	app.get("/api/projects/:id", user.auth, getProject);
	app.post("/api/projects", user.auth, postProject);
	app.put("/api/projects/:id", user.auth, putProject);
	app.delete("/api/projects/:id", user.auth, deleteProject);
}