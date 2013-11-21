var events = require('./events').events;

/**
 * Class to emit events throught socket.io
 */
function Pub(socket) {
	var self = this;
	self.socket = socket;

	// Define a new method to emit events
	// receive a string event and a data object and send it
	self.emit = function(event, data) {
		self.socket.emit(event, data);
	}

	return this;
}

/**
 * All application events are in events, here we write all communication with sockets
 * both listeners and emitters are here, if we neec to communicate with the application
 * we use the variable events which is an instantiated class
 */
module.exports = function(io) {
	io.sockets.on('connection', function (socket) {
		var pub = new Pub(socket);

	  socket.on("ready", function(data) {
	  	console.log("Client connected to the server");
	  });

	  events.on("tasks:start", function(data) {
	  	pub.emit("tasks:start", data);
	  })

	  events.on("tasks:finished", function(data) {
	  	pub.emit("tasks:finished", data);
	  });

	  events.on("tasks:stream", function(data) {
	  	pub.emit("tasks:stream", data);
	  })

	  events.on("projects:start", function(data) {
	  	pub.emit("projects:start", data);
	  });

	  events.on("projects:finished", function(data) {
	  	pub.emit("projects:finished", data);
	  })

	  events.on("projects:stream", function(data) {
	  	pub.emit("projects:stream", data);
	  });
	});
}