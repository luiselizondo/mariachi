Mariachi.Models.Recepie = Backbone.Model.extend({
	defaults: {
		name: "",
		description: "",
		parameters: "",
		recepie: "",
	},
	urlRoot: "/api/recepies"
});

Mariachi.Models.Server = Backbone.Model.extend({
	defaults: {
		name: "",
		address: "",
		ssh_user: "",
		ssh_port: "22",
		os: "",
		status: 0
	},
	urlRoot: "/api/servers",
	createSSHKey: function(id, callback) {
		$.ajax({
      type: "GET",
      url: this.urlRoot + "/" + id + "/createSSHKey",
      dataType: "json",
      success: function(data){
        callback(false, data);
      },
      error: function(jqXHR, textStatus, errorThrown){
        console.log("FETCH FAILED: " + errorThrown);
        callback(errorThrown, false);
      }
	  });
	},
	getSSHKey: function(id, callback) {
		$.ajax({
      type: "GET",
      url: this.urlRoot + "/" + id + "/getSSHKey",
      dataType: "json",
      success: function(data){
        callback(false, data);
      },
      error: function(jqXHR, textStatus, errorThrown){
        console.log("FETCH FAILED: " + errorThrown);
        callback(errorThrown, false);
      }
	  });
	}
});

/**
 * @todo add created
 */
Mariachi.Models.Project = Backbone.Model.extend({
	defaults: {
		name: "",
		description: "",
		type: "",
		fqdn: "",
		stdout: "",
		stderr: "",
		data: {}
	},
	urlRoot: "/api/projects",
	deploy: function(id, callback) {
		$.ajax({
      type: "POST",
      url: this.urlRoot + "/" + id + "/deploy",
      dataType: "json",
      success: function(data){
        callback(false, data);
      },
      error: function(jqXHR, textStatus, errorThrown){
        console.log("FETCH FAILED: " + errorThrown);
        callback(errorThrown, false);
      }
	  });
	},
});

/**
 * @todo add created
 */
Mariachi.Models.Task = Backbone.Model.extend({
	defaults: {
		status: "WAITING",
		server: "",
		user: "",
		task: "",
		type: "",
		started: "",
		ended: ""
	},
	urlRoot: "/api/tasks"
});

/**
 * @todo add created
 */
Mariachi.Models.Log = Backbone.Model.extend({
	defaults: {
		time: "WAITING",
	},
	urlRoot: "/api/logs",
	id: "_id"
});

Mariachi.Models.User = Backbone.Model.extend({
	defaults: {
		name: "",
		email: "",
		password: "",
		created: ""
	},
	urlRoot: "/api/users"
});

Mariachi.Models.Template = Backbone.Model.extend({
	defaults: {
		name: "",
		description: "",
		destination: "",
		parameters: "",
		template: "",
	},
	urlRoot: "/api/templates"
});

Mariachi.Models.SSHKey = Backbone.Model.extend({
	defaults: {
		publicKey: "",
		server: {}
	},
	urlRoot: "/api/ssh/key"
});