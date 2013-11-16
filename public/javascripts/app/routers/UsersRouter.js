Mariachi.Routers.UsersRouter = Backbone.Router.extend({
	initialize: function() {
		
	},
	routes: {
		"": "home",
		"users/add": "addUser",
		"users/:id": "getUser",
		"users/edit/:id": "editUser",
		"users/delete/:id": "deleteUser"
	},
	home: function() {
		new Mariachi.Views.ListUsersView();
	},
	getUser: function(id) {
		new Mariachi.Views.ViewUserView({id: id});
	},
	addUser: function() {
		new Mariachi.Views.AddUserView();
	},
	editUser: function(id) {
		new Mariachi.Views.EditUserView({id: id});
	},
	deleteUser: function(id) {
		new Mariachi.Views.DeleteUserView({id: id});
	}
});