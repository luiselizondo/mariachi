var fs = require("fs");
var mysql = require("mysql");
var crypto = require("crypto");

function Connection (options) {
	var self = this;
	self.options = {};
	self.installerFile = "";
	self.secretKey = "";

	self.setSecretKey = function(secretKey) {
		self.secretKey = secretKey;
	}

	self.getSecretKey = function() {
		return self.secretKey;
	}

	self.saveUser = function(data, callback) {
		var connection = mysql.createConnection(self.options);
		var query = "INSERT INTO users SET ?";
		connection.query(query, data, function(err, rows, fields) {
			callback(err, rows);
		});
	}

	self.set = function(options) {
		self.options = options;
	}
}

var connection = new Connection();

function getInstall(req, res) {
	res.render("install/step1", {title: "Install Mariachi: Step 1"});
}

function postInstall(req, res) {
	var body = req.body;

	var data = {
		mysql: {
			database: body.mysqldatabase,
			hostname: body.mysqlhostname,
			port: body.mysqlport || "3306",
			user: body.mysqluser,
			username: body.mysqluser,
			password: body.mysqlpassword
		},
		mongodb: {
			database: body.mongodatabase,
			hostname: body.mongohostname,
			port: body.mongoport || "27017"
		},
		secretKey: body.secretKey,
		ssh: {
			publicKey: body.sshPublicKey,
			privateKey: body.sshPrivateKey
		}
	}

	connection.setSecretKey(body.secretKey);
	connection.set(data.mysql);

	var insert = JSON.stringify(data);
	var file = __dirname + "/settings.json";

	console.log("Writing to file %s", file);
	fs.writeFile(file, insert, function(err) {
		if(err) console.log(err);
		res.redirect("install/step2");
	});
}

function getStepTwo(req, res) {
	res.render("install/step2", {title: "Install Mariachi: Step 2"});
}

function postStepTwo(req, res) {
	var body = req.body;
	var config = require("../config");

	var algorithm = "aes256";
	var secretKey = connection.getSecretKey();
	var cipher = crypto.createCipher(algorithm, secretKey);
	var password = cipher.update(body.password, "utf8", "hex") + cipher.final("hex");

	var data = {
		email: body.email,
		password: password,
		name: body.name
	}

	connection.saveUser(data, function(err, result) {
		if(err) {
			console.log(err);
			res.redirect("install/error");
		}
		if(result) {
			res.redirect("install/finished");
		}
	});
}

function getFinished(req, res) {
	res.render("install/finished", {title: "Finished installer"});
}

function getError(req, res) {
	res.render("install/error", {title: "We're sorry but we can't continue"});
}

module.exports = function(app) {
	app.get("/", getInstall);
	app.get("/install", getInstall);
	app.get("/install/step2", getStepTwo);
	app.post("/install/step2", postStepTwo);
	app.post("/install", postInstall);

	app.get("/install/finished", getFinished);
	app.get("/install/error", getError);
}