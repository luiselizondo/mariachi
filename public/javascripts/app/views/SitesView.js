/**
 * List sites
 */
Mariachi.Views.ListSites = Backbone.View.extend({
	el: "#content",
	events: {
		"click .btn": "getSite"
	},
	initialize: function() {
		this.render();
	},
	loading: new Mariachi.Views.Loading(),
	template: _.template($(".listSites").html()),
	render: function() {
		var self = this;
		var items = new Mariachi.Collections.Sites();
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
	getSite: function(e) {
		
	}
});

/**
 * View a site
 */
Mariachi.Views.ViewSite = Backbone.View.extend({
	el: "#content",
	template: _.template($(".viewSite").html()),
	loading: new Mariachi.Views.Loading(),
	initialize: function(data) {
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		var model = new Mariachi.Models.Site({id: id});
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
 * Add site
 */
Mariachi.Views.AddSite = Backbone.View.extend({
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
		var template = _.template($(".addSite").html());
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

		$("#submitAddSite").addClass("disabled");


		var insert = {
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
		
		var model = new Mariachi.Models.Site(insert);

		model.save(insert, {
			success: function(model, response) {
				var collection = new Mariachi.Collections.Sites();
				collection.add(model);

				self.loading.hide();
				Backbone.history.navigate("/sites", {trigger: true, replace: true});
				
				new Mariachi.Views.MessageView({
					message: "Site created.", 
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
 * Edit site
 */
Mariachi.Views.EditSite = Backbone.View.extend({
	el: "#content",
	events: {
		"click #submitAddSite": "submitAddSite"
	},
	loading: new Mariachi.Views.Loading(),
	initialize: function(data) {
		this.model = new Mariachi.Models.Site({id: data.id});
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		this.model.fetch({
			success: function(model, response) {
				var template = _.template($(".editSiteTemplate").html());
				self.$el.html(template(model.toJSON()));
				self.loading.hide();
			},
			error: function(model, response) {
				self.loading.hide();
			}
		});
	},
	submitAddSite: function(e) {
		var self = this;
		e.preventDefault();
		self.loading.show();

		$("#submitAddSite").addClass("disabled");

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
		
		// var model = new Mariachi.Models.Site(data);

		this.model.save(data, {
			success: function(model, response) {
				Backbone.history.navigate("/", {trigger: true, replace: true});
				new Mariachi.Views.MessageView({
					message: "Site updated.", 
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
		
		// var collection = new Mariachi.Collections.Sites();
		// collection.add(model);
	}
});

/**
 * Delete site
 */
Mariachi.Views.DeleteSite = Backbone.View.extend({
	el: "#content",
	events: {
		"click #confirmDeleteSubmit": "deleteSite"
	},
	loading: new Mariachi.Views.Loading(),
	initialize: function(data) {
		this.model = new Mariachi.Models.Site({id: data.id});
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		this.model.fetch({
			success: function(model, response) {
				var template = _.template($(".removeSite").html());
				self.$el.html(template(model.toJSON()));
				self.loading.hide();
			},
			error: function(model, response) {
				self.loading.hide();
			}
		});
	},
	deleteSite: function(e) {
		e.preventDefault();
		var self = this;
		self.loading.shows();
		this.model.destroy({
			success: function(model, response) {
				Backbone.history.navigate("/", {trigger: true, replace: true});
				new Mariachi.Views.MessageView({
					message: "Site deleted.", 
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