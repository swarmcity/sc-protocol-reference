var should = require('should');
var io = require('socket.io-client');
var server = require('../server');
server.start(4000);

var socketURL = 'http://localhost:4000';

var options = {
  transports: ['websocket'],
  'force new connection': true
};

describe("Swarm City API socket client", function() {

  var client;

  it('should receive "connect" event right after connect', function(done) {
    client = io.connect(socketURL, options);
    client.on('connected', function(data) {
      console.log('client id=', client.id);
      data.should.be.type('object');
      data.version.should.equal('0.0.2');
      done();
    });
  });

  it('should subscribe to "balance" channel & receive success===true', function(done) {
    client.emit('subscribe', {
      channel: 'balance',
      args: {
        pubkey: '0x7018d8f698bfa076e1bdc916e2c64caddc750944',
        tokens: ['0xb9e7f8568e08d5659f5d29c4997173d84cdf2607', '0x0']
      }
    }, (data) => {
      data.should.be.type('object');
      data.success.should.equal(true);
      data.subscription.should.exist;
    });

    client.on('balance', (data) => {
      data.balance.should.exist;
      done();
    });
  });

  after(function(done) {
    client.close();
    server.io.close();
    done();
  });


});