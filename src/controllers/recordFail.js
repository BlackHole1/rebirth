const mysqlService = require('../lib/mysql');
const recordTasks = require('../lib/recordTasks');
const servicesStatus = require('../lib/servicesStatus');
const weblog = require('../lib/weblog');
const utils = require('../lib/utils');
const { setTaskStatusIsRecordFail } = require('../lib/SQLConstants');

// 录制失败
const recordFail = (req, res) => {
  const { id } = req.query;
  mysqlService.getConnection()
    .then(async conn => {
      const result = await utils.SQLHandle(conn, setTaskStatusIsRecordFail, 'setTaskStatusIsRecordFail')(id);
      conn.release();
      recordTasks.completeTask = id;

      res.sendJson(result);
    })
    .catch(e => {
      servicesStatus.setMysqlError = true;
      weblog.sendLog('recordFail.fail', {
        recordFailMessage: e.message,
        recordFailStack: e.stack || ''
      });
      res.sendError();
    });
};

module.exports = recordFail;
