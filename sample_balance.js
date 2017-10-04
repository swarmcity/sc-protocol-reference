var io = require('socket.io-client');
var server = require('./server');
server.start(4000);

var socketURL = 'http://localhost:4000';

var options = {
	transports: ['websocket'],
	'force new connection': true
};

client = io.connect(socketURL, options);

client.emit('subscribe', {
	channel: 'balance',
	args: {
		pubkey: '0x7018d8f698bfa076e1bdc916e2c64caddc750944',
		tokens: ['0xb9e7f8568e08d5659f5d29c4997173d84cdf2607', '0x0']
	}
}, (data) => {
	console.log('subscribe returned data');
	console.log(JSON.stringify(data,null,null,2));
});

client.on('balance', (data) => {
	console.log('received "balance" event');
	console.log(JSON.stringify(data,null,null,2));
});