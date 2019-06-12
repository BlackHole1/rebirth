const mysqlService = require('../lib/mysql');
const recordTasks = require('../lib/recordTasks');
const servicesStatus = require('../lib/servicesStatus');
const { MYSQL_TABLE } = require('../lib/constants');

// 录制失败
const recordFail = (req, res) => {
  const { hash } = req.query;
  mysqlService.getConnection()
    .then(async conn => {
      const result = await conn.query(`UPDATE ${MYSQL_TABLE} SET status='record_fail', updated_by='rebirth' WHERE task_hash='${hash}'`);
      conn.release();
      recordTasks.completeTask = hash;

      res.sendJson(result, 'recordFail', {
        hash,
        sql: `UPDATE ${MYSQL_TABLE} SET status='record_fail', updated_by='rebirth' WHERE task_hash='${hash}'`
      });
    })
    .catch(e => {
      servicesStatus.setMysqlError = true;
      res.sendError(
        'update fail',
        e,
        `UPDATE ${MYSQL_TABLE} SET status='record_fail', updated_by='rebirth' WHERE task_hash='${hash}'`
      );
    });
};

module.exports = recordFail;
