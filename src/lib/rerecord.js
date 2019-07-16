const mysqlService = require('../lib/mysql');
const recordTasks = require('../lib/recordTasks');
const { MYSQL_TABLE } = require('../lib/constants');

module.exports = (cb) => {
  const tasks = recordTasks.getTasks;

  if (tasks.length === 0) return;

  const hashList = tasks.map(task => `'${task.task_hash}'`).join();

  console.log('will reRecord hash list', hashList);

  mysqlService.getConnection()
    .then(async conn => {
      await conn.query(`UPDATE ${MYSQL_TABLE} SET status='waiting' WHERE task_hash in (${hashList})`);
      conn.release();
    })
    .catch(e => {
      console.error(e);
    })
    .then(() => {
      cb();
    });
};
