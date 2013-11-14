/**
 * List servers
 */
Mariachi.Views.ListRecepies = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	initialize: function() {
		this.render();
	},
	template: _.template($(".listRecepies").html()),
	render: function() {
		var self = this;
		var items = new Mariachi.Collections.Recepies();
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
});

/**
 * View a server
 */
Mariachi.Views.ViewRecepie = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	template: _.template($(".viewRecepie").html()),
	initialize: function(data) {
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		var model = new Mariachi.Models.Recepie({id: id});
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
Mariachi.Views.AddRecepie = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	events: {
		"click #submit": "submit"
	},
	initialize: function() {
		this.render();
	},
	render: function() {
		var template = _.template($(".addRecepie").html());
		this.$el.html(template);
	},
	submit: function(e) {
		var self = this;
		e.preventDefault();
		self.loading.show();
		$("#submit").addClass("disabled");

		var data = {
			name: $('input#name').val(),
			description: $('textarea#description').val(),
			recepie: $('textarea#recepie').val()
		}
		
		var model = new Mariachi.Models.Recepie(data);

		model.save(data, {
			success: function(model, response) {
				var collection = new Mariachi.Collections.Recepies();
				collection.add(model);

				Backbone.history.navigate("/", {trigger: true, replace: true});
				
				new Mariachi.Views.MessageView({
					message: "Recepie created.", 
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
 * Edit server
 */
Mariachi.Views.EditRecepie = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	events: {
		"click #submit": "submit"
	},
	initialize: function(data) {
		this.model = new Mariachi.Models.Recepie({id: data.id});
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		this.model.fetch({
			success: function(model, response) {
				var template = _.template($(".editRecepie").html());
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
			recepie: $('textarea#recepie').val()
		}

		this.model.set(data);

		this.model.save(data, {
			success: function(model, response) {
				Backbone.history.navigate("/", {trigger: true, replace: true});
				new Mariachi.Views.MessageView({
					message: "Recepie updated.", 
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
 * Delete server
 */
Mariachi.Views.DeleteRecepie = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	events: {
		"click #submit": "submit"
	},
	initialize: function(data) {
		this.model = new Mariachi.Models.Recepie({id: data.id});
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		this.model.fetch({
			success: function(model, response) {
				var template = _.template($(".deleteRecepie").html());
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
				var collection = new Mariachi.Collections.Recepies();
				collection.remove(model);
				Backbone.history.navigate("/", {trigger: true, replace: true});
				new Mariachi.Views.MessageView({
					message: "Recepie deleted.", 
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
 * View a server
 */
Mariachi.Views.DeployRecepie = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	events: {
		"click #execute": "execute"
	},
	template: _.template($(".deployRecepie").html()),
	initialize: function(data) {
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		var model = new Mariachi.Models.Recepie({id: id});
		model.fetch({
			success: function(model, response) {
				self.$el.html(self.template(model.toJSON()));
				self.loading.hide();

				self.populateServers();
				self.addParamsForm(response);
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
	},
	addParamsForm: function(response) {
		// convert patterns to array
		var params = response.params.split(", ");

		// for each pattern, create a new view, this view will create
		// a new input element
		_.each(params, function(param, index) {
			new Mariachi.Views.Parameters({param: param});
		});
	},
	execute: function(e) {
		e.preventDefault();
		var self = this;

		
	}
});