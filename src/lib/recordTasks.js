class RecordTasks {
  constructor () {
    this.tasks = [];
  }

  set setTask(list) {
    this.tasks = this.tasks.concat(list.map(({ material_url, id }) => ({ material_url, id })));
  }

  set completeTask(id) {
    this.tasks = this.tasks.filter(task => !(task.id === id));
  }

  get getTasks() {
    return this.tasks;
  }
}

module.exports = new RecordTasks();
