const mysqlService = require('../lib/mysql');
const recordTasks = require('../lib/recordTasks');

module.exports = () => {
  const tasks = recordTasks.getTasks;

  if (tasks.length === 0) return;

  const hashList = tasks.map(task => `'${task.hash}'`).join();

  mysqlService.then(conn => {
    conn.query(`UPDATE record SET isStart=0 WHERE hash in (${hashList})`);
  }).catch(e => {
    console.error(e);
  });
};
