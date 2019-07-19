const mysqlService = require('../lib/mysql');
const recordTasks = require('../lib/recordTasks');
const servicesStatus = require('../lib/servicesStatus');
const weblog = require('../lib/weblog');
const utils = require('../lib/utils');
const { getTasks, setTaskStatusIsRecording } = require('../lib/SQLConstants');

const getRecord = (req, res) => {
  // 如果已经有服务挂了，则不要再返回录制任务了
  if (!servicesStatus.isNormal) {
    res.sendJson([]);
    return;
  }

  const { num } = req.query;

  mysqlService.getConnection()
    .then(async conn => {
      const result = await utils.SQLHandle(conn, getTasks, 'getTasks')(num);
      return [ result, conn ];
    })
    .then(async ([ data, conn ]) => {
      const flag = data.length === 0;
      const idList = data.map(({ id }) => `'${id}'`).join();
      if (!flag) {
        await utils.SQLHandle(conn, setTaskStatusIsRecording, 'setTaskStatusIsRecording')(idList);
        recordTasks.setTask = data;
      }

      conn.release();
      res.sendJson(data);
    })
    .catch(e => {
      servicesStatus.setMysqlError = true;
      weblog.sendLog('getRecords.fail', {
        getRecordsFailMessage: e.message,
        getRecordsFailStack: e.stack || ''
      }, 'error');
      res.sendError();
    })
};

module.exports = getRecord;
