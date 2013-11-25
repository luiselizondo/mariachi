Mariachi.Routers.TasksRouter = Backbone.Router.extend({
	initialize: function() {
		
	},
	routes: {
		"": "home",
		"tasks/add": "addTask",
		"tasks/:id": "getTask"
	},
	home: function() {
		new Mariachi.Views.ListTasks();
	},
	getTask: function(id) {
		new Mariachi.Views.ViewTask({id: id});
	},
	addTask: function() {
		new Mariachi.Views.AddTask();
	}
});