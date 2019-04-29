const mysqlService = require('../lib/mysql');
const recordTasks = require('../lib/recordTasks');
const { MYSQL_TABLE } = require('../lib/constants');

module.exports = (cb) => {
  const tasks = recordTasks.getTasks;

  if (tasks.length === 0) return;

  const hashList = tasks.map(task => `'${task.hash}'`).join();

  mysqlService.getConnection()
    .then(conn => {
      conn.query(`UPDATE ${MYSQL_TABLE} SET isStart=0 WHERE hash in (${hashList})`);
    })
    .catch(e => {
      console.error(e);
    })
    .then(() => {
      cb();
    });
};
