


Mariachi.Views.ListLogs = Backbone.View.extend({
	el: "tbody",
	tagName: "tr",
	events: {
		"click a.view": "viewLog"
	},
	loading: new Mariachi.Views.Loading(),
	collection: new Mariachi.Collections.Logs(),
	template: _.template($(".logRow").html()),
	initialize: function() {
		var self = this;
		this.listen();
		this.render();
		self.collection.fetch({
			success: function(results) {
				self.loading.hide();
				var data = results.toJSON();
				_.each(data, function(result) {
					self.$el.prepend(self.template(result));
				})
			},
			error: function(results) {
				new Mariachi.Views.MessageView({
					message: "There was an error", 
					type:"danger"
				});

				self.loading.hide();
			}
		});
	},
	render: function() {
		
	},
	listen: function() {
		var self = this;
		
		Mariachi.io.on("logs:new", function(data) {
			if(data) {
				self.loading.hide();
				self.$el.prepend(self.template(data));
			}
		});
	},
	viewLog: function(e) {
		e.preventDefault();
		var id = $(e.currentTarget).attr("data-id");
		console.log(id);
		
		var self = this;
		var model = new Mariachi.Models.Log({id: id});
		model.fetch({
			success: function(response) {
				var content = response.toJSON().result;
				var modal = new Backbone.BootstrapModal({
					content: content.message,
					title: content.time,
					animate: true
				});

				modal.open(function() {

				});
			},
			error: function(response) {

			}
		});
	}
});

