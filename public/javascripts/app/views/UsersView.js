/**
 * List servers
 */
Mariachi.Views.ListUsersView = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	initialize: function() {
		this.render();
	},
	template: _.template($(".listUsers").html()),
	render: function() {
		var self = this;
		var items = new Mariachi.Collections.Users();
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
Mariachi.Views.ViewUserView = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	template: _.template($(".viewUser").html()),
	initialize: function(data) {
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		var model = new Mariachi.Models.User({id: id});
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
Mariachi.Views.AddUserView = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	events: {
		"click #submit": "submit"
	},
	initialize: function() {
		this.render();
	},
	render: function() {
		var template = _.template($(".addUser").html());
		this.$el.html(template);
	},
	submit: function(e) {
		var self = this;
		e.preventDefault();
		self.loading.show();
		$("#submit").addClass("disabled");

		var data = {
			name: $('input#name').val(),
			email: $('input#email').val(),
			password: $('input#password').val()
		}
		
		var model = new Mariachi.Models.User(data);

		model.save(data, {
			success: function(model, response) {
				var collection = new Mariachi.Collections.Users();
				collection.add(model);

				Backbone.history.navigate("/", {trigger: true, replace: true});
				
				new Mariachi.Views.MessageView({
					message: "User created.", 
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
Mariachi.Views.EditUserView = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	events: {
		"click #submit": "submit"
	},
	initialize: function(data) {
		this.model = new Mariachi.Models.User({id: data.id});
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		this.model.fetch({
			success: function(model, response) {
				var template = _.template($(".editUser").html());
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
			email: $('input#email').val(),
			password: $('input#password').val()
		}

		this.model.set(data);

		// data.groups;
		// data.tags;
		// 
		
		// var model = new Mariachi.Models.Server(data);

		this.model.save(data, {
			success: function(model, response) {
				Backbone.history.navigate("/", {trigger: true, replace: true});
				new Mariachi.Views.MessageView({
					message: "User updated.", 
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
Mariachi.Views.DeleteUserView = Backbone.View.extend({
	el: "#content",
	loading: new Mariachi.Views.Loading(),
	events: {
		"click #submit": "submit"
	},
	initialize: function(data) {
		this.model = new Mariachi.Models.User({id: data.id});
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		this.model.fetch({
			success: function(model, response) {
				var template = _.template($(".deleteUser").html());
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
		self.loading.show();
		e.preventDefault();
		this.model.destroy({
			success: function(model, response) {
				var collection = new Mariachi.Collections.Users();
				collection.remove(model);
				Backbone.history.navigate("/", {trigger: true, replace: true});
				new Mariachi.Views.MessageView({
					message: "User deleted.", 
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