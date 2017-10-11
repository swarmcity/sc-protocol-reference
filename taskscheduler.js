const uuidv4 = require('uuid/v4');

var tasks = {};
var timerInterval;

module.exports = {

	tasks: tasks,

	/**
	 * start the timer scheduler
	 * @return {Number} milliseconds to trigger 
	 */
	start: function(interval) {
		timerInterval = setInterval(function() {
			this.triggerInterval('timer')
		}.bind(this), interval);
	},

	stop: function() {
		if (timerInterval) {
			clearInterval(timerInterval);
		}
	},

	/**
	 * add a task to the scheduler
	 * @return {Promise} that resolves when task was added - resolves to task's id
	 * @param {String} description of trigger type
	 * @param {Object} data passed to 'task' function
	 * @param {Function} function that gets called. should return a promise.
	 */
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

	/**
	 * remove a task from the scheduler
	 * @param {String} id of task to remove
	 */
	removeTask: function(id) {
		if (tasks[id]) {
			delete tasks[id];
			console.log('Task deleted',id);
		}
		return Promise.resolve(id);
	},

	/**
	 * trigger a task from the scheduler
	 * @param {String} type of tasks to trigger. the 'timer' type will be auto triggered.
	 */
	triggerInterval: function(type) {
		var promises = [];
		for (var p in tasks) {
			if (tasks.hasOwnProperty(p) && tasks[p].interval === type) {

				if (type !== 'timer' || (type === 'timer' && (!tasks[p].last_run || Date.now() > tasks[p].last_run + tasks[p].data.interval))) {

					var promise = new Promise(function(resolve, reject) {
						tasks[p].isRunning = true;
						tasks[p].task(tasks[p].data).then(function(result) {
							tasks[p].last_run = Date.now();
							tasks[p].isRunning = false;
							tasks[p].lastresult = result;

							resolve();
						}, function() {
							reject();
						});
					});
					promises.push(promise);

				}
			}
		}
		return Promise.all(promises);
	},
	
	/**
	 * removes all tasks from the scheduler
	 */
	clear: function() {
		for (var p in tasks) {
			if (tasks.hasOwnProperty(p)) {
				delete tasks[p];
			}
		}
		return Promise.resolve();
	}

};