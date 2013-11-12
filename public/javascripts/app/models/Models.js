Mariachi.Models.Recepie = Backbone.Model.extend({
	defaults: {
		name: "",
		description: "",
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
		os: ""
	},
	urlRoot: "/api/servers",
});

/**
 * @todo add created
 */
Mariachi.Models.Project = Backbone.Model.extend({
	defaults: {
		name: "",
		fqdn: "",
		data: {}
	},
	urlRoot: "/api/projects"
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
		type: ""
	},
	urlRoot: "/api/tasks"
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
		patterns: "",
		template: "",
		destination: "",
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