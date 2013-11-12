Mariachi.Routers.TemplatesRouter = Backbone.Router.extend({
	initialize: function() {
		
	},
	routes: {
		"": "home",
		"templates/add": "addTemplate",
		"templates/:id": "getTemplate",
		"templates/edit/:id": "editTemplate",
		"templates/delete/:id": "deleteTemplate"
	},
	home: function() {
		new Mariachi.Views.ListTemplates();
	},
	getTemplate: function(id) {
		new Mariachi.Views.ViewTemplate({id: id});
	},
	addTemplate: function() {
		new Mariachi.Views.AddTemplate();
	},
	editTemplate: function(id) {
		new Mariachi.Views.EditTemplate({id: id});
	},
	deleteTemplate: function(id) {
		new Mariachi.Views.DeleteTemplate({id: id});
	}
});