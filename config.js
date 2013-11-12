var _ = require("underscore");

function Config() {	
	this.get = function() {
		var file = require("./installer/settings.json");

		if(_.isObject(file) && !_.isEmpty(file)) {
			console.log("File found");
			return file;
		} 
		else {
			console.log("Mariachi is not configured, enabling installer, go to http://yoursite:port/install to install Mariachi");
			return false;
		}
	}
}

module.exports = new Config().get();