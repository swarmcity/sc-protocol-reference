const uuidv4 = require('uuid/v4');

var tasks = {};

module.exports = {

	tasks: tasks,

	addTask: function(interval, data, task) {
		let id = uuidv4();
		tasks[id] = {
			interval: interval,
			last_run: null,
			task: task,
			isRunning: false,
			data: data
		}
		return Promise.resolve(id);
	},

	removeTask: function() {
		if (tasks[id]) {
			delete task[id];
		}
	},

	triggerInterval: function(type) {
		var promises = [];
		for (var p in tasks) {
			if (tasks.hasOwnProperty(p) && tasks[p].interval === type) {
				var promise = new Promise(function(resolve, reject) {
					tasks[p].isRunning = true;
					tasks[p].task(tasks[p].data).then(function() {
						tasks[p].last_run = Date.now();
						tasks[p].isRunning = false;
						resolve();
					}, function() {
						reject();
					});
				});
				promises.push(promise);
			}
		}
		return Promise.all(promises);
	},

	reset: function(){
		for (var p in tasks) {
			if (tasks.hasOwnProperty(p)){
				delete tasks[p];
			}
		}
	}

};