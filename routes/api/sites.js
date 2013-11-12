var Connection = require("../../lib/database");
var db = new Connection();
var SSH = require("../../lib/ssh");
var User = require("../../lib/user");
var user = new User();

/**
 * Get all Sites
 */
function getSites(req, res) {
	db.getSites(function(err, results) {
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
 * Get one Site
 */
function getSite(req, res) {
	var id = req.params.id;
	db.getSite(id, function(err, result) {
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
 * Create a Site
 */
function postSite(req, res) {
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
	db.saveSite(insert, function(err, result) {
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
 * Update a Site
 */
function putSite(req, res) {
	var id = req.params.id;
	var data = req.body;
	
	db.updateSite(id, data, function(err, result) {
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
 * Delete a Site
 */
function deleteSite(req, res) {
	var id = req.params.id;

	db.deleteSite(id, function(err, result) {
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
	app.get("/api/sites", user.auth, getSites);
	app.get("/api/sites/:id", user.auth, getSite);
	app.post("/api/sites", user.auth, postSite);
	app.put("/api/sites/:id", user.auth, putSite);
	app.delete("/api/sites/:id", user.auth, deleteSite);
}