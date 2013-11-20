var Connection = require("../lib/database")
	, db = new Connection()
	, Drupal6 = require("../lib/drupal6");

function Project(id) {
	var self = this;
	self.projectId = id;
	self.project = {}

	// private constructor 
	__construct = function() {
		db.getProject(self.projectId, function(err, project) {
			if(err) console.log(err);

			if(project) {
				self.project = project;
					
				switch(self.project.type) {
					case "nodejs":
					break;

					case "drupal6":
						var project = new Drupal6(project);
						project.deploy(function(err, result) {
							var ended = new Date();
							
							// the data object will be saved to the database
							var data = {
								stdout: result,
								stderr: err,
								status: "EXECUTING",
								ended: dateFormat(ended, "yyyy-mm-dd hh:mm:ss")
							}

							events.emit("projects:finished", {
								task: task,
								started: task.started,
								ended: data.ended,
								stderr: data.stderr, 
								stdout: data.stdout, 
								status: data.status
							});

							// update the task to the database
							// we don't return anything
							db.updateTask(task.id, data, function(err, result) {
								return;
							});
						});
					break;

					case "drupal7":
						self.deployDrupal7();
					break;
				}
			}
		});	
	}()
}

Project.prototype.deployDrupal7 = function() {
	var self = this;
	console.log("Deploying drupal 7 site");
	console.log(self.data);
}

module.exports = Project;