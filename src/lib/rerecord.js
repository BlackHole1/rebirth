const mysqlService = require('./mysql');
const weblog = require('./weblog');
const { setTaskStatusIsWaiting } = require('./SQLConstants');
const utils = require('./utils');

module.exports = (cb) => {

  weblog.sendLog('reRecode.ready');

  mysqlService.getConnection()
    .then(async conn => {
      await utils.SQLHandle(conn, setTaskStatusIsWaiting, 'setTaskStatusIsWaiting')();
      conn.release();
    })
    .then(() => {
      weblog.sendLog('reRecode.success');
      cb();
    })
    .catch(e => {
      weblog.sendLog('reRecode.fail', {
        reRecodeFailMessage: e.message,
        reRecodeFailStack: e.stack || ''
      }, 'error');
      cb();
    });
};
