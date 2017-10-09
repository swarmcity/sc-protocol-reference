var io = require('socket.io-client');
// var server = require('./server');
// server.start(4000);

var socketURL = 'http://localhost:4000';

var options = {
	transports: ['websocket'],
	'force new connection': true
};

client = io.connect(socketURL, options);

var subscriptiondata = {
	channel: 'balance',
	args: {
		pubkey: '0x7018d8f698bfa076e1bdc916e2c64caddc750944',
		tokens: [
			'0xb9e7f8568e08d5659f5d29c4997173d84cdf2607',
			'0xd26114cd6EE289AccF82350c8d8487fedB8A0C07'
		]
	}
};

console.log('subscription');
console.log(JSON.stringify(subscriptiondata, null, 2));

client.emit('subscribe', subscriptiondata, (data) => {
	console.log('subscription response');
	console.log(JSON.stringify(data, null, 2));
	// now we have the subscription , unsubscribe immediately
	// client.emit('unsubscribe', {
	// 	subscriptionId: data.subscriptionId
	// }, (data) => {
	// 	console.log('unsubscribe response');
	// 	console.log(JSON.stringify(data, null, 2));
	// 	client.close();
	// });
});

client.on('balance', (data) => {
	console.log('received "balance" event');
	console.log(JSON.stringify(data, null, 2));
});