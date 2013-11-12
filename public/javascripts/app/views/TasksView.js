/**
 * List servers
 */
Mariachi.Views.ListTasks = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	initialize: function() {
		var self = this;
		this.render();
	},
	events: {
		"click #execute": "executeTask"
	},
	collection: new Mariachi.Collections.Tasks(),
	template: _.template($(".listTasks").html()),
	render: function() {
		var self = this;
		var items = this.collection;
		items.fetch({
			error: function(collection, response) {
				console.log("error");
				console.log(response.responseText);
				self.loading.hide();
			},
			success: function(collection, response) {
				// Table
				self.$el.html(self.template({items: response}));
				self.loading.hide();
			}
		});
	},
	executeTask: function(e) {
		e.preventDefault();
		var taskId = $(e.currentTarget).attr("data-task");
		
		var model = new Mariachi.Models.Task({id: taskId});
		model.set({status: "EXECUTING"});
		model.save({
			success: function(model, response) {
				console.log("Hello");
				console.log(model);
				console.log(response);
			},
			error: function(model, response) {
				console.log(response);
			}
		});

		var task = this.collection.get({id: taskId});
		// console.log(task.toJSON());
		var statusCell = $(e.currentTarget).parent("tr");
		console.log(statusCell);
	}
});

/**
 * View a server
 */
