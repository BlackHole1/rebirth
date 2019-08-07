const mysqlService = require('../lib/mysql');
const servicesStatus = require('../lib/servicesStatus');
const weblog = require('../lib/weblog');
const utils = require('../lib/utils');
const { DB_ID, DB_MATERIAL_URL } = require('../lib/constants');
const { setTaskStatusIsRecording } = require('../lib/SQLConstants');

const getRecord = (req, res) => {
  mysqlService.getConnection()
    .then(async conn => {
      await utils.SQLHandle(conn, setTaskStatusIsRecording, 'setTaskStatusIsRecording')();

      conn.release();
      res.sendJson({
        id: DB_ID,
        material_url: DB_MATERIAL_URL,
      });
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
