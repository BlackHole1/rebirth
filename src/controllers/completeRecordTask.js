const mysqlService = require('../lib/mysql');
const recordTasks = require('../lib/recordTasks');
const servicesStatus = require('../lib/servicesStatus');
const { MYSQL_TABLE } = require('../lib/constants');

// 完成录制
const completeRecordTask = (req, res) => {
  const { hash, s3URL } = req.query;
  mysqlService.getConnection()
    .then(async conn => {
      const result = await conn.query(`UPDATE ${MYSQL_TABLE} SET status='record_complete', merge_result_url='${s3URL}', updated_by='rebirth' WHERE task_hash='${hash}' and merge_result_url is null`);
      conn.release();
      recordTasks.completeTask = hash;

      res.sendJson(result, 'completeRecordTask', {
        hash: hash,
        sql: `UPDATE ${MYSQL_TABLE} SET status='record_complete', merge_result_url='${s3URL}', updated_by='rebirth' WHERE task_hash='${hash}' and merge_result_url is null`
      });
    })
    .catch(e => {
      servicesStatus.setMysqlError = true;
      res.sendError(
        'delete fail',
        e,
        `UPDATE ${MYSQL_TABLE} SET status='record_complete', merge_result_url='${s3URL}', updated_by='rebirth' WHERE task_hash='${hash}' and merge_result_url is null`
      );
    });
};

module.exports = completeRecordTask;
