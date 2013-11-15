Mariachi.Routers.ServersRouter = Backbone.Router.extend({
	initialize: function() {
		
	},
	routes: {
		"": "home",
		"servers/add": "addServer",
		"servers/:id": "getServer",
		"servers/edit/:id": "editServer",
		"servers/delete/:id": "deleteServer"
	},
	home: function() {
		new Mariachi.Views.ListServers();
		console.log("Home");
	},
	getServer: function(id) {
		new Mariachi.Views.ViewServer({id: id});
	},
	addServer: function() {
		new Mariachi.Views.AddServer();
	},
	editServer: function(id) {
		new Mariachi.Views.EditServer({id: id});
	},
	deleteServer: function(id) {
		new Mariachi.Views.DeleteServer({id: id});
	}
});