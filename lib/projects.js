var Connection = require("../lib/database")
	, db = new Connection()
	, Drupal6 = require("../lib/drupal6");

function Project(id) {
	var self = this;
	self.id = id;
	self.project = {}
}

Project.prototype.deploy = function() {
	var self = this;
	db.getProject(self.id, function(err, result) {
		if(err) console.log(err);

		if(result) {
			self.project = result;
							
			switch(self.project.type) {
				case "nodejs":
				break;

				case "drupal6":
					var drupal6 = new Drupal6(result);
					drupal6.start();
				break;

				case "drupal7":
					// self.deployDrupal7();
				break;
			}
		}
	});	
}

// Project.prototype.deployDrupal7 = function() {
// 	var self = this;
// 	console.log("Deploying drupal 7 site");
// 	console.log(self.data);
// }

module.exports = Project;