const mysqlService = require('../lib/mysql');
const servicesStatus = require('../lib/servicesStatus');
const weblog = require('../lib/weblog');
const utils = require('../lib/utils');
const { exit } = require('../lib/exit');
const { setTaskStatusIsFail } = require('../lib/SQLConstants');

// 录制失败
const recordFail = (req, res) => {
  mysqlService.getConnection()
    .then(async conn => {
      const result = await utils.SQLHandle(conn, setTaskStatusIsFail, 'setTaskStatusIsFail')();
      conn.release();

      res.sendJson(result);
    })
    .then(() => exit('callRecordFailAPI', false))
    .catch(e => {
      servicesStatus.setMysqlError = true;
      weblog.sendLog('recordFail.fail', {
        recordFailMessage: e.message,
        recordFailStack: e.stack || ''
      }, 'error');
      res.sendError();
    });
};

module.exports = recordFail;
