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
      const result = await conn.query(`SELECT t.* FROM ${MYSQL_TABLE} t WHERE isStart=false LIMIT ${num}`);
      return [ result, conn ];
    })
    .then(async ([ data, conn ]) => {
      const flag = data.length === 0;
      if (!flag) {
        const hashList = data.map(({ hash }) => `'${hash}'`).join();
        await conn.query(`UPDATE ${MYSQL_TABLE} SET isStart=true WHERE hash in (${hashList})`);
        recordTasks.setTask = data;
      }
      conn.release();

      const desc = flag ? undefined : 'getRecord';
      const info = flag ? undefined : {
        sql: `SELECT t.* FROM ${MYSQL_TABLE} t WHERE isStart=false LIMIT ${num}`
      };
      res.sendJson(data, desc, info);
    })
    .catch(e => {
      servicesStatus.setMysqlError = true;
      res.sendError(
        'get record or update record fail',
        e,
        {
          getRecord: `SELECT t.* FROM ${MYSQL_TABLE} t WHERE isStart=false LIMIT ${num}`,
          updateRecord: `UPDATE ${MYSQL_TABLE} SET isStart=true WHERE hash in (?)`
        }
      );
    })
};

module.exports = getRecord;
