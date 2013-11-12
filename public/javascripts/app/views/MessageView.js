/**
 * Shows a message
 */
Mariachi.Views.MessageView = Backbone.View.extend({
	el: "#messages",
	initialize: function(data) {
		if(_.isEmpty(data.type)) {
			var type = "warning";
		}
		else {
			var type = data.type;
		}

		this.render(data.message, type);
	},
	template: _.template($(".message").html()),
	render: function(message, type) {
		this.$el.html(this.template({message: message, type: type}));
	}
});