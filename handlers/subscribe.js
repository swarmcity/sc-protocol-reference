module.exports = function(socket) {
	socket.on('subscribe', (data, fn) => {
		switch (data.channel) {
			case 'balance':
				balanceSubscribeHandler(socket, data, fn);
				break;
				//case ''
			default:
				//console.log('unknown channel', data.channel);
				fn({
					success: false,
					message: 'unknown channel'
				});
				break;
		}
	});
};

var Web3 = require('web3');

const uuidv4 = require('uuid/v4');
var p = new Web3.providers.WebsocketProvider('ws://localhost:8548');
var web3 = new Web3(p);

//var web3_old = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

var minimeContract_abi = require('../contracts/MiniMeToken.json');

// var subscription = web3.eth.subscribe('pendingTransactions', function(error, result) {
// 	if (!error)
// 		console.log(result);
// 	else
// 		console.log(error);
// });

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
		subscriptions[subscriptionId] = {};

		// send response
		fn({
			response: 200,
			subscriptionId: subscriptionId,
			data: reply
		});


	});

}