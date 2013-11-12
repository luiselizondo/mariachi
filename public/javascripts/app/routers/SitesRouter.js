Mariachi.Routers.SitesRouter = Backbone.Router.extend({
	initialize: function() {
		
	},
	routes: {
		"": "home",
		"sites/add": "addSite",
		"sites/:id": "getSite",
		"sites/edit/:id": "editSite",
		"sites/delete/:id": "deleteSite"
	},
	home: function() {
		new Mariachi.Views.ListSites();
	},
	getSite: function(id) {
		new Mariachi.Views.ViewSite({id: id});
	},
	addSite: function() {
		new Mariachi.Views.AddSite();
	},
	editSite: function(id) {
		new Mariachi.Views.EditSite({id: id});
	},
	deleteSite: function(id) {
		new Mariachi.Views.DeleteSite({id: id});
	}
});