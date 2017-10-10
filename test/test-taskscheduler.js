var should = require('should');
var scheduler = require('../taskscheduler');

describe("add task", function() {

  var client;

  // start scheduler with a 10ms interval check
  scheduler.start(10);

  it('should add a "block" task', function(done) {
    scheduler.addTask('block', {
      pubkey: '0x123'
    }, function(data) {
      console.log('I am a block task. my data is', data);
      return Promise.resolve();
    }).then(function(taskid) {
      console.log('task added. Id = ', taskid);
      done();
    })
  });

  it('should add a "timer" task', function(done) {
    scheduler.addTask('timer', {
      interval: 100 // ms
    }, function(data) {
      console.log('I am a timer task. my data is', data);
      return Promise.resolve();
    }).then(function(taskid) {
      console.log('task added. Id = ', taskid);
      done();
    })
  });

  it('should trigger a block event', function(done) {
    scheduler.triggerInterval('block').then(function() {
      done();
    });
  });

  it('should wait 1000 ms', function(done) {
    // allow the scheduler to trigger a few times.
    setTimeout(done, 1000);
  });

  it('should show the task queue', function(done) {
    console.log(JSON.stringify(scheduler.tasks, null, 4));
    done();
  });

  after(function(done) {
    scheduler.clear();
    scheduler.stop();
    done();
  });


});