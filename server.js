var io = require('socket.io')();

//var c = require('./handlers/connected');
//	var s = require('./handlers/subscribe');

var socket_g;
var handler_connected = require('./handlers/connected');
var handler_subscribe = require('./handlers/subscribe')

io.on('connect', (socket) => {
	console.log('connected id=', socket.id);
	handler_connected(socket);
	handler_subscribe(socket);

	socket.on('disconnect', (reason) => {
		console.log('hangup from connection id=', socket.id, '(', reason, ')');
	});
});



function start(port) {
	io.listen(port);
}

module.exports = {
	io: io,
	start: start
};