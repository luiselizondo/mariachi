Mariachi.Routers.RecepiesRouter = Backbone.Router.extend({
	initialize: function() {
		
	},
	routes: {
		"": "home",
		"recepies/add": "addRecepie",
		"recepies/:id": "getRecepie",
		"recepies/edit/:id": "editRecepie",
		"recepies/delete/:id": "deleteRecepie"
	},
	home: function() {
		new Mariachi.Views.ListRecepies();
	},
	getRecepie: function(id) {
		new Mariachi.Views.ViewRecepie({id: id});
	},
	addRecepie: function() {
		new Mariachi.Views.AddRecepie();
	},
	editRecepie: function(id) {
		new Mariachi.Views.EditRecepie({id: id});
	},
	deleteRecepie: function(id) {
		new Mariachi.Views.DeleteRecepie({id: id});
	}
});