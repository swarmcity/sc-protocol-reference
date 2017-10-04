var io = require('socket.io')();

//var c = require('./handlers/connected');
//	var s = require('./handlers/subscribe');

var socket_g;

io.on('connect', (socket) => {
	console.log('connected id=',socket.id);
	require('./handlers/connected')(socket);
	require('./handlers/subscribe')(socket);
});


function start(port) {
	io.listen(port);
}

module.exports = {
	io: io,
	start: start
};