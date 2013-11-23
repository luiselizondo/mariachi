var config = require("../config")
	, format = require("util").format	
	, collections = ["access"]
	, databaseUrl = format("mongodb://%s:%s/%s", config.mongodb.hostname, config.mongodb.port, config.mongodb.database)
	, mongojs = require("mongojs")
	, db = mongojs.connect(databaseUrl, collections)
	, events = require('../lib/events').events;

function Logs() {
	var self = this;
	self.db = db;
	self.lastId = "";
}

Logs.prototype.getLogs = function(callback) {
	var self = this;
	if(!self.lastId) {
		db.access.find(function(err, results) {
			if(err || !results) {
				callback(err, results);
			}
			else {
				var counter = 0;
				results.forEach(function(result) {
					events.emit("logs:new", result);

					counter++;
					if(counter === results.length) {
						console.log("Setting last id to: " + self.lastId);
						self.lastId = result._id;

						callback(results);
					}
				});
			}
		}).sort({_id: 1}).limit(25);
	}
	else {
		db.access.find({_id: { $gt: self.lastId}}, function(err, results) {
			if(err || !results) {
				callback(err, results);
			}
			else {
				var counter = 0;
				results.forEach(function(result) {
					events.emit("logs:new", result);

					counter++;
					if(counter === results.length) {
						console.log("Setting last id to: " + self.lastId);
						self.lastId = result._id;

						callback(results);
					}
				});
			}
		}).sort({_id: 1}).limit(3);	
	}
}

Logs.prototype.get = function(id, callback) {
	db.access.findOne({_id: mongojs.ObjectId(id)}, function(err, results) {
		callback(err, results);
	})
}

module.exports = Logs;