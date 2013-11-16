var Mariachi = {}
Mariachi.Routers = {};
Mariachi.Views = {};
Mariachi.Collections = {};
Mariachi.Models = {};

// Load socket.io in Mariachi.io so we can use it in our application
Mariachi.io = io.connect();

/**
 * Loading div
 */
Mariachi.Views.Loading = Backbone.View.extend({
	el: ".loading",
	initialize: function() {

	},
	show: function() {
		$(this.$el).removeClass("hidden");
	},
	hide: function() {
		$(this.$el).addClass("hidden");
	}
});