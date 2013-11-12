var events = require('./events');

function taskFinished(socket, data) {
	socket.emit("tasks:finished", {stderr: data.stderr, stdout: data.stdout, status: data.status});
}

function taskStream(socket, data) {
	socket.emit("tasks:stream", {stderr: data.stderr, stdout: data.stdout});
}


/**
 * All application events are in events, here we write all communication with sockets
 * both listeners and emitters are here, if we neec to communicate with the application
 * we use the variable events which is an instantiated class
 */
module.exports = function(io) {
	io.sockets.on('connection', function (socket) {
	  socket.on("ready", function(data) {
	  	console.log("Client connected to the server");
	  	console.log(data);
	  });

	  events.on("tasks:finished", function(data) {
	  	taskFinished(socket, data);
	  });

	  events.on("tasks:stream", function(data) {
	  	taskStream(socket, data);
	  })
	});
}