/**
 * List projects
 */
Mariachi.Views.ListProjects = Backbone.View.extend({
	el: "#content",
	events: {
		"click .btn": "getProject"
	},
	initialize: function() {
		this.render();
	},
	loading: new Mariachi.Views.Loading(),
	template: _.template($(".listProjects").html()),
	render: function() {
		var self = this;
		var items = new Mariachi.Collections.Projects();
		items.fetch({
			error: function(collection, response) {
				console.log(response);
				self.loading.hide();
			},
			success: function(collection, response) {
				console.log(response);
				// Table
				self.$el.html(self.template({items: response}));
				self.loading.hide();
			}
		});
	},
	getProject: function(e) {
		
	}
});

/**
 * View a project
 */
Mariachi.Views.ViewProject = Backbone.View.extend({
	el: "#content",
	template: _.template($(".viewProject").html()),
	loading: new Mariachi.Views.Loading(),
	initialize: function(data) {
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		var model = new Mariachi.Models.Project({id: id});
		model.fetch({
			success: function(model, response) {
				self.$el.html(self.template(model.toJSON()));
				self.loading.hide();
			},
			error: function(model, response) {
				console.log(response);
				self.loading.hide();
			}
		});	
	}
});

/**
 * Add project
 */
Mariachi.Views.AddProject = Backbone.View.extend({
	el: "#content",
	events: {
		"click #submit": "submit",
		"click .createDatabase": "showDatabaseRootAccess",
	},
	loading: new Mariachi.Views.Loading(),
	initialize: function() {
		console.log("Init");
		this.render();
	},
	render: function() {
		var self = this;
		var template = _.template($(".addProject").html());
		this.$el.html(template);

		var servers = new Mariachi.Collections.Servers();
		servers.fetch({
			success: function(model, response) {
				var webServer = $("#webServer");
				var databaseServer = $("#databaseServer");
				_.each(response, function(item) {
				    webServer.append(new Option(item.name, item.id));
				    databaseServer.append(new Option(item.name, item.id));
				});
				self.loading.hide();
			},
			error: function(model, response) {
				console.log(response);
				self.loading.hide();
			}
		});
		
	},
	showDatabaseRootAccess: function(e) {
		var value = $(e.currentTarget).val();
		if(value == "yes") {
			$("div.form-database").removeClass("hidden");
		}
		else {
			$("div.form-database").addClass("hidden");
			$("#databaseUserRoot").val("");
			$("#databasePasswordRoot").val("");
		}
	},
	submit: function(e) {
		var self = this;
		e.preventDefault();
		self.loading.show();

		$("#submitAddProject").addClass("disabled");


		var insert = {
			type: $("select#type").val(),
			name: $("input#name").val(),
			fqdn: $("input#fqdn").val(),
			webserver: $("select#webServer").val(),
			codeArchive: $("input#codeArchive").val(),
			codeBranch: $("input#codeBranch").val(),
			destinationDirectory: $("input#destinationDirectory").val(),
			logsDirectory: $("input#logsDirectory").val(),
			databaseServer: $("select#databaseServer").val(),
			databaseArchive: $("input#databaseArchive").val(),
			databaseFilename: $("input#databaseFilename").val(),
			databaseType: $("select#databaseType").val(),
			databaseName: $("input#databaseName").val(),
			databaseUser: $("input#databaseUser").val(),
			databasePassword: $("input#databasePassword").val(),
			databasePort: $("input#databasePort").val(),
			createDatabase: $(".createDatabase").val(),
			databaseUserRoot: $("input#databaseUserRoot").val(),
			databasePasswordRoot: $("input#databasePasswordRoot").val()
		}

		console.log(insert);
		
		var model = new Mariachi.Models.Project(insert);

		model.save(insert, {
			success: function(model, response) {
				var collection = new Mariachi.Collections.Projects();
				collection.add(model);

				self.loading.hide();
				Backbone.history.navigate("/projects", {trigger: true, replace: true});
				
				new Mariachi.Views.MessageView({
					message: "Project created.", 
					type:"success"
				});

			},
			error: function(model, error) {
				console.log(error);
				new Mariachi.Views.MessageView({
					message: "Error: " + error.statusText + "(" + error.status + ")",
					type: "danger"
				});
				self.loading.hide();
			}
		});
		
	}
});

/**
 * Edit project
 */
Mariachi.Views.EditProject = Backbone.View.extend({
	el: "#content",
	events: {
		"click #submitAddProject": "submitAddProject"
	},
	loading: new Mariachi.Views.Loading(),
	initialize: function(data) {
		this.model = new Mariachi.Models.Project({id: data.id});
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		this.model.fetch({
			success: function(model, response) {
				var template = _.template($(".editProjectTemplate").html());
				self.$el.html(template(model.toJSON()));
				self.loading.hide();
			},
			error: function(model, response) {
				self.loading.hide();
			}
		});
	},
	submitAddProject: function(e) {
		var self = this;
		e.preventDefault();
		self.loading.show();

		$("#submitAddProject").addClass("disabled");

		var data = {
			name: $('input#name').val(),
			address: $('input#address').val(),
			ssh_user: $('input#ssh_user').val(),
			ssh_port: $("input#ssh_port").val(),
			os: $("select#os").val()
		}

		console.log(this.model.id);
		this.model.set(data);

		// data.groups;
		// data.tags;
		// 
		
		// var model = new Mariachi.Models.Project(data);

		this.model.save(data, {
			success: function(model, response) {
				Backbone.history.navigate("/", {trigger: true, replace: true});
				new Mariachi.Views.MessageView({
					message: "Project updated.", 
					type:"success"
				});
				self.loading.hide();
			},
			error: function(model, error) {
				console.log(error);
				new Mariachi.Views.MessageView({
					message: "Error: " + error.statusText + "(" + error.status + ")",
					type: "danger"
				});
				self.loading.hide();
			}
		});
		
		// var collection = new Mariachi.Collections.Projects();
		// collection.add(model);
	}
});

