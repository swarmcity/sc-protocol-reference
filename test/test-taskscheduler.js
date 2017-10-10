var should = require('should');
var scheduler = require('../taskscheduler');

describe("add task", function() {

  var client;

  it('should add a task', function(done) {
    scheduler.addTask('block', {
      pubkey: '0x123'
    }, function(data) {
      console.log('I am a task. my data is', data);
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

  it('should show the task queue',function(done){
    console.log(JSON.stringify(scheduler.tasks,null,4));
    done();
  });

  after(function(done) {
    scheduler.reset();
    done();
  });


});