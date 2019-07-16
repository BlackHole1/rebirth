const mysqlService = require('../lib/mysql');
const recordTasks = require('../lib/recordTasks');
const servicesStatus = require('../lib/servicesStatus');
const { MYSQL_TABLE } = require('../lib/constants');

// 录制失败
const recordFail = (req, res) => {
  const { id } = req.query;
  mysqlService.getConnection()
    .then(async conn => {
      const result = await conn.query(`UPDATE ${MYSQL_TABLE} SET status='record_fail', updated_by='rebirth' WHERE id='${id}'`);
      conn.release();
      recordTasks.completeTask = id;

      res.sendJson(result, 'recordFail', {
        id,
        sql: `UPDATE ${MYSQL_TABLE} SET status='record_fail', updated_by='rebirth' WHERE id='${id}'`
      });
    })
    .catch(e => {
      servicesStatus.setMysqlError = true;
      res.sendError(
        'update fail',
        e,
        `UPDATE ${MYSQL_TABLE} SET status='record_fail', updated_by='rebirth' WHERE id='${id}'`
      );
    });
};

module.exports = recordFail;
