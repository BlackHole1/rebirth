const servicesStatus = require('../lib/servicesStatus');
const weblog = require('../lib/weblog');
const { recordModel } = require('../model');
const { DB_ID, DB_MATERIAL_URL } = require('../lib/constants');

const getRecord = (req, res) => {
  recordModel()
    .then(() => {
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
