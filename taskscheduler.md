# Scheduler

## Getting started
First you need to get the scheduler in your code

```
var scheduler = require('taskscheduler');
```
# API Reference

## start
```
scheduler.start([interval]);
``` 
Starts the timer 

### Parameters
- ```interval``` - ```Number``` : The interval in milliseconds to check all tasks in the scheduler and to fire them if applicable.

### Returns
nothing


## stop
```
scheduler.stop();
``` 
Stops the timer 

### Parameters
none

### Returns
nothing

## addTask

```
scheduler.addTask([category],[custom data],[function]);
```

Adds a task to the scheduler.

### Parameters
- ```category``` - ```String``` : a string representing the group of tasks this task belongs to. Similar tasks will be triggered together. A reserved category is ```timer``` which makes this task scheduled by interval.
- ```custom data``` - ```Object``` : data passed to the function. if this is a ```timer``` task, this data object is expected to have an ```interval``` parameter which is the interval ( in ms ).
- ```function``` - ```Function``` : the function that needs to be scheduled. It will receive [custom data] as it's first parameter and is expected to return a ```Promise```.


### Returns
```Promise``` - a promise that gets resolved when the task has been added to the scheduler. The first and only parameter to the resolve function is the ```taskId``` which can be used later to remove a task.

### Example
A ```timer``` task

```
   scheduler.addTask('timer', {
      interval: 100 // ms
    }, function(data) {
      console.log('I am a timer task. my data is', data);
      return Promise.resolve();
    }).then(function(taskid) {
      console.log('task added. Id = ', taskid);
    })
```

A custom task

```
scheduler.addTask('block', {
      mydata: 'data'
    }, function(data) {
      console.log('I am a block task. my data is', data);
      return Promise.resolve();
    }).then(function(taskid) {
      console.log('task added. Id = ', taskid);
    });
```

## removeTask
```
scheduler.removeTask([id]);
```

Removes a task from the scheduler


### Parameters
none

### Returns
```Promise``` that resolves when the task has been removed.



## clear
```
scheduler.clear();
```

Removes all tasks from the scheduler


### Parameters
none

### Returns
```Promise``` that resolves when the tasks have been removed.


## tasks

```
scheduler.tasks
```
The object containing all the tasks.



