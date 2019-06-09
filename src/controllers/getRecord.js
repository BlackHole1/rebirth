const mysqlService = require('../lib/mysql');
const recordTasks = require('../lib/recordTasks');
const servicesStatus = require('../lib/servicesStatus');
const { MYSQL_TABLE } = require('../lib/constants');

const getRecord = (req, res) => {
  // 如果已经有服务挂了，则不要再返回录制任务了
  if (!servicesStatus.isNormal) {
    res.sendJson([]);
    return;
  }

  const { num } = req.query;

  mysqlService.getConnection()
    .then(async conn => {
      const result = await conn.query(`SELECT t.* FROM ${MYSQL_TABLE} t WHERE status='waiting' LIMIT ${num}`);
      return [ result, conn ];
    })
    .then(async ([ data, conn ]) => {
      const flag = data.length === 0;
      const hashList = data.map(({ task_hash }) => `'${task_hash}'`).join();
      if (!flag) {
        await conn.query(`UPDATE ${MYSQL_TABLE} SET status='recording' WHERE task_hash in (${hashList})`);
        recordTasks.setTask = data;
      }
      conn.release();

      const desc = flag ? undefined : 'getRecord';
      const info = flag ? undefined : {
        getRecordSQL: `SELECT t.* FROM ${MYSQL_TABLE} t WHERE status='waiting' LIMIT ${num}`,
        updateRecordSQL: `UPDATE ${MYSQL_TABLE} SET status='recording', updated_by='rebirth' WHERE task_hash in (${hashList})`
      };
      res.sendJson(data, desc, info);
    })
    .catch(e => {
      servicesStatus.setMysqlError = true;
      res.sendError(
        'get record or update record fail',
        e,
        {
          getRecord: `SELECT t.* FROM ${MYSQL_TABLE} t WHERE status='waiting' LIMIT ${num}`,
          updateRecord: `UPDATE ${MYSQL_TABLE} SET status='recording', updated_by='rebirth' WHERE task_hash in (?)`
        }
      );
    })
};

module.exports = getRecord;
