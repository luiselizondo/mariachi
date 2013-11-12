var mysql = require("mysql");
var config = require("../config");
var connection = mysql.createConnection(config.mysql);
var _ = require("underscore");
var async = require("async");

function Connection() {}

/**
 * Get one server
 */
Connection.prototype.getServer = function(id, callback) {
	var query = "SELECT * FROM servers WHERE id = ?";
	connection.query(query, id, function(err, rows, fields) {
		callback(err, rows[0]);
	});
}

/**
 * Get all servers
 */
Connection.prototype.getServers = function(callback) {
	var query = "SELECT * FROM servers";
	connection.query(query, function(err, rows, fields) {
		callback(err, rows);
	});
}

/**
 * Save server data
 */
Connection.prototype.saveServer = function(data, callback) {
	var query = "INSERT INTO servers SET ?";
	connection.query(query, data, function(err, rows, fields) {
		callback(err, rows);
	});
}

/**
 * Update server data
 */
Connection.prototype.updateServer = function(id, data, callback) {
	var query = "UPDATE servers SET ? WHERE id = ?";
	connection.query(query, [data, id], function(err, rows, fields) {
		callback(err, rows);
	});
}

/**
 * Delete server
 */
Connection.prototype.deleteServer = function(id, callback) {
	var query = "DELETE FROM servers WHERE id = ?";
	connection.query(query, id, function(err, rows, fields) {
		callback(err, rows);
	});
}

/**
 * USERS =====================================================
 */
/**
 * Get one user
 */
Connection.prototype.getUser = function(id, callback) {
	var query = "SELECT * FROM users WHERE id = ?";
	connection.query(query, id, function(err, rows, fields) {
		callback(err, rows[0]);
	});
}

/**
 * Loads a user given a username
 */
Connection.prototype.loadUser = function(username, callback) {
	var query = "SELECT * FROM users where email = ?";
	connection.query(query, username, function(err, rows, fields) {
		callback(err, rows[0]);
	})
}

/**
 * Get all users
 */
Connection.prototype.getUsers = function(callback) {
	var query = "SELECT * FROM users";
	connection.query(query, function(err, rows, fields) {
		callback(err, rows);
	});
}

/**
 * Save user data
 */
Connection.prototype.saveUser = function(data, callback) {
	var query = "INSERT INTO users SET ?";
	connection.query(query, data, function(err, rows, fields) {
		callback(err, rows);
	});
}

/**
 * Update user data
 */
Connection.prototype.updateUser = function(id, data, callback) {
	var query = "UPDATE users SET ? WHERE id = ?";
	connection.query(query, [data, id], function(err, rows, fields) {
		callback(err, rows);
	});
}

/**
 * Delete user
 */
Connection.prototype.deleteUser = function(id, callback) {
	var query = "DELETE FROM users WHERE id = ?";
	connection.query(query, id, function(err, rows, fields) {
		callback(err, rows);
	});
}


/**
 * RECEPIES ================================================
 */
/**
 * Get one user
 */
Connection.prototype.getRecepie = function(id, callback) {
	var query = "SELECT * FROM recepies WHERE id = ?";
	connection.query(query, id, function(err, rows, fields) {
		callback(err, rows[0]);
	});
}

/**
 * Get all users
 */
Connection.prototype.getRecepies = function(callback) {
	var query = "SELECT * FROM recepies";
	connection.query(query, function(err, rows, fields) {
		callback(err, rows);
	});
}

/**
 * Save user data
 */
Connection.prototype.saveRecepie = function(data, callback) {
	var query = "INSERT INTO recepies SET ?";
	connection.query(query, data, function(err, rows, fields) {
		callback(err, rows);
	});
}

/**
 * Update user data
 */
Connection.prototype.updateRecepie = function(id, data, callback) {
	var query = "UPDATE recepies SET ? WHERE id = ?";
	connection.query(query, [data, id], function(err, rows, fields) {
		callback(err, rows);
	});
}

/**
 * Delete user
 */
Connection.prototype.deleteRecepie = function(id, callback) {
	var query = "DELETE FROM recepies WHERE id = ?";
	connection.query(query, id, function(err, rows, fields) {
		callback(err, rows);
	});
}

/**
 * TEMPLATES ================================================
 */
/**
 * Get one user
 */
Connection.prototype.getTemplate = function(id, callback) {
	var query = "SELECT * FROM templates WHERE id = ?";
	connection.query(query, id, function(err, rows, fields) {
		callback(err, rows[0]);
	});
}

/**
 * Get all users
 */
Connection.prototype.getTemplates = function(callback) {
	var query = "SELECT * FROM templates";
	connection.query(query, function(err, rows, fields) {
		callback(err, rows);
	});
}

/**
 * Save user data
 */
Connection.prototype.saveTemplate = function(data, callback) {
	var query = "INSERT INTO templates SET ?";
	connection.query(query, data, function(err, rows, fields) {
		callback(err, rows);
	});
}

/**
 * Update user data
 */
Connection.prototype.updateTemplate = function(id, data, callback) {
	var query = "UPDATE templates SET ? WHERE id = ?";
	connection.query(query, [data, id], function(err, rows, fields) {
		callback(err, rows);
	});
}

/**
 * Delete user
 */
Connection.prototype.deleteTemplate = function(id, callback) {
	var query = "DELETE FROM templates WHERE id = ?";
	connection.query(query, id, function(err, rows, fields) {
		callback(err, rows);
	});
}

