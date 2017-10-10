var io = require('socket.io')();
var scheduler = require('./taskscheduler');
var web3connector = require('./web3connector');

var socket_g;
var handler_connected = require('./handlers/connected');
var handler_subscribe = require('./handlers/subscribe')


io.on('connect', (socket) => {
	console.log('connected id=', socket.id);
	handler_connected(socket, scheduler);
	handler_subscribe(socket, scheduler);

	socket.on('disconnect', (reason) => {
		console.log('hangup from connection id=', socket.id, '(', reason, ')');
	});
});


function start(port) {
	scheduler.start(1000 * 3);

	web3connector.events.on('newBlockHeaders', function(data) {
		console.log('NEW BLOCK',data);
		scheduler.triggerInterval('block').then(function() {

		});
	});

	web3connector.connect();

	io.listen(port);

}

module.exports = {
	io: io,
	start: start
};