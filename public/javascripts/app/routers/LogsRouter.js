Mariachi.Routers.LogsRouter = Backbone.Router.extend({
	initialize: function() {
		console.log("Initialized router");
	},
	routes: {
		"": "home",
	},
	home: function() {
		new Mariachi.Views.ListLogs();
	},
});