Mariachi.Views.ViewTask = Backbone.View.extend({
	el: "#content",
	events: {
		"click #execute": "executeTask"
	},
	loading: new Mariachi.Views.Loading(),
	template: _.template($(".viewTask").html()),
	collection: new Mariachi.Collections.Tasks(),
	initialize: function(data) {
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		var model = new Mariachi.Models.Task({id: id});
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
	executeTask: function(e) {
		var self = this;
		self.loading.show();
		
		e.preventDefault();
		var taskId = $(e.currentTarget).attr("data-task");

		// Clean the well
		$(".well").empty();
		
		var model = new Mariachi.Models.Task({id: taskId});
		model.set({status: "EXECUTING"});
		model.save({
			success: function(model, response) {
				
			},
			error: function(model, response) {
				console.log(response);
			}
		});

		var statusCell = $("p.status");
		statusCell.text("EXECUTING");

		Mariachi.io.on("tasks:stream", function(data) {
			if(data.stderr) {
				var stderr = data.stderr.replace(new RegExp('\r?\n', 'g'), '<br />');
				$(".stderr").append(stderr);
			}

			if(data.stdout) {
				var stdout = data.stdout.replace(new RegExp('\r?\n', 'g'), '<br />');
				$(".stdout").append(stdout);
			}
		});

		Mariachi.io.on("tasks:finished", function(data) {
			statusCell.text(data.status);
			self.loading.hide();
		});

	}
});

Mariachi.Views.Patterns = Backbone.View.extend({
	el: "div.patterns",
	template: _.template($(".pattern").html()),
	initialize: function(pattern) {
		this.render(pattern);
	},
	render: function(pattern) {
		if(pattern) {
			this.$el.append(this.template({pattern: pattern}));	
		}
	}
});

/**
 * Add server
 */
Mariachi.Views.AddTask = Backbone.View.extend({
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
		var template = _.template($(".addTask").html());
		this.$el.html(template);

		var servers = new Mariachi.Collections.Servers();
		servers.fetch({
			success: function(model, response) {
				var options = $("#servers");
				_.each(response, function(item) {
				    options.append(new Option(item.name, item.id));
				});
				self.loading.hide();
			},
			error: function(model, response) {
				console.log(response);
				self.loading.hide();
			}
		});
		
		$("select#type").change(function(e) {
			if($(this).val() == "recepie") {
				var recepies = new Mariachi.Collections.Recepies();
				recepies.fetch({
					success: function(model, response) {
						var options = $("#recepies");
						_.each(response, function(item) {
						    options.append(new Option(item.name, item.id));
						});

						$(".recepiesSelectContainer").removeClass("hidden");
						$(".serversSelectContainer").removeClass("hidden");
						$(".templatesSelectContainer").addClass("hidden").val("");
						$("button.submit").removeClass("hidden");
					},
					error: function(model, response) {
						console.log(response);
						self.loading.hide();
					}
				});
			}

			if($(this).val() == "template") {
				var templates = new Mariachi.Collections.Templates();
				templates.fetch({
					success: function(model, response) {
						var options = $("#templates");
						_.each(response, function(item) {
						    options.append(new Option(item.name, item.id));
						});

						$(".templatesSelectContainer").removeClass("hidden");
						$(".serversSelectContainer").removeClass("hidden");
						$(".recepiesSelectContainer").addClass("hidden").val("");
						$("button.submit").removeClass("hidden");
					},
					error: function(model, response) {
						console.log(response);
						self.loading.hide();
					}
				});
			}

			$("#templates").change(function() {
				var templateid = $(this).val();
				console.log(templateid);
				var model = new Mariachi.Models.Template({id: templateid}).fetch({
					success: function(model, response) {
						// convert patterns to array
						var patterns = response.patterns.split(", ");

						// for each pattern, create a new view, this view will create
						// a new input element
						_.each(patterns, function(pattern, index) {
							new Mariachi.Views.Patterns({pattern: pattern});
						});

						$(".templatesPatternsContainer").removeClass("hidden");
					},
					error: function(model, response) {
						console.log(response);
					}
				});

			});
		});

	},
	submit: function(e) {
		e.preventDefault();
		var self = this;
		// $("#submit").addClass("disabled");

		var type = $("select#type").val();
		console.log(type);

		var data = {}

		if(type == "recepie") {
			data.task = $('select#recepies').val();
		}

		if(type == "template") {
			data.task = $("select#templates").val();
		}

		data.type = type;
		data.server = $("select#servers").val();

		var patterns = new Array();
		_.each($(".pattern-input"), function(pattern, index) {
			var id = $(pattern).attr("id");
			var value = $(pattern).val();

			// Add every pattern to an array
			patterns.push({id: id, value: value});
		});

		data.data = JSON.stringify(patterns);
		
		var model = new Mariachi.Models.Task(data);

		model.save(data, {
			success: function(model, response) {
				var collection = new Mariachi.Collections.Tasks();
				collection.add(model);

				Backbone.history.navigate("/", {trigger: true, replace: true});
				
				new Mariachi.Views.MessageView({
					message: "Task created, execute it by clicking on the Execute button.", 
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

// /**
//  * Edit server
//  */
// Mariachi.Views.EditRecepie = Backbone.View.extend({
// 	el: "#content",
// 	events: {
// 		"click #submit": "submit"
// 	},
// 	initialize: function(data) {
// 		this.model = new Mariachi.Models.Recepie({id: data.id});
// 		this.render(data.id);
// 	},
// 	render: function(id) {
// 		var self = this;
// 		this.model.fetch({
// 			success: function(model, response) {
// 				var template = _.template($(".editRecepie").html());
// 				self.$el.html(template(model.toJSON()));
// 			},
// 			error: function(model, response) {
				
// 			}
// 		});
// 	},
// 	submit: function(e) {
// 		e.preventDefault();

// 		$("#submit").addClass("disabled");

// 		var data = {
// 			name: $('input#name').val(),
// 			description: $('textarea#description').val(),
// 			recepie: $('textarea#recepie').val()
// 		}

// 		this.model.set(data);

// 		this.model.save(data, {
// 			success: function(model, response) {
// 				Backbone.history.navigate("/", {trigger: true, replace: true});
// 				new Mariachi.Views.MessageView({
// 					message: "Recepie updated.", 
// 					type:"success"
// 				});
// 			},
// 			error: function(model, error) {
// 				console.log(error);
// 				new Mariachi.Views.MessageView({
// 					message: "Error: " + error.statusText + "(" + error.status + ")",
// 					type: "danger"
// 				});
// 			}
// 		});
// 	}
// });

// /**
//  * Delete server
//  */
// Mariachi.Views.DeleteRecepie = Backbone.View.extend({
// 	el: "#content",
// 	events: {
// 		"click #submit": "submit"
// 	},
// 	initialize: function(data) {
// 		this.model = new Mariachi.Models.Recepie({id: data.id});
// 		this.render(data.id);
// 	},
// 	render: function(id) {
// 		var self = this;
// 		this.model.fetch({
// 			success: function(model, response) {
// 				var template = _.template($(".deleteRecepie").html());
// 				self.$el.html(template(model.toJSON()));
// 			},
// 			error: function(model, response) {
				
// 			}
// 		});
// 	},
// 	submit: function(e) {
// 		e.preventDefault();
// 		this.model.destroy({
// 			success: function(model, response) {
// 				var collection = new Mariachi.Collections.Recepies();
// 				collection.remove(model);
// 				Backbone.history.navigate("/", {trigger: true, replace: true});
// 				new Mariachi.Views.MessageView({
// 					message: "Recepie deleted.", 
// 					type:"success"
// 				});
// 			},
// 			error: function(model, response) {
// 				new Mariachi.Views.MessageView({
// 					message: "Error: " + response.statusText, 
// 					type:"danger"
// 				});
// 			}
// 		});

// 	}
// });