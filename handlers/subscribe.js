module.exports = function(socket) {
	socket.on('subscribe', (data, fn) => {
		switch (data.channel) {
			case 'balance':
				balanceSubscribeHandler(socket, data, fn);
				break;
			default:
				fn({
					response: 400,
					message: 'unknown channel'
				});
				break;
		}
	});

	socket.on('unsubscribe', (data, fn) => {
		unSubscribeHandler(socket, data, fn);
	});
};

var Web3 = require('web3');

const uuidv4 = require('uuid/v4');
var p = new Web3.providers.WebsocketProvider('ws://localhost:8548');
var web3 = new Web3(p);

var minimeContract_abi = require('../contracts/MiniMeToken.json');

var subscriptions = {};

function balanceSubscribeHandler(socket, data, fn) {

	// TODO : validate 'data' field 

	var promiseslist = [];
	for (var i = 0; i < data.args.tokens.length; i++) {
		var minimeContract = new web3.eth.Contract(minimeContract_abi.abi, data.args.tokens[i]);
		promiseslist.push(Promise.all([
			data.args.tokens[i],
			minimeContract.methods.symbol().call(),
			minimeContract.methods.name().call(),
			minimeContract.methods.balanceOf(data.args.pubkey).call(),
		]));
	}

	Promise.all(promiseslist).then(function(r) {
		var reply = r.reduce(function(response, val) {
			return response.concat({
				pubkey: data.args.pubkey,
				tokenContractAddress: val[0],
				tokenSymbol: val[1],
				tokenName: val[2],
				balance: val[3]
			})
		}, []);

		// create subscription
		var subscriptionId = uuidv4();
		if (!subscriptions[socket.id]) {
			subscriptions[socket.id] = {};
		}
		subscriptions[socket.id][subscriptionId] = {};

		// send response
		fn({
			response: 200,
			subscriptionId: subscriptionId,
			data: reply
		});
	});
}


function unSubscribeHandler(socket, data, fn) {

	if (subscriptions[socket.id] && subscriptions[socket.id][data.subscriptionId]) {
		// TODO : write unsubscribe handler.
		// Now it just deletes the subscription object..
		delete subscriptions[socket.id][data.subscriptionId];
		fn({
			response: 200
		});
	} else {
		fn({
			response: 400,
			message: 'subscription not found'
		});
	}
};