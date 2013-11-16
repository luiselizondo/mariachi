Mariachi.Collections.Recepies = Backbone.Collection.extend({
	model: Mariachi.Models.Recepie,
	url: "/api/recepies"
});

Mariachi.Collections.Servers = Backbone.Collection.extend({
	model: Mariachi.Models.Server,
	url: "/api/servers",
	getWithStatus: function(status, callback) {
		$.ajax({
      type: "GET",
      url: this.url,
      data: {status: status},
      dataType: "json",
      success: function(data){
      	console.log(data);
        callback(false, data);
      },
      error: function(jqXHR, textStatus, errorThrown){
        console.log("FETCH FAILED: " + errorThrown);
        callback(errorThrown, false);
      }
	  });
	},
	refreshStatus: function(callback) {
		var url = this.url + "/actions";

		$.ajax({
      type: "GET",
      url: this.url + "/actions",
      data: {action: "refreshStatus"},
      dataType: "json",
      success: function(data){
        callback(data);
      },
      error: function(jqXHR, textStatus, errorThrown){
        console.log("FETCH FAILED: " + errorThrown);
      }
	  });
	}
});

Mariachi.Collections.Projects = Backbone.Collection.extend({
	model: Mariachi.Models.Project,
	url: "/api/projects"
});

Mariachi.Collections.Tasks = Backbone.Collection.extend({
	model: Mariachi.Models.Task,
	url: "/api/tasks"
});

Mariachi.Collections.Users = Backbone.Collection.extend({
	model: Mariachi.Models.User,
	url: "/api/users"
});

Mariachi.Collections.Templates = Backbone.Collection.extend({
	model: Mariachi.Models.Template,
	url: "/api/templates"
});