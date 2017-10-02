module.exports = function(socket) {
	socket.on('subscribe', (data, fn) => {
		switch (data.channel) {
			case 'balance':
				balanceSubscribeHandler(socket, data, fn);
				break;
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


function balanceSubscribeHandler(socket, data, fn) {

	var timer = setInterval(function() {
		socket.emit('balance', {
			balance: Math.floor(Math.random() * 100000000)
		});
	}, 100);

	fn({
		success: true,
		balance: 12345,
		subscription: 'aaaaa'
	});

}
