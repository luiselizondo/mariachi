/**
 * List servers
 */
Mariachi.Views.ListTemplates = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	initialize: function() {
		var self = this;
		this.render();
	},
	events: {
		"click #execute": "executeTemplate"
	},
	collection: new Mariachi.Collections.Templates(),
	template: _.template($(".listTemplates").html()),
	render: function() {
		var self = this;
		var items = this.collection;
		items.fetch({
			error: function(collection, response) {
				console.log(response);
				self.loading.hide();
			},
			success: function(collection, response) {
				// Table
				self.$el.html(self.template({items: response}));
				self.loading.hide();
			}
		});
	}
});

/**
 * View a server
 */
Mariachi.Views.ViewTemplate = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	template: _.template($(".viewTemplate").html()),
	collection: new Mariachi.Collections.Templates(),
	initialize: function(data) {
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		var model = new Mariachi.Models.Template({id: id});
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
 * Add server
 */
Mariachi.Views.AddTemplate = Backbone.View.extend({
	el: "#content",
	events: {
		"click #submit": "submit"
	},
	loading: new Mariachi.Views.Loading(),
	initialize: function() {
		this.render();
	},
	render: function() {
		var self = this;
		var template = _.template($(".addTemplate").html());
		this.$el.html(template);

		self.loading.hide();
	},
	submit: function(e) {
		e.preventDefault();
		var self = this;

		self.loading.show();

		$("#submit").addClass("disabled");

		var data = {
			name: $("input#name").val(),
			description: $("textarea#description").val(),
			destination: $("input#destination").val(),
			parameters: $("input#parameters").val(),
			template: $("textarea#template").val()
		}
		
		var model = new Mariachi.Models.Template(data);

		model.save(data, {
			success: function(model, response) {
				var collection = new Mariachi.Collections.Templates();
				collection.add(model);

				Backbone.history.navigate("/", {trigger: true, replace: true});
				
				new Mariachi.Views.MessageView({
					message: "Template created.", 
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
	}
});

/**
 * Edit recepie
 */
Mariachi.Views.EditTemplate = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	events: {
		"click #submit": "submit"
	},
	initialize: function(data) {
		this.model = new Mariachi.Models.Template({id: data.id});
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		this.model.fetch({
			success: function(model, response) {
				var template = _.template($(".editTemplate").html());
				self.$el.html(template(model.toJSON()));
				self.loading.hide();
			},
			error: function(model, response) {
				self.loading.hide();
			}
		});
	},
	submit: function(e) {
		var self = this;
		e.preventDefault();
		self.loading.show();
		$("#submit").addClass("disabled");

		var data = {
			name: $('input#name').val(),
			description: $('textarea#description').val(),
			destination: $('input#destination').val(),
			parameters: $("input#parameters").val(),
			template: $('textarea#template').val()
		}

		this.model.set(data);

		this.model.save(data, {
			success: function(model, response) {
				Backbone.history.navigate("/", {trigger: true, replace: true});
				new Mariachi.Views.MessageView({
					message: "Template updated.", 
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
	}
});


/**
 * Delete template
 */
Mariachi.Views.DeleteTemplate = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	events: {
		"click #submit": "submit"
	},
	initialize: function(data) {
		this.model = new Mariachi.Models.Template({id: data.id});
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		this.model.fetch({
			success: function(model, response) {
				var template = _.template($(".deleteTemplate").html());
				self.$el.html(template(model.toJSON()));
				self.loading.hide();
			},
			error: function(model, response) {
				self.loading.hide();
			}
		});
	},
	submit: function(e) {
		e.preventDefault();
		var self = this;
		this.model.destroy({
			success: function(model, response) {
				var collection = new Mariachi.Collections.Templates();
				collection.remove(model);
				Backbone.history.navigate("/", {trigger: true, replace: true});
				new Mariachi.Views.MessageView({
					message: "Template deleted.", 
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
Mariachi.Views.DeployTemplate = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	events: {
		"click #execute": "execute"
	},
	templateId: null,
	template: _.template($(".deployTemplate").html()),
	initialize: function(data) {
		this.render(data.id);
		this.templateId = data.id;
	},
	render: function(id) {
		var self = this;
		var model = new Mariachi.Models.Template({id: id});
		model.fetch({
			success: function(model, response) {
				self.$el.html(self.template(model.toJSON()));
				self.loading.hide();

				self.populateServers();

				if(response.parameters) {
					self.addParamsForm(response);
				}
				else {
					$("div.parameters").text("This template accepts no extra parameters");
				}
			},
			error: function(model, response) {
				console.log(response);
				self.loading.hide();
			}
		});
	},
	populateServers: function() {
		var self = this;
		self.loading.show();

		var servers = new Mariachi.Collections.Servers();
		servers.fetch({
			success: function(model, response) {
				if(response.length) {
					var options = $("#servers");
					_.each(response, function(item) {
					    options.append(new Option(item.name, item.id));
					});
				}
				else {
					new Mariachi.Views.MessageView({
						message: "You need to add servers before you can deploy a template",
						type: "danger"
					})

					// Hide the execute button
					$("form").addClass("hidden");
				}
				self.loading.hide();
				
			},
			error: function(model, response) {
				console.log(response);
				self.loading.hide();
			}
		});
	},
	addParamsForm: function(response) {
		// convert patterns to array
		var params = response.parameters.split(", ");

		// for each pattern, create a new view, this view will create
		// a new input element
		_.each(params, function(param, index) {
			new Mariachi.Views.Parameters({parameter: param});
		});
	},
	execute: function(e) {
		// On execution, a task will be created
		e.preventDefault();
		var self = this;
		
		var data = {}

		data.type = "template";
		data.server = $("select#servers").val();
		data.task = self.templateId;

		var parameters = new Array();
		_.each($(".parameter-input"), function(parameter, index) {
			var id = $(parameter).attr("id");
			var value = $(parameter).val();

			// Add every pattern to an array
			parameters.push({id: id, value: value});
		});

		// Push the destination as a paramenter
		parameters.push({id: "destination", value: $("input#destination").val()})

		data.parameters = JSON.stringify(parameters);
		
		var model = new Mariachi.Models.Task(data);
		console.log("Posting data");
		model.save(data, {
			success: function(model, response) {
				var collection = new Mariachi.Collections.Tasks();
				collection.add(model);
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

		Mariachi.io.on("tasks:start", function(data) {
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

		Mariachi.io.on("tasks:finished", function(data) {
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
				$(".stderr").html(stderr);
			}

			if(!_.isNull(data.stdout) && !_.isUndefined(data.stdout)) {
				var stdout = data.stdout.replace(new RegExp('\r?\n', 'g'), '<br />');
				$(".stdout").html(stdout);
			}
			
			self.loading.hide();
		});
	}
});