var taskScheduler;

module.exports = function(socket, taskscheduler) {

	taskScheduler = taskscheduler;

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
		unSubscribeHandler(socket, data.subscriptionId, fn);
	});

	socket.on('disconnect', (reason) => {
		unSubscribeSocket(socket);
	});
};


var minimeContract_abi = require('../contracts/MiniMeToken.json');

var subscriptions = {};

const uuidv4 = require('uuid/v4');

var Web3 = require('web3');
var p = new Web3.providers.WebsocketProvider('ws://127.0.0.1:8548');
var web3 = new Web3(p);

function balanceSubscribeHandler(socket, data, fn) {

	// TODO : validate 'data' field 

	var promiseslist = [];
	for (var i = 0; i < data.args.tokens.length; i++) {
		promiseslist.push(getPrice(data.args.pubkey, data.args.tokens[i]));
	}

	var balancesubscriptions = [];
	Promise.all(promiseslist).then(function(r) {

		var reply = r.reduce(function(response, val) {

			taskScheduler.addTask('block', {
				pubkey: data.args.pubkey,
				tokenaddress: val[0],
				socketid: socket.id,
				lastresponse: val[3]
			}, function(data) {

				var p = new Promise(function(resolve, reject) {
					getPrice(data.pubkey, data.tokenaddress).then(
						function(priceResponse) {
							if (data.lastresponse !== priceResponse[3]) {
								socket.emit('balance', {
									pubkey: data.pubkey,
									tokenContractAddress: priceResponse[0],
									tokenSymbol: priceResponse[1],
									tokenName: priceResponse[2],
									balance: priceResponse[3]
								});
								data.lastresponse = priceResponse[3];
							}else{
								console.log('no price change');
							}
							resolve();

						},
						function() {
							console.log('rejected...');
							reject();
						});
				});
				return p;

			}).then(function(taskid) {
				console.log('task added. Id = ', taskid);
				balancesubscriptions.push(taskid);
			});

			//console.log('subscribed to GETH event log on address ', val[0]);


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
			balancesubscriptions: balancesubscriptions
		};

		// send response
		fn({
			response: 200,
			subscriptionId: subscriptionId,
			data: reply
		});

	});
}

function getPrice(pubkey, token) {
	var minimeContract = new web3.eth.Contract(minimeContract_abi.abi, token);
	return Promise.all([
		token,
		minimeContract.methods.symbol().call(),
		minimeContract.methods.name().call(),
		minimeContract.methods.balanceOf(pubkey).call(),
	]);
}

function unSubscribeSocket(socket) {
	for (key in taskScheduler.tasks) {
		if (taskScheduler.tasks.hasOwnProperty(key) && taskScheduler.tasks[key].data.socketid === socket.id) {
			taskScheduler.removeTask(key);
		}
	}
}

function unSubscribeHandler(socket, subscriptionId, fn) {

	if (subscriptions[socket.id] && subscriptions[socket.id][subscriptionId]) {
		for (var i = 0; i < subscriptions[socket.id][subscriptionId].balancesubscriptions.length; i++) {
			var s = subscriptions[socket.id][subscriptionId].balancesubscriptions[i];
			taskScheduler.removeTask(s);
		}

		delete subscriptions[socket.id][subscriptionId];
		if (fn) {
			fn({
				response: 200
			});
		}
	} else {
		if (fn) {
			fn({
				response: 400,
				message: 'subscription not found'
			});
		}
	}
};