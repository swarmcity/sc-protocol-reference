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
var p = new Web3.providers.WebsocketProvider('ws://127.0.0.1:8548');
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


	var web3subscriptions = [];
	Promise.all(promiseslist).then(function(r) {

		// subscribe to updates on this (pubkey,token) pair
		var topic = web3.utils.sha3('Transfer(address,address,uint256)');

		var reply = r.reduce(function(response, val) {

			// create subscription 
			var s = web3.eth.subscribe('logs', {
					address: val[0],
					topics: [topic]
				})
				.on("data", function(transaction) {
					console.log('received data from GETH', transaction);
					// TODO : get transaction via transactionHash &
					// read relevant fields ( pubkey ) - update balances
					// & fire event for balance  
					socket.emit('balance',
						{
							pubkey: data.args.pubkey,
							tokenContractAddress: val[0],
							tokenSymbol: val[1],
							tokenName: val[2],
							balance: 0
						}
					);
				});
			console.log('subscribed to GETH event log on address ', val[0]);
			web3subscriptions.push(s);

			// create initial reply
			return response.concat({
				pubkey: data.args.pubkey,
				tokenContractAddress: val[0],
				tokenSymbol: val[1],
				tokenName: val[2],
				balance: val[3]
			})
		}, []);

		// save subscription , being an array of web3 subscriptions
		var subscriptionId = uuidv4();

		if (!subscriptions[socket.id]) {
			subscriptions[socket.id] = {};
		}
		subscriptions[socket.id][subscriptionId] = {
			web3subscriptions: web3subscriptions
		};

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
		for (var i = 0; i < subscriptions[socket.id][data.subscriptionId].web3subscriptions.length; i++) {
			var s = subscriptions[socket.id][data.subscriptionId].web3subscriptions[i];
			console.log('Unsubscribing from GETH event log id', s.id);
			s.unsubscribe(function(error, success) {
				if (success)
					console.log('Successfully unsubscribed from GETH event log!');
			});
		}

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