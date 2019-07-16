const mysqlService = require('../lib/mysql');
const recordTasks = require('../lib/recordTasks');
const { MYSQL_TABLE } = require('../lib/constants');

module.exports = (cb) => {
  const tasks = recordTasks.getTasks;

  if (tasks.length === 0) return;

  const idList = tasks.map(task => `'${task.id}'`).join();

  console.log('will reRecord id list', idList);

  mysqlService.getConnection()
    .then(async conn => {
      await conn.query(`UPDATE ${MYSQL_TABLE} SET status='waiting' WHERE id in (${idList})`);
      conn.release();
    })
    .catch(e => {
      console.error(e);
    })
    .then(() => {
      cb();
    });
};
