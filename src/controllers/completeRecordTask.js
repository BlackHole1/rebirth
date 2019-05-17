const mysqlService = require('../lib/mysql');
const recordTasks = require('../lib/recordTasks');
const servicesStatus = require('../lib/servicesStatus');
const { MYSQL_TABLE } = require('../lib/constants');

// 完成录制（删除数据）
const completeRecordTask = (req, res) => {
  const { hash } = req.query;
  mysqlService.getConnection()
    .then(async conn => {
      const result = await conn.query(`DELETE FROM ${MYSQL_TABLE} WHERE hash=${hash}`);
      conn.release();
      recordTasks.completeTask = hash;

      res.sendJson(result, 'completeRecordTask', {
        hash: hash,
        sql: `DELETE FROM ${MYSQL_TABLE} WHERE hash=${hash}`
      });
    })
    .catch(e => {
      servicesStatus.setMysqlError = true;
      res.sendError(
        'delete fail',
        e,
        `DELETE FROM ${MYSQL_TABLE} WHERE hash=${hash}`
      );
    });
};

module.exports = completeRecordTask;
