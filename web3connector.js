const EventEmitter = require('events').EventEmitter;
const eventEmitter = new EventEmitter();

module.exports = {

	events: eventEmitter,

	connect: function() {

		var Web3 = require('web3');
		var p = new Web3.providers.WebsocketProvider('ws://127.0.0.1:8548');
		var web3 = new Web3(p);

		var s = web3.eth.subscribe('newBlockHeaders')
			.on("data", function(blockdata) {
				console.log('new block',blockdata.number);
				eventEmitter.emit('newBlockHeaders', blockdata);
			});
	}

}