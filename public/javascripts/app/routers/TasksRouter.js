Mariachi.Routers.TasksRouter = Backbone.Router.extend({
	initialize: function() {
		
	},
	routes: {
		"": "home",
		"tasks/add": "addTask",
		"tasks/:id": "getTask",
		"tasks/edit/:id": "editTask",
		"tasks/delete/:id": "deleteTask"
	},
	home: function() {
		new Mariachi.Views.ListTasks();
	},
	getTask: function(id) {
		new Mariachi.Views.ViewTask({id: id});
	},
	addTask: function() {
		new Mariachi.Views.AddTask();
	},
	editTask: function(id) {
		new Mariachi.Views.EditTask({id: id});
	},
	deleteTask: function(id) {
		new Mariachi.Views.DeleteTask({id: id});
	}
});