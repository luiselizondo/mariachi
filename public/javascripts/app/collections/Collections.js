Mariachi.Collections.Recepies = Backbone.Collection.extend({
	model: Mariachi.Models.Recepie,
	url: "/api/recepies"
});

Mariachi.Collections.Servers = Backbone.Collection.extend({
	model: Mariachi.Models.Server,
	url: "/api/servers"
});

Mariachi.Collections.Projects = Backbone.Collection.extend({
	model: Mariachi.Models.Project,
	url: "/api/projects"
});

Mariachi.Collections.Tasks = Backbone.Collection.extend({
	model: Mariachi.Models.Task,
	url: "/api/tasks"
});

Mariachi.Collections.Users = Backbone.Collection.extend({
	model: Mariachi.Models.User,
	url: "/api/users"
});

Mariachi.Collections.Templates = Backbone.Collection.extend({
	model: Mariachi.Models.Template,
	url: "/api/templates"
});