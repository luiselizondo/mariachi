/**
 * List servers
 */
Mariachi.Views.ListServers = Backbone.View.extend({
	el: "#content",
	events: {
		"click .refreshStatus": "refreshStatus"
	},
	initialize: function() {
		this.render();
	},
	loading: new Mariachi.Views.Loading(),
	template: _.template($(".listServers").html()),
	render: function() {
		var self = this;
		var items = new Mariachi.Collections.Servers();
		items.fetch({
			error: function(collection, response) {
				self.loading.hide();
			},
			success: function(collection, response) {
				// Table
				self.$el.html(self.template({items: response}));
				self.loading.hide();
			}
		});
	},
	refreshStatus: function(e) {
		var self = this;
		self.loading.show();
		e.preventDefault();

		var items = new Mariachi.Collections.Servers();
		items.refreshStatus(function(data) {
			self.render();
		});
	}
});

/**
 * View a server
 */
Mariachi.Views.ViewServer = Backbone.View.extend({
	el: "#content",
	events: {
		"click button.sshHelp": "sshHelp",
		"click a.createSSHKey": "createSSHKey",
		"click a.getSSHKey": "getSSHKey"
	},
	serverId: null,
	template: _.template($(".viewServer").html()),
	loading: new Mariachi.Views.Loading(),
	initialize: function(data) {
		this.render(data.id);
		this.serverId = data.id;
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

		var content = new Mariachi.Views.SSHHelp({id: this.serverId});

		var modal = new Backbone.BootstrapModal({
			content: content,
			title: "Connect to SSH server",
			animate: true
		});

		modal.open(function() {

		});
	},
	createSSHKey: function(e) {
		e.preventDefault();
		var self = this;
		var id = self.serverId;
		var model = new Mariachi.Models.Server({id: id});
		model.createSSHKey(id, function(err, result) {
			var content = '';
			if(err) content = err.error;
			if(result) content = result.result;

			var modal = new Backbone.BootstrapModal({
				content: content,
				title: "Created SSH Key",
				animate: true
			});

			modal.open(function() {

			});
		});
	},
	getSSHKey: function(e) {
		e.preventDefault();
		var self = this;
		var id = self.serverId;
		var model = new Mariachi.Models.Server({id: id});
		model.getSSHKey(id, function(err, result) {
			var content = '';
			if(err) content = err.error;
			if(result) content = result.result;

			var modal = new Backbone.BootstrapModal({
				content: content,
				title: "SSH Key of this server",
				animate: true
			});

			modal.open(function() {

			});
		});
	}
});

Mariachi.Views.SSHHelp = Backbone.View.extend({
	tagName: "p",
	className: "sshkey-help",
	serverID: null,
	initialize: function(data) {
		this.serverID = data.id;
	},
	render: function() {
		var self = this;
		$(this.template).removeClass("hidden");
		
		var model = new Mariachi.Models.SSHKey({id: this.serverID});
		model.fetch({
			success: function(model, response) {
				if(response) {
					var html = 'echo "' + response.publicKey + '" | ssh -p ' + response.server.ssh_port + ' ' + response.server.ssh_user + '@' + response.server.address + ' "umask 077; test -d .ssh || mkdir .ssh ; cat >> ~/.ssh/authorized_keys" ; echo "Key copied" || exit 1';
					self.$el.html(html);
				}
			},
			error: function(model, error) {
				console.log(error.responseText);
			},
		});

		return this;
	}
});

/**
 * Add server
 */
Mariachi.Views.AddServer = Backbone.View.extend({
	el: "#content",
	events: {
		"click #submit": "submit"
	},
	loading: new Mariachi.Views.Loading(),
	initialize: function() {
		this.render();
	},
	render: function() {
		var template = _.template($(".addServer").html());
		this.$el.html(template);
		this.loading.hide();
	},
	submit: function(e) {
		var self = this;
		e.preventDefault();
		self.loading.show();

		$("#submit").addClass("disabled");

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
Mariachi.Views.EditServer = Backbone.View.extend({
	el: "#content",
	events: {
		"click #submit": "submit"
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
				var template = _.template($(".editServer").html());
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
Mariachi.Views.DeleteServer = Backbone.View.extend({
	el: "#content",
	events: {
		"click #submit": "submit"
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
				var template = _.template($(".deleteServer").html());
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