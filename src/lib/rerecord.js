const mysqlService = require('./mysql');
const weblog = require('./weblog');
const recordTasks = require('./recordTasks');
const { setTaskStatusIsWaiting } = require('./SQLConstants');
const utils = require('./utils');

module.exports = (cb) => {
  let idList;
  if (typeof cb === 'function') {
    const tasks = recordTasks.getTasks;
    if (tasks.length === 0) return cb();
    idList = tasks.map(task => `'${task.id}'`).join();
  } else {
    idList = [cb];
  }

  weblog.sendLog('reRecode.ready', {
    reRecodeList: idList.join()
  });

  mysqlService.getConnection()
    .then(async conn => {
      await utils.SQLHandle(conn, setTaskStatusIsWaiting, 'setTaskStatusIsWaiting')(idList);
      conn.release();
    })
    .catch(e => {
      weblog.sendLog('reRecode.fail', {
        reRecodeFailMessage: e.message,
        reRecodeFailStack: e.stack || ''
      });
      cb();
    })
    .then(() => {
      weblog.sendLog('reRecode.success', {
        reRecodeList: idList.join()
      });
      typeof cb === 'function' && cb();
    });
};
