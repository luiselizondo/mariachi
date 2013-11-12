Mariachi.Collections.Recepies = Backbone.Collection.extend({
	model: Mariachi.Models.Recepie,
	url: "/api/recepies"
});

Mariachi.Collections.Servers = Backbone.Collection.extend({
	model: Mariachi.Models.Server,
	url: "/api/servers"
});

Mariachi.Collections.Sites = Backbone.Collection.extend({
	model: Mariachi.Models.Site,
	url: "/api/sites"
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