var config = require("../config")
	, format = require("util").format	
	, collections = ["logs"]
	, databaseUrl = format("mongodb://%s:%s/%s", config.mongodb.hostname, config.mongodb.port, config.mongodb.database)
	, mongojs = require("mongojs")
	, db = mongojs.connect(databaseUrl, collections)
	, dateFormat = require("dateformat")
	, events = require('../lib/events').events;

function Logs() {
	var self = this;
	self.db = db;
	self.lastId = "";
}

Logs.prototype.getLogs = function(callback) {
	var self = this;
	db.logs.find(function(err, results) {
		callback(err, results);
	}).sort({_id: 1}).limit(25);
}

Logs.prototype.get = function(id, callback) {
	db.logs.findOne({_id: mongojs.ObjectId(id)}, function(err, results) {
		callback(err, results);
	})
}

Logs.prototype.save = function(data, callback) {
	var time = new Date();
	data.time = dateFormat(time, "yyyy-mm-dd hh:mm:ss");
	db.logs.insert(data, function(err, result) {
		events.emit("logs:new", data);
		callback(err, result);
	});
};

module.exports = Logs;