/**
 * TASKS
 */
Connection.prototype.getTask = function(id, callback) {
	
	function joinRecepies(id, callback) {
		var query = "SELECT * FROM recepies WHERE id = ?";
		connection.query(query, id, function(err, rows, fields) {
			if(err) callback(err, null);
			if(rows) callback(err, rows[0]);
		});
	}

	function joinTemplates(id, callback) {
		var query = "SELECT * FROM templates WHERE id = ?";
		connection.query(query, id, function(err, rows, fields) {
			if(err) callback(err, null)
			if(rows) callback(err, rows[0]);
		});
	}

	var query = "SELECT s.*, t.*, u.name as userName FROM tasks t LEFT JOIN servers s ON t.server = s.id LEFT JOIN users u ON t.user = u.id WHERE t.id = ?";
	connection.query(query, id, function (err, rows, fields) {
		if(err) callback(err, null);
		if(rows) {
			var result = rows[0];

			result.data = JSON.parse(rows[0].data);

			if(result.type == "recepie") {
				joinRecepies(result.task, function(err, r) {
					result.templateName = null;
					result.recepieName = r.name;

					result.recepie = r;
					callback(err, result);
				})
			}

			if(result.type == "template") {
				joinTemplates(result.task, function (err, r) {
					result.recepieName = null;
					result.templateName = r.name;

					result.template = r;
					callback(err, result);
				})
			}
		}

	});
}

/**
 * Save task
 */
Connection.prototype.saveTask = function(data, callback) {
 	var query = "INSERT INTO tasks SET ?";
 	connection.query(query, data, function(err, rows, fields) {
 		callback(err, rows);
 	});
}

/**
 * Change task status
 * STATUS: 
 * - WAITING, EXECUTING, SUCCESS, ERROR, CANCELED
 */
Connection.prototype.changeTaskStatus = function(id, status, callback) {
	var query = "UPDATE tasks SET status = ? WHERE id = ?";
	connection.query(query, [status, id], function(err, rows, fields) {
		callback(err, rows);
	});
}

Connection.prototype.updateTask = function(id, data, callback) {
	var query = "UPDATE tasks SET ? WHERE id = ?";
	connection.query(query, [data, id], function(err, rows, fields) {
		callback(err, rows);
	});
}

/**
 * Get all tasks
 */
Connection.prototype.getTasks = function(callback) {

	// makes a join to the recepies table
	function joinRecepies(id, callback) {
		var query = "SELECT * FROM recepies WHERE id = ?";
		connection.query(query, id, function(err, rows, fields) {
			if(err) callback(err, null);
			if(rows) callback(err, rows[0]);
		});
	}

	// makes a join to the templates table
	function joinTemplates(id, callback) {
		var query = "SELECT * FROM templates WHERE id = ?";
		connection.query(query, id, function(err, rows, fields) {
			if(err) callback(err, null)
			if(rows) callback(err, rows[0]);
		});
	}

	// main query
	var query = "SELECT t.*, s.address as serverAddress, s.name as serverName, u.name as userName FROM tasks t LEFT JOIN servers s ON t.server = s.id LEFT JOIN users u ON t.user = u.id ORDER BY id DESC";
	connection.query(query, function(err, rows, fields) {
		if(err) {
			console.log(err);
			callback(err, rows);
		}

		if(rows) {
			if(rows.length == 0) {
				callback(err, rows);
			}
			else {
				var count = 0;
				rows.forEach(function(row, index) {
					if(row.type == "recepie") {
						console.log(row);
						joinRecepies(row.task, function(err, r) {
							if(r) rows[index].recepieName = r.name;

							count++;
							if(count == rows.length) {
								callback(err, rows);
							}
						});
					}

					if(row.type == "template") {
						joinTemplates(row.task, function(err, r) {
							if(r) rows[index].templateName = r.name;

							count++;
							if(count == rows.length) {
								callback(err, rows);
							}
						});
					}
				});
			}
		}
	})
}

/**
 * Sites
 */
Connection.prototype.getProject = function(id, callback) {
	var query = "SELECT * FROM projects WHERE id = ?";
	connection.query(query, function(err, rows, fields) {
		if(err) callback(err, null);
		if(rows) {
			var result = {
				id: rows[0].id,
				name: rows[0].name,
				fqdn: rows[0].fqdn,
				data: JSON.parse(rows[0].data)
			}

			callback(err, result);
		}
	});
}

Connection.prototype.getProjects = function(callback) {
	var query = "SELECT * FROM projects";
	connection.query(query, function(err, rows, fields) {
		callback(err, rows);
	});
}

Connection.prototype.saveProject = function(data, callback) {
	var query = "INSERT INTO projects SET ?";
 	connection.query(query, data, function(err, rows, fields) {
 		callback(err, rows);
 	});
}

Connection.prototype.updateProject = function(id, data, callback) {
	var query = "UPDATE projects SET ? WHERE id = ?";
	connection.query(query, [data, id], function(err, rows, fields) {
		callback(err, rows);
	});
}

Connection.prototype.deleteProject = function(id, callback) {
	var query = "DELETE FROM projects WHERE id = ?";
	connection.query(query, id, function(err, rows, fields) {
		callback(err, rows);
	});
}

module.exports = Connection;