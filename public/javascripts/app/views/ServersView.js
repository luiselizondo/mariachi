/**
 * List servers
 */
Mariachi.Views.ServersHomeView = Backbone.View.extend({
	el: "#content",
	events: {
		"click .btn": "getServer"
	},
	initialize: function() {
		console.log("Initialized home views");
		this.render();
	},
	loading: new Mariachi.Views.Loading(),
	template: _.template($(".serverList").html()),
	render: function() {
		var self = this;
		var items = new Mariachi.Collections.Servers();
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
	getServer: function(e) {
		
	}
});

/**
 * View a server
 */
Mariachi.Views.ServersView = Backbone.View.extend({
	el: "#content",
	events: {
		"click button.sshHelp": "sshHelp",
	},
	template: _.template($(".viewServer").html()),
	loading: new Mariachi.Views.Loading(),
	initialize: function(data) {
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		var model = new Mariachi.Models.Server({id: id});
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
	sshHelp: function(e) {
		e.preventDefault();

		var content = new sshHelp();

		var modal = new Backbone.BootstrapModal({
			content: content,
			title: "Connect to SSH server",
			animate: true
		});

		modal.open(function() {

		});
	}
});

var sshHelp = Backbone.View.extend({
	tagName: "p",
	getKey: function(callback) {
		$.get("/api/ssh/key", function(response) {
			callback(response);
		});
	},
	render: function() {
		var self = this;
		$(this.template).removeClass("hidden");
		this.getKey(function(response) {
			self.$el.html('ssh "' + response + '" umask 077; test -d .ssh || mkdir .ssh ; cat >> .ssh/authorized_keys');
		})
		return this;
	}
});

/**
 * Add server
 */
Mariachi.Views.ServersAddView = Backbone.View.extend({
	el: "#content",
	events: {
		"click #submitAddServer": "submitAddServer"
	},
	loading: new Mariachi.Views.Loading(),
	initialize: function() {
		this.render();
	},
	render: function() {
		var template = _.template($(".addServerTemplate").html());
		this.$el.html(template);
		this.loading.hide();
	},
	submitAddServer: function(e) {
		var self = this;
		e.preventDefault();
		self.loading.show();

		$("#submitAddServer").addClass("disabled");

		var data = {
			name: $('input#name').val(),
			address: $('input#address').val(),
			ssh_user: $('input#ssh_user').val(),
			ssh_port: $("input#ssh_port").val(),
			os: $("select#os").val()
		}

		// data.groups;
		// data.tags;
		// 
		
		var model = new Mariachi.Models.Server(data);

		model.save(data, {
			success: function(model, response) {
				var collection = new Mariachi.Collections.Servers();
				collection.add(model);

				Backbone.history.navigate("/", {trigger: true, replace: true});
				
				new Mariachi.Views.MessageView({
					message: "Server created.", 
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
Mariachi.Views.ServersEditView = Backbone.View.extend({
	el: "#content",
	events: {
		"click #submitAddServer": "submitAddServer"
	},
	loading: new Mariachi.Views.Loading(),
	initialize: function(data) {
		this.model = new Mariachi.Models.Server({id: data.id});
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		this.model.fetch({
			success: function(model, response) {
				var template = _.template($(".editServerTemplate").html());
				self.$el.html(template(model.toJSON()));
				self.loading.hide();
			},
			error: function(model, response) {
				self.loading.hide();
			}
		});
	},
	submitAddServer: function(e) {
		var self = this;
		e.preventDefault();
		self.loading.show();

		$("#submitAddServer").addClass("disabled");

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
		
		// var model = new Mariachi.Models.Server(data);

		this.model.save(data, {
			success: function(model, response) {
				Backbone.history.navigate("/", {trigger: true, replace: true});
				new Mariachi.Views.MessageView({
					message: "Server updated.", 
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
		
		// var collection = new Mariachi.Collections.Servers();
		// collection.add(model);
	}
});

/**
 * Delete server
 */
Mariachi.Views.ServersDeleteView = Backbone.View.extend({
	el: "#content",
	events: {
		"click #confirmDeleteSubmit": "deleteServer"
	},
	loading: new Mariachi.Views.Loading(),
	initialize: function(data) {
		this.model = new Mariachi.Models.Server({id: data.id});
		this.render(data.id);
	},
	render: function(id) {
		var self = this;
		this.model.fetch({
			success: function(model, response) {
				var template = _.template($(".removeServer").html());
				self.$el.html(template(model.toJSON()));
				self.loading.hide();
			},
			error: function(model, response) {
				self.loading.hide();
			}
		});
	},
	deleteServer: function(e) {
		e.preventDefault();
		var self = this;
		self.loading.shows();
		this.model.destroy({
			success: function(model, response) {
				Backbone.history.navigate("/", {trigger: true, replace: true});
				new Mariachi.Views.MessageView({
					message: "Server deleted.", 
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