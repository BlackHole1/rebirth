class RecordTasks {
  constructor () {
    this.tasks = [];
  }

  set setTask(list) {
    this.tasks = this.tasks.concat(list.map(({ url, hash }) => ({ url, hash })));
  }

  set completeTask(hash) {
    this.tasks = this.tasks.filter(task => !(task.hash === hash));
  }

  get getTasks() {
    return this.tasks;
  }
}

module.exports = new RecordTasks();
