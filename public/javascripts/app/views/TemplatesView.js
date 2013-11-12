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
	},
	executeTemplate: function(e) {
		e.preventDefault();
		var templateId = $(e.currentTarget).attr("data-template");
		
		var model = new Mariachi.Models.Template({id: templateId});
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

		var template = this.collection.get({id: templateId});
		// console.log(template.toJSON());
		var statusCell = $(e.currentTarget).parent("tr");
		console.log(statusCell);
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
			patterns: $("input#patterns").val(),
			template: $("textarea#template").val()
		}
		
		var model = new Mariachi.Models.Template(data);

		model.save(data, {
			success: function(model, response) {
				var collection = new Mariachi.Collections.Templates();
				collection.add(model);

				Backbone.history.navigate("/", {trigger: true, replace: true});
				
				new Mariachi.Views.MessageView({
					message: "Template created, execute it by clicking on the Execute button.", 
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