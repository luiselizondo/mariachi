Mariachi.Routers.ProjectsRouter = Backbone.Router.extend({
	initialize: function() {
		
	},
	routes: {
		"": "home",
		"projects/add": "addProject",
		"projects/:id": "getProject",
		"projects/edit/:id": "editProject",
		"projects/delete/:id": "deleteProject"
	},
	home: function() {
		new Mariachi.Views.ListProjects();
	},
	getProject: function(id) {
		new Mariachi.Views.ViewProject({id: id});
	},
	addProject: function() {
		new Mariachi.Views.AddProject();
	},
	editProject: function(id) {
		new Mariachi.Views.EditProject({id: id});
	},
	deleteProject: function(id) {
		new Mariachi.Views.DeleteProject({id: id});
	}
});