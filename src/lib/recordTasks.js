const utils =  require('../lib/utils');
const weblog = require('./weblog');

class RecordTasks {
  constructor () {
    this.tasks = [];
  }

  set setTask(list) {
    const listMainInfo = list.map(({ material_url, id }) => ({ material_url, id: Number(id) }));
    this.tasks = this.tasks.concat(listMainInfo);

    weblog.sendLog('recordTasks.setTask', {
      recordTasks_tasks: Object.assign({}, listMainInfo)
    });
  }

  set completeTask(id) {
    const dbId = Number(id);
    let completeTask = {};
    this.tasks = this.tasks.filter(task => {
      const result = (task.id === dbId);
      if (result) {
        completeTask = task;
      }

      return !result;
    });

    if (Object.keys(completeTask).length !== 0) {
      weblog.sendLog('recordTasks.completeTask', {
        dbId: id,
        recordTasks_complete_task: completeTask,
        recordTasks_task: utils.arrayToObject(this.tasks)
      });
    }
  }

  get getTasks() {
    weblog.sendLog('recordTasks.getTasks', {
      recordTasks_tasks: Object.assign({}, this.tasks)
    });
    return this.tasks;
  }
}

module.exports = new RecordTasks();
