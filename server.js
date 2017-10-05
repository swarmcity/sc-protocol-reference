var io = require('socket.io')();

//var c = require('./handlers/connected');
//	var s = require('./handlers/subscribe');

var socket_g;
var handler_connected = require('./handlers/connected');
var handler_subscribe = require('./handlers/subscribe')

io.on('connect', (socket) => {
	console.log('connected id=',socket.id);
	handler_connected(socket);
	handler_subscribe(socket);
});

function start(port) {
	io.listen(port);
}

module.exports = {
	io: io,
	start: start
};