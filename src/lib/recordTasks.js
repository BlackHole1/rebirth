class RecordTasks {
  constructor () {
    this.tasks = [];
  }

  set setTask(list) {
    this.tasks = this.tasks.concat(list.map(({ material_url, task_hash }) => ({ material_url, task_hash })));
  }

  set completeTask(task_hash) {
    this.tasks = this.tasks.filter(task => !(task.task_hash === task_hash));
  }

  get getTasks() {
    return this.tasks;
  }
}

module.exports = new RecordTasks();
