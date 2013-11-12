Mariachi.Routers.ServersRouter = Backbone.Router.extend({
	initialize: function() {
		
	},
	routes: {
		"": "home",
		"server/add": "addServer",
		"server/:id": "getServer",
		"server/edit/:id": "editServer",
		"server/delete/:id": "deleteServer"
	},
	home: function() {
		new Mariachi.Views.ServersHomeView();
		console.log("Home");
	},
	getServer: function(id) {
		new Mariachi.Views.ServersView({id: id});
	},
	addServer: function() {
		new Mariachi.Views.ServersAddView();
	},
	editServer: function(id) {
		new Mariachi.Views.ServersEditView({id: id});
	},
	deleteServer: function(id) {
		new Mariachi.Views.ServersDeleteView({id: id});
	}
});