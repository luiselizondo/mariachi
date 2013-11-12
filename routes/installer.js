var fs = require("fs");

function getInstall(req, res) {
	res.render("install/step1", {title: "Install Mariachi: Step 1"});
}

function postInstall(req, res) {
	var body = req.body;

	var data = {
		mysql: {
			hostname: body.mysqlhostname,
			port: body.mysqlport || "3306",
			user: body.mysqluser,
			username: body.mysqluser,
			password: body.mysqlpassword
		},
		secretKey: body.secretKey,
		ssh: {
			publicKey: body.sshPublicKey,
			privateKey: body.sshPrivateKey
		}
	}

	var insert = JSON.stringify(data);
	console.log(insert);
	var file = __dirname + "/settings.json";

	console.log("Writing to file %s", file);
	fs.writeFile(file, insert, function(err) {
		if(err) console.log(err);
		else {
			res.redirect("install/step2");
		}
	})
}

function getStepTwo(req, res) {
	res.render("install/step2", {title: "Install Mariachi: Step 2"});
}

function postStepTwo(req, res) {
	console.log(req.body);
	res.redirect("install/finished");
}

function getFinished(req, res) {
	res.render("install/finished", {title: "Finished installer"});
}

module.exports = function(app) {
	app.get("/", getInstall);
	app.get("/install", getInstall);
	app.get("/install/step2", getStepTwo);
	app.post("/install/step2", postStepTwo);
	app.post("/install", postInstall);

	app.get("/install/finished", getFinished);
}