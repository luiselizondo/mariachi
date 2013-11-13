var Drupal6 = require("../lib/drupal6");

function Project(options) {
	var self = this;
	self.type = "";
	self.name = "";
	self.fqdn = "";
	self.data = {}

	// private constructor 
	__construct = function() {
		console.log(options);
		self.type = options.type;
		self.name = options.name;
		self.fqdn = options.fqdn;
		self.data = options.data;

		switch(self.type) {
			case "nodejs":
			break;

			case "drupal6":
				new Drupal6(options);
			break;

			case "drupal7":
				self.deployDrupal7();
			break;
		}
	}()
}

Project.prototype.deployDrupal7 = function() {
	var self = this;
	console.log("Deploying drupal 7 site");
	console.log(self.data);
}

module.exports = Project;