/**
 * Delete project
 */
Mariachi.Views.DeleteProject = Backbone.View.extend({
	el: "#content",
	events: {
		"click #confirmDeleteSubmit": "deleteProject"
	},
	loading: new Mariachi.Views.Loading(),
	initialize: function(data) {
		this.model = new Mariachi.Models.Project({id: data.id});
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		this.model.fetch({
			success: function(model, response) {
				var template = _.template($(".removeProject").html());
				self.$el.html(template(model.toJSON()));
				self.loading.hide();
			},
			error: function(model, response) {
				self.loading.hide();
			}
		});
	},
	deleteProject: function(e) {
		e.preventDefault();
		var self = this;
		self.loading.shows();
		this.model.destroy({
			success: function(model, response) {
				Backbone.history.navigate("/", {trigger: true, replace: true});
				new Mariachi.Views.MessageView({
					message: "Project deleted.", 
					type:"success"
				});
				self.loading.hide();
			},
			error: function(model, response) {
				new Mariachi.Views.MessageView({
					message: "Error: " + response.statusText, 
					type:"danger"
				});
				self.loading.hide();
			}
		});

	}
});

/**
 * Deploy template
 */
Mariachi.Views.DeployProject = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	events: {
		"click #execute": "execute"
	},
	projectId: null,
	template: _.template($(".deployProject").html()),
	initialize: function(data) {
		this.render(data.id);
		this.projectId = data.id;
	},
	render: function(id) {
		var self = this;
		var model = new Mariachi.Models.Project({id: id});
		model.fetch({
			success: function(model, response) {
				self.$el.html(self.template(model.toJSON()));
				self.loading.hide();
			},
			error: function(model, response) {
				console.log(response);
				self.loading.hide();
			}
		});
	},
	execute: function(e) {
		// On execution, a task will be created
		e.preventDefault();
		var self = this;

		var model = new Mariachi.Models.Project({id: self.projectId});
		model.deploy(self.projectId, function(err, result) {
			if(err) {
				new Mariachi.Views.MessageView({
					message: "Error: " + result.message, 
					type:"danger"
				});
			}
			if(result) {
				new Mariachi.Views.MessageView({
					message: result.message, 
					type:"success"
				});
			}
		});
		
		self.loading.hide();
		self.listen();
	},
	listen: function() {
		var self = this;
		
		$("form").fadeOut();

		// Clean the well and show the div
		$(".results").removeClass("hidden");
		$(".results").fadeIn();
		$(".stdout").html(" ");
		$(".stderr").html(" ");

		var statusCell = $("p.status");
		statusCell.text("EXECUTING");

		Mariachi.io.on("projects:start", function(data) {
			// Remove the form
			$("span#deployStatus").removeClass().addClass("label label-info").text("EXECUTING");
			console.log("Started");
			console.log(data.started);
			$("span#started").text("Started: " + data.started);

			if(!_.isNull(data.stderr)) {
				var stderr = data.stderr.replace(new RegExp('\r?\n', 'g'), '<br />');
				$(".stderr").html(stderr);

				$("span#deployStatus").removeClass().addClass("label label-danger").text("ERROR");
			}

			if(!_.isNull(data.stdout)) {
				var stdout = data.stdout.replace(new RegExp('\r?\n', 'g'), '<br />');
				$(".stdout").html(stdout);
			}
		});

		Mariachi.io.on("projects:stream", function(data) {
			console.log(data);
			statusCell.text(data.status);

			if(!_.isNull(data.stderr)) {
				var stderr = data.stderr.replace(new RegExp('\r?\n', 'g'), '<br />');
				$(".stderr").append(stderr);
			}

			if(!_.isNull(data.stdout)) {
				var stdout = data.stdout.replace(new RegExp('\r?\n', 'g'), '<br />');
				$(".stdout").append(stdout);
			}
		});

		Mariachi.io.on("projects:finished", function(data) {
			console.log("Got tasks:finished");
			console.log(data);
			$("span#ended").text("Ended: " + data.ended);
			if(data.status === "SUCCESS") {
				$("span#deployStatus").removeClass().addClass("label label-success").text(data.status);
			}	

			if(data.status === "ERROR") {
				$("span#deployStatus").removeClass().addClass("label label-danger").text(data.status);
			}
			
			if(!_.isNull(data.stderr) && !_.isUndefined(data.stderr)) {
				var stderr = data.stderr.replace(new RegExp('\r?\n', 'g'), '<br />');
				$(".stderr").append(stderr);
			}

			if(!_.isNull(data.stdout) && !_.isUndefined(data.stdout)) {
				var stdout = data.stdout.replace(new RegExp('\r?\n', 'g'), '<br />');
				$(".stdout").html(stdout);
			}
			
			self.loading.hide();
		});
	}
});