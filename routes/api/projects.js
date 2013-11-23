/** 
 * @file handles the api routes for projects
 * @todo check deploy route,
 * @todo standarize responses 
 */

var Connection = require("../../lib/database")
	, SSH = require("../../lib/ssh")
	, events = require('../../lib/events').events
	, User = require("../../lib/user")
	, Project = require("../../lib/projects")
	, db = new Connection()
	, EventEmitter = require("events").EventEmitter
	, e = new EventEmitter()
	, Validator = require("../../lib/validate")
	, validate = new Validator()
	, user = new User()
	, util = require("util")
	, _ = require("underscore");


/**
 * Get all Projects
 */
function getProjects(req, res) {
	db.getProjects(function(err, results) {
		if(err) {
			console.log(err);
			res.send(400, err);
		}

		if(!err && !results) {
			res.send(204);
		}

		if(results) {
			res.send(200, results);
		}
	});
}

/** 
 * Used to validate getProject(), deleteProject() and deployProject()
 * checks that the id is an Integer and that is not empty 
 */
function validateID(req, res, next) {
	req.sanitize("id").escape();
	req.assert("id", "The ID must be an integer").notEmpty().isInt();

	var errors = req.validationErrors();
  if (errors) {
    res.send(400, {errors: util.inspect(errors)});
    return;
  }
	
	next();
}

/**
 * Get one Project
 */
function getProject(req, res) {
	var id = req.params.id;

	db.getProject(id, function(err, results) {
		if(err) {
			res.send(400, err);
		}

		if(!err && !results) {
			res.send(204);
		}

		if(results) {
			res.send(200, results);
		}
	});
}

/** 
 * Validate postProject()
 * 
 */
function validatePostProject(req, res, next) {
	req.sanitize("name").escape();
	req.sanitize("fqdn").escape();
	req.sanitize("type").escape();

	req.assert("name", "The name is required").notEmpty().notNull();
	req.assert("fqdn", "The Full Qualified Domain Name is required and cannot contain spaces")
		.notEmpty().notNull().notContains(" ").notContains("-");
	req.assert("type", "The type cannot be empty and must be one of the available options")
		.notEmpty().notNull().isIn(["drupal", "nodejs", "joomla", "wordpress", "html", "database"]);

	var errors = req.validationErrors();
  if (errors) {
    res.send(400, {errors: util.inspect(errors)});
    return;
  }
	
	next();
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
		type: data.type,
		status: 0
	}

	delete data.name;
	delete data.fqdn;
	delete data.type;
	insert.data = JSON.stringify(data);
	
	db.saveProject(insert, function(err, result) {
		if(err) {
			res.send(400, err);
		}

		if(result) {
			res.send(201, result);
		}
	})
}

/** 
 * Validate putProject()
 * 
 */
function validatePutProject(req, res, next) {
	req.sanitize("name").escape();
	req.sanitize("fqdn").escape();
	req.sanitize("type").escape();

	req.assert("name", "The name is required").notNull();
	req.assert("fqdn", "The Full Qualified Domain Name is required and cannot contain spaces")
		.notNull().notContains(" ").notContains("-");
	req.assert("type", "The type cannot be empty and must be one of the available options")
		.notNull().isIn(["drupal", "nodejs", "joomla", "wordpress", "html", "database"]);

	var errors = req.validationErrors();
  if (errors) {
    res.send(400, {errors: util.inspect(errors)});
    return;
  }
	
	next();
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
			res.send(400, err);
		}

		if(result) {
			res.send(200, result);
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
			res.send(400, err);
		}

		if(result) {
			res.send(204, result);
		}
	});
}

/** 
 * Deploys a project 
 */
function deployProject(req, res) {
	var id = req.params.id;
	var project = new Project(id);
	project.deploy();
	
	res.send(204, {message: "Deployment started"});
}

module.exports = function(app) {
	app.get("/api/projects", user.auth, getProjects);
	app.get("/api/projects/:id", user.auth, validateID, getProject);
	app.post("/api/projects", user.auth, validatePostProject, postProject);
	app.put("/api/projects/:id", user.auth, validatePutProject, putProject);
	app.post("/api/projects/:id/deploy", user.auth, validateID, deployProject);
	app.delete("/api/projects/:id", user.auth, validateID, deleteProject);
}